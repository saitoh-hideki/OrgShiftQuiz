'use client'

import Link from 'next/link'
import { ArrowLeft, Newspaper, FileText, BookOpen, Plus, Clock, CheckCircle, AlertCircle, X, Download, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// テストモード用の会社ID
const TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000001'

export default function ContentHubPage() {
  const [isRssDialogOpen, setIsRssDialogOpen] = useState(false)
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // RSS追加用の状態
  const [rssForm, setRssForm] = useState({
    name: '',
    url: '',
    category: 'it'
  })
  
  // Policy追加用の状態
  const [policyForm, setPolicyForm] = useState({
    title: '',
    version: '',
    effectiveDate: '',
    category: '',
    file: null as File | null
  })
  
  // Manual追加用の状態
  const [manualForm, setManualForm] = useState({
    title: '',
    question: '',
    correct: '',
    distractors: ['', '', '']
  })

  // データ状態
  const [newsSources, setNewsSources] = useState<any[]>([])
  const [newsArticles, setNewsArticles] = useState<any[]>([])
  const [policyDocuments, setPolicyDocuments] = useState<any[]>([])
  const [manualDrafts, setManualDrafts] = useState<any[]>([])

  // 初期データ読み込み
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // RSSソース読み込み
      const { data: sources } = await supabase
        .from('news_sources')
        .select('*')
        .eq('company_id', TEST_COMPANY_ID)
        .eq('is_active', true)
      
      if (sources) setNewsSources(sources)

      // 記事読み込み
      const { data: articles } = await supabase
        .from('news_articles')
        .select('*')
        .eq('company_id', TEST_COMPANY_ID)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (articles) setNewsArticles(articles)

      // Policy文書読み込み
      const { data: policies } = await supabase
        .from('policy_documents')
        .select('*')
        .eq('company_id', TEST_COMPANY_ID)
        .order('created_at', { ascending: false })
      
      if (policies) setPolicyDocuments(policies)

      // Manual下書き読み込み
      const { data: manuals } = await supabase
        .from('manual_drafts')
        .select('*')
        .eq('company_id', TEST_COMPANY_ID)
        .order('created_at', { ascending: false })
      
      if (manuals) setManualDrafts(manuals)

    } catch (error) {
      console.error('データ読み込みエラー:', error)
      showToast('error', 'データの読み込みに失敗しました')
    }
  }

  // RSS追加
  const handleRssAdd = async () => {
    if (!rssForm.name || !rssForm.url) {
      showToast('error', '名前とURLを入力してください')
      return
    }

    if (!rssForm.url.startsWith('http://') && !rssForm.url.startsWith('https://')) {
      showToast('error', '有効なURLを入力してください')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('news_sources')
        .insert({
          company_id: TEST_COMPANY_ID,
          name: rssForm.name,
          url: rssForm.url,
          category: rssForm.category
        })

      if (error) throw error

      showToast('success', 'RSSソースを追加しました')
      setIsRssDialogOpen(false)
      setRssForm({ name: '', url: '', category: 'it' })
      loadData()
    } catch (error) {
      console.error('RSS追加エラー:', error)
      showToast('error', 'RSSソースの追加に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 最新記事取得
  const handleFetchLatest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/news-pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await response.json()
      
      if (result.ok) {
        showToast('success', `${result.inserted}件の記事を取得しました`)
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('記事取得エラー:', error)
      showToast('error', '記事の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // Policy追加
  const handlePolicyAdd = async () => {
    if (!policyForm.title || !policyForm.version || !policyForm.file) {
      showToast('error', '必須項目を入力してください')
      return
    }

    setIsLoading(true)
    try {
      // ファイルアップロード（簡易実装）
      const storagePath = `policy_docs/${Date.now()}_${policyForm.file.name}`
      
      const { error } = await supabase
        .from('policy_documents')
        .insert({
          company_id: TEST_COMPANY_ID,
          title: policyForm.title,
          version: policyForm.version,
          effective_date: policyForm.effectiveDate || null,
          category: policyForm.category || null,
          storage_path: storagePath,
          summary: `${policyForm.title}の${policyForm.version}版`
        })

      if (error) throw error

      showToast('success', 'Policy文書を追加しました')
      setIsPolicyDialogOpen(false)
      setPolicyForm({ title: '', version: '', effectiveDate: '', category: '', file: null })
      loadData()
    } catch (error) {
      console.error('Policy追加エラー:', error)
      showToast('error', 'Policy文書の追加に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // Manual追加
  const handleManualAdd = async () => {
    if (!manualForm.title || !manualForm.question || !manualForm.correct) {
      showToast('error', '必須項目を入力してください')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('manual_drafts')
        .insert({
          company_id: TEST_COMPANY_ID,
          title: manualForm.title,
          question: manualForm.question,
          correct: manualForm.correct,
          distractors: manualForm.distractors.filter(d => d.trim())
        })

      if (error) throw error

      showToast('success', 'Manual下書きを追加しました')
      setIsManualDialogOpen(false)
      setManualForm({ title: '', question: '', correct: '', distractors: ['', '', ''] })
      loadData()
    } catch (error) {
      console.error('Manual追加エラー:', error)
      showToast('error', 'Manual下書きの追加に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 記事からクイズ生成
  const handleGenerateQuiz = async (articleId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/news-generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      })
      
      const result = await response.json()
      
      if (result.ok) {
        showToast('success', `${result.count}問のクイズを生成しました`)
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('クイズ生成エラー:', error)
      showToast('error', 'クイズの生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // Policyからクイズ生成
  const handlePolicyQuizGenerate = async (policyId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/policy-generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId })
      })
      
      const result = await response.json()
      
      if (result.ok) {
        showToast('success', `${result.count}問のクイズを生成しました`)
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('クイズ生成エラー:', error)
      showToast('error', 'クイズの生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
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
          <h1 className="text-3xl font-bold text-gray-900">コンテンツハブ</h1>
          <p className="text-gray-600 mt-2">News・Policy・Manualの管理とAIクイズ生成</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* News Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Newspaper className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">News</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsRssDialogOpen(true)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    RSS追加
                  </button>
                  <button 
                    onClick={handleFetchLatest}
                    disabled={isLoading}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    最新取得
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {newsArticles.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">記事がありません</p>
                ) : (
                  newsArticles.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        {item.source_id ? 'RSSソース' : '手動追加'} • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs">
                          {item.status === 'quiz_generated' ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              クイズ生成済み
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              クイズ未生成
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleGenerateQuiz(item.id)}
                            disabled={isLoading || item.status === 'quiz_generated'}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50"
                          >
                            {item.status === 'quiz_generated' ? '生成済み' : 'クイズ生成'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Policy Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Policy</h2>
                </div>
                <button 
                  onClick={() => setIsPolicyDialogOpen(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  文書追加
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {policyDocuments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Policy文書がありません</p>
                ) : (
                  policyDocuments.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          下書き
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600 mb-3">
                        <span>{item.version}</span>
                        {item.effective_date && (
                          <>
                            <span className="mx-2">•</span>
                            <span>施行日: {item.effective_date}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-red-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          同意必須
                        </div>
                        <button 
                          onClick={() => handlePolicyQuizGenerate(item.id)}
                          disabled={isLoading}
                          className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 disabled:opacity-50"
                        >
                          クイズ生成
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Manual Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-orange-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Manual</h2>
                </div>
                <button 
                  onClick={() => setIsManualDialogOpen(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  手入力
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {manualDrafts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Manual下書きがありません</p>
                ) : (
                  manualDrafts.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          下書き
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        設問: {item.question.substring(0, 50)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          手動作成
                        </div>
                        <button className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded hover:bg-orange-100">
                          編集
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">承認待ちコンテンツ</h3>
            <div className="text-2xl font-bold text-orange-600">
              {newsArticles.filter(a => a.status === 'needs_review').length + 
               policyDocuments.filter(p => p.status === 'pending_approval').length}
            </div>
            <p className="text-sm text-gray-600">
              Policy: {policyDocuments.filter(p => p.status === 'pending_approval').length}件, 
              News: {newsArticles.filter(a => a.status === 'needs_review').length}件
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">今月の生成クイズ</h3>
            <div className="text-2xl font-bold text-blue-600">
              {newsArticles.filter(a => a.status === 'quiz_generated').length + 
               policyDocuments.length}
            </div>
            <p className="text-sm text-gray-600">
              自動生成: {newsArticles.filter(a => a.status === 'quiz_generated').length}件, 
              手動: {manualDrafts.length}件
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">配信待ちTray</h3>
            <div className="text-2xl font-bold text-green-600">
              {newsArticles.filter(a => a.status === 'quiz_generated').length + 
               policyDocuments.length + manualDrafts.length}
            </div>
            <p className="text-sm text-gray-600">承認済み、配信可能</p>
          </div>
        </div>
      </div>

      {/* RSS追加ダイアログ */}
      {isRssDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">RSSソース追加</h3>
              <button onClick={() => setIsRssDialogOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                <input
                  type="text"
                  value={rssForm.name}
                  onChange={(e) => setRssForm({ ...rssForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: NHK NEWS WEB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={rssForm.url}
                  onChange={(e) => setRssForm({ ...rssForm, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <select
                  value={rssForm.category}
                  onChange={(e) => setRssForm({ ...rssForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="it">IT</option>
                  <option value="education">教育</option>
                  <option value="localgov">自治体</option>
                  <option value="regional">地域</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRssAdd}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? '追加中...' : '追加'}
                </button>
                <button
                  onClick={() => setIsRssDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy追加ダイアログ */}
      {isPolicyDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Policy文書追加</h3>
              <button onClick={() => setIsPolicyDialogOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                <input
                  type="text"
                  value={policyForm.title}
                  onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 情報セキュリティ基本方針"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">版</label>
                <input
                  type="text"
                  value={policyForm.version}
                  onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: v2.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">施行日</label>
                <input
                  type="date"
                  value={policyForm.effectiveDate}
                  onChange={(e) => setPolicyForm({ ...policyForm, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <input
                  type="text"
                  value={policyForm.category}
                  onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: セキュリティ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ファイル</label>
                <input
                  type="file"
                  onChange={(e) => setPolicyForm({ ...policyForm, file: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  accept=".pdf,.docx,.txt"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePolicyAdd}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? '追加中...' : '追加'}
                </button>
                <button
                  onClick={() => setIsPolicyDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual追加ダイアログ */}
      {isManualDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manual下書き追加</h3>
              <button onClick={() => setIsManualDialogOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                <input
                  type="text"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: システム利用マニュアル"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">設問</label>
                <textarea
                  value={manualForm.question}
                  onChange={(e) => setManualForm({ ...manualForm, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="設問文を入力してください"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">正解</label>
                <input
                  type="text"
                  value={manualForm.correct}
                  onChange={(e) => setManualForm({ ...manualForm, correct: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="正解を入力してください"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">誤答肢（3つ）</label>
                {manualForm.distractors.map((distractor, index) => (
                  <input
                    key={index}
                    type="text"
                    value={distractor}
                    onChange={(e) => {
                      const newDistractors = [...manualForm.distractors]
                      newDistractors[index] = e.target.value
                      setManualForm({ ...manualForm, distractors: newDistractors })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    placeholder={`誤答肢${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleManualAdd}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {isLoading ? '追加中...' : '追加'}
                </button>
                <button
                  onClick={() => setIsManualDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast通知 */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">処理中...</p>
          </div>
        </div>
      )}
    </div>
  )
}