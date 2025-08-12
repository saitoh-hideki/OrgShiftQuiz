'use client'

import Link from 'next/link'
import { ArrowLeft, RefreshCw, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Quiz {
  id: string
  title: string
  deadline: string
  target_segment: string
  requires_attestation: boolean
  status: string
  created_at: string
  question_count: number
  estimated_time: number
  assignment?: {
    status: string
    completed_at?: string
    score?: number
  }
}

export default function MobileDemoPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // クイズデータを取得
  const fetchQuizzes = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/quizzes?status=active')
      const data = await response.json()
      
      if (data.success) {
        setQuizzes(data.quizzes)
      } else {
        throw new Error(data.error || 'クイズの取得に失敗しました')
      }
    } catch (error) {
      console.error('クイズ取得エラー:', error)
      setError(error instanceof Error ? error.message : 'クイズの取得に失敗しました')
      
      // エラー時はモックデータを表示
      setQuizzes([
        {
          id: '1',
          title: '教育デジタル化推進法について',
          deadline: '2025-08-15',
          target_segment: 'all',
          requires_attestation: false,
          status: 'active',
          created_at: '2025-08-01T10:00:00Z',
          question_count: 3,
          estimated_time: 5
        },
        {
          id: '2', 
          title: '情報セキュリティ基本方針 v2.0',
          deadline: '2025-08-20',
          target_segment: 'all',
          requires_attestation: true,
          status: 'active',
          created_at: '2025-08-01T11:00:00Z',
          question_count: 5,
          estimated_time: 8
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const handleQuizPress = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedQuiz(null)
  }

  const startQuiz = (quiz: Quiz) => {
    console.log('クイズ開始:', quiz.id)
    // 実際のアプリではここでクイズ画面に遷移
    alert(`${quiz.title}を開始します！`)
    closeModal()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric'
    })
  }

  const getStatusIcon = (quiz: Quiz) => {
    if (quiz.assignment?.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    if (new Date(quiz.deadline) < new Date()) {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }
    return <Clock className="h-5 w-5 text-blue-600" />
  }

  const getStatusText = (quiz: Quiz) => {
    if (quiz.assignment?.status === 'completed') {
      return '完了'
    }
    if (new Date(quiz.deadline) < new Date()) {
      return '期限切れ'
    }
    return '未回答'
  }

  const getStatusColor = (quiz: Quiz) => {
    if (quiz.assignment?.status === 'completed') {
      return 'text-green-600'
    }
    if (new Date(quiz.deadline) < new Date()) {
      return 'text-red-600'
    }
    return 'text-blue-600'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">新着クイズ</h1>
            <button
              onClick={fetchQuizzes}
              disabled={isLoading}
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? '更新中...' : '更新'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageSquare className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-gray-600">新着クイズはありません</p>
            <p className="text-sm text-gray-500 mt-2">配信ビルダーでクイズを配信してください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => handleQuizPress(quiz)}
                className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>{quiz.question_count}問</span>
                      <span>約{quiz.estimated_time}分</span>
                      <span>期限: {formatDeadline(quiz.deadline)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    {getStatusIcon(quiz)}
                    <span className={`text-sm font-medium ${getStatusColor(quiz)}`}>
                      {getStatusText(quiz)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>配信日: {formatDate(quiz.created_at)}</span>
                  {quiz.requires_attestation && (
                    <span className="text-red-600 font-medium">🔒 同意必須</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Detail Modal */}
      {isModalOpen && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-lg sm:rounded-lg p-6 m-0 sm:m-4 w-full sm:w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">{selectedQuiz.title}</h3>
            <div className="text-gray-600 mb-4 space-y-2">
              <p>{selectedQuiz.question_count}問のクイズです。</p>
              <p>推定時間: 約{selectedQuiz.estimated_time}分</p>
              <p>期限: {formatDeadline(selectedQuiz.deadline)}</p>
              {selectedQuiz.requires_attestation && (
                <p className="text-red-600 font-medium">🔒 このクイズは同意が必要です</p>
              )}
              {selectedQuiz.assignment?.status === 'completed' && (
                <p className="text-green-600 font-medium">✓ 完了済み (スコア: {selectedQuiz.assignment.score}点)</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              {selectedQuiz.assignment?.status !== 'completed' && (
                <button
                  onClick={() => startQuiz(selectedQuiz)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  開始
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}