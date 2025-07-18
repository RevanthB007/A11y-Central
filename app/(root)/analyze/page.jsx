// "use client"
// import { useSearchParams } from "next/navigation"
// import { JSX, useEffect, useState } from "react"
// import { Suspense } from "react"
// import { AnalysisResult } from "@/types"
// import { Button } from "@/components/ui/button"
// import { Lock, Unlock, AlertTriangle, CheckCircle, Info } from "lucide-react"

// function Analyze() {
//   const searchParams = useSearchParams()
//   const [url, setUrl] = useState("")
//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [isUnlocked, setIsUnlocked] = useState(false)
  
//   useEffect(() => {
//     const url = searchParams.get("url")
//     if (url) {
//       setUrl(url)
//       runAnalysis(url)
//     }
//   }, [searchParams])

//   const runAnalysis = async (targetUrl) => {
//     setLoading(true)
//     setError(null)
//     setResults(null)
    
//     try {
//       const response = await fetch("/api/analyze", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ url: targetUrl }),
//       })
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
      
//       const data = await response.json()
      
//       // Check if data exists and has the expected structure
//       if (data && typeof data === 'object') {
//         setResults(data)
//       } else {
//         throw new Error('Invalid response format')
//       }
//     } catch (error) {
//       console.error('Analysis error:', error)
//       setError(error.message || 'Failed to analyze website')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleUnlock = () => {
//     setIsUnlocked(true)
//   }

//   const getScoreColor = (score) => {
//     if (score >= 90) return 'text-green-600'
//     if (score >= 70) return 'text-orange-600'
//     return 'text-red-600'
//   }

//   const getScoreBgColor = (score) => {
//     if (score >= 90) return 'bg-green-50 border-green-400'
//     if (score >= 70) return 'bg-orange-50 border-orange-400'
//     return 'bg-red-50 border-red-400'
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Analysis Results</h1>
      
//       {url && (
//         <div className="mb-4">
//           <p className="text-gray-600">Analyzing: <span className="font-semibold">{url}</span></p>
//         </div>
//       )}
      
//       {loading && (
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p>Analyzing website accessibility and performance...</p>
//         </div>
//       )}
      
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
//           <h2 className="text-lg font-semibold text-red-800 mb-2">
//             ⚠️ Analysis Failed
//           </h2>
//           <p className="text-red-600">{error}</p>
//           <button 
//             onClick={() => runAnalysis(url)}
//             className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//           >
//             Try Again
//           </button>
//         </div>
//       )}
      
//       {results && (
//         <div className="space-y-6">
//           {/* Test Information */}
//           {results.axeResults?.testEngine && (
//             <div className="bg-blue-50 p-4 rounded-lg border">
//               <h3 className="font-semibold text-blue-800 mb-2">Test Information</h3>
//               <p className="text-sm text-blue-700">
//                 Engine: {results.axeResults.testEngine.name} v{results.axeResults.testEngine.version}
//               </p>
//               <p className="text-sm text-blue-700">
//                 Analyzed: {new Date(results.timeStamp).toLocaleString()}
//               </p>
//             </div>
//           )}

//           {/* Lighthouse Score Cards - Only show if unlocked */}
//           {isUnlocked && results.lighthouseResults && (
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//               <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.performance)}`}>
//                 <h3 className="font-semibold text-blue-800">Performance</h3>
//                 <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.performance)}`}>
//                   {Math.round(results.lighthouseResults.scores.performance)}
//                 </p>
//               </div>
//               <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.accessibility)}`}>
//                 <h3 className="font-semibold text-green-800">Accessibility</h3>
//                 <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.accessibility)}`}>
//                   {Math.round(results.lighthouseResults.scores.accessibility)}
//                 </p>
//               </div>
//               <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.seo)}`}>
//                 <h3 className="font-semibold text-purple-800">SEO</h3>
//                 <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.seo)}`}>
//                   {Math.round(results.lighthouseResults.scores.seo)}
//                 </p>
//               </div>
//               <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.bestPractices)}`}>
//                 <h3 className="font-semibold text-orange-800">Best Practices</h3>
//                 <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.bestPractices)}`}>
//                   {Math.round(results.lighthouseResults.scores.bestPractices)}
//                 </p>
//               </div>
//               <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.pwa)}`}>
//                 <h3 className="font-semibold text-pink-800">PWA</h3>
//                 <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.pwa)}`}>
//                   {Math.round(results.lighthouseResults.scores.pwa)}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Accessibility Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="bg-red-50 p-4 rounded border-l-4 border-red-400">
//               <h3 className="font-semibold text-red-800">Violations</h3>
//               <p className="text-2xl font-bold text-red-600">
//                 {results.axeResults?.summary?.violations || (results.axeResults?.violations ? results.axeResults.violations.length : 0)}
//               </p>
//             </div>
            
