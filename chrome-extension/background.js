// Background service worker for the extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Reclaim Reality extension installed")

    // Set default settings
    chrome.storage.sync.set({
      autoScan: false,
      highlightSuspicious: true,
      confidenceThreshold: 70,
    })

    // Open welcome page
    chrome.tabs.create({
      url: "http://localhost:3000",
    })
  }
})

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeText") {
    analyzeTextContent(request.text, request.url)
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // Keep message channel open for async response
  }
})

// Function to analyze text content
async function analyzeTextContent(text, url) {
  try {
    const response = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, url }),
    })

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Background analysis error:", error)
    throw error
  }
}

// Update badge based on analysis results
function updateBadge(tabId, status) {
  let badgeText = ""
  let badgeColor = "#666"

  switch (status) {
    case "likely_ai":
      badgeText = "AI"
      badgeColor = "#ef4444"
      break
    case "uncertain":
      badgeText = "?"
      badgeColor = "#f59e0b"
      break
    case "likely_human":
      badgeText = "✓"
      badgeColor = "#22c55e"
      break
  }

  chrome.action.setBadgeText({ text: badgeText, tabId })
  chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId })
}

// Clear badge when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.action.setBadgeText({ text: "", tabId })
  }
})
