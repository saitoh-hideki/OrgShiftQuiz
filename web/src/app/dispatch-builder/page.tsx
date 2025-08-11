'use client'

import Link from 'next/link'
import { ArrowLeft, MessageSquare, Plus, Calendar, Users, Settings, Send, Eye, Save } from 'lucide-react'
import { useState } from 'react'

export default function DispatchBuilderPage() {
  const [selectedQuizzes, setSelectedQuizzes] = useState<number[]>([])
  const [dispatchSettings, setDispatchSettings] = useState({
    title: '',
    deadline: '',
    targetSegment: 'all',
    requiresAttestation: false,
    notificationEnabled: true
  })

  const availableQuizzes = [
    {
      id: 1,
      title: '教育デジタル化推進法について',
      source: 'News',
      questions: 3,
      estimatedTime: 5,
      status: 'approved'
    },
    {
      id: 2,
      title: '情報セキュリティ基本方針 v2.1',
      source: 'Policy',
      questions: 5,
      estimatedTime: 8,
      status: 'approved',
      requiresAttestation: true
    },
    {
      id: 3,
      title: 'システム利用マニュアル',
      source: 'Manual',
      questions: 4,
      estimatedTime: 6,
      status: 'approved'
    },
    {
      id: 4,
      title: 'リモートワーク規程',
      source: 'Policy',
      questions: 3,
      estimatedTime: 4,
      status: 'approved'
    }
  ]

  const segments = [
    { id: 'all', name: '全社員', count: 156 },
    { id: 'management', name: '管理職', count: 25 },
    { id: 'it', name: 'IT部門', count: 32 },
    { id: 'hr', name: '人事部', count: 18 },
    { id: 'new_employees', name: '新入社員', count: 12 }
  ]

  const toggleQuizSelection = (quizId: number) => {
    setSelectedQuizzes(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    )
  }

  const selectedQuizData = availableQuizzes.filter(quiz => selectedQuizzes.includes(quiz.id))
  const totalQuestions = selectedQuizData.reduce((sum, quiz) => sum + quiz.questions, 0)
  const estimatedTotalTime = selectedQuizData.reduce((sum, quiz) => sum + quiz.estimatedTime, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">配信ビルダー</h1>
          <p className="text-gray-600 mt-2">クイズの束ね、セグメント設定、配信管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quiz Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Selection */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">配信可能なクイズ</h2>
                  <span className="text-sm text-gray-500">{availableQuizzes.length}件の承認済みクイズ</span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {availableQuizzes.map((quiz) => (
                    <div 
                      key={quiz.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedQuizzes.includes(quiz.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleQuizSelection(quiz.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedQuizzes.includes(quiz.id)}
                            onChange={() => toggleQuizSelection(quiz.id)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full mr-2 ${
                                quiz.source === 'News' ? 'bg-blue-100 text-blue-800' :
                                quiz.source === 'Policy' ? 'bg-green-100 text-green-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {quiz.source}
                              </span>
                              <span>{quiz.questions}問 • 約{quiz.estimatedTime}分</span>
                              {quiz.requiresAttestation && (
                                <span className="ml-2 text-xs text-red-600 font-medium">🔒 同意必須</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dispatch Settings */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">配信設定</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">配信タイトル</label>
                  <input
                    type="text"
                    value={dispatchSettings.title}
                    onChange={(e) => setDispatchSettings(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 8月度 必須研修クイズ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">回答期限</label>
                  <input
                    type="date"
                    value={dispatchSettings.deadline}
                    onChange={(e) => setDispatchSettings(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">配信対象</label>
                  <select
                    value={dispatchSettings.targetSegment}
                    onChange={(e) => setDispatchSettings(prev => ({ ...prev, targetSegment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name} ({segment.count}名)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dispatchSettings.requiresAttestation}
                      onChange={(e) => setDispatchSettings(prev => ({ ...prev, requiresAttestation: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">同意必須クイズを含む</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dispatchSettings.notificationEnabled}
                      onChange={(e) => setDispatchSettings(prev => ({ ...prev, notificationEnabled: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">プッシュ通知を送信</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">配信プレビュー</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">選択済みクイズ</div>
                    <div className="text-2xl font-bold text-blue-600">{selectedQuizzes.length}件</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">総問題数</div>
                    <div className="text-2xl font-bold text-green-600">{totalQuestions}問</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">推定所要時間</div>
                    <div className="text-2xl font-bold text-orange-600">約{estimatedTotalTime}分</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">配信対象</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {segments.find(s => s.id === dispatchSettings.targetSegment)?.name || '未選択'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {segments.find(s => s.id === dispatchSettings.targetSegment)?.count || 0}名
                    </div>
                  </div>
                </div>

                {selectedQuizData.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2">選択されたクイズ:</div>
                    <div className="space-y-2">
                      {selectedQuizData.map((quiz) => (
                        <div key={quiz.id} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                          {quiz.title} ({quiz.questions}問)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="space-y-3">
                  <button 
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={selectedQuizzes.length === 0 || !dispatchSettings.title}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    プレビュー
                  </button>
                  
                  <button 
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    disabled={selectedQuizzes.length === 0 || !dispatchSettings.title}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    下書き保存
                  </button>
                  
                  <button 
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={selectedQuizzes.length === 0 || !dispatchSettings.title || !dispatchSettings.deadline}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    配信開始
                  </button>
                </div>
                
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  配信開始後は設定変更できません
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}