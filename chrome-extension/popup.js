document.addEventListener("DOMContentLoaded", () => {
  const scanButton = document.getElementById("scanButton")
  const loading = document.getElementById("loading")
  const results = document.getElementById("results")
  const status = document.getElementById("status")
  const details = document.getElementById("details")
  const error = document.getElementById("error")

  scanButton.addEventListener("click", async () => {
    // Hide previous results
    results.style.display = "none"
    error.style.display = "none"
    loading.style.display = "block"
    scanButton.disabled = true
    scanButton.textContent = "Scanning..."

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      // Extract text from the page
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageText,
      })

      if (!result.result || !result.result.text) {
        throw new Error("Could not extract text from this page")
      }

      // Send to backend for analysis
      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: result.result.text,
          url: tab.url,
        }),
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const analysisResult = await response.json()
      displayResults(analysisResult)
    } catch (err) {
      console.error("Scan error:", err)
      error.textContent = err.message || "Failed to analyze page content"
      error.style.display = "block"
    } finally {
      loading.style.display = "none"
      scanButton.disabled = false
      scanButton.textContent = "🔍 Scan This Page"
    }
  })

  function displayResults(result) {
    // Set status
    status.className = `status ${result.status.replace("_", "-")}`

    let statusText = ""
    let statusIcon = ""

    switch (result.status) {
      case "likely_ai":
        statusText = "Likely AI-Generated"
        statusIcon = "🤖"
        break
      case "likely_human":
        statusText = "Likely Human-Authored"
        statusIcon = "👤"
        break
      case "uncertain":
        statusText = "Mixed Indicators"
        statusIcon = "❓"
        break
    }

    status.innerHTML = `
      <div>${statusIcon} ${statusText}</div>
      <div class="confidence">Confidence: ${result.confidence}%</div>
    `

    // Set details
    let detailsHTML = `<h4>Analysis Details:</h4>`

    if (result.flagged_patterns.length > 0) {
      detailsHTML += `
        <h4>Flagged Patterns:</h4>
        <ul>
          ${result.flagged_patterns.map((pattern) => `<li>${pattern}</li>`).join("")}
        </ul>
      `
    }

    if (result.analysis_details.suspicious_phrases.length > 0) {
      detailsHTML += `
        <h4>Suspicious Phrases:</h4>
        <ul>
          ${result.analysis_details.suspicious_phrases.map((phrase) => `<li>${phrase}</li>`).join("")}
        </ul>
      `
    }

    detailsHTML += `
      <h4>Recommended Action:</h4>
      <p style="margin: 5px 0; color: #e5e7eb;">${result.suggested_action}</p>
    `

    details.innerHTML = detailsHTML
    results.style.display = "block"
  }
})

// Function to be injected into the page
function extractPageText() {
  // Remove script and style elements
  const scripts = document.querySelectorAll("script, style, noscript")
  scripts.forEach((el) => el.remove())

  // Get visible text content
  const textContent = document.body.innerText || document.body.textContent || ""

  // Clean and limit text
  const cleanText = textContent.replace(/\s+/g, " ").trim().slice(0, 10000) // Limit to 10k characters

  return {
    text: cleanText,
    length: cleanText.length,
    url: window.location.href,
  }
}
