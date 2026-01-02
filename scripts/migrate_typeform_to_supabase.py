#!/usr/bin/env python3
"""
Typeform to Supabase Migration Script
Migrates all Typeform forms and responses to Supabase database

Prerequisites:
- pip install supabase python-slugify
- Run schema.sql in Supabase first
- Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
"""

import json
import os
import re
import time
from datetime import datetime
from pathlib import Path
from slugify import slugify

# Try to import supabase, provide helpful message if not installed
try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase python-slugify")
    exit(1)

# Configuration
BASE_DIR = Path(__file__).parent.parent
TYPEFORM_DIR = BASE_DIR / "typeform"

# Load environment variables
def load_env():
    env_path = BASE_DIR / ".env"
    env_vars = {}
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

ENV = load_env()
SUPABASE_URL = ENV.get('SUPABASE_URL')
SUPABASE_KEY = ENV.get('SUPABASE_SERVICE_ROLE_KEY')

# Question type mapping
TYPEFORM_TO_SUPABASE_TYPE = {
    'multiple_choice': 'multiple_choice',
    'picture_choice': 'picture_choice',
    'short_text': 'short_text',
    'long_text': 'long_text',
    'email': 'email',
    'dropdown': 'dropdown',
    'opinion_scale': 'opinion_scale',
    'rating': 'rating',
    'legal': 'legal',
    'number': 'number',
    'date': 'date',
    'file_upload': 'file_upload',
    'yes_no': 'legal',  # Map yes/no to legal
    'statement': 'short_text',  # Statements become text
}


def retry_operation(operation, max_retries=3, delay=2):
    """Retry an operation with exponential backoff"""
    for attempt in range(max_retries):
        try:
            return operation()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = delay * (2 ** attempt)
            print(f"    Retry {attempt + 1}/{max_retries} after {wait_time}s due to: {str(e)[:50]}...")
            time.sleep(wait_time)


def create_slug(title: str, existing_slugs: set) -> str:
    """Create a unique slug from title"""
    base_slug = slugify(title, max_length=50)
    slug = base_slug
    counter = 1
    while slug in existing_slugs:
        slug = f"{base_slug}-{counter}"
        counter += 1
    existing_slugs.add(slug)
    return slug


