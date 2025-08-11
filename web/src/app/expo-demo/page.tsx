'use client'

import { useState } from 'react'

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
];

export default function ExpoDemoPage() {
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)

  const handleQuizPress = (quiz: any) => {
    alert(`${quiz.title}\n\n${quiz.questions}問のクイズです。\n出典: ${quiz.source}\n期限: ${quiz.deadline}${quiz.requiresAttestation ? '\n\n🔒 このクイズは同意が必要です' : ''}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Status Bar Simulation */}
      <div className="h-6 bg-black text-white text-xs flex justify-between items-center px-4">
        <span>9:41</span>
        <span>●●●●● WiFi 100%</span>
      </div>
      
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 pb-6">
        <div className="text-center">
          <h1 className="text-xl font-bold">OrgShift Quiz</h1>
          <p className="text-sm opacity-90 mt-1">組織の理解を深めるクイズ</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">新着クイズ</h2>
        
        <div className="space-y-3">
          {mockQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className={`bg-white rounded-lg p-4 shadow-sm border-2 border-transparent cursor-pointer transition-all duration-200 active:bg-gray-50 active:border-indigo-200 ${
                quiz.completed ? 'opacity-70' : ''
              }`}
              onClick={() => handleQuizPress(quiz)}
              style={{ 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 flex-1 mr-3 leading-tight text-base">
                  {quiz.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  quiz.source === 'News' ? 'bg-blue-100 text-blue-800' :
                  quiz.source === 'Policy' ? 'bg-green-100 text-green-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {quiz.source}
                </span>
              </div>
              
              {/* Body */}
              <div className="text-sm text-gray-600 mb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span>{quiz.questions}問</span>
                  <span>期限: {quiz.deadline}</span>
                </div>
                {quiz.requiresAttestation && (
                  <div className="text-red-600 font-medium text-xs">
                    🔒 同意必須
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex justify-end">
                {quiz.completed ? (
                  <div className="text-green-600 font-medium text-sm">
                    ✅ 完了
                  </div>
                ) : (
                  <div className="text-orange-600 font-medium text-sm">
                    ⏳ 未回答
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Home Indicator (iPhone style) */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full opacity-60"></div>
    </div>
  )
}