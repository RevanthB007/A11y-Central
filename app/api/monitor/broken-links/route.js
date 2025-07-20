// app/api/monitor/broken-links/route.js
import puppeteer from 'puppeteer'
import axios from 'axios'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { url, options = {} } = await request.json()
    
    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 })
    }

    const linkResults = await detectBrokenLinks(url, options)
    
    return NextResponse.json(linkResults, { status: 200 })
  } catch (error) {
    console.error('Broken Links Analysis Error:', error)
    return NextResponse.json(
      { error: `Broken links analysis failed: ${error.message}` }, 
      { status: 500 }
    )
  }
}

async function detectBrokenLinks(url, options = {}) {
  // Initialize results with empty arrays
  const results = {
    internalLinks: [],
    externalLinks: [],
    brokenInternal: [],
    brokenExternal: [],
    slowLinks: [],
    socialLinks: [],
    imageLinks: [],
    brokenImages: []
  }

  let browser = null

  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })

    console.log('Browser launched, getting site pages...')
    
    // Get all pages to analyze
    const pagesToAnalyze = await getSitePages(url, options.maxPages || 10) // Reduced for testing
    console.log(`Found ${pagesToAnalyze.length} pages to analyze`)
    
    for (let i = 0; i < pagesToAnalyze.length; i++) {
      const pageUrl = pagesToAnalyze[i]
      console.log(`Analyzing page ${i + 1}/${pagesToAnalyze.length}: ${pageUrl}`)
      await analyzePage(pageUrl, browser, results)
    }

    console.log('Link extraction complete, starting validation...')
    console.log(`Found: ${results.internalLinks.length} internal, ${results.externalLinks.length} external, ${results.socialLinks.length} social, ${results.imageLinks.length} images`)

    // Validate all collected links
    await validateLinks(results)
    
    return categorizeResults(results)
  } catch (error) {
    console.error('Error in detectBrokenLinks:', error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

async function getSitePages(baseUrl, maxPages) {
  const pages = [baseUrl]
  const visited = new Set([baseUrl])
  let browser = null
  
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })
    const page = await browser.newPage()
    
    const baseUrlObj = new URL(baseUrl)
    let currentIndex = 0
    
    while (currentIndex < pages.length && pages.length < maxPages) {
      const currentUrl = pages[currentIndex]
      currentIndex++
      
      try {
        await page.goto(currentUrl, { waitUntil: 'networkidle0', timeout: 30000 })
        
        const links = await page.evaluate(() => {
          try {
            const anchors = Array.from(document.querySelectorAll('a[href]'))
            return anchors.map(anchor => anchor.href).filter(href => href && href.trim())
          } catch (error) {
            console.error('Error in page.evaluate:', error)
            return []
          }
        })
        
        for (const link of links) {
          try {
            const linkUrl = new URL(link)
            if (linkUrl.hostname === baseUrlObj.hostname && 
                !visited.has(link) && 
                pages.length < maxPages) {
              pages.push(link)
              visited.add(link)
            }
          } catch (error) {
            // Invalid URL, skip
            console.warn(`Invalid URL found: ${link}`)
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)) // Increased delay
      } catch (error) {
        console.error(`Failed to analyze page ${currentUrl}:`, error.message)
      }
    }
  } catch (error) {
    console.error('Error in getSitePages:', error)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
  
  return pages
}

