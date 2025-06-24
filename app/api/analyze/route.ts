import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface AnalysisRequest {
  text: string
  url?: string
}

interface AnalysisResult {
  status: "likely_ai" | "likely_human" | "uncertain"
  confidence: number
  flagged_patterns: string[]
  suggested_action: string
  analysis_details: {
    ai_indicators: string[]
    human_indicators: string[]
    suspicious_phrases: string[]
  }
}

// Rule-based AI detection patterns
const AI_PATTERNS = [
  /\b(as an ai|i'm an ai|as a language model|i don't have personal|i cannot feel|i don't have emotions)\b/gi,
  /\b(furthermore|moreover|additionally|in conclusion|to summarize)\b/gi,
  /\b(it's important to note|it's worth noting|keep in mind)\b/gi,
  /\b(various|numerous|several|multiple)\b/gi,
  /\b(comprehensive|extensive|thorough|detailed)\b/gi,
]

const SUSPICIOUS_PHRASES = [
  /\b(studies show|research indicates|experts say|according to sources)\b/gi,
  /\b(many people believe|it is widely known|common knowledge)\b/gi,
  /\b(breaking news|urgent update|shocking revelation)\b/gi,
]

function analyzeTextPatterns(text: string): {
  aiScore: number
  flaggedPatterns: string[]
  suspiciousPhrases: string[]
} {
  let aiScore = 0
  const flaggedPatterns: string[] = []
  const suspiciousPhrases: string[] = []

  // Check for AI patterns
  AI_PATTERNS.forEach((pattern, index) => {
    const matches = text.match(pattern)
    if (matches) {
      aiScore += matches.length * 10
      flaggedPatterns.push(`AI Pattern ${index + 1}: ${matches[0]}`)
    }
  })

  // Check for suspicious phrases
  SUSPICIOUS_PHRASES.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) {
      aiScore += matches.length * 5
      suspiciousPhrases.push(matches[0])
    }
  })

  // Check text characteristics
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length

  // Very uniform sentence lengths might indicate AI
  if (avgSentenceLength > 100) {
    aiScore += 15
    flaggedPatterns.push("Unusually long average sentence length")
  }

  // Check for repetitive structure
  const words = text.toLowerCase().split(/\s+/)
  const wordFreq = words.reduce(
    (freq, word) => {
      freq[word] = (freq[word] || 0) + 1
      return freq
    },
    {} as Record<string, number>,
  )

  const repetitiveWords = Object.entries(wordFreq)
    .filter(([word, count]) => count > 5 && word.length > 4)
    .map(([word]) => word)

  if (repetitiveWords.length > 3) {
    aiScore += 10
    flaggedPatterns.push(`Repetitive vocabulary: ${repetitiveWords.slice(0, 3).join(", ")}`)
  }

  return { aiScore, flaggedPatterns, suspiciousPhrases }
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()

    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    // Limit text length for performance
    const text = body.text.slice(0, 10000)

    // Rule-based analysis
    const { aiScore, flaggedPatterns, suspiciousPhrases } = analyzeTextPatterns(text)

    // AI-powered analysis
    const { text: aiAnalysis } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are an expert at detecting AI-generated text. Analyze the following text and provide:
1. A confidence score (0-100) that this text was AI-generated
2. Specific indicators that suggest AI or human authorship
3. Any suspicious patterns or phrases

Be concise and specific in your analysis.`,
      prompt: `Analyze this text for AI generation indicators:\n\n${text.slice(0, 2000)}`,
    })

    // Parse AI analysis for additional insights
    const aiConfidenceMatch = aiAnalysis.match(/confidence[:\s]*(\d+)/i)
    const aiConfidence = aiConfidenceMatch ? Number.parseInt(aiConfidenceMatch[1]) : 50

    // Combine scores
    const combinedScore = Math.min(100, (aiScore + aiConfidence) / 2)

    let status: "likely_ai" | "likely_human" | "uncertain"
    let suggestedAction: string

    if (combinedScore >= 70) {
      status = "likely_ai"
      suggestedAction = "High confidence AI-generated content detected. Verify information from original sources."
    } else if (combinedScore >= 40) {
      status = "uncertain"
      suggestedAction = "Mixed indicators detected. Cross-reference with multiple sources before trusting."
    } else {
      status = "likely_human"
      suggestedAction = "Content appears to be human-authored, but always verify important claims."
    }

    const result: AnalysisResult = {
      status,
      confidence: Math.round(combinedScore),
      flagged_patterns: flaggedPatterns,
      suggested_action: suggestedAction,
      analysis_details: {
        ai_indicators: flaggedPatterns.filter((p) => p.includes("AI Pattern")),
        human_indicators: combinedScore < 40 ? ["Natural language flow", "Varied sentence structure"] : [],
        suspicious_phrases: suspiciousPhrases,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze content" }, { status: 500 })
  }
}
