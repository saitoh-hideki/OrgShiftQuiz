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
    const { trayItems, title, description, deadline, requireAttestation } = await req.json()
    
    if (!trayItems || !Array.isArray(trayItems) || trayItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'trayItems array is required and must not be empty'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    if (!title) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'title is required'
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

    // テストモード用の会社ID
    const testCompanyId = '00000000-0000-0000-0000-000000000001'

    // 1. Quizを作成
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        company_id: testCompanyId,
        title,
        description,
        source_mix: trayItems.map((item: any) => item.origin),
        status: 'published',
        published_at: new Date().toISOString(),
        deadline,
        require_attestation: requireAttestation || trayItems.some((item: any) => item.origin === 'policy'),
        created_by: null // テストモードでは匿名
      })
      .select()
      .single()

    if (quizError) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Failed to create quiz: ${quizError.message}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // 2. QuestionsとOptionsを作成
    for (const trayItem of trayItems) {
      const questions = trayItem.content.questions || []
      
      for (const questionData of questions) {
        // Questionを作成
        const { data: question, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_id: quiz.id,
            source_type: trayItem.origin,
            question_text: questionData.question,
            options: questionData.options,
            correct_answer: questionData.correct_answer,
            explanation: questionData.explanation,
            citation_url: trayItem.metadata?.source_url,
            citation_quote: trayItem.title,
            policy_doc_id: trayItem.origin === 'policy' ? trayItem.source_id : null,
            policy_version: trayItem.metadata?.version
          })
          .select()
          .single()

        if (questionError) {
          console.warn(`Failed to create question: ${questionError.message}`)
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
    // 実際の実装では、セグメントに基づいてユーザーを割り当て
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', testCompanyId)
      .limit(10) // テスト用に制限

    if (users) {
      for (const user of users) {
        await supabase
          .from('quiz_assignments')
          .insert({
            quiz_id: quiz.id,
            user_id: user.id,
            status: 'assigned'
          })
      }
    }

    // 4. Tray Itemsのステータスを更新
    for (const trayItem of trayItems) {
      await supabase
        .from('tray_items')
        .update({ status: 'published' })
        .eq('id', trayItem.id)
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        quizId: quiz.id,
        message: `Quiz published successfully with ${trayItems.length} source types`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