async function analyzePage(url, browser, results) {
  let page = null
  
  try {
    page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (compatible; SEO-Link-Checker/1.0)')
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    
    // Extract all links and images
    const pageLinks = await page.evaluate(() => {
      try {
        const extractedLinks = []
        
        // Get all anchor links
        const anchors = Array.from(document.querySelectorAll('a[href]'))
        for (const anchor of anchors) {
          if (anchor.href && anchor.href.trim()) {
            extractedLinks.push({
              href: anchor.href,
              text: (anchor.textContent || '').trim(),
              title: anchor.title || '',
              rel: anchor.rel || '',
              target: anchor.target || '',
              type: 'link',
              location: {
                tagName: anchor.tagName.toLowerCase(),
                context: anchor.closest('nav, header, footer, main, aside')?.tagName.toLowerCase() || 'content'
              }
            })
          }
        }
        
        // Get all images
        const images = Array.from(document.querySelectorAll('img[src]'))
        for (const img of images) {
          if (img.src && img.src.trim()) {
            extractedLinks.push({
              href: img.src,
              alt: img.alt || '',
              title: img.title || '',
              type: 'image',
              location: {
                tagName: 'img',
                context: 'content'
              }
            })
          }
        }
        
        return extractedLinks
      } catch (error) {
        console.error('Error in page evaluation:', error)
        return []
      }
    })

    console.log(`Extracted ${pageLinks.length} links/images from ${url}`)

    // Categorize links
    const baseUrl = new URL(url)
    for (const link of pageLinks) {
      try {
        const linkUrl = new URL(link.href)
        const linkData = {
          ...link,
          foundOn: url,
          domain: linkUrl.hostname
        }
        
        if (link.type === 'image') {
          results.imageLinks.push(linkData)
        } else if (linkUrl.hostname === baseUrl.hostname) {
          results.internalLinks.push({
            ...linkData,
            type: 'internal'
          })
        } else if (isSocialMediaLink(linkUrl.hostname)) {
          results.socialLinks.push({
            ...linkData,
            platform: getSocialPlatform(linkUrl.hostname),
            type: 'social'
          })
        } else {
          results.externalLinks.push({
            ...linkData,
            type: 'external'
          })
        }
      } catch (error) {
        // Invalid URL format
        console.warn(`Invalid URL format: ${link.href}`)
        if (link.type === 'image') {
          results.brokenImages.push({
            ...link,
            foundOn: url,
            error: 'Invalid URL format'
          })
        } else {
          results.brokenInternal.push({
            ...link,
            foundOn: url,
            error: 'Invalid URL format'
          })
        }
      }
    }
  } catch (error) {
    console.error(`Failed to analyze page ${url}:`, error.message)
  } finally {
    if (page) {
      await page.close()
    }
  }
}

async function validateLinks(results) {
  console.log('Starting link validation...')
  
  // Add safety checks and ensure arrays exist
  const safeResults = {
    internalLinks: results.internalLinks || [],
    externalLinks: results.externalLinks || [],
    socialLinks: results.socialLinks || [],
    imageLinks: results.imageLinks || [],
    brokenInternal: results.brokenInternal || [],
    brokenExternal: results.brokenExternal || [],
    brokenImages: results.brokenImages || [],
    slowLinks: results.slowLinks || []
  }

  try {
    // Validate internal links (limit to first 20 for testing)
    if (safeResults.internalLinks.length > 0) {
      console.log(`Validating ${Math.min(safeResults.internalLinks.length, 20)} internal links...`)
      await validateLinkBatch(
        safeResults.internalLinks.slice(0, 20), 
        safeResults.brokenInternal, 
        safeResults.slowLinks, 
        'internal'
      )
    }
    
    // Validate external links (limit to first 10 for testing)
    if (safeResults.externalLinks.length > 0) {
      console.log(`Validating ${Math.min(safeResults.externalLinks.length, 10)} external links...`)
      await validateLinkBatch(
        safeResults.externalLinks.slice(0, 10), 
        safeResults.brokenExternal, 
        safeResults.slowLinks, 
        'external', 
        2000
      )
    }
    
    // Validate social links (limit to first 5 for testing)
    if (safeResults.socialLinks.length > 0) {
      console.log(`Validating ${Math.min(safeResults.socialLinks.length, 5)} social links...`)
      await validateLinkBatch(
        safeResults.socialLinks.slice(0, 5), 
        safeResults.brokenExternal, 
        safeResults.slowLinks, 
        'social', 
        3000
      )
    }
    
    // Validate images (limit to first 15 for testing)
    if (safeResults.imageLinks.length > 0) {
      console.log(`Validating ${Math.min(safeResults.imageLinks.length, 15)} images...`)
      await validateLinkBatch(
        safeResults.imageLinks.slice(0, 15), 
        safeResults.brokenImages, 
        safeResults.slowLinks, 
        'image', 
        1000
      )
    }

    // Update the original results
    Object.assign(results, safeResults)
    
  } catch (error) {
    console.error('Error in validateLinks:', error)
    throw error
  }
}

