import { type NextRequest, NextResponse } from "next/server"

interface AIDetectionRequest {
  text: string
  contentType?: "text" | "image" | "video"
  realTime?: boolean
}

interface AIDetectionResult {
  authenticity_status: "authentic" | "ai_generated" | "manipulated" | "hyperreal" | "uncertain"
  confidence: number
  ai_probability: number
  human_probability: number
  reasoning: string
  breakdown: {
    ai_generated: number
    ai_refined: number
    human_refined: number
    human_written: number
  }
  analysis_time: number
  model_used: string
}

// Direct OpenAI API call (works with OpenRouter and OpenAI keys)
async function callDirectOpenAI(text: string): Promise<{
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

    // Determine the base URL based on the API key format
    const baseURL = apiKey.startsWith("sk-or-") ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"

    const model = apiKey.startsWith("sk-or-") ? "openai/gpt-4o" : "gpt-4o"

    console.log(`Using ${apiKey.startsWith("sk-or-") ? "OpenRouter" : "OpenAI"} API with model: ${model}`)

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(apiKey.startsWith("sk-or-") && {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Reclaim Reality AI Detector",
        }),
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are an elite AI content detection specialist with expertise in identifying AI-generated text from models like GPT-3.5, GPT-4, Claude, Gemini, and other LLMs.

CRITICAL ANALYSIS FACTORS:
1. LINGUISTIC PATTERNS:
   - Repetitive sentence structures
   - Overuse of transition words (furthermore, moreover, however)
   - Balanced, overly diplomatic language
   - Lack of strong personal opinions or bias

2. CONTENT CHARACTERISTICS:
   - Generic, templated responses
   - Excessive politeness and hedging ("it's worth noting", "it's important to consider")
   - Perfect grammar with no typos or colloquialisms
   - Structured, list-like organization

3. HUMAN INDICATORS:
   - Personal anecdotes and specific experiences
   - Typos, grammatical errors, informal language
   - Strong opinions, bias, emotional language
   - Cultural references, slang, abbreviations (lol, tbh, etc.)
   - Inconsistent writing style within the text

4. AI INDICATORS:
   - Overly comprehensive coverage of topics
   - Neutral, balanced perspectives on controversial topics
   - Formal academic tone even in casual contexts
   - Repetitive phrasing patterns
   - Lack of personal pronouns in first-person contexts

Respond with ONLY this JSON format:
{
  "isAI": boolean,
  "confidence": number (65-95),
  "reasoning": "Detailed explanation with specific examples from the text",
  "ai_indicators": ["list", "of", "specific", "ai", "patterns", "found"],
  "human_indicators": ["list", "of", "specific", "human", "patterns", "found"],
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
            content: `Analyze this text for AI vs human authorship. Be thorough and look for subtle patterns:

TEXT TO ANALYZE:
"${text}"

Provide detailed analysis focusing on specific patterns you observe in this text.`,
          },
        ],
        temperature: 0.05,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("API Response Error:", response.status, errorData)
      throw new Error(`API request failed: ${response.status} - ${errorData}`)
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid API response structure")
    }

    const content = data.choices[0].message.content

    // Clean and parse response
    const cleanResponse = content.replace(/```json\n?|\n?```/g, "").trim()
    let analysis

    try {
      analysis = JSON.parse(cleanResponse)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      console.log("Raw response:", content)
      throw new Error("Failed to parse AI analysis response")
    }

    // Validate response structure
    if (
      typeof analysis.isAI !== "boolean" ||
      typeof analysis.confidence !== "number" ||
      typeof analysis.reasoning !== "string"
    ) {
      throw new Error("Invalid response structure from AI model")
    }

    // Ensure breakdown exists and sums to 100
    if (!analysis.breakdown) {
      analysis.breakdown = {
        ai_generated: analysis.isAI ? 70 : 20,
        ai_refined: analysis.isAI ? 20 : 25,
        human_refined: analysis.isAI ? 10 : 25,
        human_written: analysis.isAI ? 0 : 30,
      }
    }

    // Normalize breakdown to 100%
    const total = Object.values(analysis.breakdown).reduce((sum: number, val: any) => sum + Number(val), 0)
    if (Math.abs(total - 100) > 2) {
      const factor = 100 / total
      Object.keys(analysis.breakdown).forEach((key) => {
        analysis.breakdown[key] = Math.round(analysis.breakdown[key] * factor)
      })
    }

    // Enhance reasoning with specific indicators
    let enhancedReasoning = analysis.reasoning
    if (analysis.ai_indicators && analysis.ai_indicators.length > 0) {
      enhancedReasoning += ` AI patterns detected: ${analysis.ai_indicators.join(", ")}.`
    }
    if (analysis.human_indicators && analysis.human_indicators.length > 0) {
      enhancedReasoning += ` Human patterns detected: ${analysis.human_indicators.join(", ")}.`
    }

    return {
      isAI: analysis.isAI,
      confidence: Math.max(65, Math.min(95, analysis.confidence)),
      reasoning: enhancedReasoning,
      breakdown: analysis.breakdown,
    }
  } catch (error) {
    console.error("Direct API call error:", error)
    throw error
  }
}

