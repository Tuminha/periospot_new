#!/usr/bin/env python3
"""
Typeform Complete Data Export Script for Periospot Migration
Downloads all forms, responses, and metadata from Typeform API
"""

import os
import json
import requests
from datetime import datetime
from pathlib import Path

# Configuration
API_KEY = os.environ.get('TYPEFORM_API_KEY')
if not API_KEY:
    raise RuntimeError('TYPEFORM_API_KEY is required')
BASE_URL = 'https://api.typeform.com'
HEADERS = {'Authorization': f'Bearer {API_KEY}'}

# Output directories
BASE_DIR = Path(__file__).parent.parent / 'typeform'
FORMS_DIR = BASE_DIR / 'forms'
RESPONSES_DIR = BASE_DIR / 'responses'
EXPORTS_DIR = BASE_DIR / 'exports'
INVENTORY_DIR = BASE_DIR / 'inventory'

def ensure_dirs():
    """Create output directories if they don't exist"""
    for dir_path in [FORMS_DIR, RESPONSES_DIR, EXPORTS_DIR, INVENTORY_DIR]:
        dir_path.mkdir(parents=True, exist_ok=True)

def get_all_forms():
    """Fetch all forms from Typeform API (paginated)"""
    all_forms = []
    page = 1
    page_size = 10

    while True:
        url = f'{BASE_URL}/forms?page={page}&page_size={page_size}'
        response = requests.get(url, headers=HEADERS)
        data = response.json()

        forms = data.get('items', [])
        all_forms.extend(forms)

        print(f"  Fetched page {page}: {len(forms)} forms")

        if len(forms) < page_size:
            break
        page += 1

    return all_forms

def get_form_details(form_id):
    """Fetch complete form structure and configuration"""
    url = f'{BASE_URL}/forms/{form_id}'
    response = requests.get(url, headers=HEADERS)
    return response.json()

def get_form_responses(form_id, page_size=1000):
    """Fetch all responses for a form (paginated)"""
    all_responses = []
    url = f'{BASE_URL}/forms/{form_id}/responses?page_size={page_size}'

    while url:
        response = requests.get(url, headers=HEADERS)
        data = response.json()

        items = data.get('items', [])
        all_responses.extend(items)

        # Get next page token if exists
        next_token = data.get('page_token')
        if next_token and len(items) == page_size:
            url = f'{BASE_URL}/forms/{form_id}/responses?page_size={page_size}&before={next_token}'
        else:
            url = None

    return all_responses

def get_account_info():
    """Get Typeform account information"""
    url = f'{BASE_URL}/me'
    response = requests.get(url, headers=HEADERS)
    return response.json()