async function validateLinkBatch(links, brokenArray, slowArray, type, delay = 0) {
  // Safety check
  if (!Array.isArray(links)) {
    console.error(`Links is not an array for type ${type}:`, typeof links)
    return
  }

  if (links.length === 0) {
    console.log(`No ${type} links to validate`)
    return
  }

  console.log(`Starting validation of ${links.length} ${type} links...`)

  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    
    if (delay) await new Promise(resolve => setTimeout(resolve, delay))
    
    const startTime = Date.now()
    
    try {
      const method = 'head' // Use HEAD for all requests
      const timeout = type === 'external' ? 15000 : 10000
      
      const response = await axios({
        method,
        url: link.href,
        timeout,
        maxRedirects: 5,
        validateStatus: () => true, // Don't throw on 4xx/5xx
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Link-Checker/1.0)',
          'Accept': type === 'image' ? 'image/*' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      })

      const responseTime = Date.now() - startTime
      
      if (response.status >= 400) {
        brokenArray.push({
          ...link,
          statusCode: response.status,
          error: response.statusText || `HTTP ${response.status}`,
          responseTime
        })
        console.log(`❌ Broken ${type}: ${link.href} (${response.status})`)
      } else if (responseTime > (type === 'external' ? 5000 : 3000)) {
        slowArray.push({
          ...link,
          responseTime,
          statusCode: response.status,
          warning: 'Slow response time'
        })
        console.log(`⚠️ Slow ${type}: ${link.href} (${responseTime}ms)`)
      } else {
        console.log(`✅ OK ${type}: ${link.href} (${response.status}, ${responseTime}ms)`)
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      brokenArray.push({
        ...link,
        error: getErrorMessage(error),
        responseTime
      })
      console.log(`❌ Error ${type}: ${link.href} - ${getErrorMessage(error)}`)
    }
  }
}

function getErrorMessage(error) {
  if (error.code === 'ENOTFOUND') return 'Domain not found'
  if (error.code === 'ECONNREFUSED') return 'Connection refused'
  if (error.code === 'ETIMEDOUT') return 'Request timeout'
  if (error.code === 'ECONNRESET') return 'Connection reset'
  if (error.code === 'ECONNABORTED') return 'Request aborted'
  if (error.response?.status) return `HTTP ${error.response.status}`
  return error.message || 'Unknown error'
}

function isSocialMediaLink(hostname) {
  const socialDomains = [
    'facebook.com', 'www.facebook.com',
    'twitter.com', 'www.twitter.com', 'x.com', 'www.x.com',
    'instagram.com', 'www.instagram.com',
    'linkedin.com', 'www.linkedin.com',
    'youtube.com', 'www.youtube.com',
    'tiktok.com', 'www.tiktok.com',
    'pinterest.com', 'www.pinterest.com',
    'snapchat.com', 'www.snapchat.com'
  ]
  return socialDomains.some(domain => hostname.includes(domain))
}

function getSocialPlatform(hostname) {
  if (hostname.includes('facebook')) return 'Facebook'
  if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter/X'
  if (hostname.includes('instagram')) return 'Instagram'
  if (hostname.includes('linkedin')) return 'LinkedIn'
  if (hostname.includes('youtube')) return 'YouTube'
  if (hostname.includes('tiktok')) return 'TikTok'
  if (hostname.includes('pinterest')) return 'Pinterest'
  if (hostname.includes('snapchat')) return 'Snapchat'
  return 'Social Media'
}

function categorizeResults(results) {
  // Ensure all arrays exist
  const safeResults = {
    internalLinks: results.internalLinks || [],
    externalLinks: results.externalLinks || [],
    socialLinks: results.socialLinks || [],
    imageLinks: results.imageLinks || [],
    brokenInternal: results.brokenInternal || [],
    brokenExternal: results.brokenExternal || [],
    brokenImages: results.brokenImages || [],
    slowLinks: results.slowLinks || []
  }

  const totalLinks = safeResults.internalLinks.length + safeResults.externalLinks.length + safeResults.socialLinks.length
  const totalBroken = safeResults.brokenInternal.length + safeResults.brokenExternal.length + safeResults.brokenImages.length
  
  return {
    summary: {
      totalLinks,
      totalImages: safeResults.imageLinks.length,
      internalLinks: safeResults.internalLinks.length,
      externalLinks: safeResults.externalLinks.length,
      socialLinks: safeResults.socialLinks.length,
      brokenLinks: totalBroken,
      brokenInternal: safeResults.brokenInternal.length,
      brokenExternal: safeResults.brokenExternal.length,
      brokenImages: safeResults.brokenImages.length,
      slowLinks: safeResults.slowLinks.length,
      healthScore: totalLinks > 0 ? Math.round(((totalLinks - totalBroken) / totalLinks) * 100) : 100
    },
    internalLinks: safeResults.internalLinks,
    externalLinks: safeResults.externalLinks,
    socialLinks: safeResults.socialLinks,
    imageLinks: safeResults.imageLinks,
    brokenInternal: safeResults.brokenInternal,
    brokenExternal: safeResults.brokenExternal,
    brokenImages: safeResults.brokenImages,
    slowLinks: safeResults.slowLinks
  }
}
