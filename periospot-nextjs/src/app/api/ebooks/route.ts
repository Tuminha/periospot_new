import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/ebooks - List all published ebooks
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: ebooks, error } = await supabase
      .from('ebooks')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ebooks:', error)
      return NextResponse.json({ error: 'Failed to fetch ebooks' }, { status: 500 })
    }

    return NextResponse.json({ ebooks })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
