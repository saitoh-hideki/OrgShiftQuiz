'use client'

import { useState } from 'react'
import { Clock, CheckCircle, Lock } from 'lucide-react'

const mockQuizzes = [
  {
    id: '1',
    title: '教育デジタル化推進法について',
    source: 'News',
    deadline: '2025-08-15',
    questions: 3,
    completed: false
  },
  {
    id: '2', 
    title: '情報セキュリティ基本方針 v2.0',
    source: 'Policy',
    deadline: '2025-08-20',
    questions: 5,
    completed: false,
    requiresAttestation: true
  },
  {
    id: '3',
    title: 'リモートワーク FAQ',
    source: 'Manual', 
    deadline: '2025-08-25',
    questions: 4,
    completed: true
  }
]

export default function MobileDemoPage() {
  const [quizzes, setQuizzes] = useState(mockQuizzes)
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)

  const handleQuizPress = (quiz: any) => {
    setSelectedQuiz(quiz)
  }

  const closeModal = () => {
    setSelectedQuiz(null)
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'News': return 'bg-blue-100 text-blue-800'
      case 'Policy': return 'bg-green-100 text-green-800'  
      case 'Manual': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="text-center">
          <h1 className="text-xl font-bold">OrgShift Quiz</h1>
          <p className="text-sm opacity-90 mt-1">組織の理解を深めるクイズ</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">新着クイズ</h2>
        
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${
                quiz.completed ? 'opacity-70' : ''
              }`}
              onClick={() => handleQuizPress(quiz)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 flex-1 mr-3 leading-tight">
                  {quiz.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(quiz.source)}`}>
                  {quiz.source}
                </span>
              </div>
              
              {/* Body */}
              <div className="text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-4">
                  <span>{quiz.questions}問</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    期限: {quiz.deadline}
                  </span>
                </div>
                {quiz.requiresAttestation && (
                  <div className="flex items-center gap-1 text-red-600 mt-1">
                    <Lock className="h-3 w-3" />
                    <span className="font-medium">同意必須</span>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex justify-end">
                {quiz.completed ? (
                  <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                    <CheckCircle className="h-4 w-4" />
                    完了
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600 font-medium text-sm">
                    <Clock className="h-4 w-4" />
                    未回答
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-lg sm:rounded-lg p-6 m-0 sm:m-4 w-full sm:w-96">
            <h3 className="text-lg font-semibold mb-2">{selectedQuiz.title}</h3>
            <div className="text-gray-600 mb-4">
              <p>{selectedQuiz.questions}問のクイズです。</p>
              <p>出典: {selectedQuiz.source}</p>
              <p>期限: {selectedQuiz.deadline}</p>
              {selectedQuiz.requiresAttestation && (
                <p className="text-red-600 font-medium">🔒 このクイズは同意が必要です</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  console.log('Quiz started:', selectedQuiz.id)
                  closeModal()
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                開始
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}