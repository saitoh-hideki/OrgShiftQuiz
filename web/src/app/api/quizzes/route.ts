import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアント
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    db: {
      schema: 'public'
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001'
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status') || 'active'

    const supabase = createSupabaseClient()

    // まず、シンプルにquizzesテーブルのみからデータを取得
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    const { data: quizzes, error } = await query

    if (error) {
      console.error('クイズ取得エラー:', error)
      return NextResponse.json(
        { error: 'クイズの取得に失敗しました' },
        { status: 500 }
      )
    }

    // スマホアプリ用にデータを整形（シンプル版）
    const formattedQuizzes = quizzes?.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      deadline: quiz.deadline,
      target_segment: quiz.target_segment || 'all',
      requires_attestation: quiz.requires_attestation || false,
      notification_enabled: quiz.notification_enabled || true,
      status: quiz.status,
      created_at: quiz.created_at,
      questions: [], // 一時的に空配列
      assignment: null, // 一時的にnull
      question_count: 0, // 一時的に0
      estimated_time: 5 // デフォルト値
    })) || []

    return NextResponse.json({
      success: true,
      quizzes: formattedQuizzes,
      count: formattedQuizzes.length
    })

  } catch (error) {
    console.error('API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// クイズの回答を保存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quiz_id, user_id, answers, score, completed_at } = body

    if (!quiz_id || !user_id || !answers) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // クイズの回答を保存
    const { data: response, error } = await supabase
      .from('quiz_responses')
      .insert({
        quiz_id,
        user_id,
        answers: answers,
        score: score || 0,
        completed_at: completed_at || new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('回答保存エラー:', error)
      return NextResponse.json(
        { error: '回答の保存に失敗しました' },
        { status: 500 }
      )
    }

    // クイズ割り当てのステータスを更新
    await supabase
      .from('quiz_assignments')
      .update({
        status: 'completed',
        completed_at: completed_at || new Date().toISOString(),
        score: score || 0
      })
      .eq('quiz_id', quiz_id)
      .eq('user_id', user_id)

    return NextResponse.json({
      success: true,
      response_id: response.id,
      message: '回答が保存されました'
    })

  } catch (error) {
    console.error('API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
