'use client'

import Link from 'next/link'
import { ArrowLeft, Newspaper, FileText, BookOpen, Plus, Clock, CheckCircle, AlertCircle, X, Download, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアント
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  console.log('Supabaseクライアント作成:', { 
    url: supabaseUrl, 
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0
  })
  
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

export default function ContentHubPage() {
  const [isRssDialogOpen, setIsRssDialogOpen] = useState(false)
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  
  // 個別のローディング状態
  const [generatingQuizFor, setGeneratingQuizFor] = useState<string | null>(null)
  
  // クイズプレビュー用の状態
  const [isQuizPreviewOpen, setIsQuizPreviewOpen] = useState(false)
  const [previewQuiz, setPreviewQuiz] = useState<any>(null)
  const [previewSourceType, setPreviewSourceType] = useState<'policy' | 'news' | null>(null)
  
  // RSS追加用の状態
  const [rssForm, setRssForm] = useState({
    name: '',
    url: '',
    category: 'it'
  })
  
  // Document追加用の状態
  const [documentForm, setDocumentForm] = useState({
    title: '',
    effectiveDate: '',
    category: '',
    file: null as File | null
  })
  
  // Manual追加用の状態
  const [manualForm, setManualForm] = useState({
    title: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard'
      }
    ]
  })

  // データ状態
  const [newsSources, setNewsSources] = useState<any[]>([])
  const [newsArticles, setNewsArticles] = useState<any[]>([])
  const [documentItems, setDocumentItems] = useState<any[]>([])
  const [manualDrafts, setManualDrafts] = useState<any[]>([])
  const [fallbackQuiz, setFallbackQuiz] = useState<any>(null)

  // 初期データ読み込み
  useEffect(() => {
    checkConfiguration()
    if (isConfigured) {
      // Supabaseクライアントを再作成してスキーマキャッシュをリフレッシュ
      refreshSupabaseClient()
      testDatabaseConnection()
      loadData()
      checkFallbackQuiz()
    }
  }, [isConfigured])

  // Supabaseクライアントを再作成する関数
  const refreshSupabaseClient = () => {
    console.log('Supabaseクライアントを再作成中...')
    supabase = createSupabaseClient()
    console.log('Supabaseクライアントの再作成完了')
  }

  // Supabaseスキーマキャッシュをリフレッシュする関数
  const refreshSupabaseSchema = async () => {
    try {
      console.log('Supabaseスキーマキャッシュをリフレッシュ中...')
      // スキーマ情報を取得してキャッシュを更新
      await supabase.rpc('get_schema_info')
      console.log('スキーマキャッシュのリフレッシュ完了')
    } catch (error) {
      console.log('スキーマキャッシュのリフレッシュに失敗（これは正常な動作です）:', error)
      // エラーが発生しても続行（RPCが存在しない場合）
    }
  }

  const checkConfiguration = () => {
    const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                          process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
    const hasAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
    
    const configured = Boolean(hasSupabaseUrl && hasAnonKey)
    setIsConfigured(configured)
    
    if (!configured) {
      showToast('error', 'Supabaseの設定が完了していません。環境変数を設定してください。')
    }
  }

  const loadData = async () => {
    if (!isConfigured) return
    
    try {
      // RSSソース読み込み
      const { data: sources } = await supabase
        .from('news_sources')
        .select('*')
        .eq('company_id', TEST_COMPANY_ID)
        .eq('is_active', true)
      
      if (sources) setNewsSources(sources)

      // 記事読み込み（RSSソース情報も含める）
      const { data: articles } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_sources!inner(name)
        `)
        .eq('company_id', TEST_COMPANY_ID)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (articles) setNewsArticles(articles)

      // Document文書読み込み
      const { data: documents } = await supabase
        .from('policy_documents')
        .select('*')
        .eq('company_id', TEST_COMPANY_ID)
        .order('created_at', { ascending: false })
      
      if (documents) setDocumentItems(documents)

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
    if (!isConfigured) {
      showToast('error', 'Supabaseの設定が完了していません')
      return
    }
    
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
    if (!isConfigured) {
      showToast('error', 'Supabaseの設定が完了していません')
      return
    }
    
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

  // ファイルからテキストを抽出する関数
  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      if (file.type === 'text/plain') {
        // テキストファイルの場合は直接読み込み
        return await file.text()
      } else if (file.type === 'application/pdf') {
        // PDFファイルの場合はPDF.jsを使用してテキスト抽出
        const pdfjsLib = await import('pdfjs-dist')
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // 最大10ページまで
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
          fullText += pageText + '\n'
        }
        
        return fullText
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Wordファイルの場合はmammoth.jsを使用してテキスト抽出
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        return result.value
      } else {
        throw new Error('Unsupported file type')
      }
    } catch (error) {
      console.error('テキスト抽出エラー:', error)
      throw new Error('ファイルからテキストを抽出できませんでした')
    }
  }

  // Document追加
  const handleDocumentAdd = async () => {
    if (!isConfigured) {
      showToast('error', 'Supabaseの設定が完了していません')
      return
    }
    
    if (!documentForm.title) {
      showToast('error', 'タイトルを入力してください')
      return
    }

    setIsLoading(true)
    try {
      let storagePath = null;
      let fileUrl = null;
      let fileSize = null;
      let fileType = null;
      let originalFilename = null;
      let contentText = '';

      // ファイルがある場合はアップロードとテキスト抽出を試行
      if (documentForm.file) {
        try {
          console.log('ファイルアップロード開始:', { 
            fileName: documentForm.file.name, 
            size: documentForm.file.size, 
            type: documentForm.file.type 
          })
          
          // ファイル名を英数字のみに変換
          const timestamp = Date.now()
          const fileExtension = documentForm.file.name.split('.').pop() || ''
          const safeFileName = `document_${timestamp}.${fileExtension}`
          storagePath = `document_docs/${safeFileName}`
          
          console.log('Storageバケット名:', 'policydocuments')
          console.log('アップロードパス:', storagePath)
          
          // ファイルをSupabase Storageにアップロード
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('policydocuments')
            .upload(storagePath, documentForm.file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Storageアップロードエラー詳細:', {
              message: uploadError.message,
              details: uploadError
            })
            throw new Error(`ファイルアップロードエラー: ${uploadError.message}`)
          }

          console.log('ファイルアップロード成功:', uploadData)

          // ファイルの公開URLを取得
          const { data: urlData } = supabase.storage
            .from('policydocuments')
            .getPublicUrl(storagePath)

          fileUrl = urlData.publicUrl
          fileSize = documentForm.file.size
          fileType = documentForm.file.type
          originalFilename = documentForm.file.name
          
          // ファイルからテキスト内容を抽出
          console.log('テキスト抽出開始...')
          contentText = await extractTextFromFile(documentForm.file)
          console.log('テキスト抽出完了、文字数:', contentText.length)
          
          console.log('ファイルアップロード完了:', { storagePath, fileUrl, fileSize, fileType })
        } catch (fileError) {
          console.warn('ファイル処理に失敗しましたが、Document文書の作成は続行します:', fileError)
          // ファイル処理に失敗してもDocument文書の作成は続行
        }
      }

      console.log('Document文書データベース挿入開始:', {
        company_id: TEST_COMPANY_ID,
        title: documentForm.title,
        storage_path: storagePath,
        file_url: fileUrl,
        content_text_length: contentText.length
      })

      // Document文書をデータベースに保存（テキスト内容も含む）
      const { data: insertData, error: insertError } = await supabase
        .from('policy_documents')
        .insert({
          company_id: TEST_COMPANY_ID,
          title: documentForm.title,
          effective_date: documentForm.effectiveDate || null,
          category: documentForm.category || null,
          storage_path: storagePath,
          summary: `${documentForm.title}`,
          file_url: fileUrl,
          file_size: fileSize,
          file_type: fileType,
          original_filename: originalFilename,
          version: '1.0', // バージョン情報を追加
          content_text: contentText || null // 抽出されたテキスト内容を保存
        })
        .select()

      if (insertError) {
        console.error('データベース挿入エラー:', insertError)
        throw new Error(`データベース挿入エラー: ${insertError.message}`)
      }

      console.log('Document文書挿入成功:', insertData)

      if (documentForm.file && fileUrl) {
        if (contentText) {
          showToast('success', 'Document文書をファイル付きでアップロードし、テキスト内容を抽出しました')
        } else {
          showToast('success', 'Document文書をファイル付きでアップロードしました（テキスト抽出に失敗）')
        }
      } else {
        showToast('success', 'Document文書を作成しました（ファイルなし）')
      }
      setIsPolicyDialogOpen(false)
      setDocumentForm({ title: '', effectiveDate: '', category: '', file: null })
      loadData()
    } catch (error) {
      console.error('Document追加エラー:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast('error', `Document文書のアップロードに失敗しました: ${errorMessage}`)
      
      // より詳細なエラー情報をコンソールに出力
      if (error instanceof Error) {
        console.error('エラーの詳細:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ファイル選択処理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（10MB制限）
      if (file.size > 10 * 1024 * 1024) {
        showToast('error', 'ファイルサイズは10MB以下にしてください')
        return
      }
      
      // ファイル形式チェック
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'PDF、Word、テキストファイルのみアップロード可能です')
        return
      }
      
      setDocumentForm({ ...documentForm, file })
    }
  }

  // ドラッグ&ドロップ処理
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect({ target: { files } } as any)
    }
  }

  // Manual追加
  const handleManualAdd = async () => {
    if (!isConfigured) {
      showToast('error', 'Supabaseの設定が完了していません')
      return
    }
    
    if (!manualForm.title || manualForm.questions.length === 0) {
      showToast('error', 'タイトルと問題を入力してください')
      return
    }

    // 各問題の必須項目チェック
    for (let i = 0; i < manualForm.questions.length; i++) {
      const q = manualForm.questions[i]
      if (!q.question || !q.correct_answer || q.options.some(opt => !opt.trim())) {
        showToast('error', `問題${i + 1}の必須項目を入力してください`)
        return
      }
    }

    setIsLoading(true)
    try {
      // 各問題を個別に保存
      for (const questionData of manualForm.questions) {
        const { error } = await supabase
          .from('manual_drafts')
          .insert({
            company_id: TEST_COMPANY_ID,
            title: manualForm.title,
            question: questionData.question,
            correct: questionData.correct_answer,
            distractors: questionData.options.filter(opt => opt !== questionData.correct_answer)
          })

        if (error) throw error
      }

      showToast('success', `${manualForm.questions.length}問のManual下書きを追加しました`)
      setIsManualDialogOpen(false)
      setManualForm({ 
        title: '', 
        questions: [{
          question: '',
          options: ['', '', '', ''],
          correct_answer: '',
          explanation: '',
          difficulty: 'medium'
        }]
      })
      loadData()
    } catch (error) {
      console.error('Manual追加エラー:', error)
      showToast('error', 'Manual下書きの追加に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 問題を追加
  const addQuestion = () => {
    setManualForm(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        difficulty: 'medium'
      }]
    }))
  }

  // 問題を削除
  const removeQuestion = (index: number) => {
    if (manualForm.questions.length > 1) {
      setManualForm(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }))
    }
  }

  // 問題の更新
  const updateQuestion = (index: number, field: string, value: any) => {
    setManualForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  // 選択肢の更新
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setManualForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => 
                j === optionIndex ? value : opt
              )
            }
          : q
      )
    }))
  }

  // 記事からクイズ生成
  const handleGenerateQuiz = async (articleId: string) => {
    if (!isConfigured) {
      showToast('error', 'Supabaseの設定が完了していません')
      return
    }
    
    setIsLoading(true)
    setGeneratingQuizFor(articleId) // クイズ生成中のコンテンツを設定
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
      setGeneratingQuizFor(null) // クイズ生成中のコンテンツを解除
    }
  }

  // Documentからクイズ生成
  const handleDocumentQuizGenerate = async (documentId: string) => {
    if (!isConfigured) {
      showToast('error', 'Supabaseの設定が完了していません')
      return
    }
    
    setIsLoading(true)
    setGeneratingQuizFor(documentId) // クイズ生成中のコンテンツを設定
    try {
      // まず、ドキュメントの情報を取得
      const { data: document, error: docError } = await supabase
        .from('policy_documents')
        .select('*')
        .eq('id', documentId)
        .single()
      
      if (docError || !document) {
        throw new Error('ドキュメントが見つかりません')
      }
      
      console.log('Document data:', document)
      
      // 正しいAPIを呼び出し
      const response = await fetch('/api/document-generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documentId: documentId,
          documentType: 'policy'
        })
      })
      
      const result = await response.json()
      
      if (result.ok) {
        // クイズプレビューを表示
        setPreviewQuiz({
          questions: result.questions || [],
          sourceType: 'policy',
          sourceId: documentId,
          title: result.title || 'Document文書からのクイズ'
        })
        setPreviewSourceType('policy')
        setIsQuizPreviewOpen(true)
        showToast('success', `${result.count}問のクイズを生成しました。内容を確認してください。`)
        
        // デバッグ情報をコンソールに出力
        console.log('Quiz generation result:', result)
        console.log('Generated questions count:', result.count)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('クイズ生成エラー:', error)
      showToast('error', 'クイズの生成に失敗しました')
    } finally {
      setIsLoading(false)
      setGeneratingQuizFor(null) // クイズ生成中のコンテンツを解除
    }
  }

  // クイズ保存処理
  const handleQuizSave = async () => {
    if (!previewQuiz) return
    
    setIsLoading(true)
    try {
      console.log('クイズ保存開始:', {
        company_id: TEST_COMPANY_ID,
        origin: previewSourceType,
        source_id: previewQuiz.sourceId,
        title: previewQuiz.title,
        questions_count: previewQuiz.questions.length
      })

      // まず、tray_itemsテーブルへのアクセスをテスト
      const { data: testData, error: testError } = await supabase
        .from('tray_items')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.log('tray_itemsテーブルが利用できません。ローカル保存に切り替えます:', testError)
        
        // ローカル保存に切り替え
        const localQuizData = {
          id: `local_${Date.now()}`,
          company_id: TEST_COMPANY_ID,
          origin: previewSourceType,
          source_id: previewQuiz.sourceId,
          title: previewQuiz.title,
          content: {
            type: previewSourceType,
            questions: previewQuiz.questions,
            metadata: {
              generated_at: new Date().toISOString(),
              ai_model: 'stub-v1.0',
              source_type: previewSourceType,
              question_count: previewQuiz.questions.length,
              saved_locally: true
            }
          },
          status: 'draft',
          created_at: new Date().toISOString()
        }
        
        // ローカルストレージに保存
        const existingQuizzes = JSON.parse(localStorage.getItem('local_quizzes') || '[]')
        existingQuizzes.push(localQuizData)
        localStorage.setItem('local_quizzes', JSON.stringify(existingQuizzes))
        
        console.log('ローカル保存完了:', localQuizData)
        showToast('success', 'クイズをローカルに保存しました。配信ビルダーに移動します。')
        setIsQuizPreviewOpen(false)
        setPreviewQuiz(null)
        
        // 配信ビルダーページに移動
        window.location.href = '/dispatch-builder'
        return
      }

      // 通常のデータベース保存
      const { data: insertData, error } = await supabase
        .from('tray_items')
        .insert({
          company_id: TEST_COMPANY_ID,
          origin: previewSourceType,
          source_id: previewQuiz.sourceId,
          title: previewQuiz.title,
          content: {
            type: previewSourceType,
            questions: previewQuiz.questions,
            metadata: {
              generated_at: new Date().toISOString(),
              ai_model: 'stub-v1.0',
              source_type: previewSourceType,
              question_count: previewQuiz.questions.length
            }
          },
          status: 'draft'
        })
        .select()

      if (error) {
        console.error('データベース挿入エラー詳細:', {
          message: error.message,
          details: error,
          hint: error.hint,
          code: error.code
        })
        
        // エラーの詳細を確認
        if (error.code === '42501') {
          throw new Error('データベースの権限が不足しています。管理者に連絡してください。')
        } else if (error.code === '42P01') {
          throw new Error('tray_itemsテーブルが見つかりません。データベーススキーマを確認してください。')
        } else {
          throw new Error(`データベース挿入エラー: ${error.message}`)
        }
      }

      console.log('クイズ保存成功:', insertData)

      showToast('success', 'クイズを保存しました。配信ビルダーに移動します。')
      setIsQuizPreviewOpen(false)
      setPreviewQuiz(null)
      
      // 配信ビルダーページに移動
      window.location.href = '/dispatch-builder'
      
    } catch (error) {
      console.error('クイズ保存エラー:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // フォールバック: ローカルストレージに一時保存
      try {
        const fallbackData = {
          id: `temp_${Date.now()}`,
          company_id: TEST_COMPANY_ID,
          origin: previewSourceType,
          source_id: previewQuiz.sourceId,
          title: previewQuiz.title,
          content: {
            type: previewSourceType,
            questions: previewQuiz.questions,
            metadata: {
              generated_at: new Date().toISOString(),
              ai_model: 'stub-v1.0',
              source_type: previewSourceType,
              question_count: previewQuiz.questions.length
            }
          },
          status: 'draft',
          created_at: new Date().toISOString(),
          is_fallback: true
        }
        
        localStorage.setItem('fallback_quiz', JSON.stringify(fallbackData))
        console.log('フォールバック保存完了:', fallbackData)
        
        showToast('error', `クイズの保存に失敗しましたが、ローカルに一時保存しました。エラー: ${errorMessage}`)
      } catch (fallbackError) {
        console.error('フォールバック保存も失敗:', fallbackError)
        showToast('error', `クイズの保存に失敗しました: ${errorMessage}`)
      }
      
      // より詳細なエラー情報をコンソールに出力
      if (error instanceof Error) {
        console.error('エラーの詳細:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // データベース接続テスト
  const testDatabaseConnection = async () => {
    try {
      console.log('データベース接続テスト開始...')
      
      // tray_itemsテーブルへのアクセス権限をテスト
      console.log('tray_itemsテーブルアクセステスト開始...')
      const { data: testData, error: testError } = await supabase
        .from('tray_items')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('tray_itemsテーブルアクセステスト失敗:', {
          message: testError.message,
          details: testError,
          hint: testError.hint,
          code: testError.code
        })
        
        // テーブルが存在するかチェック
        try {
          const { data: tableInfo, error: tableError } = await supabase
            .rpc('get_table_info', { table_name: 'tray_items' })
          
          if (tableError) {
            console.log('get_table_info RPCも失敗:', tableError)
          } else {
            console.log('テーブル情報:', tableInfo)
          }
        } catch (rpcError) {
          console.log('RPC呼び出しエラー:', rpcError)
        }
        
        showToast('error', `tray_itemsテーブルアクセスエラー: ${testError.message}`)
      } else {
        console.log('tray_itemsテーブルアクセステスト成功:', testData)
      }
      
      // 他のテーブルもテスト
      const { error: newsError } = await supabase
        .from('news_articles')
        .select('count')
        .limit(1)
      
      if (newsError) {
        console.error('news_articlesテーブルアクセステスト失敗:', newsError)
      } else {
        console.log('news_articlesテーブルアクセステスト成功')
      }
      
      // 基本的なテーブルアクセステスト（information_schemaは使用しない）
      console.log('基本的なテーブルアクセステスト完了')
      
    } catch (error) {
      console.error('データベース接続テストエラー:', error)
    }
  }

  // フォールバック保存されたクイズを確認
  const checkFallbackQuiz = () => {
    try {
      const saved = localStorage.getItem('fallback_quiz')
      if (saved) {
        const quiz = JSON.parse(saved)
        setFallbackQuiz(quiz)
        console.log('フォールバック保存されたクイズを発見:', quiz)
      }
    } catch (error) {
      console.error('フォールバッククイズの読み込みエラー:', error)
    }
  }

  // 設定未完了の場合の表示
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#F0F4FA] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              メインメニューに戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">コンテンツハブ</h1>
            <p className="text-gray-600 mt-2">News・Document・Manualの管理とAIクイズ生成</p>
          </div>
          
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">設定が必要です</h2>
            <p className="text-gray-600 mb-6">
              Supabaseの設定が完了していません。以下の手順で環境変数を設定してください。
            </p>
            <div className="bg-gray-100 p-4 rounded-lg text-left text-sm font-mono">
              <p className="mb-2">1. Supabaseプロジェクトを作成</p>
              <p className="mb-2">2. 環境変数を設定:</p>
              <p className="mb-1">NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
              <p className="mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
              <p className="mb-1">SUPABASE_SERVICE_ROLE_KEY=your-service-role-key</p>
              <p className="mb-2">3. データベーススキーマを適用</p>
              <p>4. Edge Functionsをデプロイ</p>
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
              コンテンツハブ
            </h1>
            <p className="text-[14px] text-blue-clean-subtitle leading-[1.6]">
              News・Document・Manualの管理とAIクイズ生成
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* News Section */}
          <div className="card-enhanced rounded-[20px] shadow-soft border animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="p-6 border-b border-[rgba(37,99,235,0.08)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-[16px] icon-bg-unified flex items-center justify-center mr-3 shadow-soft">
                    <Newspaper className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#0F172A]">News</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsRssDialogOpen(true)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-[#2563EB] bg-[#EFF6FF] rounded-lg hover:bg-[#DBEAFE] transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    RSS追加
                  </button>
                  <button 
                    onClick={handleFetchLatest}
                    disabled={isLoading}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors duration-200"
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
                  <p className="text-[#64748B] text-center py-4">記事がありません</p>
                ) : (
                  newsArticles.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-[16px] p-4 border border-[rgba(37,99,235,0.08)] shadow-soft hover:shadow-hover transition-all duration-200 animate-fade-in-up"
                      style={{animationDelay: `${0.2 + index * 0.05}s`}}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[#0F172A] text-sm leading-tight">{item.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-[#F1F5F9] text-[#475569] rounded-full">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mb-3">
                        {item.source_id ? (
                          <span className="flex items-center">
                            <span className="text-[#2563EB] font-medium">📰 {item.news_sources?.name}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          <span>手動追加 • {new Date(item.created_at).toLocaleDateString()}</span>
                        )}
                      </p>
                      {item.url && (
                        <p className="text-xs text-[#64748B] mb-2">
                          🔗 <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline">
                            {item.url.length > 50 ? item.url.substring(0, 50) + '...' : item.url}
                          </a>
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs">
                          {item.status === 'quiz_generated' ? (
                            <div className="flex items-center text-[#10B981]">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              クイズ生成済み
                            </div>
                          ) : (
                            <div className="flex items-center text-[#64748B]">
                              <Clock className="h-3 w-3 mr-1" />
                              クイズ未生成
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleGenerateQuiz(item.id)}
                            disabled={isLoading || item.status === 'quiz_generated'}
                            className="px-3 py-1 text-xs font-medium text-[#2563EB] bg-[#EFF6FF] rounded hover:bg-[#DBEAFE] disabled:opacity-50 transition-colors duration-200"
                          >
                            {generatingQuizFor === item.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#2563EB] mr-1"></div>
                                生成中...
                              </div>
                            ) : item.status === 'quiz_generated' ? (
                              '生成済み'
                            ) : (
                              'クイズ生成'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ドキュメント Section */}
          <div className="card-enhanced rounded-[20px] shadow-soft border animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="p-6 border-b border-[rgba(37,99,235,0.08)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-[16px] icon-bg-unified flex items-center justify-center mr-3 shadow-soft">
                    <FileText className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#0F172A]">Documents</h2>
                </div>
                <button 
                  onClick={() => setIsPolicyDialogOpen(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-[#10B981] bg-[#ECFDF5] rounded-lg hover:bg-[#D1FAE5] transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Document
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {documentItems.length === 0 ? (
                  <p className="text-[#64748B] text-center py-4">No documents available</p>
                ) : (
                  documentItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-[16px] p-4 border border-[rgba(37,99,235,0.08)] shadow-soft hover:shadow-hover transition-all duration-200 animate-fade-in-up"
                      style={{animationDelay: `${0.4 + index * 0.05}s`}}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[#0F172A] text-sm leading-tight">{item.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-[#F1F5F9] text-[#475569] rounded-full">
                          Draft
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-[#64748B] mb-3">
                        {item.effective_date && (
                          <span>Effective Date: {item.effective_date}</span>
                        )}
                      </div>
                      {item.file_url && (
                        <div className="mb-3">
                          <a 
                            href={item.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors duration-200"
                          >
                            📄 View File
                          </a>
                          {item.original_filename && (
                            <p className="text-xs text-[#64748B] mt-1">
                              Original filename: {item.original_filename}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-[#EF4444]">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Approval Required
                        </div>
                        <button 
                          onClick={() => handleDocumentQuizGenerate(item.id)}
                          disabled={isLoading}
                          className="px-3 py-1 text-xs font-medium text-[#10B981] bg-[#ECFDF5] rounded hover:bg-[#D1FAE5] disabled:opacity-50 transition-colors duration-200"
                        >
                          {generatingQuizFor === item.id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#10B981] mr-1"></div>
                              生成中...
                            </div>
                          ) : (
                            'Generate Quiz'
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Manual Section */}
          <div className="card-enhanced rounded-[20px] shadow-soft border animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <div className="p-6 border-b border-[rgba(37,99,235,0.08)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-[16px] icon-bg-unified flex items-center justify-center mr-3 shadow-soft">
                    <BookOpen className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#0F172A]">Manual</h2>
                </div>
                <button 
                  onClick={() => setIsManualDialogOpen(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-[#F59E0B] bg-[#FFFBEB] rounded-lg hover:bg-[#FEF3C7] transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  手入力
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {manualDrafts.length === 0 ? (
                  <p className="text-[#64748B] text-center py-4">Manual下書きがありません</p>
                ) : (
                  manualDrafts.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-[16px] p-4 border border-[rgba(37,99,235,0.08)] shadow-soft hover:shadow-hover transition-all duration-200 animate-fade-in-up"
                      style={{animationDelay: `${0.6 + index * 0.05}s`}}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[#0F172A] text-sm leading-tight">{item.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-[#F1F5F9] text-[#475569] rounded-full">
                          下書き
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mb-3">
                        設問: {item.question.substring(0, 50)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-[#64748B]">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          手動作成
                        </div>
                        <button className="px-3 py-1 text-xs font-medium text-[#F59E0B] bg-[#FFFBEB] rounded hover:bg-[#FEF3C7] transition-colors duration-200">
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

        {/* 🚀 強化されたSummary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-enhanced rounded-[20px] p-8 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.7s'}}>
            <h3 className="font-semibold text-[#0F172A] mb-2">承認待ちコンテンツ</h3>
            <div className="text-2xl font-bold text-[#F59E0B]">
              {newsArticles.filter(a => a.status === 'needs_review').length + 
               documentItems.filter(p => p.status === 'pending_approval').length}
            </div>
            <p className="text-sm text-[#64748B]">
              Document: {documentItems.filter(p => p.status === 'pending_approval').length}件, 
              News: {newsArticles.filter(a => a.status === 'needs_review').length}件
            </p>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-8 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <h3 className="font-semibold text-[#0F172A] mb-2">今月の生成クイズ</h3>
            <div className="text-2xl font-bold text-[#2563EB]">
              {newsArticles.filter(a => a.status === 'quiz_generated').length + 
               documentItems.length}
            </div>
            <p className="text-sm text-[#64748B]">
              自動生成: {newsArticles.filter(a => a.status === 'quiz_generated').length}件, 
              手動: {manualDrafts.length}件
            </p>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-8 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.9s'}}>
            <h3 className="font-semibold text-[#0F172A] mb-2">配信待ちTray</h3>
            <div className="text-2xl font-bold text-[#10B981]">
              {newsArticles.filter(a => a.status === 'quiz_generated').length + 
               documentItems.length + manualDrafts.length}
            </div>
            <p className="text-sm text-[#64748B]">承認済み、配信可能</p>
          </div>
        </div>

        {/* フォールバック保存されたクイズの表示 */}
        {fallbackQuiz && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  ⚠️ 一時保存されたクイズがあります
                </h3>
                <p className="text-yellow-700 mb-3">
                  データベースへの保存に失敗しましたが、クイズはローカルに一時保存されています。
                  再度保存を試行するか、手動で確認してください。
                </p>
                <div className="bg-white rounded p-3 mb-3">
                  <p className="text-sm font-medium text-gray-900">{fallbackQuiz.title}</p>
                  <p className="text-xs text-gray-600">
                    問題数: {fallbackQuiz.content.questions.length}問 | 
                    ソース: {fallbackQuiz.origin} | 
                    保存日時: {new Date(fallbackQuiz.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // フォールバッククイズをプレビューに設定
                      setPreviewQuiz({
                        questions: fallbackQuiz.content.questions,
                        sourceType: fallbackQuiz.origin,
                        sourceId: fallbackQuiz.source_id,
                        title: fallbackQuiz.title
                      })
                      setPreviewSourceType(fallbackQuiz.origin)
                      setIsQuizPreviewOpen(true)
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    クイズを確認
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('fallback_quiz')
                      setFallbackQuiz(null)
                      showToast('success', '一時保存されたクイズを削除しました')
                    }}
                    className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-100"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RSS追加ダイアログ */}
      {isRssDialogOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border">
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

      {/* Document追加ダイアログ */}
      {isPolicyDialogOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Document</h3>
              <button onClick={() => setIsPolicyDialogOpen(false)}>
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
                <input
                  type="text"
                  value={documentForm.title}
                  onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Information Security Policy, Business Manual, Procedure Guide"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Effective Date</label>
                <input
                  type="date"
                  value={documentForm.effectiveDate}
                  onChange={(e) => setDocumentForm({ ...documentForm, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
                <input
                  type="text"
                  value={documentForm.category}
                  onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Security"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">File</label>
                <div 
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('document-file-input')?.click()}
                >
                  {documentForm.file ? (
                    <div className="text-sm">
                      <p className="text-blue-600 font-medium">✓ {documentForm.file.name}</p>
                      <p className="text-gray-700">({Math.round(documentForm.file.size / 1024)} KB)</p>
                      <p className="text-gray-600 mt-1">Click or drag & drop to change</p>
                    </div>
                  ) : (
                    <div className="text-gray-700">
                      <p className="mb-2">📁 Select file or drag & drop</p>
                      <p className="text-xs text-gray-600">PDF, Word, Text files (max 10MB)</p>
                    </div>
                  )}
                </div>
                <input
                  id="document-file-input"
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDocumentAdd}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Adding...' : 'Add'}
                </button>
                <button
                  onClick={() => setIsPolicyDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual追加ダイアログ */}
      {isManualDialogOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manual下書き追加</h3>
              <button onClick={() => setIsManualDialogOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* タイトル */}
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

              {/* 問題一覧 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">問題</label>
                  <button
                    onClick={addQuestion}
                    className="flex items-center px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    問題を追加
                  </button>
                </div>
                
                <div className="space-y-4">
                  {manualForm.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">問題 {questionIndex + 1}</h4>
                        {manualForm.questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(questionIndex)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            削除
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {/* 設問 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">設問</label>
                          <textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            rows={2}
                            placeholder="設問文を入力してください"
                          />
                        </div>

                        {/* 選択肢 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">選択肢（4つ）</label>
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`correct-${questionIndex}`}
                                  checked={option === question.correct_answer}
                                  onChange={() => updateQuestion(questionIndex, 'correct_answer', option)}
                                  className="text-blue-600"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder={`選択肢${optionIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 説明 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">正解の説明</label>
                          <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            rows={2}
                            placeholder="なぜその答えが正しいのか説明してください"
                          />
                        </div>

                        {/* 難易度 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">難易度</label>
                          <select
                            value={question.difficulty}
                            onChange={(e) => updateQuestion(questionIndex, 'difficulty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="easy">易しい</option>
                            <option value="medium">普通</option>
                            <option value="hard">難しい</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ボタン */}
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

      {/* クイズプレビューダイアログ */}
      {isQuizPreviewOpen && previewQuiz && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">クイズプレビュー</h3>
              <button 
                onClick={() => setIsQuizPreviewOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">{previewQuiz.title}</h4>
              <p className="text-sm text-gray-600">
                生成されたクイズ: {previewQuiz.questions.length}問
              </p>
            </div>

            <div className="space-y-6 mb-6">
              {previewQuiz.questions.map((question: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium text-gray-900 mb-3">
                    問題 {index + 1}: {question.question}
                  </h5>
                  
                  <div className="space-y-2 mb-3">
                    {question.options.map((option: string, optIndex: number) => (
                      <div 
                        key={optIndex} 
                        className={`p-2 rounded border ${
                          option === question.correct_answer 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <span className="text-sm text-gray-900">
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {option === question.correct_answer && (
                            <span className="ml-2 text-green-600 font-medium">✓ 正解</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">
                      解説: {question.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsQuizPreviewOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleQuizSave}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '保存中...' : '保存して配信ビルダーへ'}
              </button>
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
      {isLoading && !generatingQuizFor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl border">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AIクイズ生成中...</h3>
              <p className="text-gray-600">ドキュメントを分析してクイズを作成しています</p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}