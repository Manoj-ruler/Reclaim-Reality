"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Eye,
  Video,
  FileText,
  Zap,
  Brain,
  Cpu,
  Newspaper,
  Search,
  Flag,
} from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { cn } from "@/lib/utils"

export default function EnhancedDemoPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [text, setText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [wordCount, setWordCount] = useState(0)
  const [isRealTimeAnalyzing, setIsRealTimeAnalyzing] = useState(false)
  const [realTimeResult, setRealTimeResult] = useState<any>(null)
  const [analysisBreakdown, setAnalysisBreakdown] = useState({
    ai_generated: 0,
    ai_refined: 0,
    human_refined: 0,
    human_written: 0,
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    setImageUrl("") // Clear any existing URL
  }

  const analyzeContent = async () => {
    if (!text && !selectedImage && !videoUrl) return

    setIsAnalyzing(true)
    setError("")
    setResult(null)

    try {
      let formData = new FormData()
      
      if (activeTab === "text") {
        formData.append("text", text)
        formData.append("contentType", "text")
      } else if (activeTab === "image" && selectedImage) {
        formData.append("image", selectedImage)
        formData.append("contentType", "image")
      } else if (activeTab === "video") {
        formData.append("videoUrl", videoUrl)
        formData.append("contentType", "video")
      }

      if (sourceUrl) {
        formData.append("url", sourceUrl)
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const analysisResult = await response.json()

      if (analysisResult.error) {
        throw new Error(analysisResult.error)
      }

      setResult(analysisResult)
    } catch (error) {
      console.error("Analysis failed:", error)
      setError(error instanceof Error ? error.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // AI-powered real-time analysis
  const analyzeRealTimeWithAI = useCallback(
    debounce(async (textContent: string) => {
      if (!textContent || textContent.trim().length < 40) {
        setRealTimeResult(null)
        setAnalysisBreakdown({ ai_generated: 0, ai_refined: 0, human_refined: 0, human_written: 0 })
        return
      }

      setIsRealTimeAnalyzing(true)

      try {
        console.log("🤖 Calling enhanced analysis...")

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textContent,
            contentType: "text",
            realTime: true,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          if (!result.error) {
            console.log("✅ Enhanced analysis result:", result)
            setRealTimeResult(result)
            setAnalysisBreakdown(
              result.breakdown || { ai_generated: 0, ai_refined: 0, human_refined: 0, human_written: 0 },
            )
          }
        } else {
          console.error("Enhanced analysis API error:", response.status)
        }
      } catch (error) {
        console.error("Real-time enhanced analysis failed:", error)
        // Silently fail for real-time analysis
      } finally {
        setIsRealTimeAnalyzing(false)
      }
    }, 1500),
    [],
  )

  // Debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ai_generated":
        return <Cpu className="w-5 h-5 text-orange-500" />
      case "manipulated":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "hyperreal":
        return <Zap className="w-5 h-5 text-purple-500" />
      case "authentic":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "uncertain":
        return <HelpCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Brain className="w-5 h-5 text-gray-500" />
    }
  }

  const getNewsStatusIcon = (status: string) => {
    switch (status) {
      case "real":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "fake":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "misleading":
        return <Flag className="w-5 h-5 text-orange-500" />
      case "satire":
        return <Zap className="w-5 h-5 text-purple-500" />
      case "uncertain":
        return <HelpCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Newspaper className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ai_generated":
      case "fake":
      case "misleading":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "manipulated":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "hyperreal":
      case "satire":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "authentic":
      case "real":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "uncertain":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ai_generated":
        return "AI Generated"
      case "manipulated":
        return "Manipulated"
      case "hyperreal":
        return "Hyperreal"
      case "authentic":
        return "Human Written"
      case "uncertain":
        return "Uncertain"
      case "real":
        return "Real News"
      case "fake":
        return "Fake News"
      case "misleading":
        return "Misleading"
      case "satire":
        return "Satire"
      default:
        return "Unknown"
    }
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-pulse" />
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Reclaim Reality</h1>
          </div>
          <p className="text-xl text-gray-300">AI Detection & News Verification System</p>
          <Badge className="mt-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            🤖 AI Detection + 📰 News Verification - Real-time Analysis
          </Badge>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-300 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Main Interface */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Enhanced Content Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="text" className="w-full" onValueChange={(value) => {
                setActiveTab(value)
                setError("")
                setResult(null)
              }}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text">
                  <Textarea
                    key="text-input"
                    placeholder="Paste news articles, social media posts, or any text content for AI detection and news verification..."
                    value={text}
                    onChange={(e) => {
                      const newText = e.target.value
                      setText(newText)

                      // Count words
                      const words = newText
                        .trim()
                        .split(/\s+/)
                        .filter((word) => word.length > 0)
                      setWordCount(words.length)

                      // Trigger enhanced real-time analysis
                      analyzeRealTimeWithAI(newText)
                    }}
                    className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </TabsContent>

                <TabsContent value="image">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Image Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <ImageUpload
                          onImageSelect={handleImageSelect}
                          className="mb-4"
                        />
                        
                        <div className="text-sm text-gray-400 mt-2">
                          {selectedImage && (
                            <p>Selected: {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)</p>
                          )}
                        </div>

                        <Input
                          type="url"
                          placeholder="Optional: Source URL of the image"
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                        />

                        <Button
                          onClick={analyzeContent}
                          disabled={isAnalyzing || !selectedImage}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4 mr-2" />
                              Analyze Image
                            </>
                          )}
                        </Button>

                        {error && (
                          <div className="text-red-400 text-sm mt-2">
                            Error: {error}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="video">
                  <Input
                    key="video-input"
                    placeholder="Enter video URL to analyze for deepfakes..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <div className="text-sm text-gray-400">
                    Detects deepfakes, synthetic media, and video manipulation
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex space-x-4">
                <Button
                  onClick={analyzeContent}
                  disabled={(!text && !selectedImage && !videoUrl) || isAnalyzing}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Full Analysis
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setText("")
                    setImageUrl("")
                    setVideoUrl("")
                    setSourceUrl("")
                    setResult(null)
                    setError("")
                    setRealTimeResult(null)
                    setAnalysisBreakdown({ ai_generated: 0, ai_refined: 0, human_refined: 0, human_written: 0 })
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear
                </Button>
              </div>

              {/* Sample Texts */}
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Try these samples:</p>
                <div className="flex flex-wrap gap-2">
                  {["AI-generated news", "Real news article", "Fake news example"].map((sample, index) => (
                    <Button
                      key={`sample-${index}`}
                      size="sm"
                      variant="outline"
                      className="text-xs border-white/20 text-gray-300 hover:bg-white/10"
                      onClick={() => setText(getSampleText(sample))}
                    >
                      {sample}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Text Analysis Results */}
              {activeTab === "text" && text && (
                <div className="space-y-6">
                  {/* Word Count & Status */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {wordCount} words {wordCount < 40 && "(minimum 40 words required)"}
                    </span>
                    {isRealTimeAnalyzing && (
                      <span className="text-purple-400 flex items-center">
                        <Brain className="w-3 h-3 mr-1 animate-pulse" />
                        Analyzing...
                      </span>
                    )}
                  </div>

                  {/* Enhanced Analysis Results */}
                  {wordCount >= 40 && realTimeResult && (
                    <div className="space-y-6">
                      {/* News Detection Alert */}
                      {realTimeResult.is_news_content && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Newspaper className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-300 font-semibold">News Content Detected</span>
                          </div>
                          <p className="text-blue-200 text-sm">
                            Performing enhanced fact-checking and credibility analysis...
                          </p>
                        </div>
                      )}

                      {/* AI Detection Results */}
                      <div className="space-y-4">
                        <h4 className="text-white font-semibold flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          AI Detection Analysis
                        </h4>

                        {/* AI Generated */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-orange-300 text-sm flex items-center">
                              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                              AI-generated
                            </span>
                            <span className="text-orange-300 font-semibold">{analysisBreakdown.ai_generated}%</span>
                          </div>
                          <Progress value={analysisBreakdown.ai_generated} className="h-2 bg-gray-700">
                            <div
                              className="h-full bg-orange-500 rounded-full transition-all duration-700"
                              style={{ width: `${analysisBreakdown.ai_generated}%` }}
                            />
                          </Progress>
                        </div>

                        {/* Other breakdown categories... */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-300 text-sm flex items-center">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                              AI-refined
                            </span>
                            <span className="text-yellow-300 font-semibold">{analysisBreakdown.ai_refined}%</span>
                          </div>
                          <Progress value={analysisBreakdown.ai_refined} className="h-2 bg-gray-700">
                            <div
                              className="h-full bg-yellow-500 rounded-full transition-all duration-700"
                              style={{ width: `${analysisBreakdown.ai_refined}%` }}
                            />
                          </Progress>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-300 text-sm flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              Human-refined
                            </span>
                            <span className="text-blue-300 font-semibold">{analysisBreakdown.human_refined}%</span>
                          </div>
                          <Progress value={analysisBreakdown.human_refined} className="h-2 bg-gray-700">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-700"
                              style={{ width: `${analysisBreakdown.human_refined}%` }}
                            />
                          </Progress>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-green-300 text-sm flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              Human-written
                            </span>
                            <span className="text-green-300 font-semibold">{analysisBreakdown.human_written}%</span>
                          </div>
                          <Progress value={analysisBreakdown.human_written} className="h-2 bg-gray-700">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-700"
                              style={{ width: `${analysisBreakdown.human_written}%` }}
                            />
                          </Progress>
                        </div>

                        {/* AI Assessment */}
                        <div className={`p-4 rounded-lg border ${getStatusColor(realTimeResult.authenticity_status)}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(realTimeResult.authenticity_status)}
                            <span className="font-semibold">{getStatusText(realTimeResult.authenticity_status)}</span>
                          </div>
                          <div className="text-sm opacity-90">AI Confidence: {realTimeResult.confidence}%</div>
                        </div>
                      </div>

                      {/* News Verification Results */}
                      {realTimeResult.is_news_content && realTimeResult.news_authenticity && (
                        <div className="space-y-4">
                          <h4 className="text-white font-semibold flex items-center">
                            <Newspaper className="w-4 h-4 mr-2" />
                            News Verification
                          </h4>

                          {/* News Credibility Score */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-300 text-sm">News Credibility Score</span>
                              <span className="text-blue-300 font-semibold">
                                {realTimeResult.news_credibility_score}/100
                              </span>
                            </div>
                            <Progress value={realTimeResult.news_credibility_score} className="h-2 bg-gray-700">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                style={{ width: `${realTimeResult.news_credibility_score}%` }}
                              />
                            </Progress>
                          </div>

                          {/* News Status */}
                          <div className={`p-4 rounded-lg border ${getStatusColor(realTimeResult.news_authenticity)}`}>
                            <div className="flex items-center space-x-3 mb-2">
                              {getNewsStatusIcon(realTimeResult.news_authenticity)}
                              <span className="font-semibold">{getStatusText(realTimeResult.news_authenticity)}</span>
                            </div>
                            <div className="text-sm opacity-90">News Confidence: {realTimeResult.news_confidence}%</div>
                          </div>

                          {/* Fact Check Results */}
                          {realTimeResult.fact_check_results && (
                            <div className="space-y-3">
                              {realTimeResult.fact_check_results.claims_verified?.length > 0 && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                  <h5 className="text-green-300 font-semibold mb-2">✅ Verified Claims:</h5>
                                  <ul className="text-green-200 text-sm space-y-1">
                                    {realTimeResult.fact_check_results.claims_verified.map(
                                      (claim: string, index: number) => (
                                        <li key={index}>• {claim}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                              {realTimeResult.fact_check_results.red_flags?.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                  <h5 className="text-red-300 font-semibold mb-2">🚩 Red Flags:</h5>
                                  <ul className="text-red-200 text-sm space-y-1">
                                    {realTimeResult.fact_check_results.red_flags.map((flag: string, index: number) => (
                                      <li key={index}>• {flag}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Research Summary */}
                          {realTimeResult.research_summary && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                              <h5 className="text-purple-300 font-semibold mb-2 flex items-center">
                                <Search className="w-4 h-4 mr-2" />
                                Research Summary:
                              </h5>
                              <p className="text-purple-200 text-sm">{realTimeResult.research_summary}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Overall Recommendation */}
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                        <h4 className="text-purple-300 font-semibold mb-2">💡 Recommendation:</h4>
                        <p className="text-purple-200 text-sm">{realTimeResult.suggested_action}</p>
                      </div>
                    </div>
                  )}

                  {wordCount < 40 && (
                    <div className="text-center py-8 text-gray-400">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Add at least 40 words to begin enhanced analysis</p>
                    </div>
                  )}
                </div>
              )}

              {/* Image Analysis Results */}
              {activeTab === "image" && result && (
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "text-sm px-4 py-1",
                        getStatusColor(result.authenticity_status)
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.authenticity_status)}
                        {getStatusText(result.authenticity_status)}
                      </div>
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Confidence: {result.confidence}%
                    </Badge>
                  </div>

                  {/* AI Probability */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Generated Probability</span>
                      <span>{result.ai_probability}%</span>
                    </div>
                    <Progress value={result.ai_probability} className="h-2" />
                  </div>

                  {/* Image Analysis Details */}
                  {result.image_analysis && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Image Analysis</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Image Type</p>
                          <p className="font-medium">{result.image_analysis.image_type}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Technical Assessment</p>
                          <div className="space-y-1">
                            {Object.entries(result.image_analysis.technical_assessment).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                {value ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                                )}
                                <span className="text-sm">
                                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Credibility Score */}
                  {result.credibility_score && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Credibility Analysis</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Score</span>
                          <span>{result.credibility_score.overall}%</span>
                        </div>
                        <Progress 
                          value={result.credibility_score.overall} 
                          className="h-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(result.credibility_score.factors).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <p className="text-sm text-gray-400">
                              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </p>
                            <Progress value={value as number} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Real-time Flags */}
                  {result.real_time_flags && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Analysis Flags</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.real_time_flags).map(([key, value]) => (
                          value && (
                            <Badge
                              key={key}
                              variant="outline"
                              className={cn(
                                "text-sm",
                                value === true ? "border-orange-500 text-orange-400" : "border-green-500 text-green-400"
                              )}
                            >
                              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Action */}
                  {result.suggested_action && (
                    <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-sm">{result.suggested_action}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-500" />
                  <p className="text-gray-400">Analyzing your content...</p>
                </div>
              )}

              {/* Empty State */}
              {!result && !isAnalyzing && (
                <div className="text-center py-8 text-gray-400">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select content and click analyze to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Features Showcase */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          {[
            {
              icon: "🤖",
              title: "AI Detection",
              description: "Advanced AI models detect GPT, Claude, and other AI-generated content",
            },
            {
              icon: "📰",
              title: "News Verification",
              description: "Deep fact-checking and credibility analysis for news content",
            },
            {
              icon: "🔍",
              title: "Real-time Research",
              description: "Instant verification with comprehensive fact-checking",
            },
            {
              icon: "🎯",
              title: "Dual Analysis",
              description: "Combined AI detection and news verification in one system",
            },
          ].map((feature, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-xl text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Info */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-white mb-4">🚀 Enhanced Detection System</h3>
              <p className="text-gray-300 mb-4">
                Advanced AI detection combined with deep news verification and fact-checking capabilities.
              </p>
              <div className="flex justify-center space-x-4">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">✅ AI Detection</Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">✅ News Verification</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">✅ Real-time Analysis</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Enhanced sample text generator
function getSampleText(type: string): string {
  const samples = {
    "AI-generated news": `Breaking news: Scientists have made a groundbreaking discovery that could revolutionize the way we understand climate change. According to recent studies, researchers have identified a new method that shows promising results in reducing carbon emissions. The findings, published in a leading scientific journal, suggest that this innovative approach could have significant implications for environmental policy. Furthermore, experts believe that this development represents a major step forward in addressing global warming concerns. The research team emphasized the importance of continued investigation to fully understand the potential applications of their work.`,

    "Real news article": `WASHINGTON - The Federal Reserve announced Wednesday that it will raise interest rates by 0.25 percentage points, marking the third rate hike this year. Fed Chair Jerome Powell cited ongoing inflation concerns and a robust job market as key factors in the decision. "We remain committed to bringing inflation back to our 2% target," Powell said during a press conference. The decision was unanimous among voting members. Stock markets initially fell following the announcement but recovered by market close. Economists had widely expected the rate increase.`,

    "Fake news example": `SHOCKING: Local man discovers doctors HATE this one simple trick that cures everything! You won't believe what happened next! Big Pharma is trying to hide this secret that could save millions of lives. This incredible discovery was found in his grandmother's attic and has been suppressed for decades. Click here to learn the truth they don't want you to know! Warning: This information is being censored everywhere!`,
  }

  return samples[type] || ""
}
