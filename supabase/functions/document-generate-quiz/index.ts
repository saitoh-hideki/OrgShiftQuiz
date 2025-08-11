import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface DocumentAnalysis {
  summary: string
  keyPoints: string[]
  importantConcepts: string[]
  procedures: string[]
  responsibilities: string[]
  compliance: string[]
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Document quiz generation started')
    
    // リクエストボディを解析
    const { documentId, documentType } = await req.json()
    console.log('Received documentId:', documentId, 'documentType:', documentType)
    
    if (!documentId) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'documentId is required',
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    console.log('Environment variables:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseServiceKey,
      hasOpenAI: !!openaiApiKey
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
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

    if (!openaiApiKey) {
      console.error('Missing OpenAI API key')
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Missing OpenAI configuration',
          count: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. ドキュメントを取得（タイプに応じて）
    let document: any = null
    let fileContent = ''
    
    if (documentType === 'policy') {
      const { data, error } = await supabase
        .from('policy_documents')
        .select('*')
        .eq('id', documentId)
        .single()
      
      if (error || !data) {
        throw new Error('Policy document not found')
      }
      document = data
      
      // データベースに保存されたテキスト内容を使用
      if (document.content_text && document.content_text.length > 0) {
        fileContent = document.content_text
        console.log('Database content loaded, length:', fileContent.length)
      } else if (document.storage_path) {
        // フォールバック: ファイルから読み込みを試行
        try {
          const { data: fileData, error: fileError } = await supabase.storage
            .from('policydocuments')
            .download(document.storage_path)

          if (!fileError && fileData) {
            const text = await fileData.text()
            fileContent = text.substring(0, 8000)
            console.log('File content loaded as fallback, length:', fileContent.length)
          }
        } catch (fileReadError) {
          console.warn('File read error:', fileReadError)
        }
      }
    } else if (documentType === 'news') {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', documentId)
        .single()
      
      if (error || !data) {
        throw new Error('News article not found')
      }
      document = data
      
      // News記事の場合はsummaryとtitleを使用
      fileContent = `${document.title}\n\n${document.summary || ''}`
    } else if (documentType === 'manual') {
      const { data, error } = await supabase
        .from('manual_drafts')
        .select('*')
        .eq('id', documentId)
        .single()
      
      if (error || !data) {
        throw new Error('Manual draft not found')
      }
      document = data
      
      // Manualの場合はquestionとtitleを使用
      fileContent = `${document.title}\n\n${document.question}`
    }

    if (!document) {
      throw new Error('Document not found')
    }

    console.log('Document found:', { 
      id: document.id, 
      title: document.title, 
      type: documentType, 
      hasContent: fileContent.length > 0,
      contentLength: fileContent.length
    })

    if (fileContent.length < 50) {
      throw new Error('Document content is too short to generate meaningful quiz questions')
    }

    // 2. OpenAI APIを使って文書を分析
    console.log('Analyzing document content with OpenAI...')
    console.log('Content length:', fileContent.length)
    console.log('Content preview:', fileContent.substring(0, 200))
    
    const documentAnalysis = await analyzeDocumentWithAI(fileContent, document.title, documentType, openaiApiKey)
    console.log('Document analysis completed:', documentAnalysis)

    // 3. AI分析結果に基づいてクイズを生成
    console.log('Generating AI-based quiz questions...')
    const quizQuestions = await generateAIQuizQuestions(document.title, documentAnalysis, documentType, openaiApiKey)
    console.log('Generated quiz questions:', quizQuestions.length)

    if (!quizQuestions || quizQuestions.length === 0) {
      throw new Error('No quiz questions were generated')
    }

    // 4. 成功レスポンスを返す
    return new Response(
      JSON.stringify({ 
        ok: true, 
        count: quizQuestions.length,
        questions: quizQuestions,
        title: document.title,
        message: `Generated ${quizQuestions.length} AI-powered quiz questions from ${documentType} document`,
        hasFileContent: fileContent.length > 0,
        documentType: documentType,
        contentLength: fileContent.length,
        analysis: documentAnalysis
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

// OpenAI APIを使って文書を分析する関数
async function analyzeDocumentWithAI(content: string, title: string, documentType: string, apiKey: string): Promise<DocumentAnalysis> {
  const prompt = `
以下の文書の内容を詳しく分析してください。この文書は「${title}」というタイトルの${documentType}文書です。

文書内容:
${content.substring(0, 6000)}

この文書の内容を実際に読んで理解し、以下の観点から分析してください：

1. 文書の要約（100文字以内）
2. 文書で扱われている主要なトピックやテーマ
3. 文書で説明されている重要な概念や用語
4. 文書で述べられている具体的な事実や情報
5. 文書の目的や意図
6. 読者が理解すべき重要なポイント

分析は文書の実際の内容に基づいて行い、文書タイプに関係なく、その文書固有の内容を抽出してください。
ポリシー文書でもニュース記事でもマニュアルでも、その文書の内容に応じて適切に分析してください。

以下の形式で分析結果をJSONで返してください:
{
  "summary": "文書の要約（100文字以内）",
  "keyPoints": ["重要なポイント1", "重要なポイント2", "重要なポイント3"],
  "importantConcepts": ["重要な概念1", "重要な概念2", "重要な概念3"],
  "procedures": ["重要な手順1", "重要な手順2"],
  "responsibilities": ["責任・義務1", "責任・義務2"],
  "compliance": ["コンプライアンス要件1", "コンプライアンス要件2"]
}

注意: フィールド名は固定ですが、内容は文書の実際の内容に基づいて適切に埋めてください。
例えば、ニュース記事の場合は「手順」や「責任」が少ないかもしれませんが、その場合は空の配列や適切な内容を入れてください。
`

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`OpenAI analysis attempt ${attempt}/${maxRetries}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒タイムアウト

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'あなたは文書分析の専門家です。文書の内容を正確に読み取り、その文書固有の重要なポイントを抽出してください。文書の種類に関係なく、内容に基づいて分析してください。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1200
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`OpenAI API error (attempt ${attempt}):`, response.status, errorText)
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`OpenAI analysis response (attempt ${attempt}):`, data)
      
      const analysisText = data.choices[0]?.message?.content

      if (!analysisText) {
        throw new Error('No analysis content received from OpenAI')
      }

      // JSONレスポンスを抽出
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from OpenAI')
      }

      const analysis = JSON.parse(jsonMatch[0])
      console.log(`Parsed analysis (attempt ${attempt}):`, analysis)
      
      // 必要なフィールドが存在することを確認
      return {
        summary: analysis.summary || '文書の要約',
        keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : ['重要なポイント'],
        importantConcepts: Array.isArray(analysis.importantConcepts) ? analysis.importantConcepts : ['重要な概念'],
        procedures: Array.isArray(analysis.procedures) ? analysis.procedures : ['重要な手順'],
        responsibilities: Array.isArray(analysis.responsibilities) ? analysis.responsibilities : ['責任・義務'],
        compliance: Array.isArray(analysis.compliance) ? analysis.compliance : ['コンプライアンス要件']
      }

    } catch (error) {
      lastError = error as Error
      console.error(`OpenAI analysis error (attempt ${attempt}):`, error)
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${attempt * 2} seconds...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
      }
    }
  }

  // すべてのリトライが失敗した場合
  console.error('All OpenAI analysis attempts failed')
  throw new Error(`文書分析に失敗しました: ${lastError?.message}`)
}

// AI分析結果に基づいてクイズを生成する関数
async function generateAIQuizQuestions(title: string, analysis: DocumentAnalysis, documentType: string, apiKey: string): Promise<QuizQuestion[]> {
  const prompt = `
以下の文書分析結果に基づいて、5つのクイズ問題を作成してください。

文書タイトル: ${title}
文書タイプ: ${documentType}

分析結果:
- 要約: ${analysis.summary}
- 重要なポイント: ${analysis.keyPoints.join(', ')}
- 重要な概念: ${analysis.importantConcepts.join(', ')}
- 重要な手順: ${analysis.procedures.join(', ')}
- 責任・義務: ${analysis.responsibilities.join(', ')}
- コンプライアンス要件: ${analysis.compliance.join(', ')}

この文書の内容に基づいて、理解度を測る効果的なクイズを作成してください。
クイズは文書の実際の内容に関連したもので、文書を読んだ人でないと答えられないような具体的な問題にしてください。

以下の形式で5つのクイズ問題をJSONで返してください:
[
  {
    "question": "問題文（文書の内容に基づいた具体的な問題）",
    "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    "correct_answer": "正解の選択肢",
    "explanation": "正解の説明（なぜその答えが正しいのか、文書の内容に基づいて説明）",
    "difficulty": "easy"
  }
]

クイズ作成の注意点:
1. 問題文は文書の内容に基づいた具体的で理解しやすいものにする
2. 選択肢は文書で説明されている内容に関連した実用的なものにする
3. 正解の説明は文書の内容を引用するなど、明確で教育的なものにする
4. 難易度は文書の複雑さに応じて調整する
5. 文書を読んでいない人には答えられないような、内容に特化した問題にする
6. 文書タイプに関係なく、その文書の内容に適した問題を作成する
`

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`OpenAI quiz generation attempt ${attempt}/${maxRetries}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45秒タイムアウト

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'あなたは教育用クイズ作成の専門家です。文書の内容を深く理解し、その文書固有の内容に基づいて、理解度を測る効果的なクイズを作成してください。文書の種類に関係なく、内容に特化したクイズを作成することが重要です。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`OpenAI API response error (attempt ${attempt}):`, response.status, errorText)
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`OpenAI quiz response (attempt ${attempt}):`, data)
      
      const quizText = data.choices[0]?.message?.content

      if (!quizText) {
        throw new Error('No quiz content received from OpenAI')
      }

      console.log(`Raw OpenAI quiz response (attempt ${attempt}):`, quizText)

      // JSONレスポンスを抽出
      const jsonMatch = quizText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.error('No JSON array found in OpenAI response:', quizText)
        throw new Error('Invalid JSON response from OpenAI - no array found')
      }

      const quizData = JSON.parse(jsonMatch[0])
      console.log(`Parsed quiz data (attempt ${attempt}):`, quizData)
      
      // クイズデータの検証と整形
      const validatedQuestions = quizData.map((quiz: any, index: number) => {
        if (!quiz.question || !quiz.options || !quiz.correct_answer || !quiz.explanation) {
          console.warn(`Invalid quiz data at index ${index}:`, quiz)
        }
        
        return {
          question: quiz.question || `問題${index + 1}`,
          options: Array.isArray(quiz.options) && quiz.options.length === 4 
            ? quiz.options 
            : ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
          correct_answer: quiz.correct_answer || quiz.options?.[0] || '選択肢1',
          explanation: quiz.explanation || '正解の説明',
          difficulty: quiz.difficulty || 'medium'
        }
      })

      console.log(`Validated questions (attempt ${attempt}):`, validatedQuestions)
      return validatedQuestions

    } catch (error) {
      lastError = error as Error
      console.error(`OpenAI quiz generation error (attempt ${attempt}):`, error)
      
      if (attempt < maxRetries) {
        console.log(`Retrying quiz generation in ${attempt * 2} seconds...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
      }
    }
  }

  // すべてのリトライが失敗した場合
  console.error('All OpenAI quiz generation attempts failed')
  throw new Error(`クイズ生成に失敗しました: ${lastError?.message}`)
}
