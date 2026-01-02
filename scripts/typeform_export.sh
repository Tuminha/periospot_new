#!/bin/bash
# Typeform Complete Data Export Script for Periospot Migration

API_KEY="${TYPEFORM_API_KEY:?TYPEFORM_API_KEY is required}"
BASE_URL="https://api.typeform.com"
BASE_DIR="$(dirname "$0")/../typeform"

mkdir -p "$BASE_DIR"/{forms,responses,inventory}

echo "============================================================"
echo "TYPEFORM COMPLETE DATA EXPORT"
echo "============================================================"

# Step 1: Get all forms (all pages)
echo ""
echo "[1/4] Fetching all forms..."

# Fetch all pages and save to temp files
for PAGE in 1 2 3 4 5 6; do
    curl -s "$BASE_URL/forms?page=$PAGE&page_size=10" \
        -H "Authorization: Bearer $API_KEY" > "$BASE_DIR/inventory/forms_page_$PAGE.json"
done

# Combine into single list using Python
python3 << 'EOF'
import json
import os

base_dir = os.path.dirname(os.path.abspath(__file__)) + "/../typeform" if "__file__" in dir() else "typeform"
base_dir = "typeform"

all_forms = []
for page in range(1, 7):
    try:
        with open(f'{base_dir}/inventory/forms_page_{page}.json', 'r') as f:
            data = json.load(f)
            items = data.get('items', [])
            all_forms.extend(items)
            if len(items) == 0:
                break
    except:
        break

print(f"Total forms found: {len(all_forms)}")

# Save combined list
with open(f'{base_dir}/inventory/all_forms.json', 'w') as f:
    json.dump(all_forms, f, indent=2)

# Save form IDs for bash to use
with open(f'{base_dir}/inventory/form_ids.txt', 'w') as f:
    for form in all_forms:
        f.write(f"{form['id']}|{form.get('title', 'Untitled')}\n")
EOF

TOTAL_FORMS=$(wc -l < "$BASE_DIR/inventory/form_ids.txt" | tr -d ' ')
echo "  Found $TOTAL_FORMS forms"

# Step 2: Download each form structure
echo ""
echo "[2/4] Downloading form structures..."
COUNT=0
while IFS='|' read -r FORM_ID FORM_TITLE; do
    COUNT=$((COUNT + 1))
    echo "  [$COUNT/$TOTAL_FORMS] $FORM_TITLE"
    curl -s "$BASE_URL/forms/$FORM_ID" \
        -H "Authorization: Bearer $API_KEY" > "$BASE_DIR/forms/${FORM_ID}.json"
done < "$BASE_DIR/inventory/form_ids.txt"

# Step 3: Download responses for each form
echo ""
echo "[3/4] Downloading all responses..."
TOTAL_RESPONSES=0
COUNT=0
while IFS='|' read -r FORM_ID FORM_TITLE; do
    COUNT=$((COUNT + 1))
    printf "  [$COUNT/$TOTAL_FORMS] $FORM_TITLE ... "

    curl -s "$BASE_URL/forms/$FORM_ID/responses?page_size=1000" \
        -H "Authorization: Bearer $API_KEY" > "$BASE_DIR/responses/${FORM_ID}.json"

    RESP_COUNT=$(python3 -c "import json; d=json.load(open('$BASE_DIR/responses/${FORM_ID}.json')); print(len(d.get('items',[])))" 2>/dev/null || echo "0")
    echo "$RESP_COUNT responses"
    TOTAL_RESPONSES=$((TOTAL_RESPONSES + RESP_COUNT))
done < "$BASE_DIR/inventory/form_ids.txt"

echo ""
echo "  Total responses: $TOTAL_RESPONSES"

# Step 4: Create summary
echo ""
echo "[4/4] Creating inventory summary..."

python3 << 'PYEND'
import json
import os
from datetime import datetime

base_dir = "typeform"

