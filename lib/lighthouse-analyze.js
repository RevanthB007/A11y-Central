// lib/lighthouse-analyze.js
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

export async function analyzeLighthouse(url) {
    let browser;
    
    try {
        // Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        // Get browser endpoint
        const endpoint = browser.wsEndpoint();
        const endpointURL = new URL(endpoint);

        // Run Lighthouse with proper configuration
        const result = await lighthouse(url, {
            port: endpointURL.port,
            output: 'json',
            logLevel: 'error', // Reduce logging
            disableDeviceEmulation: false,
            chromeFlags: ['--disable-mobile-emulation'],
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa']
        });

        if (!result || !result.lhr) {
            throw new Error('Lighthouse analysis failed - no results returned');
        }

        const lhr = result.lhr;

        return {
            url: url,
            timestamp: new Date().toISOString(),
            scores: {
                performance: lhr.categories.performance?.score ? Math.round(lhr.categories.performance.score * 100) : 0,
                accessibility: lhr.categories.accessibility?.score ? Math.round(lhr.categories.accessibility.score * 100) : 0,
                seo: lhr.categories.seo?.score ? Math.round(lhr.categories.seo.score * 100) : 0,
                bestPractices: lhr.categories['best-practices']?.score ? Math.round(lhr.categories['best-practices'].score * 100) : 0,
                pwa: lhr.categories.pwa?.score ? Math.round(lhr.categories.pwa.score * 100) : 0
            },
            opportunities: lhr.categories.performance?.auditRefs
                ?.filter(ref => lhr.audits[ref.id]?.score !== null && lhr.audits[ref.id]?.score < 1)
                ?.map(ref => ({
                    id: ref.id,
                    title: lhr.audits[ref.id]?.title || 'Unknown',
                    description: lhr.audits[ref.id]?.description || 'No description',
                    score: lhr.audits[ref.id]?.score || 0,
                    displayValue: lhr.audits[ref.id]?.displayValue || null
                })) || [],
            accessibilityIssues: Object.values(lhr.audits)
                .filter(audit => 
                    audit.score !== null && 
                    audit.score < 1 && 
                    audit.details?.type === 'list' &&
                    lhr.categories.accessibility?.auditRefs?.some(ref => ref.id === audit.id)
                )
                .map(audit => ({
                    id: audit.id,
                    title: audit.title,
                    description: audit.description,
                    score: audit.score,
                    impact: audit.details?.items?.length || 0
                })) || []
        };

    } catch (error) {
        console.error('Lighthouse analysis error:', error);
        throw new Error(`Lighthouse analysis failed: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
