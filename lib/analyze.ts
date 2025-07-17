import { analyzeWebsiteParams } from "@/types";
import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';
import { AnalysisResult } from "@/types";

export async function analyzeWebsite({ url }: analyzeWebsiteParams) :Promise<AnalysisResult> {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        // Run axe-core analysis
        const results = await new AxePuppeteer(page).analyze();

        // Process and return results
        return {
            url: url,
            timestamp: new Date().toISOString(),
            summary: {
                violations: results.violations.length,
                passes: results.passes.length,
                incomplete: results.incomplete.length,
                inapplicable: results.inapplicable.length
            },
            violations: results.violations.map(violation => ({
                id: violation.id,
                impact: violation.impact,
                description: violation.description,
                help: violation.help,
                helpUrl: violation.helpUrl,
                nodes: violation.nodes.map(node => ({
                    target: node.target,
                    html: node.html,
                    failureSummary: node.failureSummary
                }))
            })),
            passes: results.passes.length, // Just count for now
            incomplete: results.incomplete.length
        };

    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Analysis failed: ${error.message}`);
        } else {
            throw new Error('Analysis failed: Unknown error');
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
