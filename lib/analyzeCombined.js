// lib/combined-analyze.js
import { analyzeWebsite } from './analyze';
import { analyzeLighthouse } from './lighthouse-analyze';

export async function analyzeCombined(url) {
    try {
        console.log('Starting combined analysis for:', url);
        
        // Run both analyses concurrently using Promise.allSettled for better error handling
        const [axeResult, lighthouseResult] = await Promise.allSettled([
            analyzeWebsite(url),
            analyzeLighthouse(url)
        ]);

        const axeResults = axeResult.status === 'fulfilled' ? axeResult.value : null;
        const lighthouseResults = lighthouseResult.status === 'fulfilled' ? lighthouseResult.value : null;

        return {
            url: url,
            timeStamp: new Date().toISOString(),
            axeResults,
            lighthouseResults,
            errors: {
                axe: axeResult.status === 'rejected' ? axeResult.reason?.message : null,
                lighthouse: lighthouseResult.status === 'rejected' ? lighthouseResult.reason?.message : null
            }
        };

    } catch (error) {
        console.error('Combined analysis error:', error);
        throw new Error(`Combined analysis failed: ${error.message}`);
    }
}
