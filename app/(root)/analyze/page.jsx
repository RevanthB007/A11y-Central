"use client"
import { useSearchParams } from "next/navigation"
import {  useEffect, useState, useRef } from "react"
import { Suspense } from "react"
import { useReactToPrint } from 'react-to-print'
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Info, Search, Zap, Shield, Smartphone, FileText, Server, RefreshCw, Eye, EyeOff, Globe, Image, Users, ExternalLink,Link } from "lucide-react"
import Http from "@/components/Http"
import Links from "@/components/Links"

function Analyze() {
  const searchParams = useSearchParams()
  const [url, setUrl] = useState("")
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const componentRef = useRef(null);
  const [showAllInternal, setShowAllInternal] = useState(false);
  const [showAllExternal, setShowAllExternal] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllSlow, setShowAllSlow] = useState(false);

  useEffect(() => {
    const url = searchParams.get("url")
    if (url.trim() !== "") {
      setUrl(url)
      runAnalysis(url)
      // httpStatus(url)
      // getLinkStatus(url)
    } 
  }, [searchParams])


  const runAnalysis = async (targetUrl) => {
    setLoading(true)
    setError(null)
    setResults(null)


    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      })


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }


      const data = await response.json()


      // Check if data exists and has the expected structure
      if (data && typeof data === 'object') {
        setResults(data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setError(error.message || 'Failed to analyze website')
    } finally {
      setLoading(false)
    }
  }

  // const getLinkStatus = async (targetUrl) => {
  //   setLoading(true)
  //   try {
  //     const response = await fetch("/api/monitor/broken-links", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ url: targetUrl }),
  //     })
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`)
  //     }
  //     const data = await response.json()
  //     if (data && typeof data === 'object') {
  //       setLinkStatus(data)
  //     }
  //     else {
  //       throw new Error('Invalid response format')
  //     }

  //   } catch (error) {
  //     console.error('Analysis error:', error)
  //     setError(error.message || 'Failed to analyze website')
  //   } finally {
  //     setLoading(false)
  //   }

  // }


  // const httpStatus = async (targetUrl) => {
  //   setLoading(true)
  //   try {
  //     const response = await fetch("api/monitor/http-status", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ url: targetUrl }),
  //     })
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`)
  //     }


  //     const data = await response.json()


  //     // Check if data exists and has the expected structure
  //     if (data && typeof data === 'object') {
  //       setHttpResults(data)
  //       console.log(data)
  //     } else {
  //       throw new Error('Invalid response format')
  //     }
  //   }
  //   catch (error) {
  //     console.error('Analysis error:', error)
  //     setError(error.message || 'Failed to analyze website')
  //   } finally {
  //     setLoading(false)
  //   }
  // }


  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-orange-400'
    return 'text-red-400'
  }


  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-900/20 border-green-500/30'
    if (score >= 70) return 'bg-orange-900/20 border-orange-500/30'
    return 'bg-red-900/20 border-red-500/30'
  }


  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Website Analysis Report - ${url || 'Unknown'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body { 
          font-family: Arial, sans-serif;
          color: #000 !important;
          background: white !important;
          line-height: 1.4;
        }
        .no-print { 
          display: none !important; 
        }
        .print-break { 
          page-break-before: always; 
        }
        
        /* Convert dark theme colors to print-friendly colors */
        .bg-gray-950,
        .bg-gray-900\\/50,
        .bg-gray-800\\/50,
        .bg-red-900\\/20,
        .bg-green-900\\/20,
        .bg-blue-900\\/20,
        .bg-orange-900\\/20,
        .bg-yellow-900\\/20,
        .bg-purple-900\\/30,
        .bg-pink-900\\/40,
        .bg-orange-900\\/40,
        .bg-gray-800\\/30 {
          background: white !important;
          border: 1px solid #ddd !important;
        }
        
        /* Text colors for print */
        .text-gray-100,
        .text-gray-200,
        .text-gray-300,
        .text-white,
        .text-blue-300,
        .text-green-300,
        .text-red-300,
        .text-orange-300,
        .text-yellow-300,
        .text-purple-300,
        .text-pink-300,
        .text-blue-200,
        .text-green-200,
        .text-red-200 {
          color: #000 !important;
        }
        
        .text-gray-400,
        .text-gray-500 {
          color: #555 !important;
        }
        
        .text-blue-400,
        .text-green-400,
        .text-red-400,
        .text-orange-400,
        .text-yellow-400,
        .text-purple-400,
        .text-pink-400 {
          color: #333 !important;
          font-weight: bold;
        }
        
        /* Border colors */
        .border-gray-700,
        .border-blue-500\\/30,
        .border-green-500\\/30,
        .border-red-500\\/30,
        .border-orange-500\\/30,
        .border-yellow-500\\/30,
        .border-gray-500 {
          border-color: #ccc !important;
        }
        
        /* Background colors for scores and badges */
        .bg-red-900\\/40,
        .bg-green-900\\/40,
        .bg-orange-900\\/40,
        .bg-yellow-900\\/40 {
          background: #f5f5f5 !important;
          border: 1px solid #ddd !important;
        }
        
        /* Code blocks */
        .bg-gray-700 {
          background: #f0f0f0 !important;
          color: #000 !important;
          border: 1px solid #ddd !important;
        }
        
        /* Ensure proper spacing and layout */
        .space-y-6 > * + * {
          margin-top: 24px !important;
        }
        
        .divide-y > * {
          border-bottom: 1px solid #ddd !important;
        }
        
        /* Hide gradients and fancy effects */
        .bg-gradient-to-r {
          background: white !important;
          border: 2px solid #ddd !important;
        }
        
        .shadow-xl {
          box-shadow: none !important;
          border: 1px solid #ddd !important;
        }
      }
    `
  });


  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto p-4">
        {/* Header with Print Button */}
        {results ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 no-print">
            <div>
              {url?
              <h1 className="text-3xl font-bold text-white">Analysis Results</h1>:<h1>No URL Provided</h1>}
              {url && (
                <p className="text-gray-400 mt-1">
                  Analyzing: <span className="font-semibold text-gray-200">{url}</span>
                </p>
              )}
            </div>
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export PDF Report
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4 text-white">Analysis Results</h1>
            {url && (
              <div className="mb-4">
                <p className="text-gray-400">Analyzing: <span className="font-semibold text-gray-200">{url}</span></p>
              </div>
            )}
          </>
        )}


        {/* Printable Content */}
        <div ref={componentRef} className="print-content">
          {/* PDF Header - only shows when printing */}
          <div className="hidden print:block mb-8 text-center border-b-2 border-gray-300 pb-6">
            <h1 className="text-3xl font-bold text-black mb-2">Website Analysis Report</h1>
            <p className="text-lg text-gray-700 mb-2">Generated on {new Date().toLocaleDateString('en-US')}</p>
            {url && <p className="text-xl text-gray-800 font-medium">Website: {url}</p>}
            <div className="mt-4 text-sm text-gray-600">
              <p>This report provides comprehensive analysis of your website's accessibility, performance, SEO, and best practices.</p>
            </div>
          </div>


          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Analyzing website accessibility and performance...</p>
            </div>
          )}


          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-red-400 mb-2">
                ⚠️ Analysis Failed
              </h2>
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => runAnalysis(url)}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors no-print"
              >
                Try Again
              </button>
            </div>
          )}


          {results && (
            <div className="space-y-6">
              {/* Test Information */}
              {results.axeResults?.testEngine && (
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h3 className="font-semibold text-blue-300 mb-2">Test Information</h3>
                  <p className="text-sm text-blue-200">
                    Engine: {results.axeResults.testEngine.name} v{results.axeResults.testEngine.version}
                  </p>
                  <p className="text-sm text-blue-200">
                    Analyzed: {new Date(results.timeStamp).toLocaleString('en-US')}
                  </p>
                </div>
              )}


              {/* Accessibility Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-900/20 p-4 rounded border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-300">Violations</h3>
                  <p className="text-2xl font-bold text-red-400">
                    {results.axeResults?.summary?.violations || (results.axeResults?.violations ? results.axeResults.violations.length : 0)}
                  </p>
                </div>


                <div className="bg-green-900/20 p-4 rounded border-l-4 border-green-500">
                  <h3 className="font-semibold text-green-300">Passes</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {results.axeResults?.summary?.passes || (results.axeResults?.passes ? results.axeResults.passes.length : 0)}
                  </p>
                </div>


                <div className="bg-yellow-900/20 p-4 rounded border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-yellow-300">Incomplete</h3>
                  <p className="text-2xl font-bold text-yellow-400">
                    {results.axeResults?.summary?.incomplete || (results.axeResults?.incomplete ? results.axeResults.incomplete.length : 0)}
                  </p>
                </div>


                <div className="bg-gray-800/50 p-4 rounded border-l-4 border-gray-500">
                  <h3 className="font-semibold text-gray-300">Not Applicable</h3>
                  <p className="text-2xl font-bold text-gray-400">
                    {results.axeResults?.summary?.inapplicable || (results.axeResults?.inapplicable ? results.axeResults.inapplicable.length : 0)}
                  </p>
                </div>
              </div>


              {/* Violations List */}
              {results.axeResults?.violations && results.axeResults.violations.length > 0 && (
                <div className="bg-gray-900/50 rounded-lg shadow-xl border border-gray-700 print-break">
                  <div className="px-6 py-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-red-400">Accessibility Violations</h2>
                  </div>
                  <div className="divide-y divide-gray-700">
                    {results.axeResults.violations.map((violation, index) => (
                      <div key={index} className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-100">{violation.help}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${violation.impact === 'critical' ? 'bg-red-900/40 text-red-300 border border-red-600/30' :
                            violation.impact === 'serious' ? 'bg-orange-900/40 text-orange-300 border border-orange-600/30' :
                              violation.impact === 'moderate' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-600/30' :
                                'bg-gray-800 text-gray-300 border border-gray-600'
                            }`}>
                            {violation.impact}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-2">{violation.description}</p>
                        <p className="text-sm text-gray-400 mb-2">
                          Affects {violation.nodes?.length || 0} element(s)
                        </p>


                        {/* Show affected elements */}
                        {violation.nodes && violation.nodes.length > 0 && (
                          <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                            <h4 className="text-sm font-medium text-gray-200 mb-2">Affected Elements:</h4>
                            {violation.nodes.slice(0, 3).map((node, nodeIndex) => (
                              <div key={nodeIndex} className="text-xs text-gray-400 mb-1">
                                <code className="bg-gray-700 text-gray-200 px-1 rounded">
                                  {node.target?.join(' ') || 'Unknown element'}
                                </code>
                              </div>
                            ))}
                            {violation.nodes.length > 3 && (
                              <p className="text-xs text-gray-500">
                                ...and {violation.nodes.length - 3} more
                              </p>
                            )}
                          </div>
                        )}


                        <a
                          href={violation.helpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          Learn more about this issue →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* No violations message */}
              {(!results.axeResults?.violations || results.axeResults.violations.length === 0) && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-green-300 mb-2">
                    🎉 No Accessibility Violations Found!
                  </h2>
                  <p className="text-green-200">
                    This website appears to meet basic accessibility standards according to axe-core analysis.
                  </p>
                </div>
              )}


              {/* Passes Summary */}
              {results.axeResults?.passes && results.axeResults.passes.length > 0 && (
                <div className="bg-gray-900/50 rounded-lg shadow-xl border border-gray-700 print-break">
                  <div className="px-6 py-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-green-400">Accessibility Checks Passed</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {results.axeResults.passes.length} accessibility rules passed successfully
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.axeResults.passes.map((pass, index) => (
                        <div key={index} className="flex items-center p-3 bg-green-900/20 rounded border border-green-500/30">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-800/50 rounded-full flex items-center justify-center mr-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-300">{pass.help}</p>
                            <p className="text-xs text-green-200/80">{pass.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}


              {/* Lighthouse Score Cards */}
              {results.lighthouseResults && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 print-break">
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.performance)}`}>
                    <h3 className="font-semibold text-blue-300">Performance</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.performance)}`}>
                      {Math.round(results.lighthouseResults.scores.performance)}
                    </p>
                  </div>
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.accessibility)}`}>
                    <h3 className="font-semibold text-green-300">Accessibility</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.accessibility)}`}>
                      {Math.round(results.lighthouseResults.scores.accessibility)}
                    </p>
                  </div>
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.seo)}`}>
                    <h3 className="font-semibold text-purple-300">SEO</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.seo)}`}>
                      {Math.round(results.lighthouseResults.scores.seo)}
                    </p>
                  </div>
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.bestPractices)}`}>
                    <h3 className="font-semibold text-orange-300">Best Practices</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.bestPractices)}`}>
                      {Math.round(results.lighthouseResults.scores.bestPractices)}
                    </p>
                  </div>
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.pwa)}`}>
                    <h3 className="font-semibold text-pink-300">PWA</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.pwa)}`}>
                      {Math.round(results.lighthouseResults.scores.pwa)}
                    </p>
                  </div>
                </div>
              )}


              {/* Performance Opportunities */}
              {results.lighthouseResults?.opportunities && results.lighthouseResults.opportunities.length > 0 && (
                <div className="bg-gray-900/50 rounded-lg shadow-xl border border-gray-700 print-break">
                  <div className="px-6 py-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-orange-400 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Performance Opportunities
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {results.lighthouseResults.opportunities.length} performance improvements found
                    </p>
                  </div>
                  <div className="divide-y divide-gray-700">
                    {results.lighthouseResults.opportunities.map((opportunity, index) => (
                      <div key={index} className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-100">{opportunity.title}</h3>
                          {opportunity.displayValue && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-orange-900/40 text-orange-300 border border-orange-600/30">
                              {opportunity.displayValue}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 mb-2">{opportunity.description}</p>
                        <div className="flex items-center text-sm text-gray-400">
                          <Info className="w-4 h-4 mr-1" />
                          Score: {Math.round((opportunity.score || 0) * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* SEO Analysis */}
              {results.lighthouseResults && (
                <div className="bg-gray-900/50 rounded-lg shadow-xl border border-gray-700 print-break">
                  <div className="px-6 py-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-purple-400 flex items-center">
                      <Search className="w-5 h-5 mr-2" />
                      SEO Analysis
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Current SEO score: {Math.round(results.lighthouseResults.scores.seo)}%
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-900/40 rounded-full flex items-center justify-center mr-3">
                            <Search className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-100">Meta Description</p>
                            <p className="text-sm text-gray-400">Page description optimization</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${results.lighthouseResults.scores.seo >= 80 ? 'bg-green-900/40 text-green-300 border border-green-600/30' : 'bg-red-900/40 text-red-300 border border-red-600/30'
                          }`}>
                          {results.lighthouseResults.scores.seo >= 80 ? 'Good' : 'Needs Work'}
                        </span>
                      </div>


                      <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-900/40 rounded-full flex items-center justify-center mr-3">
                            <Search className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-100">Page Title</p>
                            <p className="text-sm text-gray-400">Title tag optimization</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${results.lighthouseResults.scores.seo >= 70 ? 'bg-green-900/40 text-green-300 border border-green-600/30' : 'bg-red-900/40 text-red-300 border border-red-600/30'
                          }`}>
                          {results.lighthouseResults.scores.seo >= 70 ? 'Good' : 'Needs Work'}
                        </span>
                      </div>


                      <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-900/40 rounded-full flex items-center justify-center mr-3">
                            <Smartphone className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-100">Mobile Friendliness</p>
                            <p className="text-sm text-gray-400">Mobile optimization status</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${results.lighthouseResults.scores.seo >= 75 ? 'bg-green-900/40 text-green-300 border border-green-600/30' : 'bg-red-900/40 text-red-300 border border-red-600/30'
                          }`}>
                          {results.lighthouseResults.scores.seo >= 75 ? 'Optimized' : 'Needs Work'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Best Practices */}
              {results.lighthouseResults && (
                <div className="bg-gray-900/50 rounded-lg shadow-xl border border-gray-700 print-break">
                  <div className="px-6 py-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-orange-400 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Best Practices
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Current score: {Math.round(results.lighthouseResults.scores.bestPractices)}%
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-900/40 rounded-full flex items-center justify-center mr-3">
                            <Shield className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-100">HTTPS Usage</p>
                            <p className="text-sm text-gray-400">Secure connection protocols</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${results.lighthouseResults.scores.bestPractices >= 80 ? 'bg-green-900/40 text-green-300 border border-green-600/30' : 'bg-red-900/40 text-red-300 border border-red-600/30'
                          }`}>
                          {results.lighthouseResults.scores.bestPractices >= 80 ? 'Secure' : 'Needs Work'}
                        </span>
                      </div>


                      <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-900/40 rounded-full flex items-center justify-center mr-3">
                            <AlertTriangle className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-100">Console Errors</p>
                            <p className="text-sm text-gray-400">Browser console cleanliness</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${results.lighthouseResults.scores.bestPractices >= 70 ? 'bg-green-900/40 text-green-300 border border-green-600/30' : 'bg-red-900/40 text-red-300 border border-red-600/30'
                          }`}>
                          {results.lighthouseResults.scores.bestPractices >= 70 ? 'Clean' : 'Has Issues'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* PWA Features */}
              {results.lighthouseResults && (
                <div className="bg-gray-900/50 rounded-lg shadow-xl border border-gray-700 print-break">
                  <div className="px-6 py-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-pink-400 flex items-center">
                      <Smartphone className="w-5 h-5 mr-2" />
                      Progressive Web App
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      PWA readiness: {Math.round(results.lighthouseResults.scores.pwa)}%
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-pink-900/40 rounded-full flex items-center justify-center mr-3">
                            <Zap className="w-5 h-5 text-pink-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-100">Service Worker</p>
                            <p className="text-sm text-gray-400">Offline functionality support</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${results.lighthouseResults.scores.pwa >= 30 ? 'bg-green-900/40 text-green-300 border border-green-600/30' : 'bg-red-900/40 text-red-300 border border-red-600/30'
                          }`}>
                          {results.lighthouseResults.scores.pwa >= 30 ? 'Available' : 'Missing'}
                        </span>
                      </div>


                      <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-pink-900/40 rounded-full flex items-center justify-center mr-3">
                            <Smartphone className="w-5 h-5 text-pink-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-100">Web App Manifest</p>
                            <p className="text-sm text-gray-400">App installation configuration</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${results.lighthouseResults.scores.pwa >= 40 ? 'bg-green-900/40 text-green-300 border border-green-600/30' : 'bg-red-900/40 text-red-300 border border-red-600/30'
                          }`}>
                          {results.lighthouseResults.scores.pwa >= 40 ? 'Available' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* HTTP Results */}
        <Http url={url} setUrl={setUrl} loading={loading} setLoading={setLoading} error={error} setError={setError}/>





      <Links url={url} setUrl={setUrl} loading={loading} setLoading={setLoading} error={error} setError={setError}/>

      </div>
    </div>
  );
}


export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-100">Loading...</div>
    </div>}>
      <Analyze />
    </Suspense>
  );
}