def parse_typeform_form(form_data: dict) -> dict:
    """Parse Typeform form structure into Supabase format"""

    # Extract welcome screen
    welcome = form_data.get('welcome_screens', [{}])[0] if form_data.get('welcome_screens') else {}

    assessment = {
        'typeform_id': form_data.get('id'),
        'title': form_data.get('title', 'Untitled'),
        'slug': '', # Will be set later
        'language': form_data.get('settings', {}).get('language', 'en'),
        'is_public': form_data.get('settings', {}).get('is_public', True),
        'is_active': True,
        'show_progress_bar': form_data.get('settings', {}).get('show_progress_bar', True),
        'show_question_numbers': form_data.get('settings', {}).get('show_question_number', True),
        'welcome_title': welcome.get('title'),
        'welcome_description': welcome.get('properties', {}).get('description'),
        'welcome_image_url': welcome.get('attachment', {}).get('href'),
        'welcome_button_text': welcome.get('properties', {}).get('button_text', 'Start'),
        'total_points': 0,
    }

    questions = []
    choices_map = {}  # question_ref -> choices

    # Parse fields (questions)
    for idx, field in enumerate(form_data.get('fields', [])):
        field_type = field.get('type', 'short_text')
        supabase_type = TYPEFORM_TO_SUPABASE_TYPE.get(field_type, 'short_text')

        # Calculate points (from logic if available)
        points = 1 if form_data.get('type') == 'quiz' else 0

        question = {
            'typeform_ref': field.get('ref'),
            'type': supabase_type,
            'title': field.get('title', ''),
            'description': field.get('description'),
            'image_url': field.get('attachment', {}).get('href') or field.get('layout', {}).get('attachment', {}).get('href'),
            'is_required': field.get('validations', {}).get('required', False),
            'points': points,
            'order_index': idx,
            'settings': {},
        }

        # Type-specific settings
        props = field.get('properties', {})
        if field_type in ['multiple_choice', 'picture_choice']:
            question['settings'] = {
                'allow_multiple': props.get('allow_multiple_selection', False),
                'allow_other': props.get('allow_other_choice', False),
                'randomize': props.get('randomize', False),
            }
        elif field_type == 'opinion_scale':
            question['settings'] = {
                'steps': props.get('steps', 10),
                'start_at_one': props.get('start_at_one', True),
            }
        elif field_type == 'dropdown':
            question['settings'] = {
                'alphabetical_order': props.get('alphabetical_order', False),
            }

        # Parse choices
        field_choices = []
        for cidx, choice in enumerate(props.get('choices', [])):
            field_choices.append({
                'typeform_ref': choice.get('ref'),
                'label': choice.get('label', ''),
                'image_url': choice.get('attachment', {}).get('href'),
                'is_correct': False,  # Will be determined from logic
                'points': 0,
                'order_index': cidx,
            })

        if field_choices:
            choices_map[field.get('ref')] = field_choices

        questions.append(question)
        assessment['total_points'] += points

    # Parse logic to determine correct answers
    for logic_block in form_data.get('logic', []):
        field_ref = logic_block.get('ref')
        for action in logic_block.get('actions', []):
            if action.get('action') == 'add':
                # This action adds points, meaning it's the correct answer
                details = action.get('details', {})
                points_value = details.get('value', {}).get('value', 0)

                condition = action.get('condition', {})
                if condition.get('op') == 'is':
                    choice_ref = None
                    for var in condition.get('vars', []):
                        if var.get('type') == 'choice':
                            choice_ref = var.get('value')

                    if choice_ref and field_ref in choices_map:
                        for choice in choices_map[field_ref]:
                            if choice['typeform_ref'] == choice_ref:
                                if points_value > 0:
                                    choice['is_correct'] = True
                                choice['points'] = points_value

    # Parse thank you screens (result screens)
    result_screens = []
    for idx, screen in enumerate(form_data.get('thankyou_screens', [])):
        if screen.get('id') == 'DefaultTyScreen':
            continue  # Skip default Typeform screen

        # Try to extract score conditions from logic
        min_score = None
        max_score = None

        result_screen = {
            'typeform_ref': screen.get('ref'),
            'title': screen.get('title', ''),
            'description': screen.get('properties', {}).get('description'),
            'image_url': screen.get('attachment', {}).get('href'),
            'button_text': screen.get('properties', {}).get('button_text'),
            'button_url': screen.get('properties', {}).get('redirect_url'),
            'min_score': min_score,
            'max_score': max_score,
            'is_default': screen.get('ref') == 'default_tys',
            'order_index': idx,
        }
        result_screens.append(result_screen)

    return {
        'assessment': assessment,
        'questions': questions,
        'choices_map': choices_map,
        'result_screens': result_screens,
    }


def parse_typeform_responses(responses_data: dict, question_map: dict) -> list:
    """Parse Typeform responses into Supabase format"""
    attempts = []

    for response in responses_data.get('items', responses_data.get('responses', [])):
        # Extract user info from answers
        user_email = None
        user_name = None
        user_country = None

        answers = response.get('answers') or []
        for answer in answers:
            field_type = answer.get('type')
            if field_type == 'email':
                user_email = answer.get('email')
            elif field_type == 'text' and 'name' in answer.get('field', {}).get('ref', '').lower():
                user_name = answer.get('text')

        # Calculate score from variables
        variables = response.get('variables') or []
        score = 0
        for var in variables:
            if var.get('key') == 'score':
                score = var.get('number', 0)

        attempt = {
            'typeform_response_id': response.get('response_id') or response.get('token'),
            'user_email': user_email,
            'user_name': user_name,
            'user_country': user_country,
            'score': score,
            'typeform_submitted_at': response.get('submitted_at'),
            'typeform_landed_at': response.get('landed_at'),
            'answers': [],  # Will be transformed to responses
        }

        # Parse answers
        for answer in answers:
            field_ref = answer.get('field', {}).get('ref')
            field_type = answer.get('type')

            response_data = {
                'question_ref': field_ref,
                'text_value': None,
                'number_value': None,
                'boolean_value': None,
            }

            if field_type == 'text':
                response_data['text_value'] = answer.get('text')
            elif field_type == 'email':
                response_data['text_value'] = answer.get('email')
            elif field_type == 'number':
                response_data['number_value'] = answer.get('number')
            elif field_type == 'boolean':
                response_data['boolean_value'] = answer.get('boolean')
            elif field_type == 'choice':
                choice = answer.get('choice', {})
                # Store choice label as text
                response_data['text_value'] = choice.get('label', choice.get('ref', ''))
            elif field_type == 'choices':
                choices = answer.get('choices', {})
                labels = choices.get('labels', [])
                # Store multiple choices as comma-separated text
                response_data['text_value'] = ', '.join(labels) if labels else None

            attempt['answers'].append(response_data)

        attempts.append(attempt)

    return attempts


