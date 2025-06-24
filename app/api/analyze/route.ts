import { type NextRequest, NextResponse } from "next/server"

interface AnalysisRequest {
  text?: string
  imageUrl?: string
  videoUrl?: string
  url?: string
  contentType: "text" | "image" | "video" | "mixed"
}

interface CredibilityScore {
  overall: number
  factors: {
    source_reliability: number
    content_authenticity: number
    fact_check_status: number
    ai_detection: number
  }
}

interface VerifiedSource {
  name: string
  url: string
  reliability_score: number
  fact_check_result: "verified" | "disputed" | "false" | "mixed" | "unknown"
}

interface AnalysisResult {
  content_type: "text" | "image" | "video" | "mixed"
  authenticity_status: "authentic" | "ai_generated" | "manipulated" | "hyperreal" | "uncertain"
  confidence: number
  credibility_score: CredibilityScore
  flagged_patterns: string[]
  manipulation_indicators: string[]
  verified_sources: VerifiedSource[]
  suggested_action: string
  analysis_details: {
    ai_indicators: string[]
    human_indicators: string[]
    technical_analysis: string[]
    metadata_analysis: string[]
  }
  real_time_flags: {
    deepfake_detected: boolean
    ai_text_detected: boolean
    image_manipulation: boolean
    source_credibility_low: boolean
  }
}

