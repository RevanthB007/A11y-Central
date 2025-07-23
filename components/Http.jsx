"use client"
import React, { useState, useEffect } from 'react'
import { Server, CheckCircle, RefreshCw, AlertTriangle, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react' // Adjust import as needed
import { useSearchParams } from 'next/navigation'
const Http = ({ url, setUrl,loading,setLoading,error,setError}) => {
  const [httpResults, setHttpResults] = useState(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    const url = searchParams.get("url")
    if (url && url.trim() !== "") {
      setUrl(url)
      httpStatus(url)
    }        
  },[searchParams])

  const httpStatus = async (targetUrl) => {
    setLoading(true)
    try {
      const response = await fetch("api/monitor/http-status", {
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

      if (data && typeof data === 'object') {
        setHttpResults(data)
        console.log(data)
      } else {
        throw new Error('Invalid response format')
      }
    }
    catch (error) {
      console.error('Analysis error:', error)
      setError(error.message || 'Failed to analyze website')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {httpResults && (
        <div className="bg-gray-900/50 rounded-lg shadow-xl border border-gray-700 print-break">
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    HTTP Status Monitoring
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Analyzed {httpResults.summary?.totalUrls || 0} URLs
                  </p>
                </div>
                <div className={`text-2xl font-bold ${httpResults.healthScore >= 90 ? 'text-green-400' :
                  httpResults.healthScore >= 70 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                  {httpResults.healthScore}/100
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded border bg-green-900/20 border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Successful</span>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {httpResults.summary?.successfulUrls || 0}
                  </div>
                </div>

                <div className="p-4 rounded border bg-yellow-900/20 border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Redirects</span>
                    <RefreshCw className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {httpResults.summary?.redirectUrls || 0}
                  </div>
                </div>

                <div className="p-4 rounded border bg-red-900/20 border-red-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Client Errors</span>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    {httpResults.summary?.clientErrors || 0}
                  </div>
                </div>

                <div className="p-4 rounded border bg-red-900/30 border-red-600/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Server Errors</span>
                    <Server className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {httpResults.summary?.serverErrors || 0}
                  </div>
                </div>
              </div>

              {/* Status Code Distribution */}
              {httpResults.statusCodes && Object.keys(httpResults.statusCodes).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-200">Status Code Distribution</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {Object.entries(httpResults.statusCodes).map(([status, urls]) => (
                      <div key={status} className="text-center p-3 bg-gray-800/30 rounded border border-gray-600">
                        <div className={`text-xl font-bold ${status >= 200 && status < 300 ? 'text-green-400' :
                          status >= 300 && status < 400 ? 'text-yellow-400' :
                            status >= 400 && status < 500 ? 'text-red-400' :
                              status >= 500 ? 'text-red-600' : 'text-gray-400'
                          }`}>
                          {urls.length}
                        </div>
                        <div className="text-xs text-gray-400">Status {status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Errors (4xx) */}
              {httpResults.errors && httpResults.errors.filter(err => err.type === 'client_error').length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-400">
                    Client Errors (4xx) ({httpResults.errors.filter(err => err.type === 'client_error').length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {httpResults.errors.filter(err => err.type === 'client_error').slice(0, 5).map((error, index) => (
                      <div key={index} className="p-3 rounded border text-sm bg-red-900/20 border-red-500/30">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-xs text-gray-300 break-all flex-1 mr-2">
                            {error.url}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 font-medium">{error.statusCode}</span>
                            <a
                              href={error.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <p className="text-red-200/80 text-sm">{error.error}</p>
                      </div>
                    ))}
                    {httpResults.errors.filter(err => err.type === 'client_error').length > 5 && (
                      <div className="text-center text-gray-400 text-sm py-2">
                        ... and {httpResults.errors.filter(err => err.type === 'client_error').length - 5} more client errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Server Errors (5xx) */}
              {httpResults.serverErrors && httpResults.serverErrors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-600">
                    Server Errors (5xx) ({httpResults.serverErrors.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {httpResults.serverErrors.slice(0, 5).map((error, index) => (
                      <div key={index} className="p-3 rounded border text-sm bg-red-900/30 border-red-600/40">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-xs text-gray-300 break-all flex-1 mr-2">
                            {error.url}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 font-medium">{error.statusCode}</span>
                            <a
                              href={error.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <p className="text-red-200/80 text-sm">{error.error}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          Detected: {new Date(error.timestamp).toLocaleString('en-US')}
                        </p>
                      </div>
                    ))}
                    {httpResults.serverErrors.length > 5 && (
                      <div className="text-center text-gray-400 text-sm py-2">
                        ... and {httpResults.serverErrors.length - 5} more server errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Network Errors */}
              {httpResults.errors && httpResults.errors.filter(err => err.type === 'network_error').length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-orange-400">
                    Network Errors ({httpResults.errors.filter(err => err.type === 'network_error').length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {httpResults.errors.filter(err => err.type === 'network_error').slice(0, 5).map((error, index) => (
                      <div key={index} className="p-3 rounded border text-sm bg-orange-900/20 border-orange-500/30">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-xs text-gray-300 break-all flex-1 mr-2">
                            {error.url}
                          </span>
                          <a
                            href={error.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-orange-200/80 text-sm">{error.error}</p>
                      </div>
                    ))}
                    {httpResults.errors.filter(err => err.type === 'network_error').length > 5 && (
                      <div className="text-center text-gray-400 text-sm py-2">
                        ... and {httpResults.errors.filter(err => err.type === 'network_error').length - 5} more network errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Redirect Chains */}
              {httpResults.redirectChains && httpResults.redirectChains.length > 0 && (() => {
                const [expandedChain, setExpandedChain] = useState(null)
                return (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-yellow-400">
                      Redirect Chains ({httpResults.redirectChains.length})
                    </h3>
                    <div className="space-y-2">
                      {httpResults.redirectChains.slice(0, 5).map((chain, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded border ${chain.excessive
                            ? 'bg-red-900/20 border-red-500/30'
                            : 'bg-yellow-900/20 border-yellow-500/30'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-200">
                                Chain Length: {chain.chainLength}
                              </span>
                              {chain.excessive && (
                                <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                                  Excessive
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => setExpandedChain(expandedChain === index ? null : index)}
                              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                            >
                              {expandedChain === index ? (
                                <>Hide Details <ChevronUp className="w-3 h-3" /></>
                              ) : (
                                <>Show Details <ChevronDown className="w-3 h-3" /></>
                              )}
                            </button>
                          </div>

                          <div className="text-xs font-mono text-gray-300 mb-2">
                            {chain.originalUrl}
                          </div>

                          {expandedChain === index && (
                            <div className="mt-3 space-y-1 pl-4 border-l-2 border-gray-600">
                              {chain.chain.map((step, stepIndex) => (
                                <div key={stepIndex} className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400">{stepIndex + 1}.</span>
                                    <span className="font-mono text-gray-300 text-xs break-all">{step.url}</span>
                                    <span className={`px-1 py-0.5 text-xs rounded ${step.statusCode >= 200 && step.statusCode < 300 ? 'bg-green-600' :
                                      step.statusCode >= 300 && step.statusCode < 400 ? 'bg-yellow-600' :
                                        'bg-red-600'
                                      } text-white`}>
                                      {step.statusCode}
                                    </span>
                                  </div>
                                  {step.error && (
                                    <div className="text-xs text-red-300 ml-6">
                                      Error: {step.error}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {httpResults.redirectChains.length > 5 && (
                        <div className="text-center text-gray-400 text-sm py-2">
                          ... and {httpResults.redirectChains.length - 5} more redirect chains
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* No Issues Message */}
              {httpResults.summary?.totalUrls > 0 &&
                httpResults.summary?.clientErrors === 0 &&
                httpResults.summary?.serverErrors === 0 &&
                httpResults.summary?.networkErrors === 0 && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-green-300 mb-2">
                      🎉 No HTTP Status Issues Found!
                    </h3>
                    <p className="text-green-200">
                      All {httpResults.summary.totalUrls} analyzed URLs are returning healthy status codes.
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}
        </>
  )
}

export default Http