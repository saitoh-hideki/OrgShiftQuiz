'use client'

import { Search, Filter, Eye, Edit, Trash2, BarChart3, Users, Clock, CheckCircle, AlertTriangle, Play, Pause, CheckCircle2, XCircle, X, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CoolHeader from '@/components/CoolHeader'

interface Quiz {
  id: string
  title: string
  description?: string
  source: string
  questions: number
  status: string
  created: string
  deadline?: string
  totalResponses: number
  responseRate: number
  avgScore: number
  difficulty: string
  requiresAttestation: boolean
  targetSegment: string
  notificationEnabled: boolean
  publishedAt?: string
  sourceMix: string[]
  latestResponseAt?: string // 追加: 最新の回答日時
  totalAssignments?: number // 追加: 総割り当て数
}

interface QuizStats {
  total: number
  active: number
  completed: number
  draft: number
  pending: number
}

// クイズ詳細モーダルコンポーネント
function QuizDetailModal({ quiz, isOpen, onClose }: { quiz: Quiz | null, isOpen: boolean, onClose: () => void }) {
  if (!isOpen || !quiz) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">クイズ詳細</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">タイトル</dt>
                  <dd className="text-sm text-gray-900">{quiz.title}</dd>
                </div>
                {quiz.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">説明</dt>
                    <dd className="text-sm text-gray-900">{quiz.description}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">ソース</dt>
                  <dd className="text-sm text-gray-900">{quiz.source}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">質問数</dt>
                  <dd className="text-sm text-gray-900">{quiz.questions}問</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">難易度</dt>
                  <dd className="text-sm text-gray-900">{quiz.difficulty}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">対象セグメント</dt>
                  <dd className="text-sm text-gray-900">{quiz.targetSegment}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">配信設定</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                  <dd className="text-sm text-gray-900">{quiz.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">作成日</dt>
                  <dd className="text-sm text-gray-900">{formatDate(quiz.created)}</dd>
                </div>
                {quiz.deadline && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">期限</dt>
                    <dd className="text-sm text-gray-900">{formatDate(quiz.deadline)}</dd>
                  </div>
                )}
                {quiz.publishedAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">配信開始日</dt>
                    <dd className="text-sm text-gray-900">{formatDate(quiz.publishedAt)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">同意必須</dt>
                  <dd className="text-sm text-gray-900">{quiz.requiresAttestation ? 'はい' : 'いいえ'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">通知</dt>
                  <dd className="text-sm text-gray-900">{quiz.notificationEnabled ? '有効' : '無効'}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">回答状況</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{quiz.totalResponses}</div>
                <div className="text-sm text-gray-600">総回答数</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{quiz.responseRate}%</div>
                <div className="text-sm text-gray-600">回答率</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{quiz.avgScore}点</div>
                <div className="text-sm text-gray-600">平均スコア</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{quiz.totalAssignments || 0}</div>
                <div className="text-sm text-gray-600">総割り当て数</div>
              </div>
            </div>
            {quiz.latestResponseAt && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>最新回答:</strong> {formatDate(quiz.latestResponseAt)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// クイズ分析モーダルコンポーネント
function QuizAnalyticsModal({ quiz, isOpen, onClose }: { quiz: Quiz | null, isOpen: boolean, onClose: () => void }) {
  if (!isOpen || !quiz) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">クイズ分析</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{quiz.title}</h3>
            <p className="text-sm text-gray-600">詳細な分析データ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">回答分布</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">総回答数</span>
                  <span className="text-sm font-medium">{quiz.totalResponses}人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">回答率</span>
                  <span className="text-sm font-medium">{quiz.responseRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">平均スコア</span>
                  <span className="text-sm font-medium">{quiz.avgScore}点</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">クイズ情報</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">質問数</span>
                  <span className="text-sm font-medium">{quiz.questions}問</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">難易度</span>
                  <span className="text-sm font-medium">{quiz.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ソース</span>
                  <span className="text-sm font-medium">{quiz.source}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">スコア分布</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center text-gray-500">
                スコア分布の詳細データは現在開発中です
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QuizzesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [stats, setStats] = useState<QuizStats>({ total: 0, active: 0, completed: 0, draft: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false)
  
  // スクロール表示用の状態
  const [displayLimit, setDisplayLimit] = useState(3) // 9件のデータでスクロールテストができるように3件に調整
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // スクロールで残りのクイズを表示
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100 // 下端100px手前でトリガー
    
    if (isNearBottom && displayLimit < quizzes.length && !isLoadingMore) {
      setIsLoadingMore(true)
      // 少し遅延を入れてスムーズな表示にする
      setTimeout(() => {
        const newLimit = Math.min(displayLimit + 3, quizzes.length) // 3件ずつ追加
        setDisplayLimit(newLimit)
        setIsLoadingMore(false)
      }, 300)
    }
  }

  // クイズデータを取得
  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (sourceFilter !== 'all') params.append('source', sourceFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/quizzes?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error response:', errorData)
        throw new Error(`クイズの取得に失敗しました: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`)
      }
      
      const data = await response.json()
      
      setQuizzes(data.quizzes || [])
      setStats(data.stats || { total: 0, active: 0, completed: 0, draft: 0, pending: 0 })
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // クイズのステータスを更新
  const updateQuizStatus = async (quizId: string, action: string) => {
    try {
      const response = await fetch('/api/quizzes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quizId, action })
      })

      if (!response.ok) throw new Error('クイズの更新に失敗しました')
      
      // 成功したらデータを再取得
      await fetchQuizzes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'クイズの更新に失敗しました')
    }
  }

  // クイズを削除
  const deleteQuiz = async (quizId: string) => {
    if (!confirm('このクイズを削除しますか？この操作は取り消せません。')) return

    try {
      const response = await fetch(`/api/quizzes?quiz_id=${quizId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('クイズの削除に失敗しました')
      
      // 成功したらデータを再取得
      await fetchQuizzes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'クイズの削除に失敗しました')
    }
  }

  // 詳細モーダルを開く
  const openDetailModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setDetailModalOpen(true)
  }

  // 分析モーダルを開く
  const openAnalyticsModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setAnalyticsModalOpen(true)
  }

  // 初期データ取得
  useEffect(() => {
    fetchQuizzes()
  }, [])

  // フィルター変更時にデータを再取得
  useEffect(() => {
    fetchQuizzes()
  }, [statusFilter, sourceFilter])

  // 検索時にデータを再取得（デバウンス）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchQuizzes()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center"><CheckCircle className="h-3 w-3 mr-1" />配信中</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" />完了</span>
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center"><Edit className="h-3 w-3 mr-1" />下書き</span>
      case 'pending_approval':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full flex items-center"><Clock className="h-3 w-3 mr-1" />承認待ち</span>
      case 'paused':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center"><Pause className="h-3 w-3 mr-1" />一時停止</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center"><XCircle className="h-3 w-3 mr-1" />却下</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'hard':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '易'
      case 'medium':
        return '中'
      case 'hard':
        return '難'
      default:
        return difficulty
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  if (loading && quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F4FA] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
              <div className="text-[#64748B]">クイズデータを読み込み中...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F4FA] p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🚀 強化されたヘッダー - ブランドグラデーション */}
        <div className="brand-header mb-12 p-8 rounded-[24px] pattern-dots relative overflow-hidden">
          <Link href="/" className="inline-flex items-center gradient-text-blue-subtitle hover:text-white mb-6 transition-colors duration-200 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            メインメニューに戻る
          </Link>
          <div className="relative z-10 animate-fade-in-up">
            <h1 className="text-[32px] font-bold text-blue-clean mb-3 tracking-[-0.5%] drop-shadow-sm">
              クイズ管理
            </h1>
            <p className="text-[14px] text-blue-clean-subtitle leading-[1.6]">
              配信済みクイズの一覧と詳細分析
            </p>
          </div>
        </div>

        {/* 🚀 強化されたError Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 mb-8 animate-fade-in-up">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 🚀 強化されたStats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-[16px] icon-bg-unified flex items-center justify-center shadow-soft">
                <BarChart3 className="h-6 w-6 text-[#2563EB]" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-[#0F172A]">{stats.total}</div>
                <div className="text-sm text-[#64748B]">総クイズ数</div>
              </div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-[16px] icon-bg-unified flex items-center justify-center shadow-soft">
                <CheckCircle className="h-6 w-6 text-[#10B981]" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-[#0F172A]">{stats.active}</div>
                <div className="text-sm text-[#64748B]">配信中</div>
              </div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-[16px] icon-bg-unified flex items-center justify-center shadow-soft">
                <Users className="h-6 w-6 text-[#2563EB]" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-[#0F172A]">{stats.completed}</div>
                <div className="text-sm text-[#64748B]">完了</div>
              </div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-[16px] icon-bg-unified flex items-center justify-center shadow-soft">
                <Edit className="h-6 w-6 text-[#64748B]" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-[#0F172A]">{stats.draft}</div>
                <div className="text-sm text-[#64748B]">下書き</div>
              </div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-[16px] icon-bg-unified flex items-center justify-center shadow-soft">
                <Clock className="h-6 w-6 text-[#F59E0B]" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-[#0F172A]">{stats.pending}</div>
                <div className="text-sm text-[#64748B]">承認待ち</div>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 強化されたFilters */}
        <div className="card-enhanced rounded-[20px] shadow-soft border p-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="クイズタイトルを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="active">配信中</option>
              <option value="completed">完了</option>
              <option value="draft">下書き</option>
              <option value="pending_approval">承認待ち</option>
              <option value="paused">一時停止</option>
              <option value="rejected">却下</option>
            </select>
            
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのソース</option>
              <option value="news">News</option>
              <option value="policy">Policy</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              クイズ一覧 ({quizzes.length}件)
            </h2>

          </div>
          
          <div className="quiz-table-wrapper">
            {/* 固定ヘッダー */}
            <div className="quiz-table-header">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">クイズ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ソース</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">回答状況</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成績</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期限</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
                  </tr>
                </thead>
              </table>
            </div>
            
            {/* スクロール可能なボディ */}
            <div className="quiz-table-body" onScroll={handleScroll}>
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizzes.slice(0, displayLimit).map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{quiz.title}</div>
                        <div className="text-sm text-gray-500">
                          {quiz.questions}問 • 
                          <span className={`ml-1 ${getDifficultyColor(quiz.difficulty)}`}>
                            {getDifficultyText(quiz.difficulty)}
                          </span>
                          {quiz.requiresAttestation && (
                            <span className="ml-2 text-xs text-red-600">🔒 同意必須</span>
                          )}
                        </div>
                        {quiz.description && (
                          <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {quiz.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quiz.source === 'News' ? 'bg-blue-100 text-blue-800' :
                        quiz.source === 'Policy' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {quiz.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(quiz.status)}
                    </td>
                    <td className="px-6 py-4">
                      {quiz.status === 'active' || quiz.status === 'completed' ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quiz.totalResponses}人回答
                          </div>
                          <div className={`text-sm ${
                            quiz.responseRate >= 80 ? 'text-green-600' :
                            quiz.responseRate >= 60 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            回答率: {quiz.responseRate}%
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {quiz.status === 'active' || quiz.status === 'completed' ? (
                        <div>
                          <div className={`text-sm font-medium ${
                            quiz.avgScore >= 80 ? 'text-green-600' :
                            quiz.avgScore >= 60 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            平均: {quiz.avgScore}点
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {quiz.deadline ? formatDate(quiz.deadline) : '期限なし'}
                      </div>
                      <div className="text-xs text-gray-500">
                        作成: {formatDate(quiz.created)}
                      </div>
                      {quiz.publishedAt && (
                        <div className="text-xs text-green-600">
                          配信: {formatDate(quiz.publishedAt)}
                        </div>
                      )}
                      {quiz.latestResponseAt && (
                        <div className="text-xs text-blue-600">
                          最新回答: {formatDate(quiz.latestResponseAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="詳細表示"
                          onClick={() => openDetailModal(quiz)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-green-600 hover:text-green-800"
                          title="分析"
                          onClick={() => openAnalyticsModal(quiz)}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        
                        {/* ステータスに応じたアクションボタン */}
                        {quiz.status === 'draft' && (
                          <>
                            <button 
                              className="p-1 text-green-600 hover:text-green-800"
                              onClick={() => updateQuizStatus(quiz.id, 'publish')}
                              title="配信開始"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-orange-600 hover:text-orange-800"
                              title="編集"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:text-red-800"
                              onClick={() => deleteQuiz(quiz.id)}
                              title="削除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {quiz.status === 'pending_approval' && (
                          <>
                            <button 
                              className="p-1 text-green-600 hover:text-green-800"
                              onClick={() => updateQuizStatus(quiz.id, 'approve')}
                              title="承認"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:text-red-800"
                              onClick={() => updateQuizStatus(quiz.id, 'reject')}
                              title="却下"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {quiz.status === 'active' && (
                          <>
                            <button 
                              className="p-1 text-yellow-600 hover:text-yellow-800"
                              onClick={() => updateQuizStatus(quiz.id, 'pause')}
                              title="一時停止"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-blue-600 hover:text-blue-800"
                              onClick={() => updateQuizStatus(quiz.id, 'complete')}
                              title="完了"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          
          {/* スクロール表示制御 */}
          
          
          {quizzes.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <div className="text-lg font-medium mb-2">該当するクイズがありません</div>
              <div className="text-sm">検索条件を変更してお試しください</div>
            </div>
          )}
        </div>
      </div>

      {/* モーダル */}
      <QuizDetailModal 
        quiz={selectedQuiz} 
        isOpen={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)} 
      />
      <QuizAnalyticsModal 
        quiz={selectedQuiz} 
        isOpen={analyticsModalOpen} 
        onClose={() => setAnalyticsModalOpen(false)} 
      />
    </div>
  )
}