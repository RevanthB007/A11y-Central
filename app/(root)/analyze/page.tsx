"use client"
import { useSearchParams } from "next/navigation"
import { JSX, useEffect,useState } from "react"
import { Suspense } from "react"
import { AnalysisResult } from "@/types"
function Analyze () {
  const searchParams = useSearchParams()
  const [url, setUrl] = useState("")
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false)
  
  useEffect(()=>{
    const url = searchParams.get("url")
    if(url){
      setUrl(url)
      runAnalysis(url)
    }
  },[searchParams])

  const runAnalysis = async (targetUrl: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.log(error)  
    }
    finally{
      setLoading(false)
    }
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
          <p>Analyzing website accessibility...</p>
          {/* Add loading spinner component */}
        </div>
      )}
      
{results && (
  <div className="space-y-6">
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-red-50 p-4 rounded border-l-4 border-red-400">
        <h3 className="font-semibold text-red-800">Violations</h3>
        <p className="text-2xl font-bold text-red-600">{results.summary.violations}</p>
      </div>
      
      <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
        <h3 className="font-semibold text-green-800">Passes</h3>
        <p className="text-2xl font-bold text-green-600">{results.summary.passes}</p>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
        <h3 className="font-semibold text-yellow-800">Incomplete</h3>
        <p className="text-2xl font-bold text-yellow-600">{results.summary.incomplete}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-400">
        <h3 className="font-semibold text-gray-800">Not Applicable</h3>
        <p className="text-2xl font-bold text-gray-600">{results.summary.inapplicable}</p>
      </div>
    </div>
    
    {/* Violations List */}
    {results.violations.length > 0 && (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-red-600">Accessibility Violations</h2>
        </div>
        <div className="divide-y">
          {results.violations.map((violation, index) => (
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
                Affects {violation.nodes.length} element(s)
              </p>
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
    {results.violations.length === 0 && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-green-800 mb-2">
          🎉 No Accessibility Violations Found!
        </h2>
        <p className="text-green-600">
          This website appears to meet basic accessibility standards according to axe-core analysis.
        </p>
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
