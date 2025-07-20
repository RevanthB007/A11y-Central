import { NextRequest, NextResponse } from "next/server";
import model from "@/lib/gemini"
import { Suggestion } from "@/models/suggestions";

export async function POST(request: NextRequest) {
  try {
    const { type, data, context, url } = await request.json();

    if (!data || !type) {
      return NextResponse.json({
        error: "missing data or type"
      }, { status: 400 });
    }

    let prompt = "";
    switch (type) {
      case 'violation':
        prompt = createViolationPrompt(data, context);
        break;
      case 'performance':
        prompt = createPerformancePrompt(data, context);
        break;
      case 'seo':
        prompt = createSEOPrompt(data, context);
        break;
      case 'performance-bulk':
        prompt = createBulkPerformancePrompt(data, context);
        break;
      default:
        prompt = createGenericPrompt(data, context);
    }

    console.log('Prompt:', type);

    const content = await model.generateContent(prompt);
    const response = content.response
    const result = response.text()

    try {
      const aiSuggestions = JSON.parse(result);
      aiSuggestions.url = url; const cleanedSuggestions = {
        quickFix: aiSuggestions.quickFix || {
          code: 'No code provided',
          explanation: 'No explanation available',
          effort: 'Unknown',
          impact: 'Unknown'
        },
        alternatives: Array.isArray(aiSuggestions.alternatives) ? aiSuggestions.alternatives : [],
        testingSteps: Array.isArray(aiSuggestions.testingSteps) ? aiSuggestions.testingSteps : [],
        relatedIssues: Array.isArray(aiSuggestions.relatedIssues) ? aiSuggestions.relatedIssues : [],
        url,
        type
      };

      try {
        await Suggestion.create(cleanedSuggestions);
      } catch (e) {
        console.log(e);
      }
      return NextResponse.json(cleanedSuggestions);
    } catch (error) {
      const aiSuggestions = {
        quickFix: {
          code: extractCodeFromText(result),
          explanation: result,
          effort: "5-10 minutes",
          impact: "Improves accessibility compliance"
        },
        alternatives: [],
        testingSteps: ["Test the fix with screen readers", "Validate with accessibility tools"],
        relatedIssues: []
      };

      return NextResponse.json(aiSuggestions);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: error.message || 'Analysis failed'
    }, { status: 500 });
  }
}



function createViolationPrompt(violation: any, context: any) {
  return `
You are an expert web accessibility developer. Analyze this accessibility violation and provide specific code fixes.

VIOLATION DETAILS:
- Rule ID: ${violation.id}
- Issue: ${violation.help}
- Impact Level: ${violation.impact}
- Description: ${violation.description}
- Affected Elements: ${violation.nodes?.length || 0}
- HTML Context: ${context.htmlContext || 'Not provided'}
- Page URL: ${context.pageUrl}

PROVIDE A JSON RESPONSE WITH THIS EXACT STRUCTURE:
{
  "quickFix": {
    "code": "exact HTML/CSS/JS code to fix the issue",
    "explanation": "clear explanation of why this fixes the accessibility issue",
    "effort": "estimated time to implement (e.g., '2-5 minutes')",
    "impact": "accessibility improvement description",
    "wcagCriteria": "WCAG success criteria that this addresses"
  },
  "alternatives": [
    {
      "code": "alternative fix approach",
      "explanation": "when to use this alternative approach",
      "pros": "advantages of this method",
      "cons": "potential drawbacks"
    }
  ],
  "testingSteps": [
    "Step 1: Test with screen reader",
    "Step 2: Validate with accessibility tools",
    "Step 3: Manual keyboard navigation test"
  ],
  "relatedIssues": [
    "Other potential accessibility issues to check"
  ]
}

Focus on providing copy-paste ready code solutions that developers can implement immediately.
`;
}


function createPerformancePrompt(opportunity: any, context: any) {
  return `
You are a web performance expert. Analyze this performance opportunity and provide specific optimization code.

PERFORMANCE OPPORTUNITY:
- Issue: ${opportunity.title}
- Description: ${opportunity.description}
- Current Score: ${opportunity.score}
- Potential Savings: ${opportunity.displayValue}
- Page URL: ${context.pageUrl}

PROVIDE A JSON RESPONSE WITH:
{
  "quickFix": {
    "code": "specific code changes to implement this optimization",
    "explanation": "why this improves performance",
    "effort": "implementation time estimate",
    "impact": "expected performance improvement",
    "metrics": "which Core Web Vitals this affects"
  },
  "alternatives": [
    {
      "code": "alternative optimization approach",
      "explanation": "when to use this approach instead"
    }
  ],
  "testingSteps": [
    "How to measure the improvement",
    "Tools to verify the optimization"
  ]
}

Provide practical, implementable performance optimizations.
`;
}

function createSEOPrompt(data: any, context: any) {
  return `
You are an SEO expert. Analyze the current SEO score and provide specific improvements.

SEO ANALYSIS:
- Current SEO Score: ${context.currentScore}%
- Page URL: ${context.pageUrl}
- Issues Found: Based on Lighthouse SEO audit

PROVIDE A JSON RESPONSE WITH:
{
  "quickFix": {
    "code": "HTML/meta tag improvements for immediate SEO gains",
    "explanation": "how this improves search engine optimization",
    "effort": "time to implement",
    "impact": "expected SEO improvement"
  },
  "alternatives": [
    {
      "code": "additional SEO optimization",
      "explanation": "when and how to implement this"
    }
  ],
  "testingSteps": [
    "How to verify SEO improvements",
    "Tools to test the changes"
  ]
}

Focus on technical SEO improvements that can be implemented immediately.
`;
}

function createBulkPerformancePrompt(opportunities: any[], context: any) {
  return `
Create a comprehensive performance optimization strategy for multiple issues.

PERFORMANCE OPPORTUNITIES: ${opportunities.length} issues found
Current Score: ${context.currentScore}%
Page: ${context.pageUrl}

PROVIDE A JSON RESPONSE WITH:
{
  "quickFix": {
    "explanation": "Priority-based optimization strategy covering the most impactful improvements",
    "effort": "estimated total implementation time",
    "impact": "expected overall performance improvement"
  }
}

Provide a strategic approach to address multiple performance issues efficiently.
`;
}

function createGenericPrompt(data: any, context: any) {
  return `
Analyze this web development issue and provide a practical solution.

ISSUE DATA: ${JSON.stringify(data, null, 2)}
CONTEXT: ${JSON.stringify(context, null, 2)}

Provide specific, actionable code improvements in JSON format.
`;
}

// Helper function to extract code from text responses
function extractCodeFromText(text: string): string {
  // Look for code blocks in markdown format
  const codeBlockMatch = text.match(/``````/g);
  if (codeBlockMatch && codeBlockMatch.length > 0) {
    return codeBlockMatch[0].replace(/``````/g, '').trim();
  }

  // Look for inline code
  const inlineCodeMatch = text.match(/`([^`]+)`/);
  if (inlineCodeMatch) {
    return inlineCodeMatch[1];
  }

  // Return original text if no code found
  return text;
}
