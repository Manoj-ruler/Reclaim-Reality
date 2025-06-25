import { type NextRequest, NextResponse } from "next/server"

interface NewsVerificationRequest {
  text: string
  url?: string
  realTime?: boolean
}

interface NewsVerificationResult {
  news_authenticity: "real" | "fake" | "misleading" | "satire" | "uncertain"
  credibility_score: number
  confidence: number
  reasoning: string
  fact_check_results: {
    claims_verified: string[]
    claims_disputed: string[]
    sources_found: string[]
    red_flags: string[]
  }
  research_summary: string
  verification_time: number
  model_used: string
}

// Deep news verification using AI research
async function performDeepNewsVerification(
  text: string,
  url?: string,
): Promise<{
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

    console.log(`Using ${apiKey.startsWith("sk-or-") ? "OpenRouter" : "OpenAI"} for news verification`)

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(apiKey.startsWith("sk-or-") && {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Reclaim Reality News Verifier",
        }),
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are an elite fact-checking journalist and misinformation expert with access to extensive knowledge about current events, historical facts, and common misinformation patterns.

Your task is to analyze news content and determine its authenticity through deep research and fact-checking.

ANALYSIS FRAMEWORK:
1. FACTUAL ACCURACY:
   - Verify specific claims, dates, statistics, and quotes
   - Check for historical accuracy and context
   - Identify verifiable vs unverifiable claims

2. SOURCE CREDIBILITY:
   - Evaluate the reliability of cited sources
   - Check for primary vs secondary sources
   - Identify missing or questionable sources

3. MISINFORMATION PATTERNS:
   - Sensationalized headlines or language
   - Emotional manipulation tactics
   - Cherry-picked data or out-of-context quotes
   - Conspiracy theory indicators

4. STRUCTURAL ANALYSIS:
   - Professional journalism standards
   - Balanced reporting vs bias
   - Proper attribution and citations
   - Timeline consistency

5. RED FLAGS:
   - Unverified claims presented as fact
   - Lack of credible sources
   - Extreme emotional language
   - Contradicts established facts
   - Promotes harmful misinformation

RESEARCH APPROACH:
- Cross-reference claims with known facts
- Identify specific verifiable/disputable elements
- Check for common misinformation narratives
- Evaluate source credibility and bias
- Consider context and timing

Respond with ONLY this JSON format:
{
  "isReal": boolean,
  "credibilityScore": number (0-100),
  "confidence": number (70-95),
  "reasoning": "Detailed explanation of your fact-checking analysis",
  "factCheckResults": {
    "claimsVerified": ["list of verified claims"],
    "claimsDisputed": ["list of disputed/false claims"],
    "sourcesFound": ["credible sources mentioned"],
    "redFlags": ["misinformation indicators found"]
  },
  "researchSummary": "Summary of your fact-checking research and findings",
  "newsCategory": "breaking|political|health|science|entertainment|sports|other"
}`,
          },
          {
            role: "user",
            content: `Perform deep fact-checking analysis on this news content. Research the claims, verify facts, and determine authenticity:

${url ? `SOURCE URL: ${url}\n\n` : ""}NEWS CONTENT TO VERIFY:
"${text}"

Provide comprehensive fact-checking analysis with specific findings.`,
          },
        ],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("News Verification API Error:", response.status, errorData)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Clean and parse response
    const cleanResponse = content.replace(/```json\n?|\n?```/g, "").trim()
    let analysis

    try {
      analysis = JSON.parse(cleanResponse)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      console.log("Raw response:", content)
      throw new Error("Failed to parse news verification response")
    }

    // Validate response structure
    if (
      typeof analysis.isReal !== "boolean" ||
      typeof analysis.credibilityScore !== "number" ||
      typeof analysis.confidence !== "number"
    ) {
      throw new Error("Invalid response structure from AI model")
    }

    return {
      isReal: analysis.isReal,
      credibilityScore: Math.max(0, Math.min(100, analysis.credibilityScore)),
      confidence: Math.max(70, Math.min(95, analysis.confidence)),
      reasoning: analysis.reasoning || "Analysis completed",
      factCheckResults: analysis.factCheckResults || {
        claimsVerified: [],
        claimsDisputed: [],
        sourcesFound: [],
        redFlags: [],
      },
      researchSummary: analysis.researchSummary || "Research summary not available",
    }
  } catch (error) {
    console.error("News verification error:", error)
    throw error
  }
}

// Fallback news analysis using pattern recognition
async function fallbackNewsAnalysis(text: string): Promise<{
  isReal: boolean
  credibilityScore: number
  confidence: number
  reasoning: string
  factCheckResults: any
  researchSummary: string
}> {
  console.log("Using fallback news analysis...")

  let credibilityScore = 70 // Start neutral
  const redFlags = []
  const positiveIndicators = []

  // Check for sensationalized language
  const sensationalWords = [
    "shocking",
    "unbelievable",
    "incredible",
    "amazing",
    "devastating",
    "explosive",
    "bombshell",
    "exclusive",
    "breaking",
    "urgent",
  ]

  const sensationalCount = sensationalWords.filter((word) => text.toLowerCase().includes(word)).length

  if (sensationalCount > 3) {
    credibilityScore -= 20
    redFlags.push("Excessive sensationalized language")
  } else if (sensationalCount === 0) {
    credibilityScore += 10
    positiveIndicators.push("Professional tone")
  }

  // Check for proper attribution
  const attributionPatterns = [
    /according to/gi,
    /sources say/gi,
    /reported by/gi,
    /\bsaid\b/gi,
    /quoted/gi,
    /spokesperson/gi,
  ]

  let attributionCount = 0
  attributionPatterns.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) attributionCount += matches.length
  })

  if (attributionCount > 0) {
    credibilityScore += 15
    positiveIndicators.push("Proper source attribution")
  } else {
    credibilityScore -= 15
    redFlags.push("Lack of source attribution")
  }

  // Check for specific dates and facts
  const datePattern =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}\/\d{1,2}\/\d{4}|\d{4})\b/gi
  const numberPattern = /\b\d+(\.\d+)?\s*(percent|%|million|billion|thousand)\b/gi

  const dateMatches = text.match(datePattern) || []
  const numberMatches = text.match(numberPattern) || []

  if (dateMatches.length > 0 || numberMatches.length > 0) {
    credibilityScore += 10
    positiveIndicators.push("Specific facts and figures")
  }

  // Check for conspiracy theory language
  const conspiracyWords = [
    "cover-up",
    "conspiracy",
    "they don't want you to know",
    "hidden truth",
    "secret agenda",
    "wake up",
    "sheeple",
  ]

  const conspiracyCount = conspiracyWords.filter((word) => text.toLowerCase().includes(word)).length

  if (conspiracyCount > 0) {
    credibilityScore -= 30
    redFlags.push("Conspiracy theory language")
  }

  // Check for emotional manipulation
  const emotionalWords = ["outraged", "furious", "devastated", "terrified", "panic", "crisis", "disaster"]

  const emotionalCount = emotionalWords.filter((word) => text.toLowerCase().includes(word)).length

  if (emotionalCount > 2) {
    credibilityScore -= 15
    redFlags.push("Emotional manipulation tactics")
  }

  // Final assessment
  credibilityScore = Math.max(0, Math.min(100, credibilityScore))
  const isReal = credibilityScore > 60
  const confidence = Math.min(85, Math.max(70, Math.abs(credibilityScore - 50) + 70))

  return {
    isReal,
    credibilityScore,
    confidence,
    reasoning: `Fallback analysis based on: ${[...positiveIndicators, ...redFlags].join(", ")}`,
    factCheckResults: {
      claimsVerified: positiveIndicators,
      claimsDisputed: [],
      sourcesFound: [],
      redFlags: redFlags,
    },
    researchSummary: `Pattern-based analysis found ${redFlags.length} red flags and ${positiveIndicators.length} positive indicators.`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    console.log("📰 News verification API called")

    const body: NewsVerificationRequest = await request.json()

    if (!body.text || body.text.trim().length < 50) {
      return NextResponse.json(
        {
          error: "Text too short for news verification (minimum 50 characters)",
        },
        { status: 400 },
      )
    }

    let verificationResult
    let modelUsed = "fallback-analysis"

    try {
      // Try AI-powered deep verification first
      verificationResult = await performDeepNewsVerification(body.text, body.url)
      modelUsed = process.env.OPENAI_API_KEY?.startsWith("sk-or-") ? "openrouter-gpt-4o" : "openai-gpt-4o"
    } catch (apiError) {
      console.log("AI verification failed, using fallback analysis:", apiError)
      // Use pattern-based fallback if AI fails
      verificationResult = await fallbackNewsAnalysis(body.text)
    }

    // Determine news authenticity status
    let news_authenticity: "real" | "fake" | "misleading" | "satire" | "uncertain"

    if (verificationResult.confidence > 85) {
      if (verificationResult.credibilityScore > 80) {
        news_authenticity = "real"
      } else if (verificationResult.credibilityScore < 30) {
        news_authenticity = "fake"
      } else {
        news_authenticity = "misleading"
      }
    } else {
      news_authenticity = "uncertain"
    }

    const result: NewsVerificationResult = {
      news_authenticity,
      credibility_score: verificationResult.credibilityScore,
      confidence: verificationResult.confidence,
      reasoning: verificationResult.reasoning,
      fact_check_results: {
        claims_verified: verificationResult.factCheckResults.claimsVerified || [],
        claims_disputed: verificationResult.factCheckResults.claimsDisputed || [],
        sources_found: verificationResult.factCheckResults.sourcesFound || [],
        red_flags: verificationResult.factCheckResults.redFlags || [],
      },
      research_summary: verificationResult.researchSummary,
      verification_time: Date.now() - startTime,
      model_used: modelUsed,
    }

    console.log("✅ News verification complete:", {
      authenticity: news_authenticity,
      credibility: verificationResult.credibilityScore,
      confidence: verificationResult.confidence,
      time: result.verification_time + "ms",
      model: modelUsed,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ News verification error:", error)
    return NextResponse.json(
      {
        error: "News verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
