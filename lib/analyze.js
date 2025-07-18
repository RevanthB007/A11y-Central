import { AxePuppeteer } from "@axe-core/puppeteer";
import puppeteer from "puppeteer";

export async function analyzeWebsite(url) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Run axe-core analysis
    const results = await new AxePuppeteer(page).analyze();
    console.log(results);

    // Process and return results matching the actual axe-core output structure
    return {
      url: url,
      timestamp: new Date().toISOString(),
      testEngine: results.testEngine,
      testRunner: results.testRunner,
      testEnvironment: results.testEnvironment,
      summary: {
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
      },
      violations: results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        tags: violation.tags,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary,
          impact: node.impact,
          any: node.any,
          all: node.all,
          none: node.none,
        })),
      })),
      passes: results.passes.map((pass) => ({
        id: pass.id,
        impact: pass.impact,
        description: pass.description,
        help: pass.help,
        helpUrl: pass.helpUrl,
        tags: pass.tags,
        nodes: pass.nodes.length, // Just count for summary
      })),
      incomplete: results.incomplete.map((incomplete) => ({
        id: incomplete.id,
        impact: incomplete.impact,
        description: incomplete.description,
        help: incomplete.help,
        helpUrl: incomplete.helpUrl,
        tags: incomplete.tags,
        nodes: incomplete.nodes.length,
      })),
      inapplicable: results.inapplicable.map((inapplicable) => ({
        id: inapplicable.id,
        description: inapplicable.description,
        help: inapplicable.help,
        helpUrl: inapplicable.helpUrl,
        tags: inapplicable.tags,
      })),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    } else {
      throw new Error("Analysis failed: Unknown error");
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


