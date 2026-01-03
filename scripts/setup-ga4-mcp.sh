#!/bin/bash
# Setup script for Google Analytics 4 MCP Server
# This script helps configure the GA4 MCP server for Claude Desktop

echo "🔧 GA4 MCP Server Setup for Periospot"
echo "======================================"
echo ""

# Check if credentials file exists
CREDENTIALS_PATH="$HOME/.config/gcloud/periospot-ga4-credentials.json"

if [ ! -f "$CREDENTIALS_PATH" ]; then
    echo "❌ Credentials file not found at: $CREDENTIALS_PATH"
    echo ""
    echo "Please follow these steps first:"
    echo ""
    echo "1. Go to Google Cloud Console: https://console.cloud.google.com"
    echo "2. Create/select a project"
    echo "3. Enable these APIs:"
    echo "   - Analytics Data API: https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com"
    echo "   - Analytics Admin API: https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com"
    echo "4. Create a service account:"
    echo "   - IAM & Admin → Service Accounts → Create"
    echo "   - Name: periospot-analytics"
    echo "   - Create key (JSON format)"
    echo "5. Save the JSON key to: $CREDENTIALS_PATH"
    echo "6. Add the service account email to GA4:"
    echo "   - Google Analytics → Admin → Property Access Management"
    echo "   - Add the service account email with 'Viewer' role"
    echo ""
    exit 1
fi

echo "✅ Credentials file found at: $CREDENTIALS_PATH"
echo ""

# Get GA4 Property ID
read -p "Enter your GA4 Property ID (numeric, e.g., 123456789): " GA4_PROPERTY_ID

if [ -z "$GA4_PROPERTY_ID" ]; then
    echo "❌ GA4 Property ID is required"
    exit 1
fi

echo ""
echo "📝 Add this to your Claude Desktop config:"
echo "   Location: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "Add this to the 'mcpServers' object:"
echo ""
cat << EOF
    "ga4-analytics": {
      "command": "python3",
      "args": ["-m", "ga4_mcp_server"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "$CREDENTIALS_PATH",
        "GA4_PROPERTY_ID": "$GA4_PROPERTY_ID"
      }
    }
EOF
echo ""
echo "======================================"
echo ""
echo "📊 For the Admin Dashboard, add these to Vercel:"
echo ""
echo "1. GA4_PROPERTY_ID=$GA4_PROPERTY_ID"
echo ""
echo "2. GOOGLE_APPLICATION_CREDENTIALS_JSON="
echo "   (Paste the entire contents of the JSON file as a single line)"
echo ""
echo "Run: vercel env add GA4_PROPERTY_ID production"
echo "Run: vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON production"
echo ""
echo "Done! Restart Claude Desktop to use the GA4 MCP server."