//             <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
//               <h3 className="font-semibold text-green-800">Passes</h3>
//               <p className="text-2xl font-bold text-green-600">
//                 {results.axeResults?.summary?.passes || (results.axeResults?.passes ? results.axeResults.passes.length : 0)}
//               </p>
//             </div>
            
//             <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
//               <h3 className="font-semibold text-yellow-800">Incomplete</h3>
//               <p className="text-2xl font-bold text-yellow-600">
//                 {results.axeResults?.summary?.incomplete || (results.axeResults?.incomplete ? results.axeResults.incomplete.length : 0)}
//               </p>
//             </div>
            
//             <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-400">
//               <h3 className="font-semibold text-gray-800">Not Applicable</h3>
//               <p className="text-2xl font-bold text-gray-600">
//                 {results.axeResults?.summary?.inapplicable || (results.axeResults?.inapplicable ? results.axeResults.inapplicable.length : 0)}
//               </p>
//             </div>
//           </div>
          
//           {/* Violations List */}
//           {results.axeResults?.violations && results.axeResults.violations.length > 0 && (
//             <div className="bg-white rounded-lg shadow">
//               <div className="px-6 py-4 border-b">
//                 <h2 className="text-xl font-semibold text-red-600">Accessibility Violations</h2>
//               </div>
//               <div className="divide-y">
//                 {results.axeResults.violations.map((violation, index) => (
//                   <div key={index} className="p-6">
//                     <div className="flex justify-between items-start mb-2">
//                       <h3 className="font-semibold text-gray-900">{violation.help}</h3>
//                       <span className={`px-2 py-1 text-xs font-medium rounded ${
//                         violation.impact === 'critical' ? 'bg-red-100 text-red-800' :
//                         violation.impact === 'serious' ? 'bg-orange-100 text-orange-800' :
//                         violation.impact === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-gray-100 text-gray-800'
//                       }`}>
//                         {violation.impact}
//                       </span>
//                     </div>
//                     <p className="text-gray-600 mb-2">{violation.description}</p>
//                     <p className="text-sm text-gray-500 mb-2">
//                       Affects {violation.nodes?.length || 0} element(s)
//                     </p>
                    
//                     {/* Show affected elements */}
//                     {violation.nodes && violation.nodes.length > 0 && (
//                       <div className="mt-3 p-3 bg-gray-50 rounded">
//                         <h4 className="text-sm font-medium text-gray-700 mb-2">Affected Elements:</h4>
//                         {violation.nodes.slice(0, 3).map((node, nodeIndex) => (
//                           <div key={nodeIndex} className="text-xs text-gray-600 mb-1">
//                             <code className="bg-gray-200 px-1 rounded">
//                               {node.target?.join(' ') || 'Unknown element'}
//                             </code>
//                           </div>
//                         ))}
//                         {violation.nodes.length > 3 && (
//                           <p className="text-xs text-gray-500">
//                             ...and {violation.nodes.length - 3} more
//                           </p>
//                         )}
//                       </div>
//                     )}
                    
