import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Zap, Users, Download, Github, Mail, ArrowRight, CheckCircle, Star, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative"
      suppressHydrationWarning={true}
    >
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-morph-1"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-morph-2"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-morph-3"></div>

        {/* Floating Particles */}
        <div className="particle-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 animate-grid-flow"></div>
      </div>

      {/* Magnetic Navigation */}
      <nav className="relative border-b border-white/10 bg-black/20 backdrop-blur-2xl nav-magnetic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 group logo-hover">
              <div className="relative shield-container">
                <Shield className="h-8 w-8 text-purple-400 shield-icon" />
                <div className="shield-glow"></div>
                <div className="shield-particles"></div>
              </div>
              <span className="text-2xl font-bold text-white logo-text">Reclaim Reality</span>
            </div>
            <div className="flex items-center space-x-6">
              {["Features", "How It Works", "Download"].map((item, index) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="nav-link"
                  data-text={item}
                >
                  <span className="nav-link-text">{item}</span>
                  <div className="nav-link-bg"></div>
                  <div className="nav-link-border"></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Advanced Effects */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 hero-section">
        <div className="max-w-7xl mx-auto text-center">
          <div className="hero-badge-container">
            <Badge className="hero-badge">
              <Star className="w-4 h-4 mr-2 star-spin" />
              <Sparkles className="w-4 h-4 mr-2 sparkle-animation" />🚀 Now Available - Chrome Extension
            </Badge>
          </div>

          <div className="hero-title-container">
            <h1 className="hero-title">
              <span className="hero-title-main">Reclaim Reality</span>
              <span className="hero-title-sub">in Real Time</span>
            </h1>
          </div>

          <div className="hero-description">
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed hero-text">
              Detect AI-generated, fake, and manipulated content while you browse. Our intelligent Chrome extension
              analyzes web content in real-time to help you distinguish between authentic and artificial information.
            </p>
          </div>

          <div className="hero-buttons">
            <Button className="hero-btn-primary">
              <Download className="mr-3 h-6 w-6 btn-icon" />
              Download Extension
              <ArrowRight className="ml-3 h-6 w-6 btn-arrow" />
              <div className="btn-ripple"></div>
            </Button>
            <Button className="hero-btn-secondary">
              <Github className="mr-3 h-6 w-6 btn-icon-github" />
              View on GitHub
              <div className="btn-magnetic-field"></div>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section with Liquid Animations */}
      <section id="features" className="relative py-32 px-4 sm:px-6 lg:px-8 features-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 section-header">
            <h2 className="section-title">
              <span className="title-word" data-word="Powerful">
                Powerful
              </span>
              <span className="title-word" data-word="Detection">
                Detection
              </span>
              <br />
              <span className="title-word" data-word="Features">
                Features
              </span>
            </h2>
            <p className="section-subtitle">
              Advanced AI and rule-based analysis to identify suspicious content across the web
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 features-grid">
            {[
              {
                icon: Eye,
                title: "Real-Time Scanning",
                description: "Instantly analyze any webpage content with a single click",
                content:
                  "Extract and analyze up to 10,000 characters of visible text content from any webpage in seconds.",
                color: "purple",
              },
              {
                icon: Zap,
                title: "AI Detection",
                description: "Advanced algorithms to identify AI-generated text",
                content:
                  "Uses multiple AI models and pattern recognition to detect artificially generated content with high accuracy.",
                color: "blue",
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "Your data stays secure and private",
                content:
                  "No personal data collection. Content is analyzed securely and results are not stored permanently.",
                color: "green",
              },
              {
                icon: Users,
                title: "Fact Checking",
                description: "Cross-reference claims with reliable sources",
                content: "Integrates with fact-checking APIs to verify claims and identify potential misinformation.",
                color: "pink",
              },
              {
                icon: Eye,
                title: "Visual Highlighting",
                description: "Suspicious content highlighted on the page",
                content: "Automatically highlights suspicious sentences and phrases directly in your browser.",
                color: "orange",
              },
              {
                icon: Zap,
                title: "Confidence Scoring",
                description: "Clear confidence levels for each analysis",
                content: "Get detailed confidence scores and explanations for why content was flagged as suspicious.",
                color: "cyan",
              },
            ].map((feature, index) => (
              <Card key={index} className={`feature-card feature-card-${feature.color}`} data-index={index}>
                <div className="feature-card-inner">
                  <CardHeader className="feature-header">
                    <div className="feature-icon-container">
                      <feature.icon className="feature-icon" />
                      <div className="feature-icon-glow"></div>
                      <div className="feature-icon-particles"></div>
                    </div>
                    <CardTitle className="feature-title">{feature.title}</CardTitle>
                    <CardDescription className="feature-description">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="feature-content">{feature.content}</CardContent>
                  <div className="feature-card-bg"></div>
                  <div className="feature-card-border"></div>
                  <div className="feature-liquid-effect"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Revolutionary How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-4 sm:px-6 lg:px-8 how-it-works-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 section-header">
            <h2 className="section-title">
              <span className="title-word morphing-text" data-word="How">
                How
              </span>
              <span className="title-word morphing-text" data-word="It">
                It
              </span>
              <span className="title-word morphing-text" data-word="Works">
                Works
              </span>
            </h2>
            <p className="section-subtitle">Simple, fast, and effective content analysis in just a few steps</p>
          </div>

          <div className="relative how-it-works-container">
            {/* Animated Connection Path */}
            <svg className="connection-path" viewBox="0 0 1200 400">
              <path
                className="path-line"
                d="M100,200 Q300,100 500,200 T900,200 Q1000,150 1100,200"
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <circle className="path-dot" r="4" fill="#8b5cf6">
                <animateMotion dur="8s" repeatCount="indefinite">
                  <mpath href="#pathLine" />
                </animateMotion>
              </circle>
            </svg>

            <div className="steps-grid">
              {[
                {
                  step: "01",
                  title: "Install Extension",
                  description: "Download and install the Chrome extension from our secure repository",
                  icon: Download,
                  color: "purple",
                },
                {
                  step: "02",
                  title: "Browse Normally",
                  description: "Continue browsing the web as usual - the extension works on any website",
                  icon: Eye,
                  color: "blue",
                },
                {
                  step: "03",
                  title: "Click to Scan",
                  description: "Click the extension icon and hit 'Scan this page' to analyze content",
                  icon: Zap,
                  color: "pink",
                },
                {
                  step: "04",
                  title: "Get Results",
                  description: "Receive instant analysis with confidence scores and highlighted suspicious content",
                  icon: CheckCircle,
                  color: "green",
                },
              ].map((item, index) => (
                <div key={index} className={`step-card step-${index + 1}`} data-step={item.step}>
                  <div className="step-number-container">
                    <div className={`step-number step-number-${item.color}`}>
                      <span className="step-number-text">{item.step}</span>
                      <div className="step-number-glow"></div>
                    </div>
                  </div>

                  <div className="step-content">
                    <div className="step-icon-container">
                      <item.icon className="step-icon" />
                      <div className="step-icon-orbit"></div>
                      <div className="step-icon-pulse"></div>
                    </div>

                    <h3 className="step-title">{item.title}</h3>
                    <p className="step-description">{item.description}</p>
                  </div>

                  <div className="step-card-bg"></div>
                  <div className="step-hover-effect"></div>
                  <div className="step-magnetic-field"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section with 3D Effects */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 demo-section">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="section-title demo-title">
            <span className="title-word holographic-text" data-word="See">
              See
            </span>
            <span className="title-word holographic-text" data-word="It">
              It
            </span>
            <span className="title-word holographic-text" data-word="In">
              In
            </span>
            <span className="title-word holographic-text" data-word="Action">
              Action
            </span>
          </h2>

          <div className="demo-container">
            <div className="demo-video-placeholder">
              <div className="demo-bg-pattern"></div>
              <div className="demo-content">
                <div className="demo-shield-container">
                  <Shield className="demo-shield" />
                  <div className="demo-shield-rings"></div>
                  <div className="demo-shield-particles"></div>
                </div>
                <p className="demo-text-main">Demo Video Coming Soon</p>
                <p className="demo-text-sub">Watch how Reclaim Reality detects AI-generated content in real-time</p>
              </div>
              <div className="demo-hologram-effect"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section with Magnetic Effects */}
      <section id="download" className="relative py-32 px-4 sm:px-6 lg:px-8 download-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title download-title">
            <span className="title-word electric-text" data-word="Ready">
              Ready
            </span>
            <span className="title-word electric-text" data-word="to">
              to
            </span>
            <span className="title-word electric-text" data-word="Reclaim">
              Reclaim
            </span>
            <span className="title-word electric-text" data-word="Reality?">
              Reality?
            </span>
          </h2>

          <p className="section-subtitle download-subtitle">
            Join thousands of users who are already protecting themselves from AI-generated misinformation
          </p>

          <div className="download-cards">
            <Card className="download-card download-card-primary">
              <div className="download-card-inner">
                <CardHeader>
                  <CardTitle className="download-card-title">Chrome Extension</CardTitle>
                  <CardDescription className="download-card-description">
                    Install directly in your browser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="download-btn download-btn-primary">
                    <Download className="download-btn-icon" />
                    Download Extension
                    <div className="download-btn-energy"></div>
                  </Button>
                </CardContent>
                <div className="download-card-aura"></div>
              </div>
            </Card>

            <Card className="download-card download-card-secondary">
              <div className="download-card-inner">
                <CardHeader>
                  <CardTitle className="download-card-title">Source Code</CardTitle>
                  <CardDescription className="download-card-description">View and contribute on GitHub</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="download-btn download-btn-secondary">
                    <Github className="download-btn-icon github-icon" />
                    View on GitHub
                    <div className="download-btn-magnetic"></div>
                  </Button>
                </CardContent>
                <div className="download-card-aura"></div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 contact-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title contact-title">
            <span className="title-word neon-text" data-word="Get">
              Get
            </span>
            <span className="title-word neon-text" data-word="In">
              In
            </span>
            <span className="title-word neon-text" data-word="Touch">
              Touch
            </span>
          </h2>

          <p className="section-subtitle contact-subtitle">
            Have questions, feedback, or want to contribute? We'd love to hear from you.
          </p>

          <div className="contact-buttons">
            <Button className="contact-btn contact-btn-mail">
              <Mail className="contact-btn-icon" />
              Contact Us
              <div className="contact-btn-ripple"></div>
            </Button>
            <Button className="contact-btn contact-btn-github">
              <Github className="contact-btn-icon github-spin" />
              Report Issues
              <div className="contact-btn-glow"></div>
            </Button>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative border-t border-white/10 bg-black/30 backdrop-blur-2xl py-12 footer-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0 footer-logo">
              <div className="footer-shield-container">
                <Shield className="footer-shield" />
                <div className="footer-shield-glow"></div>
              </div>
              <span className="footer-text">Reclaim Reality</span>
            </div>
            <div className="footer-info">
              <p className="footer-copyright">© 2024 Reclaim Reality. Protecting digital truth, one page at a time.</p>
              <p className="footer-tagline">Built with passion for digital authenticity</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