def save_json(data, filepath):
    """Save data as formatted JSON"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)

def export_all_data():
    """Main export function"""
    ensure_dirs()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    print("=" * 60)
    print("TYPEFORM COMPLETE DATA EXPORT")
    print(f"Export started: {datetime.now().isoformat()}")
    print("=" * 60)

    # Get account info
    print("\n[1/5] Fetching account information...")
    try:
        account_info = get_account_info()
        save_json(account_info, INVENTORY_DIR / 'account_info.json')
        print(f"  Account: {account_info.get('alias', 'Unknown')}")
    except Exception as e:
        print(f"  Warning: Could not fetch account info: {e}")

    # Get all forms
    print("\n[2/5] Fetching all forms...")
    forms = get_all_forms()
    print(f"  Total forms found: {len(forms)}")

    # Save forms list
    save_json(forms, INVENTORY_DIR / 'all_forms_list.json')

    # Create inventory summary
    inventory = {
        'export_date': datetime.now().isoformat(),
        'total_forms': len(forms),
        'forms': []
    }

    total_responses = 0

    # Process each form
    print("\n[3/5] Downloading form structures...")
    for i, form in enumerate(forms, 1):
        form_id = form['id']
        form_title = form.get('title', 'Untitled')
        print(f"  [{i}/{len(forms)}] {form_title} ({form_id})")

        try:
            # Get full form details
            form_details = get_form_details(form_id)
            save_json(form_details, FORMS_DIR / f'{form_id}_structure.json')
        except Exception as e:
            print(f"    Error fetching form details: {e}")
            form_details = form

    print("\n[4/5] Downloading all responses...")
    for i, form in enumerate(forms, 1):
        form_id = form['id']
        form_title = form.get('title', 'Untitled')
        print(f"  [{i}/{len(forms)}] {form_title} ({form_id})", end='')

        try:
            # Get all responses
            responses = get_form_responses(form_id)
            response_count = len(responses)
            total_responses += response_count

            print(f" - {response_count} responses")

            # Save responses
            save_json({
                'form_id': form_id,
                'form_title': form_title,
                'response_count': response_count,
                'export_date': datetime.now().isoformat(),
                'responses': responses
            }, RESPONSES_DIR / f'{form_id}_responses.json')

            # Add to inventory
            inventory['forms'].append({
                'id': form_id,
                'title': form_title,
                'type': form.get('type', 'unknown'),
                'created_at': form.get('created_at'),
                'last_updated_at': form.get('last_updated_at'),
                'response_count': response_count,
                'is_public': form.get('settings', {}).get('is_public', False),
                'display_url': form.get('_links', {}).get('display', ''),
            })

        except Exception as e:
            print(f" - Error: {e}")
            inventory['forms'].append({
                'id': form_id,
                'title': form_title,
                'error': str(e)
            })

    inventory['total_responses'] = total_responses

    # Save inventory
    print("\n[5/5] Creating inventory summary...")
    save_json(inventory, INVENTORY_DIR / 'complete_inventory.json')

    # Create human-readable summary
    summary_lines = [
        "# Typeform Data Export Summary",
        f"\nExport Date: {datetime.now().isoformat()}",
        f"\n## Statistics",
        f"- Total Forms: {len(forms)}",
        f"- Total Responses: {total_responses}",
        f"\n## Forms Inventory\n",
        "| # | Form ID | Title | Type | Responses | Created | Last Updated |",
        "|---|---------|-------|------|-----------|---------|--------------|"
    ]

    for i, f in enumerate(inventory['forms'], 1):
        created = f.get('created_at', 'N/A')[:10] if f.get('created_at') else 'N/A'
        updated = f.get('last_updated_at', 'N/A')[:10] if f.get('last_updated_at') else 'N/A'
        summary_lines.append(
            f"| {i} | {f['id']} | {f['title'][:40]} | {f.get('type', 'N/A')} | {f.get('response_count', 'N/A')} | {created} | {updated} |"
        )

    summary_lines.extend([
        f"\n## File Structure",
        "```",
        "typeform/",
        "├── forms/           # Complete form structures (questions, logic, themes)",
        "├── responses/       # All responses for each form",
        "├── exports/         # Combined exports",
        "└── inventory/       # Summaries and inventories",
        "```",
        f"\n## Files Generated",
        f"- {len(forms)} form structure files in forms/",
        f"- {len(forms)} response files in responses/",
        "- complete_inventory.json in inventory/",
        "- all_forms_list.json in inventory/",
    ])

    with open(INVENTORY_DIR / 'SUMMARY.md', 'w') as f:
        f.write('\n'.join(summary_lines))

    # Create combined export
    combined_export = {
        'export_date': datetime.now().isoformat(),
        'account': account_info if 'account_info' in dir() else None,
        'inventory': inventory,
        'forms_count': len(forms),
        'responses_count': total_responses
    }
    save_json(combined_export, EXPORTS_DIR / f'typeform_export_{timestamp}.json')

    print("\n" + "=" * 60)
    print("EXPORT COMPLETE!")
    print("=" * 60)
    print(f"\nTotal Forms Exported: {len(forms)}")
    print(f"Total Responses Exported: {total_responses}")
    print(f"\nFiles saved to: {BASE_DIR}")
    print("\nFolder structure:")
    print("  typeform/forms/       - Form structures")
    print("  typeform/responses/   - All responses")
    print("  typeform/inventory/   - Summaries")
    print("  typeform/exports/     - Combined exports")

    return inventory

if __name__ == '__main__':
    export_all_data()