//                     <a 
//                       href={violation.helpUrl} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:text-blue-800 text-sm"
//                     >
//                       Learn more about this issue →
//                     </a>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           {/* No violations message */}
//           {(!results.axeResults?.violations || results.axeResults.violations.length === 0) && (
//             <div className="bg-green-50 border border-green-200 rounded-lg p-6">
//               <h2 className="text-lg font-semibold text-green-800 mb-2">
//                 🎉 No Accessibility Violations Found!
//               </h2>
//               <p className="text-green-600">
//                 This website appears to meet basic accessibility standards according to axe-core analysis.
//               </p>
//             </div>
//           )}

//           {/* Performance Opportunities - Only show if unlocked */}
//           {isUnlocked && results.lighthouseResults?.opportunities && results.lighthouseResults.opportunities.length > 0 && (
//             <div className="bg-white rounded-lg shadow">
//               <div className="px-6 py-4 border-b">
//                 <h2 className="text-xl font-semibold text-orange-600 flex items-center">
//                   <AlertTriangle className="w-5 h-5 mr-2" />
//                   Performance Opportunities
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {results.lighthouseResults.opportunities.length} performance improvements found
//                 </p>
//               </div>
//               <div className="divide-y">
//                 {results.lighthouseResults.opportunities.map((opportunity, index) => (
//                   <div key={index} className="p-6">
//                     <div className="flex justify-between items-start mb-2">
//                       <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
//                       {opportunity.displayValue && (
//                         <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">
//                           {opportunity.displayValue}
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-gray-600 mb-2">{opportunity.description}</p>
//                     <div className="flex items-center text-sm text-gray-500">
//                       <Info className="w-4 h-4 mr-1" />
//                       Score: {Math.round((opportunity.score || 0) * 100)}%
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* SEO Issues - Only show if unlocked */}
//           {isUnlocked && results.lighthouseResults && (
//             <div className="bg-white rounded-lg shadow">
//               <div className="px-6 py-4 border-b">
//                 <h2 className="text-xl font-semibold text-purple-600 flex items-center">
//                   <CheckCircle className="w-5 h-5 mr-2" />
//                   SEO Analysis
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Current SEO score: {Math.round(results.lighthouseResults.scores.seo)}%
//                 </p>
//               </div>
//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex items-center p-3 bg-purple-50 rounded">
//                     <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3">
//                       <CheckCircle className="w-4 h-4 text-purple-600" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-purple-800">Meta Description</p>
//                       <p className="text-xs text-purple-600">
//                         {results.lighthouseResults.scores.seo >= 80 ? 'Properly configured' : 'Needs improvement'}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center p-3 bg-purple-50 rounded">
//                     <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3">
//                       <CheckCircle className="w-4 h-4 text-purple-600" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-purple-800">Page Title</p>
//                       <p className="text-xs text-purple-600">
//                         {results.lighthouseResults.scores.seo >= 70 ? 'Properly configured' : 'Needs improvement'}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center p-3 bg-purple-50 rounded">
//                     <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3">
//                       <CheckCircle className="w-4 h-4 text-purple-600" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-purple-800">Mobile Friendliness</p>
//                       <p className="text-xs text-purple-600">
//                         {results.lighthouseResults.scores.seo >= 75 ? 'Mobile optimized' : 'Needs mobile optimization'}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center p-3 bg-purple-50 rounded">
//                     <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3">
//                       <CheckCircle className="w-4 h-4 text-purple-600" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-purple-800">Structured Data</p>
//                       <p className="text-xs text-purple-600">
//                         {results.lighthouseResults.scores.seo >= 85 ? 'Well structured' : 'Could be improved'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Best Practices - Only show if unlocked */}
//           {isUnlocked && results.lighthouseResults && (
//             <div className="bg-white rounded-lg shadow">
//               <div className="px-6 py-4 border-b">
//                 <h2 className="text-xl font-semibold text-orange-600 flex items-center">
//                   <CheckCircle className="w-5 h-5 mr-2" />
//                   Best Practices
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Current score: {Math.round(results.lighthouseResults.scores.bestPractices)}%
//                 </p>
//               </div>
//               <div className="p-6">
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
//                     <div className="flex items-center">
//                       <CheckCircle className="w-5 h-5 text-orange-600 mr-3" />
//                       <div>
//                         <p className="text-sm font-medium text-orange-800">HTTPS Usage</p>
//                         <p className="text-xs text-orange-600">Secure connection protocols</p>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-orange-800">
//                       {results.lighthouseResults.scores.bestPractices >= 80 ? 'Good' : 'Needs Work'}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
//                     <div className="flex items-center">
//                       <CheckCircle className="w-5 h-5 text-orange-600 mr-3" />
//                       <div>
//                         <p className="text-sm font-medium text-orange-800">Console Errors</p>
//                         <p className="text-xs text-orange-600">Browser console cleanliness</p>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-orange-800">
//                       {results.lighthouseResults.scores.bestPractices >= 70 ? 'Clean' : 'Has Issues'}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
//                     <div className="flex items-center">
//                       <CheckCircle className="w-5 h-5 text-orange-600 mr-3" />
//                       <div>
//                         <p className="text-sm font-medium text-orange-800">Image Optimization</p>
//                         <p className="text-xs text-orange-600">Modern image formats usage</p>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-orange-800">
//                       {results.lighthouseResults.scores.bestPractices >= 75 ? 'Optimized' : 'Can Improve'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* PWA Features - Only show if unlocked */}
//           {isUnlocked && results.lighthouseResults && (
//             <div className="bg-white rounded-lg shadow">
//               <div className="px-6 py-4 border-b">
//                 <h2 className="text-xl font-semibold text-pink-600 flex items-center">
//                   <CheckCircle className="w-5 h-5 mr-2" />
//                   Progressive Web App
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   PWA readiness: {Math.round(results.lighthouseResults.scores.pwa)}%
//                 </p>
//               </div>
//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex items-center p-3 bg-pink-50 rounded">
//                     <div className="flex-shrink-0 w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center mr-3">
//                       {results.lighthouseResults.scores.pwa >= 30 ? 
//                         <CheckCircle className="w-4 h-4 text-pink-600" /> : 
//                         <AlertTriangle className="w-4 h-4 text-pink-600" />
//                       }
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-pink-800">Service Worker</p>
//                       <p className="text-xs text-pink-600">
//                         {results.lighthouseResults.scores.pwa >= 30 ? 'Implemented' : 'Not implemented'}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center p-3 bg-pink-50 rounded">
//                     <div className="flex-shrink-0 w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center mr-3">
//                       {results.lighthouseResults.scores.pwa >= 40 ? 
//                         <CheckCircle className="w-4 h-4 text-pink-600" /> : 
//                         <AlertTriangle className="w-4 h-4 text-pink-600" />
//                       }
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-pink-800">Web App Manifest</p>
//                       <p className="text-xs text-pink-600">
//                         {results.lighthouseResults.scores.pwa >= 40 ? 'Configured' : 'Missing or incomplete'}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center p-3 bg-pink-50 rounded">
//                     <div className="flex-shrink-0 w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center mr-3">
//                       {results.lighthouseResults.scores.pwa >= 50 ? 
//                         <CheckCircle className="w-4 h-4 text-pink-600" /> : 
//                         <AlertTriangle className="w-4 h-4 text-pink-600" />
//                       }
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-pink-800">Offline Functionality</p>
//                       <p className="text-xs text-pink-600">
//                         {results.lighthouseResults.scores.pwa >= 50 ? 'Works offline' : 'No offline support'}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center p-3 bg-pink-50 rounded">
//                     <div className="flex-shrink-0 w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center mr-3">
//                       {results.lighthouseResults.scores.pwa >= 60 ? 
//                         <CheckCircle className="w-4 h-4 text-pink-600" /> : 
//                         <AlertTriangle className="w-4 h-4 text-pink-600" />
//                       }
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-pink-800">Installable</p>
//                       <p className="text-xs text-pink-600">
//                         {results.lighthouseResults.scores.pwa >= 60 ? 'Can be installed' : 'Not installable'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Passes Summary */}
//           {results.axeResults?.passes && results.axeResults.passes.length > 0 && (
//             <div className="bg-white rounded-lg shadow">
//               <div className="px-6 py-4 border-b">
//                 <h2 className="text-xl font-semibold text-green-600">Accessibility Checks Passed</h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {results.axeResults.passes.length} accessibility rules passed successfully
//                 </p>
//               </div>
//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {results.axeResults.passes.slice(0, 6).map((pass, index) => (
//                     <div key={index} className="flex items-center p-3 bg-green-50 rounded">
//                       <div className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-3">
//                         <CheckCircle className="w-4 h-4 text-green-600" />
//                       </div>
//                       <div className="flex-1">
//                         <p className="text-sm font-medium text-green-800">{pass.help}</p>
//                         <p className="text-xs text-green-600">{pass.description}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 {results.axeResults.passes.length > 6 && (
//                   <div className="mt-4 text-center">
//                     <p className="text-sm text-gray-500 mb-4">
//                       ...and {results.axeResults.passes.length - 6} more checks passed
//                     </p>
                    