def migrate_to_supabase(dry_run: bool = True):
    """Main migration function"""

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: Missing Supabase credentials!")
        print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
        print("\nTo get your service role key:")
        print("1. Go to your Supabase project dashboard")
        print("2. Navigate to Settings > API")
        print("3. Copy the 'service_role' key (under Project API keys)")
        return

    print("=" * 60)
    print("TYPEFORM TO SUPABASE MIGRATION")
    print("=" * 60)
    print(f"\nDry run: {dry_run}")
    print(f"Supabase URL: {SUPABASE_URL}")

    if not dry_run:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Load inventory
    inventory_path = TYPEFORM_DIR / "inventory" / "complete_inventory.json"
    with open(inventory_path) as f:
        inventory = json.load(f)

    print(f"\nForms to migrate: {inventory['total_forms']}")
    print(f"Total responses: {inventory['total_responses']}")

    existing_slugs = set()
    migration_stats = {
        'assessments': 0,
        'questions': 0,
        'choices': 0,
        'result_screens': 0,
        'attempts': 0,
        'responses': 0,
    }

    # Process each form
    for form_info in inventory['forms']:
        form_id = form_info['id']
        form_title = form_info['title']
        response_count = form_info.get('response_count', 0)

        print(f"\n[Processing] {form_title} ({form_id})")
        print(f"  Responses: {response_count}")

        # Load form structure
        form_path = TYPEFORM_DIR / "forms" / f"{form_id}.json"
        if not form_path.exists():
            print(f"  SKIP: Form file not found")
            continue

        with open(form_path) as f:
            form_data = json.load(f)

        # Parse form
        parsed = parse_typeform_form(form_data)
        assessment = parsed['assessment']
        assessment['slug'] = create_slug(assessment['title'], existing_slugs)

        print(f"  Questions: {len(parsed['questions'])}")
        print(f"  Result screens: {len(parsed['result_screens'])}")

        if not dry_run:
            # Check if assessment already exists
            existing = supabase.table('assessments').select('id').eq('typeform_id', form_id).execute()
            if existing.data:
                print(f"  SKIP: Already exists in database")
                assessment_id = existing.data[0]['id']
                # Load question mapping for responses
                existing_questions = supabase.table('questions').select('id, typeform_ref').eq('assessment_id', assessment_id).execute()
                question_id_map = {q['typeform_ref']: q['id'] for q in existing_questions.data}
            else:
                # Insert new assessment
                result = supabase.table('assessments').insert(assessment).execute()
                assessment_id = result.data[0]['id']

                # Insert questions and choices (only for new assessments)
                question_id_map = {}  # typeform_ref -> supabase_id
                for question in parsed['questions']:
                    question['assessment_id'] = assessment_id
                    q_result = retry_operation(
                        lambda q=question: supabase.table('questions').insert(q).execute()
                    )
                    question_id = q_result.data[0]['id']
                    question_id_map[question['typeform_ref']] = question_id

                    # Insert choices
                    if question['typeform_ref'] in parsed['choices_map']:
                        for choice in parsed['choices_map'][question['typeform_ref']]:
                            choice['question_id'] = question_id
                            retry_operation(
                                lambda c=choice: supabase.table('choices').insert(c).execute()
                            )
                            migration_stats['choices'] += 1

                    migration_stats['questions'] += 1

                # Insert result screens
                for screen in parsed['result_screens']:
                    screen['assessment_id'] = assessment_id
                    retry_operation(
                        lambda s=screen: supabase.table('result_screens').insert(s).execute()
                    )
                    migration_stats['result_screens'] += 1

                migration_stats['assessments'] += 1
        else:
            migration_stats['assessments'] += 1
            migration_stats['questions'] += len(parsed['questions'])
            for choices in parsed['choices_map'].values():
                migration_stats['choices'] += len(choices)
            migration_stats['result_screens'] += len(parsed['result_screens'])

        # Load and process responses
        if response_count > 0:
            responses_path = TYPEFORM_DIR / "responses" / f"{form_id}.json"
            if responses_path.exists():
                with open(responses_path) as f:
                    responses_data = json.load(f)

                attempts = parse_typeform_responses(responses_data, {})
                print(f"  Parsed attempts: {len(attempts)}")

                if not dry_run:
                    for idx, attempt in enumerate(attempts):
                        # Check if attempt already exists
                        try:
                            existing_attempt = retry_operation(
                                lambda a=attempt: supabase.table('assessment_attempts').select('id').eq('typeform_response_id', a['typeform_response_id']).execute()
                            )
                            if existing_attempt.data:
                                continue  # Skip silently
                        except Exception as e:
                            print(f"    ERROR checking attempt: {str(e)[:50]}")
                            continue

                        attempt_answers = attempt.pop('answers')
                        attempt['assessment_id'] = assessment_id
                        attempt['max_score'] = assessment['total_points']

                        try:
                            a_result = retry_operation(
                                lambda a=attempt: supabase.table('assessment_attempts').insert(a).execute()
                            )
                            attempt_id = a_result.data[0]['id']

                            for answer in attempt_answers:
                                question_ref = answer.pop('question_ref')
                                if question_ref in question_id_map:
                                    answer['attempt_id'] = attempt_id
                                    answer['question_id'] = question_id_map[question_ref]
                                    try:
                                        retry_operation(
                                            lambda ans=answer: supabase.table('responses').insert(ans).execute()
                                        )
                                        migration_stats['responses'] += 1
                                    except Exception as e:
                                        print(f"    ERROR inserting response: {str(e)[:50]}")

                            migration_stats['attempts'] += 1

                            # Progress update every 100 attempts
                            if (idx + 1) % 100 == 0:
                                print(f"    Progress: {idx + 1}/{len(attempts)} attempts")

                        except Exception as e:
                            print(f"    ERROR inserting attempt: {str(e)[:50]}")
                            continue

                        # Small delay to avoid rate limits
                        if idx % 50 == 0:
                            time.sleep(0.5)
                else:
                    migration_stats['attempts'] += len(attempts)
                    for attempt in attempts:
                        migration_stats['responses'] += len(attempt.get('answers', []))

    print("\n" + "=" * 60)
    print("MIGRATION SUMMARY")
    print("=" * 60)
    print(f"\n{'Dry run - no data written' if dry_run else 'Migration complete!'}")
    print(f"\nStats:")
    print(f"  Assessments:    {migration_stats['assessments']}")
    print(f"  Questions:      {migration_stats['questions']}")
    print(f"  Choices:        {migration_stats['choices']}")
    print(f"  Result screens: {migration_stats['result_screens']}")
    print(f"  Attempts:       {migration_stats['attempts']}")
    print(f"  Responses:      {migration_stats['responses']}")

    if dry_run:
        print("\nTo run the actual migration, call:")
        print("  migrate_to_supabase(dry_run=False)")


if __name__ == '__main__':
    import sys
    dry_run = '--execute' not in sys.argv
    migrate_to_supabase(dry_run=dry_run)
