/**
 * Apply Editorial Workflow Migration
 *
 * This script applies the migration step by step using the Supabase client
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajueupqlrodkhfgkegnx.supabase.co';
const supabaseServiceKey = 'sb_secret_mgKpp5PgldT4PJ59mAlqHA_woDXSMWV';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying Editorial Workflow Migration...\n');

  // Step 1: Add is_admin column to profiles
  console.log('1. Adding is_admin column to profiles...');
  try {
    // Check if column exists by trying to select it
    const { error: checkError } = await supabase
      .from('profiles')
      .select('is_admin')
      .limit(1);

    if (checkError && checkError.message.includes('column')) {
      // Column doesn't exist, need to add it via SQL
      console.log('   Column does not exist - needs to be added via Supabase Dashboard SQL Editor');
      console.log('   Run this SQL in your Supabase Dashboard:');
      console.log('   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;');
    } else {
      console.log('   ✅ is_admin column already exists');
    }
  } catch (e) {
    console.log('   ⚠️ Check error:', e);
  }

  // Step 2: Check if source column exists in posts
  console.log('\n2. Checking posts table columns...');
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('source')
      .limit(1);

    if (error && error.message.includes('column')) {
      console.log('   Source column does not exist - needs to be added');
      console.log('   Run this SQL in your Supabase Dashboard:');
      console.log(`
   ALTER TABLE public.posts
   ADD COLUMN IF NOT EXISTS reviewed_by UUID,
   ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
   ADD COLUMN IF NOT EXISTS review_notes TEXT,
   ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
   ADD COLUMN IF NOT EXISTS created_by UUID,
   ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'import';
      `);
    } else {
      console.log('   ✅ posts table already has new columns');
    }
  } catch (e) {
    console.log('   ⚠️ Check error:', e);
  }

  // Step 3: Check if post_history table exists
  console.log('\n3. Checking post_history table...');
  try {
    const { error } = await supabase
      .from('post_history')
      .select('id')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('   post_history table does not exist - needs to be created');
      console.log('   Run the CREATE TABLE statement in Supabase Dashboard');
    } else {
      console.log('   ✅ post_history table exists');
    }
  } catch (e) {
    console.log('   ⚠️ Check error:', e);
  }

  // Step 4: Set admin user
  console.log('\n4. Setting admin user...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('email', 'cisco@periospot.com')
      .select();

    if (error) {
      if (error.message.includes('column')) {
        console.log('   ⚠️ Cannot set admin - is_admin column missing');
      } else {
        console.log('   ⚠️ Error:', error.message);
      }
    } else if (data && data.length > 0) {
      console.log('   ✅ Set cisco@periospot.com as admin');
    } else {
      console.log('   ⚠️ User cisco@periospot.com not found in profiles');
    }
  } catch (e) {
    console.log('   ⚠️ Error:', e);
  }

  console.log('\n-------------------------------------------');
  console.log('Migration check complete!');
  console.log('\nIf columns are missing, run the full migration SQL in');
  console.log('Supabase Dashboard > SQL Editor:');
  console.log('File: supabase/migrations/20260104000004_editorial_workflow.sql');
  console.log('-------------------------------------------\n');
}

applyMigration().catch(console.error);
