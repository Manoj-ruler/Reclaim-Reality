import { type NextRequest, NextResponse } from "next/server"

interface AnalysisRequest {
  text?: string
  imageUrl?: string
  videoUrl?: string
  url?: string
  contentType: "text" | "image" | "video"
  realTime?: boolean
}

// Function to detect if content is news-related
function isNewsContent(text: string): boolean {
  const newsWords = [
    "breaking news",
    "reported",
    "according to",
    "sources say",
    "spokesperson",
    "statement",
    "announced",
    "confirmed",
    "investigation",
    "authorities",
    "officials",
    "government",
    "president",
    "minister",
    "senator",
  ]

  let newsScore = 0
  const lowerText = text.toLowerCase()

  newsWords.forEach((word) => {
    if (lowerText.includes(word)) {
      newsScore += 1
    }
  })

  // Check for news outlet patterns
  if (/\b(reuters|ap|cnn|bbc|fox|nbc|abc|cbs|npr)\b/gi.test(text)) {
    newsScore += 3
  }

  // Check for date patterns (common in news)
  if (
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g.test(text) ||
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/gi.test(
      text,
    )
  ) {
    newsScore += 2
  }

  // Check for quotes (common in news)
  if (/"[^"]*"/g.test(text)) {
    newsScore += 1
  }

  return newsScore >= 3
}

// Combined AI detection function
async function performAIDetection(text: string): Promise<{
  isAI: boolean
  confidence: number
  reasoning: string
  breakdown: any
}> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("No API key found")
    }

    const baseURL = apiKey.startsWith("sk-or-") ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"
    const model = apiKey.startsWith("sk-or-") ? "openai/gpt-4o" : "gpt-4o"

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(apiKey.startsWith("sk-or-") && {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Reclaim Reality AI Detector",
        }),
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are an expert AI content detector. Analyze text and determine if it was written by AI or humans.

Look for these AI indicators:
- Repetitive sentence structures
- Overuse of transition words (furthermore, moreover, however)
- Balanced, overly diplomatic language
- Generic, templated responses
- Perfect grammar with no typos

Look for these human indicators:
- Personal anecdotes and experiences
- Typos, grammatical errors, informal language
- Strong opinions, bias, emotional language
- Slang, abbreviations (lol, tbh, etc.)
- Inconsistent writing style

