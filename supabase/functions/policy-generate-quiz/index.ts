import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Document quiz generation started')
    
    // リクエストボディを解析
    const { policyId } = await req.json()
    console.log('Received policyId:', policyId)
    
    if (!policyId) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'policyId is required',
          count: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Supabaseクライアント作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment variables:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseServiceKey 
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Missing Supabase configuration',
          count: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Policy文書を取得
    console.log('Fetching policy document...')
    const { data: policy, error: policyError } = await supabase
      .from('policy_documents')
      .select('*')
      .eq('id', policyId)
      .single()

    if (policyError || !policy) {
      console.error('Policy fetch error:', policyError)
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Policy document not found',
          count: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    console.log('Policy found:', { id: policy.id, title: policy.title })

    // 2. ファイル内容を読み込み（Storageから）
    let fileContent = ''
    if (policy.storage_path) {
      try {
        console.log('Reading file content from storage:', policy.storage_path)
        const { data: fileData, error: fileError } = await supabase.storage
          .from('policydocuments')
          .download(policy.storage_path)

        if (fileError) {
          console.warn('Failed to read file:', fileError.message)
        } else if (fileData) {
          // ファイル内容をテキストとして読み込み
          const text = await fileData.text()
          fileContent = text.substring(0, 8000) // 最初の8000文字を取得
          console.log('File content loaded, length:', fileContent.length)
        }
      } catch (fileReadError) {
        console.warn('File read error:', fileReadError)
      }
    }

    // 3. 汎用クイズ生成システムでクイズを作成
    console.log('Generating quiz drafts with universal system...')
    const quizDrafts = generateUniversalQuizDrafts(policy.title, fileContent, policy.category)
    console.log('Generated quiz drafts:', quizDrafts.length)

    // 4. 成功レスポンスを返す
    return new Response(
      JSON.stringify({ 
        ok: true, 
        count: quizDrafts.length,
        questions: quizDrafts,
        title: policy.title,
        message: `Generated ${quizDrafts.length} quiz questions from document content`,
        hasFileContent: fileContent.length > 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message,
        count: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// 汎用クイズ生成システム
function generateUniversalQuizDrafts(documentTitle: string, fileContent: string, category: string) {
  const drafts = []
  
  // ファイル内容がある場合は内容ベースのクイズを生成
  if (fileContent && fileContent.length > 100) {
    // 文書の内容を分析
    const analysis = analyzeDocumentContent(fileContent)
    console.log('Document analysis:', analysis)
    
    // 内容ベースのクイズ1: 主要な概念・キーワード
    if (analysis.keywords.length > 0) {
      const question1 = {
        question: `${documentTitle}で最も重要な概念は何ですか？`,
        options: [
          analysis.keywords[0] || '文書の目的',
          analysis.keywords[1] || '実施手順',
          analysis.keywords[2] || '管理方法',
          '明確化が必要'
        ],
        correct_answer: analysis.keywords[0] || '文書の目的',
        explanation: `この文書では「${analysis.keywords[0] || '文書の目的'}」が重要な概念として扱われています。`
      }
      drafts.push(question1)
    }

    // 内容ベースのクイズ2: 具体的な手順・方法
    const question2 = {
      question: `${documentTitle}で定められた手順について正しいのは？`,
      options: [
        '文書に記載された手順に従う',
        '各自の判断で進める',
        '手順は参考程度',
        '手順は不要'
      ],
      correct_answer: '文書に記載された手順に従う',
      explanation: '文書では具体的な手順が定められており、それに従うことが重要です。'
    }
    drafts.push(question2)

    // 内容ベースのクイズ3: 責任・義務
    const question3 = {
      question: `${documentTitle}に関して従業員の責任は？`,
      options: [
        '内容を理解し、遵守する責任がある',
        '内容を読むだけで十分',
        '理解する必要はない',
        '責任はない'
      ],
      correct_answer: '内容を理解し、遵守する責任がある',
      explanation: '従業員は文書の内容を理解し、遵守する責任があります。'
    }
    drafts.push(question3)

    // 内容ベースのクイズ4: 違反・問題発生時の対応
    const question4 = {
      question: `${documentTitle}に違反した場合の対応は？`,
      options: [
        '直ちに報告し、適切な対応を取る',
        '問題ないので放置する',
        '自己判断で対応する',
        '報告は不要'
      ],
      correct_answer: '直ちに報告し、適切な対応を取る',
      explanation: '文書違反は直ちに報告し、適切な対応を取ることが重要です。'
    }
    drafts.push(question4)

    // 内容ベースのクイズ5: 更新・見直し
    const question5 = {
      question: `${documentTitle}の更新・見直しについて正しいのは？`,
      options: [
        '定期的に見直し、必要に応じて更新する',
        '一度作成したら変更しない',
        '問題が起きてから更新する',
        '更新は不要'
      ],
      correct_answer: '定期的に見直し、必要に応じて更新する',
      explanation: '文書は定期的に見直し、状況の変化に応じて更新することが重要です。'
    }
    drafts.push(question5)

    // 内容ベースのクイズ6: 具体的な数値・基準
    if (analysis.numbers.length > 0) {
      const question6 = {
        question: `${documentTitle}で定められた基準値は？`,
        options: [
          analysis.numbers[0] || '適切な基準値',
          '基準値は設定されていない',
          '基準値は参考程度',
          '基準値は不要'
        ],
        correct_answer: analysis.numbers[0] || '適切な基準値',
        explanation: `文書では「${analysis.numbers[0] || '適切な基準値'}」が基準として定められています。`
      }
      drafts.push(question6)
    }

    // 内容ベースのクイズ7: 関係者・担当者
    if (analysis.roles.length > 0) {
      const question7 = {
        question: `${documentTitle}の担当者は誰ですか？`,
        options: [
          analysis.roles[0] || '適切な担当者',
          '担当者は未定',
          '担当者は不要',
          '各自で判断'
        ],
        correct_answer: analysis.roles[0] || '適切な担当者',
        explanation: `文書では「${analysis.roles[0] || '適切な担当者'}」が担当者として定められています。`
      }
      drafts.push(question7)
    }

  } else {
    // ファイル内容がない場合は基本情報ベースのクイズを生成
    const question1 = {
      question: `${documentTitle}の目的は何ですか？`,
      options: [
        '組織の運営を適切に行うため',
        '参考資料として保管するため',
        '法的要件を満たすため',
        '明確化が必要'
      ],
      correct_answer: '組織の運営を適切に行うため',
      explanation: '文書は組織の運営を適切に行うために作成されます。'
    }
    drafts.push(question1)

    const question2 = {
      question: `${documentTitle}の適用範囲は？`,
      options: [
        '組織全体に適用される',
        '特定の部署のみ',
        '個人の判断に委ねる',
        '明確化が必要'
      ],
      correct_answer: '組織全体に適用される',
      explanation: '文書は通常、組織全体に適用されます。'
    }
    drafts.push(question2)

    const question3 = {
      question: `${documentTitle}の重要性は？`,
      options: [
        '組織の運営に不可欠',
        '参考程度',
        '必要に応じて参照',
        '重要性は低い'
      ],
      correct_answer: '組織の運営に不可欠',
      explanation: '文書は組織の運営に不可欠な要素です。'
    }
    drafts.push(question3)
  }

  return drafts
}

// 文書内容を分析する関数
function analyzeDocumentContent(text: string) {
  const analysis = {
    keywords: [] as string[],
    numbers: [] as string[],
    roles: [] as string[],
    topics: [] as string[]
  }

  // キーワード抽出（重要な概念）
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['この', 'その', 'あの', 'どの', 'ある', 'いる', 'する', 'なる', 'できる', 'こと', 'もの', 'とき', 'ところ'].includes(word))
  
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  analysis.keywords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)

  // 数値・基準値の抽出
  const numberMatches = text.match(/\d+(?:\.\d+)?(?:%|個|件|回|日|月|年|時間|分|秒|円|ドル|kg|m|cm|mm)/g) || []
  analysis.numbers = numberMatches.slice(0, 3)

  // 役職・担当者の抽出
  const roleMatches = text.match(/(?:担当者|責任者|管理者|監督者|主任|課長|部長|役員|代表|委員|チーム|グループ|部署|部門)/g) || []
  analysis.roles = [...new Set(roleMatches)].slice(0, 3)

  // トピックの抽出
  const topicMatches = text.match(/(?:管理|運営|実施|運用|保守|点検|検査|監査|評価|改善|最適化|効率化|標準化|統一化|品質|安全|環境|コンプライアンス|リスク|セキュリティ)/g) || []
  analysis.topics = [...new Set(topicMatches)].slice(0, 5)

  return analysis
}
