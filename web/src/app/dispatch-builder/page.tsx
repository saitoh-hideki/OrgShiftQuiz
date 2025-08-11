'use client'

import Link from 'next/link'
import { ArrowLeft, MessageSquare, Plus, Calendar, Users, Settings, Send, Eye, Save, RefreshCw, X } from 'lucide-react'
import { useState, useEffect } from 'react'
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

let supabase = createSupabaseClient()

// テストモード用の会社ID
const TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000001'

export default function DispatchBuilderPage() {
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([])
  const [dispatchSettings, setDispatchSettings] = useState({
    title: '',
    deadline: '',
    targetSegment: 'all',
    requiresAttestation: false,
    notificationEnabled: true
  })
  
  // データ状態
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // プレビュー表示用の状態
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)

  // 初期化
  useEffect(() => {
    checkConfiguration()
    if (isConfigured) {
      loadTrayItems()
    }
  }, [isConfigured])

  const checkConfiguration = () => {
    const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                          process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
    const hasAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
    
    const configured = Boolean(hasSupabaseUrl && hasAnonKey)
    setIsConfigured(configured)
    
    if (!configured) {
      setError('Supabaseの設定が完了していません。環境変数を設定してください。')
    }
  }

  const loadTrayItems = async () => {
    if (!isConfigured) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('tray_itemsからデータを読み込み中...')
      
      const { data: trayItems, error: trayError } = await supabase
        .from('tray_items')
        .select('*')
        .eq('company_id', TEST_COMPANY_ID)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
      
      if (trayError) {
        console.error('tray_items読み込みエラー:', trayError)
        throw new Error(`データ読み込みエラー: ${trayError.message}`)
      }
      
      console.log('読み込まれたtray_items:', trayItems)
      
      // クイズデータを整形
      const quizzes = trayItems?.map(item => ({
        id: item.id,
        title: item.title,
        source: item.origin === 'news' ? 'News' : 
                item.origin === 'policy' ? 'Policy' : 'Manual',
        questions: item.content?.questions?.length || 0,
        estimatedTime: Math.ceil((item.content?.questions?.length || 0) * 1.5), // 1問あたり1.5分と仮定
        status: item.status,
        requiresAttestation: item.origin === 'policy', // Policy文書は同意必須と仮定
        content: item.content,
        metadata: item.metadata,
        created_at: item.created_at
      })) || []
      
      setAvailableQuizzes(quizzes)
      console.log('整形されたクイズデータ:', quizzes)
      
    } catch (error) {
      console.error('データ読み込みエラー:', error)
      setError(error instanceof Error ? error.message : 'データの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const segments = [
    { id: 'all', name: '全社員', count: 156 },
    { id: 'management', name: '管理職', count: 25 },
    { id: 'it', name: 'IT部門', count: 32 },
    { id: 'hr', name: '人事部', count: 18 },
    { id: 'new_employees', name: '新入社員', count: 12 }
  ]

  const toggleQuizSelection = (quizId: string) => {
    setSelectedQuizzes(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    )
  }

  const selectedQuizData = availableQuizzes.filter(quiz => selectedQuizzes.includes(quiz.id))
  const totalQuestions = selectedQuizData.reduce((sum, quiz) => sum + quiz.questions, 0)
  const estimatedTotalTime = selectedQuizData.reduce((sum, quiz) => sum + quiz.estimatedTime, 0)

  // 配信開始処理
  const handleDispatchStart = async () => {
    if (!isConfigured) {
      setError('Supabaseの設定が完了していません')
      return
    }
    
    if (selectedQuizzes.length === 0) {
      setError('配信するクイズを選択してください')
      return
    }
    
    if (!dispatchSettings.title) {
      setError('配信タイトルを入力してください')
      return
    }
    
    if (!dispatchSettings.deadline) {
      setError('回答期限を設定してください')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      console.log('配信開始処理を開始:', {
        selectedQuizzes,
        dispatchSettings,
        selectedQuizData
      })

      // 1. 配信クイズを作成
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          company_id: TEST_COMPANY_ID,
          title: dispatchSettings.title,
          deadline: dispatchSettings.deadline,
          target_segment: dispatchSettings.targetSegment,
          requires_attestation: dispatchSettings.requiresAttestation,
          notification_enabled: dispatchSettings.notificationEnabled,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (quizError) {
        console.error('Quiz作成エラー:', quizError)
        throw new Error(`Quiz作成エラー: ${quizError.message}`)
      }

      console.log('Quiz作成完了:', quiz)

      // 2. 選択されたクイズの内容をquestionsテーブルに保存
      for (const trayItem of selectedQuizData) {
        const questions = trayItem.content?.questions || []
        
        for (const questionData of questions) {
          // Questionを作成
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .insert({
              quiz_id: quiz.id,
              source_type: trayItem.source.toLowerCase(),
              question_text: questionData.question,
              options: questionData.options,
              correct_answer: questionData.correct_answer,
              explanation: questionData.explanation || '',
              citation_url: trayItem.metadata?.source_url,
              citation_quote: trayItem.title,
              policy_doc_id: trayItem.source.toLowerCase() === 'policy' ? trayItem.id : null,
              policy_version: trayItem.metadata?.version
            })
            .select()
            .single()

          if (questionError) {
            console.warn(`Question作成エラー: ${questionError.message}`)
            continue
          }

          // Optionsを作成
          for (let i = 0; i < questionData.options.length; i++) {
            const option = questionData.options[i]
            const isCorrect = option === questionData.correct_answer
            
            await supabase
              .from('options')
              .insert({
                question_id: question.id,
                option_text: option,
                is_correct: isCorrect
              })
          }
        }
      }

      // 3. Quiz Assignmentsを作成（テストモードでは全員に割り当て）
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', TEST_COMPANY_ID)
        .limit(10) // テスト用に制限

      if (users && users.length > 0) {
        const assignments = users.map(user => ({
          quiz_id: quiz.id,
          user_id: user.id,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        }))

        const { error: assignmentError } = await supabase
          .from('quiz_assignments')
          .insert(assignments)

        if (assignmentError) {
          console.warn('Quiz assignments作成エラー:', assignmentError)
        }
      }

      // 4. 配信完了メッセージ
      console.log('配信完了:', quiz)
      setSuccessMessage(`配信が完了しました！\n\nタイトル: ${dispatchSettings.title}\n問題数: ${totalQuestions}問\n期限: ${dispatchSettings.deadline}\n\nスマホアプリで新着クイズとして表示されます。`)

      // 5. フォームをリセット
      setSelectedQuizzes([])
      setDispatchSettings({
        title: '',
        deadline: '',
        targetSegment: 'all',
        requiresAttestation: false,
        notificationEnabled: true
      })

      // 6. 成功メッセージを5秒後に自動で消す
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)

    } catch (error) {
      console.error('配信開始エラー:', error)
      setError(`配信開始に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // プレビュー表示
  const handlePreview = () => {
    if (selectedQuizzes.length === 0) return
    
    const previewQuizzes = selectedQuizData.map(quiz => ({
      ...quiz,
      questions: quiz.content?.questions || []
    }))
    
    setPreviewData({
      title: dispatchSettings.title || '（タイトル未設定）',
      deadline: dispatchSettings.deadline || '（期限未設定）',
      targetSegment: dispatchSettings.targetSegment || '（対象未設定）',
      requiresAttestation: dispatchSettings.requiresAttestation,
      notificationEnabled: dispatchSettings.notificationEnabled,
      quizzes: previewQuizzes
    })
    
    setIsPreviewOpen(true)
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
          <h1 className="text-3xl font-bold text-gray-900">配信ビルダー</h1>
          <p className="text-gray-600 mt-2">クイズの束ね、セグメント設定、配信管理</p>
        </div>

        {/* 設定未完了の場合の表示 */}
        {!isConfigured ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Settings className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">設定が必要です</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              環境変数 NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Quiz Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 text-red-400">⚠️</div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 text-green-400">✅</div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800 whitespace-pre-line">{successMessage}</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        onClick={() => setSuccessMessage(null)}
                        className="text-green-400 hover:text-green-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Selection */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">配信可能なクイズ</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {isLoading ? '読み込み中...' : `${availableQuizzes.length}件のクイズ`}
                      </span>
                      <button
                        onClick={loadTrayItems}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="更新"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {error ? (
                    <div className="text-center py-8">
                      <div className="text-red-600 mb-2">エラーが発生しました</div>
                      <div className="text-sm text-gray-600 mb-4">{error}</div>
                      <button
                        onClick={loadTrayItems}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        再試行
                      </button>
                    </div>
                  ) : isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <div className="text-gray-600">クイズデータを読み込み中...</div>
                    </div>
                  ) : availableQuizzes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-lg mb-2">クイズがありません</div>
                      <div className="text-sm">
                        コンテンツハブでクイズを生成してください
                      </div>
                      <Link 
                        href="/content-hub"
                        className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        コンテンツハブへ
                      </Link>
                    </div>
                  ) : (
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
                                  <span className="ml-2 text-xs text-gray-500">
                                    {new Date(quiz.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="例: 8月度 必須研修クイズ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">回答期限</label>
                    <input
                      type="date"
                      value={dispatchSettings.deadline}
                      onChange={(e) => setDispatchSettings(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">配信対象</label>
                    <select
                      value={dispatchSettings.targetSegment}
                      onChange={(e) => setDispatchSettings(prev => ({ ...prev, targetSegment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                      onClick={handlePreview}
                      disabled={selectedQuizzes.length === 0}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                      onClick={handleDispatchStart}
                      disabled={selectedQuizzes.length === 0 || !dispatchSettings.title || !dispatchSettings.deadline || isLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          配信中...
                        </div>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          配信開始
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    配信開始後は設定変更できません
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* プレビューモーダル */}
      {isPreviewOpen && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">配信プレビュー</h3>
              <button onClick={() => setIsPreviewOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* 配信設定 */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-900 mb-2">配信設定</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">タイトル:</span>
                    <span className="ml-2 font-medium">{previewData.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">期限:</span>
                    <span className="ml-2 font-medium">{previewData.deadline}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">対象セグメント:</span>
                    <span className="ml-2 font-medium">{previewData.targetSegment}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">同意必須:</span>
                    <span className="ml-2 font-medium">{previewData.requiresAttestation ? 'はい' : 'いいえ'}</span>
                  </div>
                </div>
              </div>

              {/* クイズ一覧 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">選択されたクイズ ({previewData.quizzes.length}件)</h4>
                <div className="space-y-4">
                  {previewData.quizzes.map((quiz: any, index: number) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">
                          {index + 1}. {quiz.title}
                        </h5>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          quiz.source === 'News' ? 'bg-blue-100 text-blue-800' :
                          quiz.source === 'Policy' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {quiz.source}
                        </span>
                      </div>
                      
                      {/* 問題内容 */}
                      {quiz.questions && quiz.questions.length > 0 ? (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">
                            問題数: {quiz.questions.length}問
                          </div>
                          {quiz.questions.map((question: any, qIndex: number) => (
                            <div key={qIndex} className="bg-gray-50 p-3 rounded">
                              <div className="text-sm font-medium text-gray-900 mb-2">
                                問題{qIndex + 1}: {question.question}
                              </div>
                              {question.options && (
                                <div className="space-y-1">
                                  {question.options.map((option: string, oIndex: number) => (
                                    <div key={oIndex} className="text-xs text-gray-700">
                                      {String.fromCharCode(65 + oIndex)}. {option}
                                      {option === question.correct_answer && (
                                        <span className="ml-2 text-green-600 font-medium">✓ 正解</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          ⚠️ このクイズには問題が含まれていません
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 閉じるボタン */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}