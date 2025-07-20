// app/api/monitor/http-status/route.js
import puppeteer from 'puppeteer'
import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import { NextResponse } from 'next/server'


export async function POST(request) {
  try {
    const { url, options = {} } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const httpResults = await analyzeHttpStatus(url, options)
    
    return NextResponse.json(httpResults, { status: 200 })
  } catch (error) {
    console.error('HTTP Status Analysis Error:', error)
    return Response.json(
      { error: `HTTP status analysis failed: ${error.message}` }, 
      { status: 500 }
    )
  }
}

async function analyzeHttpStatus(url, options = {}) {
  const results = {
    statusCodes: {},
    errors: [],
    redirectChains: [],
    serverErrors: []
  }

  try {
    // Get all URLs from sitemap first
    const sitemapUrls = await extractSitemapUrls(url)
    
    // Crawl internal links
    const internalUrls = await crawlInternalLinks(url, options.maxPages || 100)
    
    // Combine and deduplicate URLs
    const allUrls = [...new Set([...sitemapUrls, ...internalUrls])]

    // Check each URL
    for (const targetUrl of allUrls) {
      await checkUrlStatus(targetUrl, results)
    }

    return categorizeResults(results)
  } catch (error) {
    throw new Error(`HTTP status analysis failed: ${error.message}`)
  }
}

// Extract URLs from sitemap
async function extractSitemapUrls(baseUrl) {
  const sitemapUrls = []
  
  try {
    // Common sitemap locations
    const sitemapLocations = [
      '/sitemap.xml',
      '/sitemap_index.xml', 
      '/sitemaps.xml',
      '/sitemap/sitemap.xml'
    ]

    for (const location of sitemapLocations) {
      try {
        const sitemapUrl = new URL(location, baseUrl).href
        const response = await axios.get(sitemapUrl, {
          timeout: 10000,
          headers: { 'User-Agent': 'SEO-Analyzer-Bot/1.0' }
        })

        if (response.status === 200) {
          const urls = await parseSitemap(response.data, baseUrl)
          sitemapUrls.push(...urls)
          break // Found a sitemap, use it
        }
      } catch (error) {
        // Try next location
        continue
      }
    }

    // Also check robots.txt for sitemap references
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).href
      const robotsResponse = await axios.get(robotsUrl, {
        timeout: 5000,
        headers: { 'User-Agent': 'SEO-Analyzer-Bot/1.0' }
      })

      if (robotsResponse.status === 200) {
        const robotsContent = robotsResponse.data
        const sitemapMatches = robotsContent.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi)
        
        if (sitemapMatches) {
          for (const match of sitemapMatches) {
            const sitemapUrl = match.replace(/Sitemap:\s*/i, '').trim()
            try {
              const sitemapResponse = await axios.get(sitemapUrl, {
                timeout: 10000,
                headers: { 'User-Agent': 'SEO-Analyzer-Bot/1.0' }
              })
              
              if (sitemapResponse.status === 200) {
                const urls = await parseSitemap(sitemapResponse.data, baseUrl)
                sitemapUrls.push(...urls)
              }
            } catch (error) {
              console.error(`Failed to fetch sitemap from robots.txt: ${sitemapUrl}`)
            }
          }
        }
      }
    } catch (error) {
      // Robots.txt not found or inaccessible
    }

    return [...new Set(sitemapUrls)] // Remove duplicates
  } catch (error) {
    console.error('Failed to extract sitemap URLs:', error.message)
    return []
  }
}

// Helper function to parse sitemap XML
async function parseSitemap(xmlContent, baseUrl) {
  const urls = []
  
  try {
    const result = await parseStringPromise(xmlContent)
    
    // Handle sitemap index files
    if (result.sitemapindex && result.sitemapindex.sitemap) {
      for (const sitemap of result.sitemapindex.sitemap) {
        if (sitemap.loc && sitemap.loc[0]) {
          try {
            const sitemapUrl = sitemap.loc[0]
            const response = await axios.get(sitemapUrl, {
              timeout: 10000,
              headers: { 'User-Agent': 'SEO-Analyzer-Bot/1.0' }
            })
            
            if (response.status === 200) {
              const subUrls = await parseSitemap(response.data, baseUrl)
              urls.push(...subUrls)
            }
          } catch (error) {
            console.error(`Failed to fetch sub-sitemap: ${sitemap.loc[0]}`)
          }
        }
      }
    }
    
    // Handle regular sitemap files
    if (result.urlset && result.urlset.url) {
      for (const urlEntry of result.urlset.url) {
        if (urlEntry.loc && urlEntry.loc[0]) {
          urls.push(urlEntry.loc[0])
        }
      }
    }

  } catch (error) {
    console.error('Failed to parse sitemap XML:', error.message)
  }

  return urls
}