//                     {!isUnlocked && (
//                       <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
//                         <div className="flex items-center justify-center mb-4">
//                           <Lock className="w-8 h-8 text-blue-600 mr-2" />
//                           <h3 className="text-lg font-semibold text-blue-800">Unlock More Insights</h3>
//                         </div>
//                         <p className="text-blue-700 mb-4 text-center">
//                           Get detailed SEO analysis, performance metrics, best practices audit, and PWA compliance insights
//                         </p>
//                         <Button 
//                           onClick={handleUnlock}
//                           className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
//                         >
//                           <Unlock className="w-4 h-4 mr-2" />
//                           Sign In to Unlock All Features
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Show unlock card even if no passes */}
//           {!isUnlocked && (!results.axeResults?.passes || results.axeResults.passes.length <= 6) && (
//             <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
//               <div className="flex items-center justify-center mb-4">
//                 <Lock className="w-8 h-8 text-blue-600 mr-2" />
//                 <h3 className="text-lg font-semibold text-blue-800">Unlock More Insights</h3>
//               </div>
//               <p className="text-blue-700 mb-4 text-center">
//                 Get detailed SEO analysis, performance metrics, best practices audit, and PWA compliance insights
//               </p>
//               <Button 
//                 onClick={handleUnlock}
//                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
//               >
//                 <Unlock className="w-4 h-4 mr-2" />
//                 Sign In to Unlock All Features
//               </Button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default function AnalyzePage() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <Analyze />
//     </Suspense>
//   );
// }

