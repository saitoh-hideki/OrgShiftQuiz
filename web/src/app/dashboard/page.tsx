'use client'

import Link from 'next/link'
import { ArrowLeft, BarChart3, Users, Clock, AlertTriangle, TrendingUp, FileText, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

interface DashboardStats {
  totalQuizzes: number
  activeQuizzes: number
  completedQuizzes: number
  avgResponseRate: number
  avgScore: number
  pendingApproval: number
  criticalItems: number
  totalUsers: number
  completedToday: number
}

interface ActiveQuiz {
  id: string
  title: string
  source: string
  responseRate: number
  avgScore: number
  deadline?: string
  status: string
  requiresAttestation: boolean
}

interface DashboardData {
  stats: DashboardStats
  activeQuizzes: ActiveQuiz[]
  recentActivity: {
    lastUpdated: string
    totalAssignments: number
    totalResponses: number
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // ダッシュボードデータを取得
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching dashboard data...')
      
      const response = await fetch('/api/dashboard')
      console.log('Dashboard response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Dashboard API Error response:', errorData)
        throw new Error(`ダッシュボードデータの取得に失敗しました: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log('Dashboard API Response data:', data)
      
      setDashboardData(data.data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // 手動更新
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  // 初期データ取得
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  // ローディング表示
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">ダッシュボードデータを読み込み中...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            メインメニューに戻る
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
              <p className="text-gray-600 mt-2">配信状況と回答分析の概要</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? '更新中...' : '更新'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.activeQuizzes}</div>
                  <div className="text-sm text-gray-600">配信中のクイズ</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.avgResponseRate}%</div>
                  <div className="text-sm text-gray-600">平均回答率</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.pendingApproval}</div>
                  <div className="text-sm text-gray-600">承認待ち</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.criticalItems}</div>
                  <div className="text-sm text-gray-600">要注意項目</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{dashboardData.stats.totalQuizzes}</div>
                <div className="text-sm text-gray-600">総クイズ数</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{dashboardData.stats.avgScore}点</div>
                <div className="text-sm text-gray-600">平均スコア</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{dashboardData.stats.completedToday}</div>
                <div className="text-sm text-gray-600">今日完了</div>
              </div>
            </div>
          </div>
        )}

        {/* Active Quizzes */}
        {dashboardData && dashboardData.activeQuizzes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">配信中のクイズ</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.activeQuizzes.map((quiz) => (
                  <div key={quiz.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-900 mr-3">{quiz.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          quiz.source === 'News' ? 'bg-blue-100 text-blue-800' :
                          quiz.source === 'Policy' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {quiz.source}
                        </span>
                        {quiz.requiresAttestation && (
                          <span className="ml-2 text-xs text-red-600 font-medium">🔒 同意必須</span>
                        )}
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        配信中
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">回答率: </span>
                        <span className={`font-medium ${
                          quiz.responseRate >= 80 ? 'text-green-600' :
                          quiz.responseRate >= 60 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {quiz.responseRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">平均スコア: </span>
                        <span className={`font-medium ${
                          quiz.avgScore >= 80 ? 'text-green-600' :
                          quiz.avgScore >= 60 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {quiz.avgScore}点
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">期限: </span>
                        <span className="font-medium">
                          {quiz.deadline ? formatDate(quiz.deadline) : '期限なし'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Active Quizzes Message */}
        {dashboardData && dashboardData.activeQuizzes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 text-center">
              <div className="text-gray-500 mb-4">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">現在配信中のクイズはありません</p>
                <p className="text-sm">新しいクイズを作成して配信を開始しましょう</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {dashboardData && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">最近の活動</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">総割り当て数: </span>
                  <span className="font-medium text-blue-600">{dashboardData.recentActivity.totalAssignments}</span>
                </div>
                <div>
                  <span className="text-gray-600">総回答数: </span>
                  <span className="font-medium text-green-600">{dashboardData.recentActivity.totalResponses}</span>
                </div>
                <div>
                  <span className="text-gray-600">最終更新: </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(dashboardData.recentActivity.lastUpdated)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/content-hub" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="font-semibold">新しいコンテンツ</h3>
            </div>
            <p className="text-gray-600 text-sm">News・Policy・Manualから新しいクイズを作成</p>
          </Link>
          
          <Link href="/dispatch-builder" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="font-semibold">配信作成</h3>
            </div>
            <p className="text-gray-600 text-sm">クイズを束ねて配信スケジュールを設定</p>
          </Link>
          
          <Link href="/quizzes" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="font-semibold">クイズ管理</h3>
            </div>
            <p className="text-gray-600 text-sm">配信済みクイズの詳細分析と管理</p>
          </Link>
        </div>
      </div>
    </div>
  )
}