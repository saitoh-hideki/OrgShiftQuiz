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
    // リクエストボディを解析
    const { articleId } = await req.json()
    
    if (!articleId) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'articleId is required',
          count: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Supabaseクライアント作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. 記事を取得
    const { data: article, error: articleError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', articleId)
      .single()

    if (articleError || !article) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Article not found',
          count: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // 2. AIでクイズ下書きを生成（現在はスタブ）
    const quizDrafts = generateQuizDrafts(article)

    // 3. news_quiz_draftsに保存
    const { error: insertError } = await supabase
      .from('news_quiz_drafts')
      .insert({
        article_id: articleId,
        questions: quizDrafts,
        ai_model: 'stub-v1.0'
      })

    if (insertError) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Failed to save quiz drafts: ${insertError.message}`,
          count: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // 4. 記事のステータスを更新
    await supabase
      .from('news_articles')
      .update({ status: 'quiz_generated' })
      .eq('id', articleId)

    // 5. Trayに追加
    const trayItem = {
      company_id: article.company_id,
      origin: 'news',
      source_id: articleId,
      title: article.title,
      content: {
        type: 'news',
        article: {
          title: article.title,
          url: article.url,
          summary: article.summary
        },
        questions: quizDrafts
      },
      metadata: {
        source_url: article.url,
        published_at: article.published_at,
        trust_score: article.trust_score
      },
      status: 'draft'
    }

    const { error: trayError } = await supabase
      .from('tray_items')
      .insert(trayItem)

    if (trayError) {
      console.warn('Failed to add to tray:', trayError.message)
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        count: quizDrafts.length,
        message: `Generated ${quizDrafts.length} quiz questions`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
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

// スタブ用のクイズ下書き生成
function generateQuizDrafts(article: any) {
  const drafts = []
  
  // 記事の内容に基づいて1-2問のクイズを生成
  const question1 = {
    question: `${article.title}について、正しい説明はどれですか？`,
    options: [
      article.summary || '記事の内容に関する説明A',
      '記事の内容に関する説明B（誤り）',
      '記事の内容に関する説明C（誤り）',
      '記事の内容に関する説明D（誤り）'
    ],
    correct_answer: article.summary || '記事の内容に関する説明A',
    explanation: '記事の要約に基づいて正解を選択してください。'
  }
  
  drafts.push(question1)

  // 2問目（確率的に生成）
  if (Math.random() > 0.3) {
    const question2 = {
      question: `この記事の信頼性スコアは何点ですか？`,
      options: [
        `${article.trust_score}点`,
        `${article.trust_score + 1}点`,
        `${article.trust_score - 1}点`,
        '不明'
      ],
      correct_answer: `${article.trust_score}点`,
      explanation: `記事の信頼性スコアは${article.trust_score}点です。`
    }
    drafts.push(question2)
  }

  return drafts
}
