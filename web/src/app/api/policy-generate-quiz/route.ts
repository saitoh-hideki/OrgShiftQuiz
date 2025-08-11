import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { policyId } = await request.json()
    
    if (!policyId) {
      return NextResponse.json(
        { ok: false, error: 'policyId is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { ok: false, error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    // Edge Functionを直接呼び出し
    const response = await fetch(`${supabaseUrl}/functions/v1/policy-generate-quiz`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ policyId })
    })

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('policy-generate-quiz API error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
