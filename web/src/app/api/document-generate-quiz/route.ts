import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { documentId, documentType } = await request.json()
    
    if (!documentId || !documentType) {
      return NextResponse.json(
        { ok: false, error: 'documentId and documentType are required' },
        { status: 400 }
      )
    }

    // Supabase Edge Functionを呼び出し
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { ok: false, error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/document-generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ documentId, documentType })
    })

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('document-generate-quiz API error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
