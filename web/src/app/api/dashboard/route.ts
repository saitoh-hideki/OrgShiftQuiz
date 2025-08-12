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

    console.log('Getting dashboard data for company:', companyId)

    const supabase = createSupabaseClient()

    // 1. クイズの基本統計を取得
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (quizError) {
      console.error('クイズ取得エラー:', quizError)
      return NextResponse.json(
        { error: 'クイズデータの取得に失敗しました' },
        { status: 500 }
      )
    }

    // 2. クイズ割り当ての統計を取得
    const { data: assignments, error: assignmentError } = await supabase
      .from('quiz_assignments')
      .select('*')
      .eq('company_id', companyId)

    if (assignmentError) {
      console.warn('割り当て取得エラー（無視）:', assignmentError)
    }

    // 3. クイズ回答の統計を取得
    const { data: responses, error: responseError } = await supabase
      .from('quiz_responses')
      .select('*')
      .eq('company_id', companyId)

    if (responseError) {
      console.warn('回答取得エラー（無視）:', responseError)
    }

    // 4. ユーザー数を取得
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', companyId)

    if (userError) {
      console.warn('ユーザー取得エラー（無視）:', userError)
    }

    // 統計を計算
    const totalQuizzes = quizzes?.length || 0
    const activeQuizzes = quizzes?.filter(q => q.status === 'active').length || 0
    const completedQuizzes = quizzes?.filter(q => q.status === 'completed').length || 0
    const pendingApproval = quizzes?.filter(q => q.status === 'pending_approval').length || 0
    const draftQuizzes = quizzes?.filter(q => q.status === 'draft').length || 0

    // 回答率の計算（クイズ数ベース）
    let avgResponseRate = 0
    if (activeQuizzes > 0) {
      // 配信中のクイズのうち、回答済みのクイズ数をカウント
      let respondedQuizzes = 0;
      if (responses && responses.length > 0) {
        // 重複回答を除外して、回答済みのクイズIDを取得
        const respondedQuizIds = new Set();
        responses.forEach(r => respondedQuizIds.add(r.quiz_id));
        respondedQuizzes = respondedQuizIds.size;
      }
      avgResponseRate = Math.round((respondedQuizzes / activeQuizzes) * 100);
    }

    // 平均スコアの計算（重複回答を除外）
    let avgScore = 0
    if (responses && responses.length > 0) {
      // 重複回答を除外して、最新の回答のみを使用
      const latestResponses = new Map();
      responses.forEach(r => {
        const key = `${r.quiz_id}-${r.user_id}`;
        if (!latestResponses.has(key) || 
            new Date(r.completed_at) > new Date(latestResponses.get(key).completed_at)) {
          latestResponses.set(key, r);
        }
      });
      
      const validScores = Array.from(latestResponses.values())
        .filter(r => r.score !== null)
        .map(r => r.score);
      
      if (validScores.length > 0) {
        avgScore = Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
      }
    }

    // 今日完了したクイズ数（重複回答を除外）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayResponses = responses?.filter(r => {
      const completedDate = new Date(r.completed_at)
      return completedDate >= today
    }) || [];
    
    // 今日のユニークな回答数をカウント
    const uniqueTodayResponses = new Set();
    todayResponses.forEach(r => {
      const key = `${r.quiz_id}-${r.user_id}`;
      uniqueTodayResponses.add(key);
    });
    const completedToday = uniqueTodayResponses.size;

    // 要注意項目（期限が近いクイズ、回答率が低いクイズなど）
    const criticalItems = quizzes?.filter(q => {
      if (q.deadline) {
        const deadline = new Date(q.deadline)
        const now = new Date()
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilDeadline <= 3 && daysUntilDeadline >= 0
      }
      return false
    }).length || 0

    // アクティブなクイズの詳細情報
    const activeQuizzesData = quizzes?.filter(q => q.status === 'active').map(quiz => {
      // このクイズの回答統計を計算（重複回答を除外）
      const quizResponses = responses?.filter(r => r.quiz_id === quiz.id) || [];
      const quizAssignments = assignments?.filter(a => a.quiz_id === quiz.id) || [];
      
      console.log(`クイズ ${quiz.title} の詳細計算:`, {
        quizId: quiz.id,
        quizResponsesCount: quizResponses.length,
        quizAssignmentsCount: quizAssignments.length,
        quizResponses: quizResponses.map(r => ({ user_id: r.user_id, score: r.score, completed_at: r.completed_at })),
        quizAssignments: quizAssignments.map(a => ({ user_id: a.user_id, status: a.status }))
      });
      
      // 個別クイズの回答率：割り当てユーザー数に対する回答ユーザー数
      const uniqueRespondedUsers = new Set();
      quizResponses.forEach(r => uniqueRespondedUsers.add(r.user_id));
      
      const responseRate = quizAssignments.length > 0 
        ? Math.round((uniqueRespondedUsers.size / quizAssignments.length) * 100)
        : 0;
      
      console.log(`クイズ ${quiz.title} の回答率計算:`, {
        uniqueRespondedUsersCount: uniqueRespondedUsers.size,
        quizAssignmentsCount: quizAssignments.length,
        calculatedResponseRate: responseRate
      });
      
      // 最新の回答のみを使用して平均スコアを計算
      const latestResponses = new Map();
      quizResponses.forEach(r => {
        const key = r.user_id;
        if (!latestResponses.has(key) || 
            new Date(r.completed_at) > new Date(latestResponses.get(key).completed_at)) {
          latestResponses.set(key, r);
        }
      });
      
      const avgQuizScore = latestResponses.size > 0
        ? Math.round(Array.from(latestResponses.values())
            .filter(r => r.score !== null)
            .reduce((sum, r) => sum + (r.score || 0), 0) / latestResponses.size)
        : 0;

      return {
        id: quiz.id,
        title: quiz.title,
        source: quiz.source_mix && quiz.source_mix.length > 0 
          ? quiz.source_mix[0].charAt(0).toUpperCase() + quiz.source_mix[0].slice(1)
          : 'Manual',
        responseRate: responseRate,
        avgScore: avgQuizScore,
        deadline: quiz.deadline,
        status: quiz.status,
        requiresAttestation: quiz.require_attestation || false
      }
    }) || []

    const dashboardData = {
      stats: {
        totalQuizzes,
        activeQuizzes,
        completedQuizzes,
        avgResponseRate,
        avgScore,
        pendingApproval,
        criticalItems,
        totalUsers: users?.length || 0,
        completedToday
      },
      activeQuizzes: activeQuizzesData,
      recentActivity: {
        lastUpdated: new Date().toISOString(),
        totalAssignments: assignments?.length || 0,
        totalResponses: new Set(responses?.map(r => `${r.quiz_id}-${r.user_id}`) || []).size
      }
    }

    console.log('Dashboard data calculated:', dashboardData)

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Dashboard API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