// Crawl internal links
async function crawlInternalLinks(baseUrl, maxPages = 100) {
  const internalUrls = new Set([baseUrl])
  const crawled = new Set()
  const toCrawl = [baseUrl]
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (compatible; SEO-Analyzer-Bot/1.0)')
    
    const baseUrlObj = new URL(baseUrl)
    
    while (toCrawl.length > 0 && crawled.size < maxPages) {
      const currentUrl = toCrawl.shift()
      
      if (crawled.has(currentUrl)) continue
      crawled.add(currentUrl)
      
      try {
        await page.goto(currentUrl, { 
          waitUntil: 'networkidle0', 
          timeout: 30000 
        })
        
        // Extract all links from the page
        const links = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll('a[href]'))
          return anchors.map(anchor => anchor.href).filter(href => href)
        })
        
        // Filter for internal links only
        for (const link of links) {
          try {
            const linkUrl = new URL(link)
            
            // Only include same-domain links
            if (linkUrl.hostname === baseUrlObj.hostname) {
              const cleanUrl = `${linkUrl.protocol}//${linkUrl.hostname}${linkUrl.pathname}`
              
              if (!internalUrls.has(cleanUrl) && !crawled.has(cleanUrl)) {
                internalUrls.add(cleanUrl)
                
                if (crawled.size + toCrawl.length < maxPages) {
                  toCrawl.push(cleanUrl)
                }
              }
            }
          } catch (error) {
            // Invalid URL, skip
          }
        }
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`Failed to crawl ${currentUrl}:`, error.message)
      }
    }
    
  } finally {
    await browser.close()
  }
  
  return Array.from(internalUrls)
}

// Categorize results
function categorizeResults(results) {
  return {
    summary: {
      totalUrls: Object.values(results.statusCodes).flat().length,
      successfulUrls: (results.statusCodes[200] || []).length,
      redirectUrls: Object.keys(results.statusCodes).filter(code => code >= 300 && code < 400).reduce((sum, code) => sum + results.statusCodes[code].length, 0),
      clientErrors: results.errors.filter(err => err.type === 'client_error').length,
      serverErrors: results.serverErrors.length,
      networkErrors: results.errors.filter(err => err.type === 'network_error').length,
      excessiveRedirects: results.redirectChains.filter(chain => chain.excessive).length
    },
    statusCodes: results.statusCodes,
    errors: results.errors,
    redirectChains: results.redirectChains,
    serverErrors: results.serverErrors,
    healthScore: calculateHealthScore(results)
  }
}

// Calculate overall health score
function calculateHealthScore(results) {
  const totalUrls = Object.values(results.statusCodes).flat().length
  if (totalUrls === 0) return 0
  
  const successfulUrls = (results.statusCodes[200] || []).length
  const clientErrors = results.errors.filter(err => err.type === 'client_error').length
  const serverErrors = results.serverErrors.length
  const excessiveRedirects = results.redirectChains.filter(chain => chain.excessive).length
  
  // Calculate score out of 100
  let score = (successfulUrls / totalUrls) * 100
  
  // Penalize errors
  score -= (clientErrors / totalUrls) * 30
  score -= (serverErrors / totalUrls) * 50
  score -= (excessiveRedirects / totalUrls) * 20
  
  return Math.max(0, Math.round(score))
}

async function checkUrlStatus(url, results) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 10,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on non-2xx status
      headers: {
        'User-Agent': 'SEO-Analyzer-Bot/1.0'
      }
    })

    const statusCode = response.status
    
    // Track status codes
    if (!results.statusCodes[statusCode]) {
      results.statusCodes[statusCode] = []
    }
    results.statusCodes[statusCode].push(url)

    // Track redirects
    if (statusCode >= 300 && statusCode < 400) {
      await analyzeRedirectChain(url, results)
    }

    // Track server errors
    if (statusCode >= 500) {
      results.serverErrors.push({
        url,
        statusCode,
        error: response.statusText,
        timestamp: new Date().toISOString()
      })
    }

    // Track client errors
    if (statusCode >= 400 && statusCode < 500) {
      results.errors.push({
        url,
        statusCode,
        error: response.statusText,
        type: 'client_error'
      })
    }

  } catch (error) {
    results.errors.push({
      url,
      error: error.message,
      type: 'network_error'
    })
  }
}

async function analyzeRedirectChain(url, results) {
  const chain = []
  let currentUrl = url
  let redirectCount = 0
  const maxRedirects = 10

  while (redirectCount < maxRedirects) {
    try {
      const response = await axios.get(currentUrl, {
        maxRedirects: 0,
        validateStatus: () => true,
        timeout: 5000
      })

      chain.push({
        url: currentUrl,
        statusCode: response.status,
        location: response.headers.location
      })

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        currentUrl = new URL(response.headers.location, currentUrl).href
        redirectCount++
      } else {
        break
      }
    } catch (error) {
      chain.push({
        url: currentUrl,
        error: error.message
      })
      break
    }
  }

  if (chain.length > 1) {
    results.redirectChains.push({
      originalUrl: url,
      chain,
      chainLength: chain.length,
      excessive: chain.length > 3
    })
  }
}
