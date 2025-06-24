# Reclaim Reality Chrome Extension

## Installation Instructions

### Manual Installation (Development)

1. Download the extension files to a local folder
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your extensions list

### Usage

1. Navigate to any webpage you want to analyze
2. Click the Reclaim Reality extension icon in your browser toolbar
3. Click "Scan This Page" to analyze the content
4. View the results showing AI detection confidence and flagged patterns
5. Suspicious content may be highlighted directly on the page

### Features

- **Real-time Analysis**: Scan any webpage content instantly
- **AI Detection**: Advanced algorithms to identify AI-generated text
- **Pattern Recognition**: Flags common AI writing patterns and suspicious phrases
- **Visual Highlighting**: Suspicious content highlighted directly on pages
- **Confidence Scoring**: Clear confidence levels for each analysis
- **Privacy Focused**: No personal data collection or permanent storage

### Configuration

The extension connects to the Reclaim Reality backend API. Make sure the backend is running on:
- Development: `http://localhost:3000`
- Production: Update the API endpoint in the manifest.json host_permissions

### Permissions

- `activeTab`: Access current tab content for analysis
- `storage`: Store user preferences and settings
- Host permissions for API communication

### Troubleshooting

1. **Extension not working**: Check that Developer mode is enabled
2. **API errors**: Ensure the backend server is running
3. **No text extracted**: Some pages may block content extraction
4. **Highlights not showing**: Try refreshing the page after scanning

### Support

For issues, feedback, or contributions, visit our GitHub repository or contact support through the main website.
