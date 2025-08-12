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
    const quizId = searchParams.get('quiz_id')
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001'

    if (!quizId) {
      return NextResponse.json(
        { error: 'クイズIDが指定されていません' },
        { status: 400 }
      )
    }

    console.log('Getting stats for quiz:', quizId)

    const supabase = createSupabaseClient()

    // 1. クイズ割り当ての統計を取得
    const { data: assignments, error: assignmentError } = await supabase
      .from('quiz_assignments')
      .select('*')
      .eq('quiz_id', quizId)

    if (assignmentError) {
      console.error('割り当て取得エラー:', assignmentError)
    }

    // 2. クイズ回答の統計を取得
    const { data: responses, error: responseError } = await supabase
      .from('quiz_responses')
      .select('*')
      .eq('quiz_id', quizId)

    if (responseError) {
      console.error('回答取得エラー:', responseError)
    }

    // 3. 質問数を取得
    const { data: questions, error: questionError } = await supabase
      .from('questions')
      .select('id')
      .eq('quiz_id', quizId)

    if (questionError) {
      console.error('質問取得エラー:', questionError)
    }

    // 統計を計算
    const totalAssignments = assignments?.length || 0
    const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0
    const totalResponses = responses?.length || 0
    
    // 平均スコアを計算
    const validScores = responses?.filter(r => r.score !== null).map(r => r.score) || []
    const avgScore = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0

    // 回答率を計算
    const responseRate = totalAssignments > 0 
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0

    // 最新の回答日時を取得
    const latestResponse = responses && responses.length > 0 
      ? responses.reduce((latest, current) => {
          return new Date(current.completed_at) > new Date(latest.completed_at) 
            ? current 
            : latest
        })
      : null

    const stats = {
      quiz_id: quizId,
      total_assignments: totalAssignments,
      completed_assignments: completedAssignments,
      total_responses: totalResponses,
      response_rate: responseRate,
      average_score: avgScore,
      question_count: questions?.length || 0,
      latest_response_at: latestResponse ? latestResponse.completed_at : null,
      score_distribution: validScores.length > 0 ? {
        min: Math.min(...validScores),
        max: Math.max(...validScores),
        count: validScores.length
      } : null
    }

    console.log('Quiz stats calculated:', stats)

    return NextResponse.json({
      success: true,
      stats: stats
    })

  } catch (error) {
    console.error('API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