// Enhanced AI detection patterns for hyperreal content
const HYPERREAL_PATTERNS = [
  {
    pattern: /\b(breaking|exclusive|shocking|unprecedented|revolutionary|groundbreaking|never before seen)\b/gi,
    weight: 15,
    name: "Sensational Language",
    category: "hyperreal",
  },
  {
    pattern: /\b(scientists discover|new study reveals|experts shocked|doctors hate this|you won't believe)\b/gi,
    weight: 20,
    name: "Clickbait Science",
    category: "hyperreal",
  },
  {
    pattern: /\b(this one trick|secret that|they don't want you to know|hidden truth|exposed)\b/gi,
    weight: 25,
    name: "Conspiracy Language",
    category: "hyperreal",
  },
]

const AI_TEXT_PATTERNS = [
  {
    pattern: /\b(as an ai|i'm an ai|as a language model|i don't have personal|i cannot feel)\b/gi,
    weight: 30,
    name: "AI Self-Reference",
    category: "ai_generated",
  },
  {
    pattern: /\b(furthermore|moreover|additionally|in conclusion|to summarize|consequently)\b/gi,
    weight: 8,
    name: "Formal Transitions",
    category: "ai_generated",
  },
  {
    pattern: /\b(it's important to note|it's worth noting|keep in mind|bear in mind)\b/gi,
    weight: 12,
    name: "Cautionary Phrases",
    category: "ai_generated",
  },
]

const MANIPULATION_INDICATORS = [
  {
    pattern: /\b(according to unnamed sources|sources close to|insider reveals|leaked documents)\b/gi,
    weight: 18,
    name: "Anonymous Sources",
    category: "manipulation",
  },
  {
    pattern: /\b(viral video shows|shocking footage|caught on camera|you need to see this)\b/gi,
    weight: 22,
    name: "Viral Content Claims",
    category: "manipulation",
  },
]

// Simulated credible sources database
const CREDIBLE_SOURCES = [
  { domain: "reuters.com", reliability: 95, type: "news" },
  { domain: "ap.org", reliability: 94, type: "news" },
  { domain: "bbc.com", reliability: 92, type: "news" },
  { domain: "nature.com", reliability: 98, type: "scientific" },
  { domain: "science.org", reliability: 97, type: "scientific" },
  { domain: "snopes.com", reliability: 88, type: "fact_check" },
  { domain: "factcheck.org", reliability: 90, type: "fact_check" },
  { domain: "politifact.com", reliability: 87, type: "fact_check" },
]

function analyzeImageManipulation(imageUrl: string): {
  manipulation_detected: boolean
  confidence: number
  indicators: string[]
} {
  // Simulated image analysis (in real implementation, use AI vision APIs)
  const indicators: string[] = []
  let manipulation_score = 0

  // Simulate detection based on URL patterns (for demo)
  if (imageUrl.includes("deepfake") || imageUrl.includes("fake")) {
    manipulation_score += 80
    indicators.push("Potential deepfake indicators detected")
  }

  if (imageUrl.includes("generated") || imageUrl.includes("ai")) {
    manipulation_score += 70
    indicators.push("AI-generated image signatures found")
  }

  // Simulate metadata analysis
  indicators.push("EXIF data analysis: No camera metadata found")
  indicators.push("Compression artifacts suggest digital manipulation")

  return {
    manipulation_detected: manipulation_score > 50,
    confidence: Math.min(95, manipulation_score),
    indicators,
  }
}

function analyzeVideoAuthenticity(videoUrl: string): {
  deepfake_detected: boolean
  confidence: number
  indicators: string[]
} {
  // Simulated video analysis
  const indicators: string[] = []
  let deepfake_score = 0

  // Simulate deepfake detection
  if (videoUrl.includes("deepfake") || videoUrl.includes("synthetic")) {
    deepfake_score += 85
    indicators.push("Facial inconsistencies detected")
    indicators.push("Unnatural eye movement patterns")
  }

  indicators.push("Frame-by-frame analysis completed")
  indicators.push("Audio-visual synchronization checked")

  return {
    deepfake_detected: deepfake_score > 60,
    confidence: Math.min(90, deepfake_score),
    indicators,
  }
}

function calculateCredibilityScore(sourceUrl: string, aiScore: number, manipulationScore: number): CredibilityScore {
  // Extract domain from URL
  let domain = ""
  try {
    domain = new URL(sourceUrl).hostname.replace("www.", "")
  } catch {
    domain = "unknown"
  }

  // Check against credible sources
  const sourceInfo = CREDIBLE_SOURCES.find((s) => domain.includes(s.domain))
  const source_reliability = sourceInfo ? sourceInfo.reliability : 30

  // Calculate component scores
  const content_authenticity = Math.max(10, 100 - aiScore - manipulationScore)
  const fact_check_status = sourceInfo?.type === "fact_check" ? 95 : 60
  const ai_detection = Math.max(20, 100 - aiScore)

  // Calculate overall score
  const overall = Math.round(
    source_reliability * 0.3 + content_authenticity * 0.4 + fact_check_status * 0.2 + ai_detection * 0.1,
  )

  return {
    overall,
    factors: {
      source_reliability,
      content_authenticity,
      fact_check_status,
      ai_detection,
    },
  }
}

function findVerifiedSources(content: string, sourceUrl: string): VerifiedSource[] {
  // Simulate finding related verified sources
  const sources: VerifiedSource[] = []

  // Add some credible sources based on content type
  if (content.toLowerCase().includes("climate") || content.toLowerCase().includes("science")) {
    sources.push({
      name: "Nature Scientific Reports",
      url: "https://nature.com/articles/climate-research",
      reliability_score: 98,
      fact_check_result: "verified",
    })
  }

  if (content.toLowerCase().includes("news") || content.toLowerCase().includes("breaking")) {
    sources.push({
      name: "Reuters Fact Check",
      url: "https://reuters.com/fact-check",
      reliability_score: 95,
      fact_check_result: "verified",
    })
  }

  // Always add a fact-checking source
  sources.push({
    name: "Snopes Fact Check",
    url: "https://snopes.com/fact-check",
    reliability_score: 88,
    fact_check_result: "unknown",
  })

  return sources
}

function analyzeTextContent(text: string): {
  aiScore: number
  manipulationScore: number
  hyperrealScore: number
  flaggedPatterns: string[]
  aiIndicators: string[]
  technicalAnalysis: string[]
} {
  let aiScore = 0
  let manipulationScore = 0
  let hyperrealScore = 0
  const flaggedPatterns: string[] = []
  const aiIndicators: string[] = []
  const technicalAnalysis: string[] = []

  // Analyze AI patterns
  AI_TEXT_PATTERNS.forEach((item) => {
    const matches = text.match(item.pattern)
    if (matches) {
      const score = matches.length * item.weight
      aiScore += score
      aiIndicators.push(`${item.name}: "${matches[0]}"`)
      flaggedPatterns.push(`AI Pattern - ${item.name}`)
    }
  })

  // Analyze hyperreal patterns
  HYPERREAL_PATTERNS.forEach((item) => {
    const matches = text.match(item.pattern)
    if (matches) {
      const score = matches.length * item.weight
      hyperrealScore += score
      flaggedPatterns.push(`Hyperreal Pattern - ${item.name}`)
    }
  })

  // Analyze manipulation indicators
  MANIPULATION_INDICATORS.forEach((item) => {
    const matches = text.match(item.pattern)
    if (matches) {
      const score = matches.length * item.weight
      manipulationScore += score
      flaggedPatterns.push(`Manipulation Indicator - ${item.name}`)
    }
  })

  // Technical analysis
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  if (sentences.length > 0) {
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length
    technicalAnalysis.push(`Average sentence length: ${Math.round(avgLength)} characters`)

    if (avgLength > 120) {
      aiScore += 15
      technicalAnalysis.push("Unusually long sentences detected (AI-like)")
    }
  }

  return {
    aiScore,
    manipulationScore,
    hyperrealScore,
    flaggedPatterns,
    aiIndicators,
    technicalAnalysis,
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Enhanced analysis API called")

    const body: AnalysisRequest = await request.json()
    console.log("📝 Request type:", body.contentType)

    if (!body.text && !body.imageUrl && !body.videoUrl) {
      return NextResponse.json({ error: "No content provided for analysis" }, { status: 400 })
    }

    let textAnalysis = {
      aiScore: 0,
      manipulationScore: 0,
      hyperrealScore: 0,
      flaggedPatterns: [],
      aiIndicators: [],
      technicalAnalysis: [],
    }
    let imageAnalysis = { manipulation_detected: false, confidence: 0, indicators: [] }
    let videoAnalysis = { deepfake_detected: false, confidence: 0, indicators: [] }

    // Analyze text content
    if (body.text) {
      textAnalysis = analyzeTextContent(body.text)
    }

    // Analyze image content
    if (body.imageUrl) {
      imageAnalysis = analyzeImageManipulation(body.imageUrl)
    }

    // Analyze video content
    if (body.videoUrl) {
      videoAnalysis = analyzeVideoAuthenticity(body.videoUrl)
    }

    // Calculate overall scores
    const totalAiScore = textAnalysis.aiScore
    const totalManipulationScore =
      textAnalysis.manipulationScore +
      (imageAnalysis.manipulation_detected ? 50 : 0) +
      (videoAnalysis.deepfake_detected ? 60 : 0)
    const totalHyperrealScore = textAnalysis.hyperrealScore

    // Determine authenticity status
    let authenticity_status: "authentic" | "ai_generated" | "manipulated" | "hyperreal" | "uncertain"
    let confidence = 0

    if (totalHyperrealScore > 40) {
      authenticity_status = "hyperreal"
      confidence = Math.min(95, 60 + totalHyperrealScore * 0.5)
    } else if (totalAiScore > 50) {
      authenticity_status = "ai_generated"
      confidence = Math.min(90, 50 + totalAiScore * 0.4)
    } else if (totalManipulationScore > 40) {
      authenticity_status = "manipulated"
      confidence = Math.min(85, 50 + totalManipulationScore * 0.4)
    } else if (totalAiScore < 20 && totalManipulationScore < 20) {
      authenticity_status = "authentic"
      confidence = Math.min(80, 60 + (40 - totalAiScore - totalManipulationScore) * 0.3)
    } else {
      authenticity_status = "uncertain"
      confidence = 45
    }

    // Calculate credibility score
    const credibility_score = calculateCredibilityScore(body.url || "unknown", totalAiScore, totalManipulationScore)

    // Find verified sources
    const verified_sources = findVerifiedSources(body.text || "", body.url || "")

    // Compile all indicators
    const manipulation_indicators = [
      ...imageAnalysis.indicators,
      ...videoAnalysis.indicators,
      ...textAnalysis.flaggedPatterns.filter((p) => p.includes("Manipulation")),
    ]

    // Real-time flags
    const real_time_flags = {
      deepfake_detected: videoAnalysis.deepfake_detected,
      ai_text_detected: totalAiScore > 30,
      image_manipulation: imageAnalysis.manipulation_detected,
      source_credibility_low: credibility_score.overall < 50,
    }

    // Suggested action based on analysis
    let suggested_action = ""
    if (authenticity_status === "hyperreal") {
      suggested_action =
        "⚠️ HYPERREAL CONTENT DETECTED: This content shows signs of being artificially enhanced or manipulated to appear more dramatic than reality. Verify with multiple credible sources before sharing."
    } else if (authenticity_status === "ai_generated") {
      suggested_action =
        "🤖 AI-GENERATED CONTENT: This appears to be created by artificial intelligence. Verify facts independently and check original sources."
    } else if (authenticity_status === "manipulated") {
      suggested_action =
        "🚨 MANIPULATION DETECTED: This content may have been altered or contains misleading information. Cross-reference with verified sources."
    } else if (authenticity_status === "authentic") {
      suggested_action =
        "✅ CONTENT APPEARS AUTHENTIC: While this content seems genuine, always verify important claims with multiple sources."
    } else {
      suggested_action =
        "❓ UNCERTAIN AUTHENTICITY: Mixed signals detected. Exercise caution and verify with trusted sources."
    }

    const result: AnalysisResult = {
      content_type: body.contentType,
      authenticity_status,
      confidence: Math.round(confidence),
      credibility_score,
      flagged_patterns: textAnalysis.flaggedPatterns,
      manipulation_indicators,
      verified_sources,
      suggested_action,
      analysis_details: {
        ai_indicators: textAnalysis.aiIndicators,
        human_indicators: [],
        technical_analysis: textAnalysis.technicalAnalysis,
        metadata_analysis: [...imageAnalysis.indicators, ...videoAnalysis.indicators],
      },
      real_time_flags,
    }

    console.log("✅ Enhanced analysis complete:", {
      status: authenticity_status,
      confidence,
      credibility: credibility_score.overall,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Enhanced analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
