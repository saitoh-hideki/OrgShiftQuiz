'use client'

import Link from 'next/link'
import { BarChart3, Users, Clock, AlertTriangle, TrendingUp, FileText, Settings, PieChart, RefreshCw, ArrowLeft, Search, Filter, Eye, Calendar, Target, Zap, Activity, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import CoolHeader from '@/components/CoolHeader'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // スポットライト効果のためのref
  const spotlightRefs = useRef<(HTMLElement | null)[]>([])

  // refを設定するためのコールバック
  const setSpotlightRef = useCallback((index: number) => (el: HTMLElement | null) => {
    spotlightRefs.current[index] = el
  }, [])

  // スポットライト効果の実装
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      spotlightRefs.current.forEach((ref) => {
        if (ref) {
          const rect = ref.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          
          ref.style.setProperty('--mouse-x', `${x}px`)
          ref.style.setProperty('--mouse-y', `${y}px`)
        }
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

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

  // フィルタリングされたクイズリスト
  const filteredQuizzes = dashboardData?.activeQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && quiz.status === '配信中') ||
                         (filterStatus === 'pending' && quiz.status === '承認待ち')
    return matchesSearch && matchesStatus
  }) || []

  // ローディング表示
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-slate-600 text-lg font-medium">ダッシュボードデータを読み込み中...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 🚀 米SaaS風ヘッダー - モダンで洗練されたデザイン */}
        <div className="relative mb-12">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            メインメニューに戻る
          </Link>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-slate-600 text-lg">
                  組織学習の進捗とパフォーマンスを可視化
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 rounded-xl disabled:opacity-50 transition-all duration-200 font-medium bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? '更新中...' : '更新'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg animate-fade-in-up">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* 🚀 米SaaS風KPI Section - ガラスモーフィズム効果 */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">前週比</div>
                  <div className="text-sm font-semibold text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12%
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{dashboardData.stats.activeQuizzes}</div>
              <div className="text-sm text-slate-600">配信中のクイズ</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">前週比</div>
                  <div className="text-sm font-semibold text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8%
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{dashboardData.stats.avgResponseRate}%</div>
              <div className="text-sm text-slate-600">平均回答率</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">前週比</div>
                  <div className="text-sm font-semibold text-red-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                    -5%
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{dashboardData.stats.pendingApproval}</div>
              <div className="text-sm text-slate-600">承認待ち</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">前週比</div>
                  <div className="text-sm font-semibold text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    -15%
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{dashboardData.stats.criticalItems}</div>
              <div className="text-sm text-slate-600">要注意項目</div>
            </div>
          </div>
        )}

        {/* 🚀 米SaaS風Additional Stats - モダンカードデザイン */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-3">{dashboardData.stats.totalQuizzes}</div>
              <div className="text-lg text-slate-600 font-medium">総クイズ数</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-3">{dashboardData.stats.avgScore}点</div>
              <div className="text-lg text-slate-600 font-medium">平均スコア</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-3">{dashboardData.stats.completedToday}</div>
              <div className="text-lg text-slate-600 font-medium">今日完了</div>
            </div>
          </div>
        )}

        {/* 🚀 米SaaS風Active Quizzes - スクロール対応テーブル */}
        {dashboardData && dashboardData.activeQuizzes.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 mb-12">
            <div className="p-8 border-b border-slate-200/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">配信中のクイズ</h2>
                </div>
                <div className="text-sm text-slate-500">
                  {filteredQuizzes.length} / {dashboardData.activeQuizzes.length} 件
                </div>
              </div>
              
              {/* 検索・フィルターUI */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="クイズ名やソースで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">すべて</option>
                  <option value="active">配信中</option>
                  <option value="pending">承認待ち</option>
                </select>
              </div>
            </div>
            
            {/* スクロール対応テーブル */}
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/80 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50/80">クイズ名</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50/80">ソース</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50/80">回答率</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50/80">平均スコア</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50/80">期限</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50/80">ステータス</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50/80">アクション</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60">
                      {filteredQuizzes.map((quiz, index) => (
                        <tr key={quiz.id} className="hover:bg-slate-50/80 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900">{quiz.title}</div>
                                {quiz.requiresAttestation && (
                                  <div className="text-xs text-red-600 font-medium flex items-center mt-1">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    同意必須
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              quiz.source === 'News' ? 'bg-blue-100 text-blue-800' :
                              quiz.source === 'Policy' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {quiz.source}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    quiz.responseRate >= 80 ? 'bg-emerald-500' :
                                    quiz.responseRate >= 60 ? 'bg-amber-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${quiz.responseRate}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-medium ${
                                quiz.responseRate >= 80 ? 'text-emerald-600' :
                                quiz.responseRate >= 60 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {quiz.responseRate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${
                              quiz.avgScore >= 80 ? 'text-emerald-600' :
                              quiz.avgScore >= 60 ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {quiz.avgScore}点
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-slate-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              {quiz.deadline ? formatDate(quiz.deadline) : '期限なし'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              配信中
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* スクロール案内 */}
                {filteredQuizzes.length > 5 && (
                  <div className="p-4 text-center border-t border-slate-200/60 bg-slate-50/50">
                    <div className="text-sm text-slate-600 mb-1">
                      表示中: 最初の5件 / 全{filteredQuizzes.length}件
                    </div>
                    <div className="text-xs text-slate-500">
                      ↓ スクロールして残りを表示 ↓
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🚀 米SaaS風No Active Quizzes Message */}
        {dashboardData && dashboardData.activeQuizzes.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 mb-12">
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BarChart3 className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">現在配信中のクイズはありません</h3>
              <p className="text-slate-600">新しいクイズを作成して配信を開始しましょう</p>
            </div>
          </div>
        )}

        {/* 🚀 米SaaS風Recent Activity */}
        {dashboardData && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 mb-12">
            <div className="p-8 border-b border-slate-200/60">
              <div className="flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">最近の活動</h2>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.recentActivity.totalAssignments}</div>
                  <span className="text-slate-600 font-medium">総割り当て数</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{dashboardData.recentActivity.totalResponses}</div>
                  <span className="text-slate-600 font-medium">総回答数</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {formatDate(dashboardData.recentActivity.lastUpdated)}
                  </div>
                  <span className="text-slate-600 font-medium">最終更新</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 米SaaS風Quick Actions - 5個横一列展開（KPI表示付き） */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <Link href="/content-hub" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-md transition-transform duration-200 group-hover:scale-110">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">コンテンツハブ</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">News・Policy・Manualの管理とAIクイズ生成</p>
                <span className="text-blue-600 text-xs group-hover:underline transition-all duration-200 font-medium">管理を開始 →</span>
              </div>
            </div>
          </Link>
          
          <Link href="/dispatch-builder" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3 shadow-md transition-transform duration-200 group-hover:scale-110">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">配信ビルダー</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">クイズを束ねて配信スケジュールを設定</p>
                <span className="text-emerald-600 text-xs group-hover:underline transition-all duration-200 font-medium">配信作成 →</span>
              </div>
            </div>
          </Link>
          
          <Link href="/quizzes" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 shadow-md transition-transform duration-200 group-hover:scale-110">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">クイズ管理</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">配信済みクイズの詳細分析と管理</p>
                <span className="text-purple-600 text-xs group-hover:underline transition-all duration-200 font-medium">一覧表示 →</span>
              </div>
            </div>
          </Link>
          
          <Link href="/analytics" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-3 shadow-md transition-transform duration-200 group-hover:scale-110">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">詳細分析</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">詳細な分析レポートとインサイト</p>
                <span className="text-red-600 text-xs group-hover:underline transition-all duration-200 font-medium">分析開始 →</span>
              </div>
            </div>
          </Link>
          
          <Link href="/settings" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center mb-3 shadow-md transition-transform duration-200 group-hover:scale-110">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">設定</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">システム設定とユーザー管理</p>
                <span className="text-slate-600 text-xs group-hover:underline transition-all duration-200 font-medium">設定変更 →</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}