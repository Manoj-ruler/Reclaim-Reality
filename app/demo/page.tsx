"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Shield, Loader2, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react"

export default function DemoPage() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  const analyzeText = async () => {
    if (!text.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const analysisResult = await response.json()
      setResult(analysisResult)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "likely_ai":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "likely_human":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "uncertain":
        return <HelpCircle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "likely_ai":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "likely_human":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "uncertain":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Reclaim Reality</h1>
          </div>
          <p className="text-xl text-gray-300">Hackathon Demo - AI Content Detection System</p>
          <Badge className="mt-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            🚀 Live Demo - No Extension Required
          </Badge>
        </div>

        {/* Demo Interface */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <span>📝 Paste Content to Analyze</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste any text content here - news articles, social media posts, emails, etc..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />

              <div className="flex space-x-4">
                <Button
                  onClick={analyzeText}
                  disabled={!text.trim() || isAnalyzing}
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
                    setResult(null)
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
                  {["AI-generated news article", "Human-written blog post", "Social media post"].map(
                    (sample, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        className="text-xs border-white/20 text-gray-300 hover:bg-white/10"
                        onClick={() => setText(getSampleText(sample))}
                      >
                        {sample}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <span>🔍 Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12 text-gray-400">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Enter text and click "Analyze Content" to see results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status */}
                  <div className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(result.status)}
                      <span className="font-semibold capitalize">{result.status.replace("_", " ")}</span>
                    </div>
                    <div className="text-sm opacity-90">Confidence: {result.confidence}%</div>
                  </div>

                  {/* Flagged Patterns */}
                  {result.flagged_patterns?.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">🚩 Flagged Patterns:</h4>
                      <div className="space-y-2">
                        {result.flagged_patterns.map((pattern, index) => (
                          <div
                            key={index}
                            className="bg-red-500/10 border border-red-500/20 rounded p-2 text-sm text-red-300"
                          >
                            {pattern}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suspicious Phrases */}
                  {result.analysis_details?.suspicious_phrases?.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">⚠️ Suspicious Phrases:</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis_details.suspicious_phrases.map((phrase, index) => (
                          <Badge key={index} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold mb-2">💡 Recommendation:</h4>
                    <p className="text-blue-200 text-sm">{result.suggested_action}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Showcase */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🤖",
              title: "AI Detection",
              description: "Advanced algorithms detect AI-generated content with high accuracy",
            },
            {
              icon: "⚡",
              title: "Real-time Analysis",
              description: "Instant analysis of any text content in seconds",
            },
            {
              icon: "🔒",
              title: "Privacy First",
              description: "No data storage, secure analysis, privacy protected",
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
    "AI-generated news article": `Breaking news: Scientists have made a groundbreaking discovery that could revolutionize the way we understand climate change. According to recent studies, researchers have identified a new method that shows promising results in reducing carbon emissions. The findings, published in a leading scientific journal, suggest that this innovative approach could have significant implications for environmental policy. Furthermore, experts believe that this development represents a major step forward in addressing global warming concerns. The research team emphasized the importance of continued investigation to fully understand the potential applications of their work.`,

    "Human-written blog post": `I can't believe it's already December! This year has flown by so fast. I was just thinking about all the crazy stuff that happened - remember when I accidentally dyed my hair green trying to go blonde? My mom still brings that up at family dinners lol. Anyway, I'm trying to figure out what to get everyone for Christmas. My brother is impossible to shop for because he literally has everything already. Maybe I'll just get him a gift card again... he never complains about those. What are you guys doing for the holidays?`,

    "Social media post": `Just had the most amazing coffee at this little place downtown ☕️ The barista was super friendly and they have this cozy reading nook by the window. Perfect spot to work on my novel! #WritingLife #CoffeeShop #LocalBusiness`,
  }

  return samples[type] || ""
}