Respond with ONLY this JSON:
{
  "isAI": boolean,
  "confidence": number (65-95),
  "reasoning": "Brief explanation",
  "breakdown": {
    "ai_generated": number,
    "ai_refined": number,
    "human_refined": number,
    "human_written": number
  }
}`,
          },
          {
            role: "user",
            content: `Analyze this text for AI vs human authorship: "${text}"`,
          },
        ],
        temperature: 0.05,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    const cleanResponse = content.replace(/```json\n?|\n?```/g, "").trim()
    const analysis = JSON.parse(cleanResponse)

    // Ensure breakdown sums to 100
    if (!analysis.breakdown) {
      analysis.breakdown = {
        ai_generated: analysis.isAI ? 70 : 20,
        ai_refined: analysis.isAI ? 20 : 25,
        human_refined: analysis.isAI ? 10 : 25,
        human_written: analysis.isAI ? 0 : 30,
      }
    }

    const total = Object.values(analysis.breakdown).reduce((sum: number, val: any) => sum + Number(val), 0)
    if (Math.abs(total - 100) > 2) {
      const factor = 100 / total
      Object.keys(analysis.breakdown).forEach((key) => {
        analysis.breakdown[key] = Math.round(analysis.breakdown[key] * factor)
      })
    }

    return {
      isAI: analysis.isAI,
      confidence: Math.max(65, Math.min(95, analysis.confidence)),
      reasoning: analysis.reasoning,
      breakdown: analysis.breakdown,
    }
  } catch (error) {
    console.error("AI detection error:", error)
    // Fallback analysis
    return performFallbackAIAnalysis(text)
  }
}

// Combined news verification function
async function performNewsVerification(text: string): Promise<{
  isReal: boolean
  credibilityScore: number
  confidence: number
  reasoning: string
  factCheckResults: any
  researchSummary: string
}> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("No API key found")
    }

    const baseURL = apiKey.startsWith("sk-or-") ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"
    const model = apiKey.startsWith("sk-or-") ? "openai/gpt-4o" : "gpt-4o"

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(apiKey.startsWith("sk-or-") && {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Reclaim Reality News Verifier",
        }),
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are a fact-checking expert. Analyze news content for authenticity.

Check for:
- Factual accuracy of claims
- Source credibility
- Misinformation patterns
- Sensationalized language
- Conspiracy theory indicators

Respond with ONLY this JSON:
{
  "isReal": boolean,
  "credibilityScore": number (0-100),
  "confidence": number (70-95),
  "reasoning": "Brief explanation",
  "factCheckResults": {
    "claimsVerified": ["verified claims"],
    "redFlags": ["misinformation indicators"]
  },
  "researchSummary": "Summary of findings"
}`,
          },
          {
            role: "user",
            content: `Fact-check this news content: "${text}"`,
          },
        ],
        temperature: 0.1,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      throw new Error(`News API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    const cleanResponse = content.replace(/```json\n?|\n?```/g, "").trim()
    const analysis = JSON.parse(cleanResponse)

    return {
      isReal: analysis.isReal,
      credibilityScore: Math.max(0, Math.min(100, analysis.credibilityScore)),
      confidence: Math.max(70, Math.min(95, analysis.confidence)),
      reasoning: analysis.reasoning || "Analysis completed",
      factCheckResults: analysis.factCheckResults || {
        claimsVerified: [],
        redFlags: [],
      },
      researchSummary: analysis.researchSummary || "Research completed",
    }
  } catch (error) {
    console.error("News verification error:", error)
    // Fallback analysis
    return performFallbackNewsAnalysis(text)
  }
}

// Fallback AI analysis
function performFallbackAIAnalysis(text: string): {
  isAI: boolean
  confidence: number
  reasoning: string
  breakdown: any
} {
  let aiScore = 0
  let humanScore = 0
  const indicators = []

  // AI patterns
  const aiPhrases = ["furthermore", "moreover", "it's important to note", "in conclusion", "to summarize"]
  const aiCount = aiPhrases.filter((phrase) => text.toLowerCase().includes(phrase)).length
  if (aiCount > 0) {
    aiScore += aiCount * 20
    indicators.push(`${aiCount} AI phrases`)
  }

  // Human patterns
  const humanPhrases = ["lol", "omg", "tbh", "i think", "i feel", "personally"]
  const humanCount = humanPhrases.filter((phrase) => text.toLowerCase().includes(phrase)).length
  if (humanCount > 0) {
    humanScore += humanCount * 20
    indicators.push(`${humanCount} human expressions`)
  }

  const totalScore = Math.max(aiScore + humanScore, 1)
  const aiProbability = (aiScore / totalScore) * 100
  const isAI = aiProbability > 55
  const confidence = Math.min(85, Math.max(65, Math.abs(aiProbability - 50) * 1.5 + 65))

  return {
    isAI,
    confidence,
    reasoning: `Fallback analysis: ${indicators.join(", ")}`,
    breakdown: {
      ai_generated: Math.round(aiProbability * 0.8),
      ai_refined: Math.round(aiProbability * 0.2),
      human_refined: Math.round((100 - aiProbability) * 0.3),
      human_written: Math.round((100 - aiProbability) * 0.7),
    },
  }
}

// Fallback news analysis
function performFallbackNewsAnalysis(text: string): {
  isReal: boolean
  credibilityScore: number
  confidence: number
  reasoning: string
  factCheckResults: any
  researchSummary: string
} {
  let credibilityScore = 70
  const redFlags = []
  const verified = []

  // Check for sensationalized language
  const sensationalWords = ["shocking", "unbelievable", "exclusive", "bombshell"]
  const sensationalCount = sensationalWords.filter((word) => text.toLowerCase().includes(word)).length
  if (sensationalCount > 2) {
    credibilityScore -= 20
    redFlags.push("Sensationalized language")
  }

  // Check for proper attribution
  if (text.toLowerCase().includes("according to") || text.toLowerCase().includes("sources say")) {
    credibilityScore += 15
    verified.push("Source attribution found")
  } else {
    credibilityScore -= 10
    redFlags.push("Lack of source attribution")
  }

  // Check for conspiracy language
  const conspiracyWords = ["cover-up", "conspiracy", "hidden truth", "wake up"]
  const conspiracyCount = conspiracyWords.filter((word) => text.toLowerCase().includes(word)).length
  if (conspiracyCount > 0) {
    credibilityScore -= 30
    redFlags.push("Conspiracy theory language")
  }

  credibilityScore = Math.max(0, Math.min(100, credibilityScore))

  return {
    isReal: credibilityScore > 60,
    credibilityScore,
    confidence: Math.min(85, Math.max(70, Math.abs(credibilityScore - 50) + 70)),
    reasoning: `Pattern analysis: ${redFlags.length} red flags, ${verified.length} positive indicators`,
    factCheckResults: {
      claimsVerified: verified,
      redFlags: redFlags,
    },
    researchSummary: `Analyzed ${text.split(" ").length} words for misinformation patterns`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    console.log("🔍 Enhanced analysis API called")

    const body: AnalysisRequest = await request.json()

    if (!body.text && !body.imageUrl && !body.videoUrl) {
      return NextResponse.json({ error: "No content provided for analysis" }, { status: 400 })
    }

    // For text analysis
    if (body.text && body.contentType === "text") {
      const isNews = isNewsContent(body.text)

      // Perform AI detection
      const aiResult = await performAIDetection(body.text)

      let result: any = {
        content_type: body.contentType,
        is_news_content: isNews,

        // AI Detection Results
        authenticity_status: aiResult.isAI ? "ai_generated" : "authentic",
        confidence: aiResult.confidence,
        ai_probability: aiResult.isAI ? aiResult.confidence : 100 - aiResult.confidence,
        human_probability: aiResult.isAI ? 100 - aiResult.confidence : aiResult.confidence,
        ai_reasoning: aiResult.reasoning,
        breakdown: aiResult.breakdown,

        analysis_time: Date.now() - startTime,
      }

      // If it's news content, also perform news verification
      if (isNews) {
        console.log("📰 News content detected, performing verification...")
        const newsResult = await performNewsVerification(body.text)

        result = {
          ...result,
          // News Verification Results
          news_authenticity: newsResult.isReal ? "real" : "fake",
          news_credibility_score: newsResult.credibilityScore,
          news_confidence: newsResult.confidence,
          news_reasoning: newsResult.reasoning,
          fact_check_results: {
            claims_verified: newsResult.factCheckResults.claimsVerified || [],
            claims_disputed: [],
            sources_found: [],
            red_flags: newsResult.factCheckResults.redFlags || [],
          },
          research_summary: newsResult.researchSummary,

          // Enhanced credibility scoring
          credibility_score: {
            overall: Math.round(aiResult.confidence * 0.3 + newsResult.credibilityScore * 0.7),
            factors: {
              ai_detection: aiResult.confidence,
              content_authenticity: newsResult.credibilityScore,
              fact_check_status: newsResult.isReal ? 90 : 20,
              source_reliability: body.url ? 75 : 60,
            },
          },

          // Real-time flags
          real_time_flags: {
            ai_generated: aiResult.isAI,
            fake_news: !newsResult.isReal,
            misleading_content: newsResult.credibilityScore < 50,
            unverified_claims: newsResult.factCheckResults.redFlags?.length > 0,
            low_credibility: newsResult.credibilityScore < 40,
          },

          // Enhanced suggested action
          suggested_action: !newsResult.isReal
            ? "⚠️ This appears to be fake news. Verify with credible sources before sharing."
            : newsResult.isReal
              ? "✅ This appears to be legitimate news content."
              : "❓ News authenticity uncertain. Cross-check with multiple sources.",
        }
      } else {
        // For non-news content
        result = {
          ...result,
          credibility_score: {
            overall: aiResult.confidence,
            factors: {
              ai_detection: aiResult.confidence,
              content_authenticity: aiResult.isAI ? 30 : 80,
              fact_check_status: 70,
              source_reliability: body.url ? 75 : 60,
            },
          },
          real_time_flags: {
            ai_generated: aiResult.isAI,
            fake_news: false,
            misleading_content: false,
            unverified_claims: false,
            low_credibility: false,
          },
          suggested_action: aiResult.isAI
            ? "🤖 This content appears to be AI-generated."
            : "👤 This content appears to be human-written.",
        }
      }

      console.log("✅ Enhanced analysis complete:", {
        isNews: isNews,
        aiStatus: result.authenticity_status,
        newsStatus: result.news_authenticity,
        time: result.analysis_time + "ms",
      })

      return NextResponse.json(result)
    }

    // For image/video analysis (placeholder)
    else {
      const result = {
        content_type: body.contentType,
        authenticity_status: "uncertain",
        confidence: 50,
        reasoning: "Image/video analysis not yet implemented",
        suggested_action: "Manual verification recommended for media content",
        analysis_time: Date.now() - startTime,
      }

      return NextResponse.json(result)
    }
  } catch (error) {
    console.error("❌ Enhanced analysis error:", error)
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