// Sophisticated fallback analysis (same as before)
async function sophisticatedFallbackAnalysis(text: string): Promise<{
  isAI: boolean
  confidence: number
  reasoning: string
  breakdown: any
}> {
  console.log("Using sophisticated fallback analysis...")

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  let aiScore = 0
  let humanScore = 0
  const indicators = []

  // 1. AI-typical transition words and phrases (strong indicator)
  const aiTransitions = [
    "furthermore",
    "moreover",
    "additionally",
    "consequently",
    "therefore",
    "nonetheless",
    "it's important to note",
    "it's worth noting",
    "it should be noted",
    "it's crucial to",
    "in conclusion",
    "to summarize",
    "in summary",
    "overall",
    "ultimately",
  ]

  const aiTransitionCount = aiTransitions.filter((phrase) => text.toLowerCase().includes(phrase)).length

  if (aiTransitionCount > 0) {
    aiScore += aiTransitionCount * 25
    indicators.push(`${aiTransitionCount} AI-typical transitions`)
  }

  // 2. Human-specific patterns (strong indicator)
  const humanPatterns = [
    /\b(lol|omg|wtf|tbh|imo|imho)\b/gi,
    /\b(gonna|wanna|kinda|sorta|dunno)\b/gi,
    /\b(i think|i feel|i believe|personally|honestly)\b/gi,
    /[.]{3,}|[!]{2,}|[?]{2,}/g, // Multiple punctuation
    /\b(um|uh|like|you know)\b/gi, // Filler words
  ]

  let humanPatternCount = 0
  humanPatterns.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) {
      humanPatternCount += matches.length
    }
  })

  if (humanPatternCount > 0) {
    humanScore += humanPatternCount * 20
    indicators.push(`${humanPatternCount} human speech patterns`)
  }

  // 3. Sentence structure analysis
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length

  if (avgSentenceLength > 25) {
    aiScore += 20
    indicators.push("very long sentences")
  } else if (avgSentenceLength < 10) {
    humanScore += 15
    indicators.push("short, casual sentences")
  }

  // 4. Personal experience indicators
  const personalIndicators = [
    /\bmy (experience|opinion|view|perspective|story|life|family|friend)\b/gi,
    /\bi (remember|experienced|went|saw|felt|thought)\b/gi,
    /\b(yesterday|last week|when i was|growing up)\b/gi,
  ]

  let personalCount = 0
  personalIndicators.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) personalCount += matches.length
  })

  if (personalCount > 0) {
    humanScore += personalCount * 25
    indicators.push("personal experiences")
  }

  // Calculate final scores
  const totalScore = Math.max(aiScore + humanScore, 1)
  const aiProbability = (aiScore / totalScore) * 100

  const isAI = aiProbability > 55
  const confidence = Math.min(90, Math.max(65, Math.abs(aiProbability - 50) * 1.5 + 65))

  const reasoning = `Fallback analysis based on: ${indicators.join(", ")}. ${
    isAI ? `AI probability: ${Math.round(aiProbability)}%` : `Human probability: ${Math.round(100 - aiProbability)}%`
  }`

  const breakdown = {
    ai_generated: Math.round(aiProbability * 0.8),
    ai_refined: Math.round(aiProbability * 0.2),
    human_refined: Math.round((100 - aiProbability) * 0.3),
    human_written: Math.round((100 - aiProbability) * 0.7),
  }

  return {
    isAI,
    confidence,
    reasoning,
    breakdown,
  }
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    console.log("🎯 Enhanced AI detection API called")

    const body: AIDetectionRequest = await request.json()

    if (!body.text || body.text.trim().length < 20) {
      return NextResponse.json(
        {
          error: "Text too short for accurate analysis (minimum 20 characters)",
        },
        { status: 400 },
      )
    }

    let aiResult
    let modelUsed = "fallback-analysis"

    try {
      // Try direct API call first
      aiResult = await callDirectOpenAI(body.text)
      modelUsed = process.env.OPENAI_API_KEY?.startsWith("sk-or-") ? "openrouter-gpt-4o" : "openai-gpt-4o"
    } catch (apiError) {
      console.log("API call failed, using fallback analysis:", apiError)
      // Use sophisticated fallback if API fails
      aiResult = await sophisticatedFallbackAnalysis(body.text)
    }

    // More nuanced authenticity status determination
    let authenticity_status: "authentic" | "ai_generated" | "manipulated" | "hyperreal" | "uncertain"

    if (aiResult.confidence > 85) {
      authenticity_status = aiResult.isAI ? "ai_generated" : "authentic"
    } else if (aiResult.confidence > 75) {
      authenticity_status = aiResult.isAI ? "ai_generated" : "authentic"
    } else {
      authenticity_status = "uncertain"
    }

    const result: AIDetectionResult = {
      authenticity_status,
      confidence: aiResult.confidence,
      ai_probability: aiResult.isAI ? aiResult.confidence : 100 - aiResult.confidence,
      human_probability: aiResult.isAI ? 100 - aiResult.confidence : aiResult.confidence,
      reasoning: aiResult.reasoning,
      breakdown: aiResult.breakdown,
      analysis_time: Date.now() - startTime,
      model_used: modelUsed,
    }

    console.log("✅ Enhanced AI detection complete:", {
      status: authenticity_status,
      confidence: aiResult.confidence,
      time: result.analysis_time + "ms",
      model: modelUsed,
      isAI: aiResult.isAI,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Enhanced AI detection error:", error)
    return NextResponse.json(
      {
        error: "AI detection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
