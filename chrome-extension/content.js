// Content script for highlighting suspicious content
let highlightedElements = []

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlight") {
    highlightSuspiciousContent(request.patterns)
    sendResponse({ success: true })
  } else if (request.action === "clearHighlights") {
    clearHighlights()
    sendResponse({ success: true })
  }
})

function highlightSuspiciousContent(patterns) {
  // Clear existing highlights
  clearHighlights()

  if (!patterns || patterns.length === 0) return

  // Create regex patterns from flagged content
  const regexPatterns = patterns
    .map((pattern) => {
      try {
        // Extract text from pattern description
        const match = pattern.match(/: (.+)$/)
        if (match) {
          return new RegExp(escapeRegExp(match[1]), "gi")
        }
        return null
      } catch (e) {
        return null
      }
    })
    .filter(Boolean)

  // Find and highlight text nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)

  const textNodes = []
  let node
  while ((node = walker.nextNode())) {
    if (
      node.parentElement.tagName !== "SCRIPT" &&
      node.parentElement.tagName !== "STYLE" &&
      node.textContent.trim().length > 0
    ) {
      textNodes.push(node)
    }
  }

  textNodes.forEach((textNode) => {
    regexPatterns.forEach((regex) => {
      const text = textNode.textContent
      if (regex.test(text)) {
        highlightTextNode(textNode, regex)
      }
    })
  })
}

function highlightTextNode(textNode, regex) {
  const parent = textNode.parentNode
  const text = textNode.textContent
  const fragments = []
  let lastIndex = 0
  let match

  regex.lastIndex = 0 // Reset regex

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      fragments.push(document.createTextNode(text.slice(lastIndex, match.index)))
    }

    // Add highlighted match
    const highlight = document.createElement("span")
    highlight.style.backgroundColor = "rgba(239, 68, 68, 0.3)"
    highlight.style.border = "1px solid rgba(239, 68, 68, 0.5)"
    highlight.style.borderRadius = "2px"
    highlight.style.padding = "1px 2px"
    highlight.textContent = match[0]
    highlight.title = "Flagged by Reclaim Reality as potentially suspicious"
    fragments.push(highlight)
    highlightedElements.push(highlight)

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    fragments.push(document.createTextNode(text.slice(lastIndex)))
  }

  // Replace original text node with fragments
  if (fragments.length > 1) {
    fragments.forEach((fragment) => {
      parent.insertBefore(fragment, textNode)
    })
    parent.removeChild(textNode)
  }
}

function clearHighlights() {
  highlightedElements.forEach((element) => {
    const parent = element.parentNode
    if (parent) {
      parent.replaceChild(document.createTextNode(element.textContent), element)
      parent.normalize() // Merge adjacent text nodes
    }
  })
  highlightedElements = []
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Add visual indicator when extension is active
const indicator = document.createElement("div")
indicator.id = "reclaim-reality-indicator"
indicator.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`
indicator.textContent = "🛡️ Reclaim Reality Active"
document.body.appendChild(indicator)

// Show indicator briefly when page loads
setTimeout(() => {
  indicator.style.display = "block"
  setTimeout(() => {
    indicator.style.display = "none"
  }, 3000)
}, 1000)
