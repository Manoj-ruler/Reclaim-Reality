"use client"

import { useState, useEffect } from "react"
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
  ExternalLink,
  Zap,
  TrendingUp,
} from "lucide-react"

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

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const analyzeContent = async () => {
    if (!text && !imageUrl && !videoUrl) return

    setIsAnalyzing(true)
    setError("")
    setResult(null)

    try {
      const requestBody = {
        text: text || undefined,
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
        url: sourceUrl || undefined,
        contentType: activeTab as "text" | "image" | "video",
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ai_generated":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case "manipulated":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "hyperreal":
        return <Zap className="w-5 h-5 text-purple-500" />
      case "authentic":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "uncertain":
        return <HelpCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ai_generated":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "manipulated":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "hyperreal":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "authentic":
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
        return "Authentic"
      case "uncertain":
        return "Uncertain"
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
          <p className="text-xl text-gray-300">Multi-Modal AI Detection & Credibility Analysis</p>
          <Badge className="mt-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            🚀 Detects Text, Images & Videos - Real-time Analysis
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
                <span>🔍 Content Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-white/10">
                  <TabsTrigger value="text" className="data-[state=active]:bg-purple-600">
                    <FileText className="w-4 h-4 mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="image" className="data-[state=active]:bg-purple-600">
                    <Eye className="w-4 h-4 mr-2" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="video" className="data-[state=active]:bg-purple-600">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    key="text-input"
                    placeholder="Paste news articles, social media posts, or any text content..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <Input
                    key="image-input"
                    placeholder="Enter image URL to analyze for manipulation..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <div className="text-sm text-gray-400">
                    Analyzes for deepfakes, AI-generated images, and digital manipulation
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
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

              <Input
                key="source-input"
                placeholder="Source URL (optional) - for credibility analysis"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />

              <div className="flex space-x-4">
                <Button
                  onClick={analyzeContent}
                  disabled={(!text && !imageUrl && !videoUrl) || isAnalyzing}
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
                      Analyze Content
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
                  {["AI-generated news", "Human blog post", "Social media"].map((sample, index) => (
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
                <span>📊 Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12 text-gray-400">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select content type and analyze to see results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Authenticity Status */}
                  <div className={`p-4 rounded-lg border ${getStatusColor(result.authenticity_status)}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(result.authenticity_status)}
                      <span className="font-semibold">{getStatusText(result.authenticity_status)}</span>
                    </div>
                    <div className="text-sm opacity-90">Confidence: {result.confidence}%</div>
                  </div>

                  {/* Credibility Score */}
                  {result.credibility_score && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Credibility Score
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Overall Score</span>
                          <span className="font-bold text-lg">{result.credibility_score.overall}/100</span>
                        </div>
                        <Progress value={result.credibility_score.overall} className="h-2" />

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Source: {result.credibility_score.factors.source_reliability}/100</div>
                          <div>Content: {result.credibility_score.factors.content_authenticity}/100</div>
                          <div>Fact Check: {result.credibility_score.factors.fact_check_status}/100</div>
                          <div>AI Detection: {result.credibility_score.factors.ai_detection}/100</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real-time Flags */}
                  {result.real_time_flags && (
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold">🚨 Real-time Flags:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(result.real_time_flags).map(([key, value]) => (
                          <Badge
                            key={key}
                            className={value ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}
                          >
                            {key.replace(/_/g, " ")}: {value ? "⚠️" : "✅"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verified Sources */}
                  {result.verified_sources?.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Verified Sources
                      </h4>
                      <div className="space-y-2">
                        {result.verified_sources.map((source: any, index: number) => (
                          <div key={index} className="bg-green-500/10 border border-green-500/20 rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-green-300">{source.name}</div>
                                <div className="text-xs text-green-400">
                                  Reliability: {source.reliability_score}/100
                                </div>
                              </div>
                              <Badge className="bg-green-500/20 text-green-300">{source.fact_check_result}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="text-purple-300 font-semibold mb-2">💡 Recommendation:</h4>
                    <p className="text-purple-200 text-sm">{result.suggested_action}</p>
                  </div>
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
              description: "Detects AI-generated text, images, and videos with advanced algorithms",
            },
            {
              icon: "🔍",
              title: "Deepfake Detection",
              description: "Identifies synthetic media and facial manipulation in real-time",
            },
            {
              icon: "📊",
              title: "Credibility Scoring",
              description: "Multi-factor credibility analysis with source verification",
            },
            {
              icon: "🌐",
              title: "Real-time Analysis",
              description: "Instant analysis as you browse with Chrome extension",
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

        {/* Hackathon Info */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-white mb-4">🏆 Hackathon Project</h3>
              <p className="text-gray-300 mb-4">
                This is a live demonstration of the Reclaim Reality system - a comprehensive solution for detecting
                AI-generated and manipulated content across the web.
              </p>
              <div className="flex justify-center space-x-4">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">✅ Chrome Extension Ready</Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">✅ Full-Stack Solution</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">✅ Real-time Detection</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Sample text generator for demo
function getSampleText(type: string): string {
  const samples = {
    "AI-generated news": `Breaking news: Scientists have made a groundbreaking discovery that could revolutionize the way we understand climate change. According to recent studies, researchers have identified a new method that shows promising results in reducing carbon emissions. The findings, published in a leading scientific journal, suggest that this innovative approach could have significant implications for environmental policy. Furthermore, experts believe that this development represents a major step forward in addressing global warming concerns. The research team emphasized the importance of continued investigation to fully understand the potential applications of their work.`,

    "Human blog post": `I can't believe it's already December! This year has flown by so fast. I was just thinking about all the crazy stuff that happened - remember when I accidentally dyed my hair green trying to go blonde? My mom still brings that up at family dinners lol. Anyway, I'm trying to figure out what to get everyone for Christmas. My brother is impossible to shop for because he literally has everything already. Maybe I'll just get him a gift card again... he never complains about those. What are you guys doing for the holidays?`,

    "Social media": `Just had the most amazing coffee at this little place downtown ☕️ The barista was super friendly and they have this cozy reading nook by the window. Perfect spot to work on my novel! #WritingLife #CoffeeShop #LocalBusiness`,
  }

  return samples[type] || ""
}
