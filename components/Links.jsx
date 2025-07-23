import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle,  RefreshCw, Eye, EyeOff, Globe, Image, Users, ExternalLink,Link } from "lucide-react"


const Links = ({url,setUrl,loading, setLoading, error, setError}) => {
  const [linkStatus, setLinkStatus] = useState(null)
  const getLinkStatus = async (targetUrl) => {
    setLoading(true);
    try {
      const response = await fetch("/api/monitor/broken-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && typeof data === "object") {
        setLinkStatus(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setError(error.message || "Failed to analyze website");
    } finally {
      setLoading(false);
    }
  };
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams.get("url");
    if (url.trim() !== "") {
      setUrl(url);
      getLinkStatus(url);
    }
  }, [searchParams]);
  return (
    <>
      {linkStatus && (
        <div className="bg-gray-900/50 rounded-lg shadow-xl border border-gray-700 print-break">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Broken Links Analysis
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Analyzed {linkStatus.summary?.totalLinks || 0} links and{" "}
                  {linkStatus.summary?.totalImages || 0} images
                </p>
              </div>
              <div
                className={`text-2xl font-bold ${
                  linkStatus.summary?.healthScore >= 90
                    ? "text-green-400"
                    : linkStatus.summary?.healthScore >= 70
                    ? "text-orange-400"
                    : "text-red-400"
                }`}
              >
                {linkStatus.summary?.healthScore || 0}/100
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded border bg-green-900/20 border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Working Links</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {(linkStatus.summary?.totalLinks || 0) -
                    (linkStatus.summary?.brokenLinks || 0)}
                </div>
              </div>

              <div className="p-4 rounded border bg-red-900/20 border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Broken Links</span>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {linkStatus.summary?.brokenLinks || 0}
                </div>
              </div>

              <div className="p-4 rounded border bg-orange-900/20 border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Slow Links</span>
                  <RefreshCw className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-orange-400">
                  {linkStatus.summary?.slowLinks || 0}
                </div>
              </div>

              <div className="p-4 rounded border bg-blue-900/20 border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Total Checked</span>
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {(linkStatus.summary?.totalLinks || 0) +
                    (linkStatus.summary?.totalImages || 0)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-800/30 rounded border border-gray-600">
                <div className="text-xl font-bold text-blue-300">
                  {linkStatus.summary?.internalLinks || 0}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Link className="w-3 h-3" />
                  Internal Links
                </div>
              </div>

              <div className="text-center p-3 bg-gray-800/30 rounded border border-gray-600">
                <div className="text-xl font-bold text-purple-300">
                  {linkStatus.summary?.externalLinks || 0}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  External Links
                </div>
              </div>

              <div className="text-center p-3 bg-gray-800/30 rounded border border-gray-600">
                <div className="text-xl font-bold text-pink-300">
                  {linkStatus.summary?.socialLinks || 0}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" />
                  Social Links
                </div>
              </div>

              <div className="text-center p-3 bg-gray-800/30 rounded border border-gray-600">
                <div className="text-xl font-bold text-yellow-300">
                  {linkStatus.summary?.totalImages || 0}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Image className="w-3 h-3" />
                  Images
                </div>
              </div>
            </div>

            {linkStatus.brokenInternal &&
              linkStatus.brokenInternal.length > 0 &&
              (() => {
                return (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-red-400">
                      Broken Internal Links ({linkStatus.brokenInternal.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {displayedInternal.map((link, index) => (
                        <div
                          key={index}
                          className="p-4 rounded border bg-red-900/20 border-red-500/30"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 mr-4">
                              <div className="font-mono text-sm text-red-200 break-all mb-1">
                                {link.href}
                              </div>
                              {link.text && (
                                <div className="text-xs text-gray-400">
                                  Link Text: "{link.text}"
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {link.statusCode && (
                                <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                                  {link.statusCode}
                                </span>
                              )}
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                          <div className="text-sm text-red-200/80 mb-2">
                            {link.error}
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>Found on: {link.foundOn}</span>
                            {link.responseTime && (
                              <span>{link.responseTime}ms</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {linkStatus.brokenInternal.length > 5 && (
                        <button
                          onClick={() => setShowAllInternal(!showAllInternal)}
                          className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 flex items-center justify-center gap-2"
                        >
                          {showAllInternal ? (
                            <>
                              Hide Details <EyeOff className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Show {linkStatus.brokenInternal.length - 5} More{" "}
                              <Eye className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

            {linkStatus.brokenExternal &&
              linkStatus.brokenExternal.length > 0 &&
              (() => {
                const [showAllExternal, setShowAllExternal] = useState(false);
                const displayedExternal = showAllExternal
                  ? linkStatus.brokenExternal
                  : linkStatus.brokenExternal.slice(0, 5);

                return (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-orange-400">
                      Broken External Links ({linkStatus.brokenExternal.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {displayedExternal.map((link, index) => (
                        <div
                          key={index}
                          className="p-4 rounded border bg-orange-900/20 border-orange-500/30"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 mr-4">
                              <div className="font-mono text-sm text-orange-200 break-all mb-1">
                                {link.href}
                              </div>
                              {link.text && (
                                <div className="text-xs text-gray-400">
                                  Link Text: "{link.text}"
                                </div>
                              )}
                              {link.platform && (
                                <div className="text-xs text-orange-300">
                                  Platform: {link.platform}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {link.statusCode && (
                                <span className="px-2 py-1 text-xs bg-orange-600 text-white rounded">
                                  {link.statusCode}
                                </span>
                              )}
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                          <div className="text-sm text-orange-200/80 mb-2">
                            {link.error}
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>Found on: {link.foundOn}</span>
                            {link.responseTime && (
                              <span>{link.responseTime}ms</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {linkStatus.brokenExternal.length > 5 && (
                        <button
                          onClick={() => setShowAllExternal(!showAllExternal)}
                          className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 flex items-center justify-center gap-2"
                        >
                          {showAllExternal ? (
                            <>
                              Hide Details <EyeOff className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Show {linkStatus.brokenExternal.length - 5} More{" "}
                              <Eye className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            {linkStatus.brokenImages &&
              linkStatus.brokenImages.length > 0 &&
              (() => {
                const [showAllImages, setShowAllImages] = useState(false);
                const displayedImages = showAllImages
                  ? linkStatus.brokenImages
                  : linkStatus.brokenImages.slice(0, 5);

                return (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-yellow-400">
                      Broken Images ({linkStatus.brokenImages.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {displayedImages.map((image, index) => (
                        <div
                          key={index}
                          className="p-4 rounded border bg-yellow-900/20 border-yellow-500/30"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 mr-4">
                              <div className="font-mono text-sm text-yellow-200 break-all mb-1">
                                {image.href}
                              </div>
                              {image.alt && (
                                <div className="text-xs text-gray-400">
                                  Alt Text: "{image.alt}"
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {image.statusCode && (
                                <span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded">
                                  {image.statusCode}
                                </span>
                              )}
                              <a
                                href={image.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                          <div className="text-sm text-yellow-200/80 mb-2">
                            {image.error}
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>Found on: {image.foundOn}</span>
                            {image.responseTime && (
                              <span>{image.responseTime}ms</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {linkStatus.brokenImages.length > 5 && (
                        <button
                          onClick={() => setShowAllImages(!showAllImages)}
                          className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 flex items-center justify-center gap-2"
                        >
                          {showAllImages ? (
                            <>
                              Hide Details <EyeOff className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Show {linkStatus.brokenImages.length - 5} More{" "}
                              <Eye className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

            {linkStatus.slowLinks &&
              linkStatus.slowLinks.length > 0 &&
              (() => {
                const [showAllSlow, setShowAllSlow] = useState(false);
                const displayedSlow = showAllSlow
                  ? linkStatus.slowLinks
                  : linkStatus.slowLinks.slice(0, 5);

                return (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-orange-300">
                      Slow Loading Links ({linkStatus.slowLinks.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {displayedSlow.map((link, index) => (
                        <div
                          key={index}
                          className="p-4 rounded border bg-orange-900/10 border-orange-500/20"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 mr-4">
                              <div className="font-mono text-sm text-orange-200 break-all mb-1">
                                {link.href}
                              </div>
                              {link.text && (
                                <div className="text-xs text-gray-400">
                                  Link Text: "{link.text}"
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 text-xs bg-orange-600 text-white rounded">
                                {link.responseTime}ms
                              </span>
                              <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                                {link.statusCode}
                              </span>
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                          <div className="text-sm text-orange-200/80 mb-2">
                            {link.warning}
                          </div>
                          <div className="text-xs text-gray-400">
                            Found on: {link.foundOn}
                          </div>
                        </div>
                      ))}
                      {linkStatus.slowLinks.length > 5 && (
                        <button
                          onClick={() => setShowAllSlow(!showAllSlow)}
                          className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 flex items-center justify-center gap-2"
                        >
                          {showAllSlow ? (
                            <>
                              Hide Details <EyeOff className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Show {linkStatus.slowLinks.length - 5} More{" "}
                              <Eye className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

            {linkStatus.summary &&
              linkStatus.summary.brokenLinks === 0 &&
              linkStatus.summary.slowLinks === 0 &&
              linkStatus.summary.totalLinks > 0 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-300 mb-2">
                    🎉 All Links Are Working Perfectly!
                  </h3>
                  <p className="text-green-200">
                    Checked {linkStatus.summary.totalLinks} links and{" "}
                    {linkStatus.summary.totalImages} images - no broken links
                    found.
                  </p>
                </div>
              )}
            {linkStatus.summary &&
              linkStatus.summary.totalLinks === 0 &&
              linkStatus.summary.totalImages === 0 && (
                <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-6 text-center">
                  <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    No Links Found
                  </h3>
                  <p className="text-gray-400">
                    No links or images were found on the analyzed pages.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
};

export default Links;
