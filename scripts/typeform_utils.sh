#!/bin/bash
# Typeform Utility Script for Periospot Migration
# Usage: ./typeform_utils.sh [command]

# Load environment variables
source "$(dirname "$0")/../.env"

API_URL="https://api.typeform.com"

case "$1" in
  list)
    echo "Listing all Typeform forms..."
    curl -s -X GET "$API_URL/forms" \
      -H "Authorization: Bearer $TYPEFORM_API_KEY" | \
      python3 -c "import sys,json; data=json.load(sys.stdin); print(f'Total forms: {data[\"total_items\"]}'); [print(f'  - {f[\"id\"]}: {f[\"title\"]}') for f in data['items']]"
    ;;

  get)
    if [ -z "$2" ]; then
      echo "Usage: $0 get <form_id>"
      exit 1
    fi
    echo "Getting form details for: $2"
    curl -s -X GET "$API_URL/forms/$2" \
      -H "Authorization: Bearer $TYPEFORM_API_KEY" | python3 -m json.tool
    ;;

  responses)
    if [ -z "$2" ]; then
      echo "Usage: $0 responses <form_id>"
      exit 1
    fi
    echo "Getting responses for form: $2"
    curl -s -X GET "$API_URL/forms/$2/responses" \
      -H "Authorization: Bearer $TYPEFORM_API_KEY" | python3 -m json.tool
    ;;

  test)
    echo "Testing Typeform API connection..."
    response=$(curl -s -X GET "$API_URL/me" -H "Authorization: Bearer $TYPEFORM_API_KEY")
    if echo "$response" | grep -q "alias"; then
      echo "Connection successful!"
      echo "$response" | python3 -m json.tool
    else
      echo "Connection failed!"
      echo "$response"
    fi
    ;;

  *)
    echo "Typeform Utility Script"
    echo "======================"
    echo "Commands:"
    echo "  list              - List all forms"
    echo "  get <form_id>     - Get form details"
    echo "  responses <id>    - Get form responses"
    echo "  test              - Test API connection"
    ;;
esac
