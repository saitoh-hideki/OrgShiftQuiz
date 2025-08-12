'use client'

import Link from 'next/link'
import { BarChart3, Users, Clock, AlertTriangle, TrendingUp, FileText, Settings, PieChart, RefreshCw, ArrowLeft } from 'lucide-react'
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

  // ローディング表示
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-blue-ultra-light p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
              <div className="text-muted-strong text-lg font-medium">ダッシュボードデータを読み込み中...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-ultra-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🚀 強化されたヘッダー - ブランドグラデーション強化 */}
        <div className="brand-header mb-12 p-8 rounded-[24px] pattern-dots relative overflow-hidden">
          <Link href="/" className="inline-flex items-center gradient-text-blue-subtitle hover:text-white mb-6 transition-colors duration-200 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            メインメニューに戻る
          </Link>
          <div className="relative z-10 animate-fade-in-up">
            <h1 className="text-[32px] font-bold gradient-text-blue-light mb-3 tracking-[-0.5%] drop-shadow-sm">
              OrgShift Quiz — 管理者ダッシュボード
            </h1>
            <p className="text-[14px] gradient-text-blue-subtitle leading-[1.6]">
              組織学習を加速させるクイズ配信システム
            </p>
          </div>
          <div className="absolute top-8 right-8 z-10">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 rounded-lg disabled:opacity-50 transition-all duration-200 font-medium bg-white/20 text-white hover:bg-white/30 border border-white/30 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? '更新中...' : '更新'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-soft animate-fade-in-up">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* 🚀 強化されたKPI Section - 青系背景・視認性改善 */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="kpi-enhanced rounded-[20px] p-8 h-[120px] flex items-center animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center w-full">
                <div className="w-16 h-16 rounded-[20px] icon-bg-unified flex items-center justify-center mr-6 shadow-blue-medium transition-all duration-200 group-hover:icon-bg-unified-hover">
                  <BarChart3 className="h-8 w-8 text-brand-700" />
                </div>
                <div>
                  <div className="text-[32px] font-bold text-primary-strong mb-2">{dashboardData.stats.activeQuizzes}</div>
                  <div className="text-[13px] font-semibold text-muted-strong uppercase tracking-wide">配信中</div>
                </div>
              </div>
            </div>
            
            <div className="kpi-enhanced rounded-[20px] p-8 h-[120px] flex items-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center w-full">
                <div className="w-16 h-16 rounded-[20px] icon-bg-unified flex items-center justify-center mr-6 shadow-blue-medium">
                  <Users className="h-8 w-8 text-brand-700" />
                </div>
                <div>
                  <div className="text-[32px] font-bold text-primary-strong mb-2">{dashboardData.stats.avgResponseRate}%</div>
                  <div className="text-[13px] font-semibold text-muted-strong uppercase tracking-wide">平均回答率</div>
                </div>
              </div>
            </div>
            
            <div className="kpi-enhanced rounded-[20px] p-8 h-[120px] flex items-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center w-full">
                <div className="w-16 h-16 rounded-[20px] icon-bg-unified flex items-center justify-center mr-6 shadow-blue-medium">
                  <Clock className="h-8 w-8 text-brand-700" />
                </div>
                <div>
                  <div className="text-[32px] font-bold text-primary-strong mb-2">{dashboardData.stats.pendingApproval}</div>
                  <div className="text-[13px] font-semibold text-muted-strong uppercase tracking-wide">承認待ち</div>
                </div>
              </div>
            </div>
            
            <div className="kpi-enhanced rounded-[20px] p-8 h-[120px] flex items-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center w-full">
                <div className="w-16 h-16 rounded-[20px] icon-bg-unified flex items-center justify-center mr-6 shadow-blue-medium">
                  <AlertTriangle className="h-8 w-8 text-brand-700" />
                </div>
                <div>
                  <div className="text-[32px] font-bold text-primary-strong mb-2">{dashboardData.stats.criticalItems}</div>
                  <div className="text-[13px] font-semibold text-muted-strong uppercase tracking-wide">要注意項目</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 強化されたAdditional Stats - 青系背景・視認性改善 */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div 
              ref={setSpotlightRef(0)}
              className="card-enhanced rounded-[20px] p-8 text-center hover-lift spotlight-enhanced animate-fade-in-up bg-blue-very-light"
              style={{animationDelay: '0.5s'}}
            >
              <div className="w-20 h-20 rounded-[20px] icon-bg-unified flex items-center justify-center mx-auto mb-6 shadow-blue-medium">
                <BarChart3 className="h-10 w-10 text-brand-700" />
              </div>
              <div className="text-4xl font-bold text-primary-strong mb-3">{dashboardData.stats.totalQuizzes}</div>
              <div className="text-lg text-secondary-strong font-semibold">総クイズ数</div>
            </div>
            
            <div 
              ref={setSpotlightRef(1)}
              className="card-enhanced rounded-[20px] p-8 text-center hover-lift spotlight-enhanced animate-fade-in-up bg-blue-very-light"
              style={{animationDelay: '0.6s'}}
            >
              <div className="w-20 h-20 rounded-[20px] icon-bg-unified flex items-center justify-center mx-auto mb-6 shadow-blue-medium">
                <TrendingUp className="h-10 w-10 text-brand-700" />
              </div>
              <div className="text-4xl font-bold text-primary-strong mb-3">{dashboardData.stats.avgScore}点</div>
              <div className="text-lg text-secondary-strong font-semibold">平均スコア</div>
            </div>
            
            <div 
              ref={setSpotlightRef(2)}
              className="card-enhanced rounded-[20px] p-8 text-center hover-lift spotlight-enhanced animate-fade-in-up bg-blue-very-light"
              style={{animationDelay: '0.7s'}}
            >
              <div className="w-20 h-20 rounded-[20px] icon-bg-unified flex items-center justify-center mx-auto mb-6 shadow-blue-medium">
                <Users className="h-10 w-10 text-brand-700" />
              </div>
              <div className="text-4xl font-bold text-primary-strong mb-3">{dashboardData.stats.completedToday}</div>
              <div className="text-lg text-secondary-strong font-semibold">今日完了</div>
            </div>
          </div>
        )}

        {/* 🚀 強化されたActive Quizzes - 青系枠線・視認性改善 */}
        {dashboardData && dashboardData.activeQuizzes.length > 0 && (
          <div className="card-enhanced rounded-[20px] mb-12 animate-fade-in-up bg-blue-ultra-light" style={{animationDelay: '0.8s'}}>
            <div className="p-8 border-b border-blue-medium">
              <div className="flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-brand-700 to-brand-600 rounded-full mr-4"></div>
                <h2 className="text-2xl font-semibold text-primary-strong tracking-tight">配信中のクイズ</h2>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                {dashboardData.activeQuizzes.map((quiz, index) => (
                  <div 
                    key={quiz.id} 
                    className="bg-white rounded-[20px] p-6 border border-blue-subtle shadow-blue-soft hover:shadow-blue-medium transition-all duration-200 animate-fade-in-up"
                    style={{animationDelay: `${0.9 + index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-primary-strong mr-4 text-lg">{quiz.title}</h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          quiz.source === 'News' ? 'bg-blue-100 text-blue-800' :
                          quiz.source === 'Policy' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {quiz.source}
                        </span>
                        {quiz.requiresAttestation && (
                          <span className="ml-3 text-sm text-red-600 font-medium">🔒 同意必須</span>
                        )}
                      </div>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                        配信中
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div>
                        <span className="text-secondary-strong font-medium">回答率: </span>
                        <span className={`font-semibold ${
                          quiz.responseRate >= 80 ? 'text-[#10B981]' :
                          quiz.responseRate >= 60 ? 'text-[#F59E0B]' :
                          'text-[#EF4444]'
                        }`}>
                          {quiz.responseRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary-strong font-medium">平均スコア: </span>
                        <span className={`font-semibold ${
                          quiz.avgScore >= 80 ? 'text-[#10B981]' :
                          quiz.avgScore >= 60 ? 'text-[#F59E0B]' :
                          'text-[#EF4444]'
                        }`}>
                          {quiz.avgScore}点
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary-strong font-medium">期限: </span>
                        <span className="font-semibold text-primary-strong">
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

        {/* 🚀 強化されたNo Active Quizzes Message - 青系背景 */}
        {dashboardData && dashboardData.activeQuizzes.length === 0 && (
          <div className="card-enhanced rounded-[20px] mb-12 animate-fade-in-up bg-blue-ultra-light" style={{animationDelay: '0.8s'}}>
            <div className="p-12 text-center">
              <div className="text-muted-strong mb-6">
                <div className="w-24 h-24 rounded-[20px] icon-bg-unified flex items-center justify-center mx-auto mb-6 shadow-blue-medium">
                  <BarChart3 className="h-12 w-12 text-brand-700" />
                </div>
                <p className="text-xl font-semibold text-secondary-strong mb-2">現在配信中のクイズはありません</p>
                <p className="text-muted-strong font-medium">新しいクイズを作成して配信を開始しましょう</p>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 強化されたRecent Activity - 青系背景・視認性改善 */}
        {dashboardData && (
          <div className="card-enhanced rounded-[20px] mb-12 animate-fade-in-up bg-blue-ultra-light" style={{animationDelay: '0.9s'}}>
            <div className="p-8 border-b border-blue-medium">
              <div className="flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-brand-700 to-brand-600 rounded-full mr-4"></div>
                <h2 className="text-2xl font-semibold text-primary-strong tracking-tight">最近の活動</h2>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-700 mb-2">{dashboardData.recentActivity.totalAssignments}</div>
                  <span className="text-secondary-strong font-semibold">総割り当て数</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-700 mb-2">{dashboardData.recentActivity.totalResponses}</div>
                  <span className="text-secondary-strong font-semibold">総回答数</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-strong mb-2">
                    {formatDate(dashboardData.recentActivity.lastUpdated)}
                  </div>
                  <span className="text-secondary-strong font-semibold">最終更新</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 強化されたQuick Actions - 青系背景・視認性改善 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Link 
            href="/content-hub" 
            ref={setSpotlightRef(3)}
            className="card-enhanced rounded-[20px] p-8 hover-lift spotlight-enhanced focus-ring animate-fade-in-up group bg-blue-very-light"
            style={{animationDelay: '1.0s'}}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-[20px] icon-bg-unified flex items-center justify-center mr-4 shadow-blue-medium transition-all duration-200 group-hover:icon-bg-unified-hover">
                <FileText className="h-6 w-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-primary-strong text-lg">コンテンツハブ</h3>
            </div>
            <p className="text-secondary-strong text-base leading-relaxed mb-4 font-medium">News・Policy・Manualから新しいクイズを作成</p>
            <span className="text-link-strong text-sm group-hover:underline transition-all duration-200 font-medium">管理を開始 →</span>
          </Link>
          
          <Link 
            href="/dispatch-builder" 
            ref={setSpotlightRef(4)}
            className="card-enhanced rounded-[20px] p-8 hover-lift spotlight-enhanced focus-ring animate-fade-in-up group bg-blue-very-light"
            style={{animationDelay: '1.1s'}}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-[20px] icon-bg-unified flex items-center justify-center mr-4 shadow-blue-medium transition-all duration-200 group-hover:icon-bg-unified-hover">
                <TrendingUp className="h-6 w-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-primary-strong text-lg">配信ビルダー</h3>
            </div>
            <p className="text-secondary-strong text-base leading-relaxed mb-4 font-medium">クイズを束ねて配信スケジュールを設定</p>
            <span className="text-link-strong text-sm group-hover:underline transition-all duration-200 font-medium">配信作成 →</span>
          </Link>
          
          <Link 
            href="/quizzes" 
            ref={setSpotlightRef(5)}
            className="card-enhanced rounded-[20px] p-8 hover-lift spotlight-enhanced focus-ring animate-fade-in-up group bg-blue-very-light"
            style={{animationDelay: '1.2s'}}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-[20px] icon-bg-unified flex items-center justify-center mr-4 shadow-blue-medium transition-all duration-200 group-hover:icon-bg-unified-hover">
                <BarChart3 className="h-6 w-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-primary-strong text-lg">クイズ管理</h3>
            </div>
            <p className="text-secondary-strong text-base leading-relaxed mb-4 font-medium">配信済みクイズの詳細分析と管理</p>
            <span className="text-link-strong text-sm group-hover:underline transition-all duration-200 font-medium">一覧表示 →</span>
          </Link>
        </div>

        {/* 🚀 強化されたAdditional Quick Actions - 青系背景・視認性改善 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link 
            href="/analytics" 
            ref={setSpotlightRef(6)}
            className="card-enhanced rounded-[20px] p-8 hover-lift spotlight-enhanced focus-ring animate-fade-in-up group bg-blue-very-light"
            style={{animationDelay: '1.3s'}}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-[20px] icon-bg-unified flex items-center justify-center mr-4 shadow-blue-medium transition-all duration-200 group-hover:icon-bg-unified-hover">
                <PieChart className="h-6 w-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-primary-strong text-lg">詳細分析</h3>
            </div>
            <p className="text-secondary-strong text-base leading-relaxed mb-4 font-medium">詳細な分析レポートとインサイト</p>
            <span className="text-link-strong text-sm group-hover:underline transition-all duration-200 font-medium">分析開始 →</span>
          </Link>
          
          <Link 
            href="/settings" 
            ref={setSpotlightRef(7)}
            className="card-enhanced rounded-[20px] p-8 hover-lift spotlight-enhanced focus-ring animate-fade-in-up group bg-blue-very-light"
            style={{animationDelay: '1.4s'}}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-[20px] icon-bg-unified flex items-center justify-center mr-4 shadow-blue-medium transition-all duration-200 group-hover:icon-bg-unified-hover">
                <Settings className="h-6 w-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-primary-strong text-lg">設定</h3>
            </div>
            <p className="text-secondary-strong text-base leading-relaxed mb-4 font-medium">システム設定とユーザー管理</p>
            <span className="text-link-strong text-sm group-hover:underline transition-all duration-200 font-medium">設定変更 →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}