"use client"
import { useSearchParams } from "next/navigation"
import { JSX, useEffect, useState } from "react"
import { Suspense } from "react"
import { AnalysisResult } from "@/types"
import { Button } from "@/components/ui/button"
import { Lock, Unlock, AlertTriangle, CheckCircle, Info, Search, Zap, Shield, Smartphone } from "lucide-react"

function Analyze() {
  const searchParams = useSearchParams()
  const [url, setUrl] = useState("")
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  
  useEffect(() => {
    const url = searchParams.get("url")
    if (url) {
      setUrl(url)
      runAnalysis(url)
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

  const handleUnlock = () => {
    setIsUnlocked(true)
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-400'
    if (score >= 70) return 'bg-orange-50 border-orange-400'
    return 'bg-red-50 border-red-400'
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analysis Results</h1>
      
      {url && (
        <div className="mb-4">
          <p className="text-gray-600">Analyzing: <span className="font-semibold">{url}</span></p>
        </div>
      )}
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Analyzing website accessibility and performance...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            ⚠️ Analysis Failed
          </h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => runAnalysis(url)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
      
      {results && (
        <div className="space-y-6">
          {/* Test Information */}
          {results.axeResults?.testEngine && (
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-blue-800 mb-2">Test Information</h3>
              <p className="text-sm text-blue-700">
                Engine: {results.axeResults.testEngine.name} v{results.axeResults.testEngine.version}
              </p>
              <p className="text-sm text-blue-700">
                Analyzed: {new Date(results.timeStamp).toLocaleString()}
              </p>
            </div>
          )}

          {/* Accessibility Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded border-l-4 border-red-400">
              <h3 className="font-semibold text-red-800">Violations</h3>
              <p className="text-2xl font-bold text-red-600">
                {results.axeResults?.summary?.violations || (results.axeResults?.violations ? results.axeResults.violations.length : 0)}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
              <h3 className="font-semibold text-green-800">Passes</h3>
              <p className="text-2xl font-bold text-green-600">
                {results.axeResults?.summary?.passes || (results.axeResults?.passes ? results.axeResults.passes.length : 0)}
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
              <h3 className="font-semibold text-yellow-800">Incomplete</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {results.axeResults?.summary?.incomplete || (results.axeResults?.incomplete ? results.axeResults.incomplete.length : 0)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-400">
              <h3 className="font-semibold text-gray-800">Not Applicable</h3>
              <p className="text-2xl font-bold text-gray-600">
                {results.axeResults?.summary?.inapplicable || (results.axeResults?.inapplicable ? results.axeResults.inapplicable.length : 0)}
              </p>
            </div>
          </div>
          
          {/* Violations List */}
          {results.axeResults?.violations && results.axeResults.violations.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-red-600">Accessibility Violations</h2>
              </div>
              <div className="divide-y">
                {results.axeResults.violations.map((violation, index) => (
                  <div key={index} className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{violation.help}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        violation.impact === 'critical' ? 'bg-red-100 text-red-800' :
                        violation.impact === 'serious' ? 'bg-orange-100 text-orange-800' :
                        violation.impact === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {violation.impact}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{violation.description}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      Affects {violation.nodes?.length || 0} element(s)
                    </p>
                    
                    {/* Show affected elements */}
                    {violation.nodes && violation.nodes.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Affected Elements:</h4>
                        {violation.nodes.slice(0, 3).map((node, nodeIndex) => (
                          <div key={nodeIndex} className="text-xs text-gray-600 mb-1">
                            <code className="bg-gray-200 px-1 rounded">
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
                      className="text-blue-600 hover:text-blue-800 text-sm"
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                🎉 No Accessibility Violations Found!
              </h2>
              <p className="text-green-600">
                This website appears to meet basic accessibility standards according to axe-core analysis.
              </p>
            </div>
          )}

          {/* Passes Summary */}
          {results.axeResults?.passes && results.axeResults.passes.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-green-600">Accessibility Checks Passed</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {results.axeResults.passes.length} accessibility rules passed successfully
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.axeResults.passes.slice(0, 6).map((pass, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 rounded">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">{pass.help}</p>
                        <p className="text-xs text-green-600">{pass.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {results.axeResults.passes.length > 6 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      ...and {results.axeResults.passes.length - 6} more checks passed
                    </p>
                    
                    {!isUnlocked && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center justify-center mb-4">
                          <Lock className="w-8 h-8 text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-blue-800">Unlock More Insights</h3>
                        </div>
                        <p className="text-blue-700 mb-4 text-center">
                          Get detailed SEO analysis, performance metrics, best practices audit, and PWA compliance insights
                        </p>
                        <Button 
                          onClick={handleUnlock}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          Sign In to Unlock All Features
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show unlock card even if no passes */}
          {!isUnlocked && (!results.axeResults?.passes || results.axeResults.passes.length <= 6) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-800">Unlock More Insights</h3>
              </div>
              <p className="text-blue-700 mb-4 text-center">
                Get detailed SEO analysis, performance metrics, best practices audit, and PWA compliance insights
              </p>
              <Button 
                onClick={handleUnlock}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Sign In to Unlock All Features
              </Button>
            </div>
          )}

          {/* ====== UNLOCKED CONTENT APPEARS BELOW ====== */}
          {isUnlocked && (
            <div className="space-y-6 mt-8 border-t pt-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Unlock className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="text-2xl font-bold text-green-800">Premium Analysis Unlocked!</h2>
                </div>
                <p className="text-gray-600">
                  You now have access to comprehensive SEO, performance, and best practices analysis
                </p>
              </div>

              {/* Lighthouse Score Cards */}
              {results.lighthouseResults && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.performance)}`}>
                    <h3 className="font-semibold text-blue-800">Performance</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.performance)}`}>
                      {Math.round(results.lighthouseResults.scores.performance)}
                    </p>
                  </div>
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.accessibility)}`}>
                    <h3 className="font-semibold text-green-800">Accessibility</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.accessibility)}`}>
                      {Math.round(results.lighthouseResults.scores.accessibility)}
                    </p>
                  </div>
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.seo)}`}>
                    <h3 className="font-semibold text-purple-800">SEO</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.seo)}`}>
                      {Math.round(results.lighthouseResults.scores.seo)}
                    </p>
                  </div>
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.bestPractices)}`}>
                    <h3 className="font-semibold text-orange-800">Best Practices</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.bestPractices)}`}>
                      {Math.round(results.lighthouseResults.scores.bestPractices)}
                    </p>
                  </div>
                  <div className={`p-4 rounded border-l-4 ${getScoreBgColor(results.lighthouseResults.scores.pwa)}`}>
                    <h3 className="font-semibold text-pink-800">PWA</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(results.lighthouseResults.scores.pwa)}`}>
                      {Math.round(results.lighthouseResults.scores.pwa)}
                    </p>
                  </div>
                </div>
              )}

              {/* Performance Opportunities */}
              {results.lighthouseResults?.opportunities && results.lighthouseResults.opportunities.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-orange-600 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Performance Opportunities
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {results.lighthouseResults.opportunities.length} performance improvements found
                    </p>
                  </div>
                  <div className="divide-y">
                    {results.lighthouseResults.opportunities.map((opportunity, index) => (
                      <div key={index} className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
                          {opportunity.displayValue && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">
                              {opportunity.displayValue}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{opportunity.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
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
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-purple-600 flex items-center">
                      <Search className="w-5 h-5 mr-2" />
                      SEO Analysis
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Current SEO score: {Math.round(results.lighthouseResults.scores.seo)}%
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <Search className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Meta Description</p>
                            <p className="text-sm text-gray-600">Page description optimization</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          results.lighthouseResults.scores.seo >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {results.lighthouseResults.scores.seo >= 80 ? 'Good' : 'Needs Work'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <Search className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Page Title</p>
                            <p className="text-sm text-gray-600">Title tag optimization</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          results.lighthouseResults.scores.seo >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {results.lighthouseResults.scores.seo >= 70 ? 'Good' : 'Needs Work'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <Smartphone className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Mobile Friendliness</p>
                            <p className="text-sm text-gray-600">Mobile optimization status</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          results.lighthouseResults.scores.seo >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-orange-600 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Best Practices
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Current score: {Math.round(results.lighthouseResults.scores.bestPractices)}%
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <Shield className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">HTTPS Usage</p>
                            <p className="text-sm text-gray-600">Secure connection protocols</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          results.lighthouseResults.scores.bestPractices >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {results.lighthouseResults.scores.bestPractices >= 80 ? 'Secure' : 'Needs Work'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Console Errors</p>
                            <p className="text-sm text-gray-600">Browser console cleanliness</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          results.lighthouseResults.scores.bestPractices >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-pink-600 flex items-center">
                      <Smartphone className="w-5 h-5 mr-2" />
                      Progressive Web App
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      PWA readiness: {Math.round(results.lighthouseResults.scores.pwa)}%
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                            <Zap className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Service Worker</p>
                            <p className="text-sm text-gray-600">Offline functionality support</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          results.lighthouseResults.scores.pwa >= 30 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {results.lighthouseResults.scores.pwa >= 30 ? 'Available' : 'Missing'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                            <Smartphone className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Web App Manifest</p>
                            <p className="text-sm text-gray-600">App installation configuration</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          results.lighthouseResults.scores.pwa >= 40 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Analyze />
    </Suspense>
  );
}
