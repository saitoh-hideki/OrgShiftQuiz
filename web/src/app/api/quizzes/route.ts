import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアント
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'undefined')
  
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
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const search = searchParams.get('search')

    console.log('API Request params:', { companyId, status, source, search })

    const supabase = createSupabaseClient()

    // まず、シンプルにquizzesテーブルのみからデータを取得
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    // フィルタリング
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    console.log('Executing query...')
    const { data: quizzes, error } = await query

    if (error) {
      console.error('クイズ取得エラー詳細:', error)
      return NextResponse.json(
        { 
          error: 'クイズの取得に失敗しました',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    console.log('Quizzes found:', quizzes?.length || 0)

    // クイズの詳細情報と統計を計算（シンプル版）
    const detailedQuizzes = quizzes?.map(quiz => {
      // ソースタイプを決定
      const sourceType = quiz.source_mix && quiz.source_mix.length > 0 
        ? quiz.source_mix[0].charAt(0).toUpperCase() + quiz.source_mix[0].slice(1)
        : 'Manual'

      // 難易度を推定（質問数から）
      let difficulty = 'medium'
      if (quiz.questions && quiz.questions <= 3) difficulty = 'easy'
      else if (quiz.questions && quiz.questions >= 5) difficulty = 'hard'

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        source: sourceType,
        questions: quiz.questions || 0,
        status: quiz.status || 'draft',
        created: quiz.created_at,
        deadline: quiz.deadline,
        totalResponses: 0, // 一時的に0
        responseRate: 0,   // 一時的に0
        avgScore: 0,       // 一時的に0
        difficulty: difficulty,
        requiresAttestation: quiz.require_attestation || false,
        targetSegment: quiz.target_segment || 'all',
        notificationEnabled: quiz.notification_enabled !== false,
        publishedAt: quiz.published_at,
        sourceMix: quiz.source_mix || [],
        latestResponseAt: null,
        totalAssignments: 0,
        completedAssignments: 0
      }
    }) || []

    // 基本的な統計情報を計算
    const stats = {
      total: detailedQuizzes.length,
      active: detailedQuizzes.filter(q => q.status === 'active').length,
      completed: detailedQuizzes.filter(q => q.status === 'completed').length,
      draft: detailedQuizzes.filter(q => q.status === 'draft').length,
      pending: detailedQuizzes.filter(q => q.status === 'pending_approval').length
    }

    console.log('Returning data:', { count: detailedQuizzes.length, stats })

    return NextResponse.json({
      success: true,
      quizzes: detailedQuizzes,
      stats: stats,
      count: detailedQuizzes.length,
      note: '基本データのみ表示中（詳細統計は後で実装）'
    })

  } catch (error) {
    console.error('API エラー詳細:', error)
    return NextResponse.json(
      { 
        error: 'サーバーエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
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

    console.log('Saving quiz response:', { quiz_id, user_id, score, answers_count: Object.keys(answers).length })

    const supabase = createSupabaseClient()

    // 1. クイズの回答を保存
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
        { error: '回答の保存に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    console.log('Quiz response saved successfully:', response.id)

    // 2. クイズ割り当てのステータスを更新
    const { error: assignmentError } = await supabase
      .from('quiz_assignments')
      .update({
        status: 'completed',
        completed_at: completed_at || new Date().toISOString(),
        score: score || 0
      })
      .eq('quiz_id', quiz_id)
      .eq('user_id', user_id)

    if (assignmentError) {
      console.warn('Quiz assignment update warning:', assignmentError)
      // 割り当ての更新に失敗しても回答の保存は成功しているので続行
    } else {
      console.log('Quiz assignment updated successfully')
    }

    // 3. クイズの統計情報を更新（オプション）
    try {
      // クイズの回答数を取得
      const { count: responseCount, error: countError } = await supabase
        .from('quiz_responses')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz_id)

      if (!countError && responseCount !== null) {
        console.log(`Quiz ${quiz_id} now has ${responseCount} responses`)
      }
    } catch (statsError) {
      console.warn('Statistics update warning:', statsError)
      // 統計更新に失敗しても回答の保存は成功しているので続行
    }

    return NextResponse.json({
      success: true,
      response_id: response.id,
      message: '回答が保存されました',
      quiz_id,
      user_id,
      score,
      completed_at: completed_at || new Date().toISOString()
    })

  } catch (error) {
    console.error('API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// クイズのステータス更新
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { quiz_id, status, action } = body

    if (!quiz_id || !action) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    console.log('Updating quiz status:', { quiz_id, action })

    const supabase = createSupabaseClient()

    let updateData: any = {}
    
    switch (action) {
      case 'publish':
        updateData = { 
          status: 'active',
          published_at: new Date().toISOString()
        }
        break
      case 'pause':
        updateData = { status: 'paused' }
        break
      case 'complete':
        updateData = { status: 'completed' }
        break
      case 'approve':
        updateData = { status: 'active' }
        break
      case 'reject':
        updateData = { status: 'rejected' }
        break
      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        )
    }

    const { data, error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', quiz_id)
      .select()
      .single()

    if (error) {
      console.error('クイズ更新エラー:', error)
      return NextResponse.json(
        { error: 'クイズの更新に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    console.log('Quiz updated successfully:', data)

    return NextResponse.json({
      success: true,
      quiz: data,
      message: 'クイズが更新されました'
    })

  } catch (error) {
    console.error('API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// クイズの削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quiz_id')

    if (!quizId) {
      return NextResponse.json(
        { error: 'クイズIDが指定されていません' },
        { status: 400 }
      )
    }

    console.log('Deleting quiz:', quizId)

    const supabase = createSupabaseClient()

    // クイズを削除（関連データも自動削除される）
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)

    if (error) {
      console.error('クイズ削除エラー:', error)
      return NextResponse.json(
        { error: 'クイズの削除に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    console.log('Quiz deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'クイズが削除されました'
    })

  } catch (error) {
    console.error('API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
