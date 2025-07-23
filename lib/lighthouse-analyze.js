// lib/lighthouse-analyze.js
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

export async function analyzeLighthouse(url) {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    });

    console.log(`Starting enhanced Lighthouse analysis for: ${url}`);

    // Run comprehensive analysis with all categories
    const desktopResults = await runLighthouseAnalysis(url, browser, 'desktop');
    const mobileResults = await runLighthouseAnalysis(url, browser, 'mobile');

    return {
      // Basic scores (your existing structure)
      scores: {
        performance: Math.round(mobileResults.categories.performance.score * 100),
        accessibility: Math.round(mobileResults.categories.accessibility.score * 100),
        bestPractices: Math.round(mobileResults.categories['best-practices'].score * 100),
        seo: Math.round(mobileResults.categories.seo.score * 100),
        pwa: Math.round(mobileResults.categories.pwa.score * 100)
      },

      // Enhanced Core Web Vitals with detailed breakdown
      coreWebVitals: {
        desktop: extractCoreWebVitals(desktopResults, 'desktop'),
        mobile: extractCoreWebVitals(mobileResults, 'mobile'),
        recommendations: generateVitalsRecommendations(desktopResults, mobileResults),
        overallScore: calculateOverallScore(desktopResults, mobileResults)
      },

      // Detailed Performance Diagnostics
      performanceDetails: extractDetailedPerformance(mobileResults),

      // Enhanced SEO Insights
      seoDetails: extractSEOInsights(mobileResults),

      // Your existing opportunities (keeping backward compatibility)
      opportunities: mobileResults.audits['unused-javascript']?.details?.items?.slice(0, 10) || []
    };

  } catch (error) {
    console.error('Enhanced Lighthouse analysis failed:', error);
    throw new Error(`Lighthouse analysis failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function runLighthouseAnalysis(url, browser, formFactor) {
  console.log(`Running comprehensive ${formFactor} Lighthouse analysis...`);

  const options = {
    port: new URL(browser.wsEndpoint()).port,
    output: 'json',
    logLevel: 'info',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    settings: {
      formFactor: formFactor,
      throttling: formFactor === 'mobile' ? {
        rttMs: 150,
        throughputKbps: 1638,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      } : {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      screenEmulation: formFactor === 'mobile' ? {
        mobile: true,
        width: 360,
        height: 640,
        deviceScaleFactor: 2,
        disabled: false,
      } : {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      }
    }
  };

  const result = await lighthouse(url, options);
  return result.lhr;
}

// Enhanced Core Web Vitals extraction (from your API route)
function extractCoreWebVitals(lighthouseResult, formFactor) {
  const audits = lighthouseResult.audits;

  return {
    // Largest Contentful Paint (LCP)
    lcp: {
      value: audits['largest-contentful-paint']?.numericValue || 0,
      displayValue: audits['largest-contentful-paint']?.displayValue || 'N/A',
      score: Math.round((audits['largest-contentful-paint']?.score || 0) * 100),
      rating: getLCPRating(audits['largest-contentful-paint']?.numericValue || 0),
      element: audits['largest-contentful-paint-element']?.details?.items?.[0] || null,
      breakdown: {
        ttfb: audits['server-response-time']?.numericValue || 0,
        resourceLoadDelay: audits['largest-contentful-paint']?.details?.items?.[0]?.phases?.resourceLoadDelay || 0,
        renderDelay: audits['largest-contentful-paint']?.details?.items?.[0]?.phases?.renderDelay || 0
      }
    },

    // Interaction to Next Paint (INP) / First Input Delay (FID)
    interactivity: {
      inp: audits['interaction-to-next-paint']?.numericValue || 0,
      inpScore: Math.round((audits['interaction-to-next-paint']?.score || 0) * 100),
      inpRating: getINPRating(audits['interaction-to-next-paint']?.numericValue || 0),
      fid: audits['max-potential-fid']?.numericValue || 0,
      totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
      ttiScore: Math.round((audits['interactive']?.score || 0) * 100),
      longTasks: audits['long-tasks']?.details?.items || [],
      mainThreadWorkBreakdown: audits['main-thread-tasks']?.details?.items || []
    },

    // Cumulative Layout Shift (CLS)
    cls: {
      value: audits['cumulative-layout-shift']?.numericValue || 0,
      score: Math.round((audits['cumulative-layout-shift']?.score || 0) * 100),
      rating: getCLSRating(audits['cumulative-layout-shift']?.numericValue || 0),
      elements: audits['layout-shift-elements']?.details?.items || [],
      breakdown: audits['cumulative-layout-shift']?.details?.items || []
    },

    // Additional Performance Metrics
    additional: {
      firstContentfulPaint: {
        value: audits['first-contentful-paint']?.numericValue || 0,
        score: Math.round((audits['first-contentful-paint']?.score || 0) * 100),
        displayValue: audits['first-contentful-paint']?.displayValue || 'N/A'
      },
      speedIndex: {
        value: audits['speed-index']?.numericValue || 0,
        score: Math.round((audits['speed-index']?.score || 0) * 100),
        displayValue: audits['speed-index']?.displayValue || 'N/A'
      },
      timeToInteractive: {
        value: audits['interactive']?.numericValue || 0,
        score: Math.round((audits['interactive']?.score || 0) * 100),
        displayValue: audits['interactive']?.displayValue || 'N/A'
      }
    },

    // Performance Opportunities and Diagnostics (from your API route)
    opportunities: audits['unused-javascript']?.details?.items?.slice(0, 10) || [],
    diagnostics: {
      unusedJavaScript: audits['unused-javascript']?.details?.items || [],
      unusedCSS: audits['unused-css-rules']?.details?.items || [],
      oversizedImages: audits['uses-optimized-images']?.details?.items || [],
      unoptimizedImages: audits['uses-webp-images']?.details?.items || [],
      renderBlockingResources: audits['render-blocking-resources']?.details?.items || [],
      eliminateBlockingResources: audits['eliminate-render-blocking-resources']?.details?.items || []
    }
  };
}

// Additional detailed performance extraction
function extractDetailedPerformance(lighthouseResult) {
  const audits = lighthouseResult.audits;
  
  return {
    // Critical Path Analysis
    criticalRequestChain: audits['critical-request-chains']?.details || null,
    renderBlockingResources: audits['render-blocking-resources']?.details?.items || [],
    
    // JavaScript Analysis
    bootupTime: audits['bootup-time']?.details?.items || [],
    mainThreadWorkBreakdown: audits['mainthread-work-breakdown']?.details?.items || [],
    
    // Image Optimization
    oversizedImages: audits['uses-responsive-images']?.details?.items || [],
    modernImageFormats: audits['uses-webp-images']?.details?.items || [],
    
    // Network Efficiency
    efficientCachePolicy: audits['uses-long-cache-ttl']?.details?.items || [],
    textCompression: audits['uses-text-compression']?.details?.items || [],
    
    // Third Party Impact
    thirdPartySummary: audits['third-party-summary']?.details?.items || []
  };
}

// Enhanced SEO insights
function extractSEOInsights(lighthouseResult) {
  const audits = lighthouseResult.audits;
  
  return {
    // Content SEO
    metaDescription: {
      passed: audits['meta-description']?.score === 1,
      details: audits['meta-description']?.details || null
    },
    documentTitle: {
      passed: audits['document-title']?.score === 1,
      details: audits['document-title']?.details || null
    },
    
    // Technical SEO
    crawlableAnchors: audits['crawlable-anchors']?.details?.items || [],
    hreflang: audits['hreflang']?.details?.items || [],
    canonical: audits['canonical']?.details?.items || [],
    
    // Mobile SEO
    viewport: audits['viewport']?.score === 1,
    tapTargets: audits['tap-targets']?.details?.items || [],
    
    // Image SEO
    imageAlt: audits['image-alt']?.details?.items || [],
    
    // Structured Data
    structuredData: audits['structured-data']?.details?.items || []
  };
}

// Rating functions (from your API route)
function getLCPRating(value) {
  if (value <= 2500) return 'good';
  if (value <= 4000) return 'needs-improvement';
  return 'poor';
}

function getINPRating(value) {
  if (value <= 200) return 'good';
  if (value <= 500) return 'needs-improvement';
  return 'poor';
}

function getCLSRating(value) {
  if (value <= 0.1) return 'good';
  if (value <= 0.25) return 'needs-improvement';
  return 'poor';
}

// Enhanced recommendations (from your API route)
function generateVitalsRecommendations(desktopResults, mobileResults) {
  const recommendations = [];

  // LCP Recommendations
  const mobileLCP = mobileResults.audits['largest-contentful-paint']?.numericValue || 0;
  const desktopLCP = desktopResults.audits['largest-contentful-paint']?.numericValue || 0;

  if (mobileLCP > 2500 || desktopLCP > 2500) {
    recommendations.push({
      type: 'LCP',
      priority: 'high',
      title: 'Improve Largest Contentful Paint',
      description: `Current LCP is ${Math.round(mobileLCP)}ms on mobile, ${Math.round(desktopLCP)}ms on desktop. Target: <2.5s`,
      fixes: [
        'Optimize and compress images',
        'Implement proper image sizing',
        'Use a CDN for faster content delivery',
        'Optimize server response times',
        'Remove unused JavaScript and CSS'
      ]
    });
  }

  // INP/FID Recommendations  
  const mobileINP = mobileResults.audits['interaction-to-next-paint']?.numericValue || 0;
  const desktopINP = desktopResults.audits['interaction-to-next-paint']?.numericValue || 0;

  if (mobileINP > 200 || desktopINP > 200) {
    recommendations.push({
      type: 'INP',
      priority: 'high',
      title: 'Improve Interaction Response Time',
      description: `Current INP is ${Math.round(mobileINP)}ms on mobile, ${Math.round(desktopINP)}ms on desktop. Target: <200ms`,
      fixes: [
        'Reduce JavaScript execution time',
        'Break up long-running tasks',
        'Optimize third-party scripts',
        'Use web workers for heavy computations',
        'Implement code splitting'
      ]
    });
  }

  // CLS Recommendations
  const mobileCLS = mobileResults.audits['cumulative-layout-shift']?.numericValue || 0;
  const desktopCLS = desktopResults.audits['cumulative-layout-shift']?.numericValue || 0;

  if (mobileCLS > 0.1 || desktopCLS > 0.1) {
    recommendations.push({
      type: 'CLS',
      priority: 'medium',
      title: 'Reduce Layout Shifts',
      description: `Current CLS is ${mobileCLS.toFixed(3)} on mobile, ${desktopCLS.toFixed(3)} on desktop. Target: <0.1`,
      fixes: [
        'Add size attributes to images and videos',
        'Reserve space for ads and dynamic content',
        'Avoid inserting content above existing content',
        'Use CSS aspect-ratio for responsive images',
        'Preload custom fonts'
      ]
    });
  }

  return recommendations;
}

// Overall score calculation (from your API route)
function calculateOverallScore(desktopResults, mobileResults) {
  const desktopScore = desktopResults.categories?.performance?.score || 0;
  const mobileScore = mobileResults.categories?.performance?.score || 0;
  
  // Weight mobile more heavily (60/40 split)
  const overallScore = Math.round((mobileScore * 0.6 + desktopScore * 0.4) * 100);
  
  return {
    overall: overallScore,
    desktop: Math.round(desktopScore * 100),
    mobile: Math.round(mobileScore * 100),
    rating: overallScore >= 90 ? 'good' : overallScore >= 50 ? 'needs-improvement' : 'poor'
  };
}