# Load all forms
with open(f'{base_dir}/inventory/all_forms.json', 'r') as f:
    forms = json.load(f)

inventory = {
    'export_date': datetime.now().isoformat(),
    'total_forms': len(forms),
    'total_responses': 0,
    'forms': []
}

for form in forms:
    form_id = form['id']

    # Count responses
    resp_count = 0
    try:
        with open(f'{base_dir}/responses/{form_id}.json', 'r') as f:
            resp_data = json.load(f)
            resp_count = len(resp_data.get('items', []))
    except:
        pass

    inventory['total_responses'] += resp_count
    inventory['forms'].append({
        'id': form_id,
        'title': form.get('title', 'Untitled'),
        'type': form.get('type', 'unknown'),
        'response_count': resp_count,
        'created_at': form.get('created_at', '')[:10] if form.get('created_at') else '',
        'last_updated': form.get('last_updated_at', '')[:10] if form.get('last_updated_at') else '',
        'url': form.get('_links', {}).get('display', '')
    })

# Sort by responses (highest first)
inventory['forms'].sort(key=lambda x: x['response_count'], reverse=True)

with open(f'{base_dir}/inventory/complete_inventory.json', 'w') as f:
    json.dump(inventory, f, indent=2)

# Create markdown summary
md = f"""# Typeform Complete Export - Periospot Migration

**Export Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary
- **Total Forms:** {inventory['total_forms']}
- **Total Responses:** {inventory['total_responses']}

## All Forms (Sorted by Response Count)

| # | Form ID | Title | Type | Responses | Last Updated |
|---|---------|-------|------|-----------|--------------|
"""

for i, f in enumerate(inventory['forms'], 1):
    title = f['title'][:50] + '...' if len(f['title']) > 50 else f['title']
    md += f"| {i} | `{f['id']}` | {title} | {f['type']} | **{f['response_count']}** | {f['last_updated']} |\n"

# Separate forms with and without responses
with_responses = [f for f in inventory['forms'] if f['response_count'] > 0]
without_responses = [f for f in inventory['forms'] if f['response_count'] == 0]

md += f"""

## Critical Data for Migration

### Forms WITH Responses ({len(with_responses)} forms, {inventory['total_responses']} total responses)
These contain user assessment data that MUST be preserved:

"""
for f in with_responses:
    md += f"- **{f['title']}** - {f['response_count']} responses - [View Form]({f['url']})\n"

md += f"""

### Forms Without Responses ({len(without_responses)} forms)
These may be templates or unused forms:

"""
for f in without_responses:
    md += f"- {f['title']} (`{f['id']}`)\n"

md += """

## File Structure
```
typeform/
├── forms/              # Form structures (questions, logic, themes)
├── responses/          # All user responses
└── inventory/          # Summaries and lists
    ├── complete_inventory.json
    ├── all_forms.json
    └── SUMMARY.md
```

## How to Use This Data

1. **Form structures** (`forms/<id>.json`): Contains all questions, field types, logic jumps, themes
2. **Responses** (`responses/<id>.json`): Contains all user submissions with answers, timestamps, metadata
3. **Inventory** (`inventory/complete_inventory.json`): Quick reference for all forms

## Next Steps for Migration
1. Analyze forms with high response counts
2. Map form fields to new database schema
3. Import historical responses to new system
4. Recreate forms in new platform (or keep using Typeform)
"""

with open(f'{base_dir}/inventory/SUMMARY.md', 'w') as f:
    f.write(md)

print(f"Summary created: {len(forms)} forms, {inventory['total_responses']} responses")
print(f"Forms with responses: {len(with_responses)}")
print(f"Forms without responses: {len(without_responses)}")
PYEND

echo ""
echo "============================================================"
echo "EXPORT COMPLETE!"
echo "============================================================"
echo ""
echo "Files saved to: $BASE_DIR/"
echo ""
ls -la "$BASE_DIR"/
echo ""
echo "See: $BASE_DIR/inventory/SUMMARY.md for full details"
