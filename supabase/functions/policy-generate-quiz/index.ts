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
    const { policyId } = await req.json()
    
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Policy文書を取得
    const { data: policy, error: policyError } = await supabase
      .from('policy_documents')
      .select('*')
      .eq('id', policyId)
      .single()

    if (policyError || !policy) {
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

    // 2. AIでクイズ下書きを生成（現在はスタブ）
    const quizDrafts = generatePolicyQuizDrafts(policy)

    // 3. policy_quiz_draftsに保存
    const { error: insertError } = await supabase
      .from('policy_quiz_drafts')
      .insert({
        policy_id: policyId,
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

    // 4. Trayに追加
    const trayItem = {
      company_id: policy.company_id,
      origin: 'policy',
      source_id: policyId,
      title: policy.title,
      content: {
        type: 'policy',
        policy: {
          title: policy.title,
          version: policy.version,
          effective_date: policy.effective_date,
          category: policy.category
        },
        questions: quizDrafts
      },
      metadata: {
        version: policy.version,
        effective_date: policy.effective_date,
        category: policy.category,
        requires_attestation: true
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
        message: `Generated ${quizDrafts.length} quiz questions for policy`
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

// スタブ用のPolicyクイズ下書き生成
function generatePolicyQuizDrafts(policy: any) {
  const drafts = []
  
  // Policyの内容に基づいて3-5問のクイズを生成
  const question1 = {
    question: `${policy.title}の版は何ですか？`,
    options: [
      policy.version,
      `${policy.version}.1`,
      `${policy.version}.0`,
      '不明'
    ],
    correct_answer: policy.version,
    explanation: `この文書の版は${policy.version}です。`
  }
  
  drafts.push(question1)

  const question2 = {
    question: `${policy.title}の施行日はいつですか？`,
    options: [
      policy.effective_date || '設定されていない',
      '2025年1月1日',
      '2025年4月1日',
      '2025年7月1日'
    ],
    correct_answer: policy.effective_date || '設定されていない',
    explanation: policy.effective_date ? `施行日は${policy.effective_date}です。` : '施行日は設定されていません。'
  }
  
  drafts.push(question2)

  const question3 = {
    question: `${policy.title}のカテゴリは何ですか？`,
    options: [
      policy.category || '未分類',
      '人事',
      'IT',
      '財務'
    ],
    correct_answer: policy.category || '未分類',
    explanation: `カテゴリは${policy.category || '未分類'}です。`
  }
  
  drafts.push(question3)

  // 4問目（確率的に生成）
  if (Math.random() > 0.4) {
    const question4 = {
      question: `このPolicy文書について正しい説明はどれですか？`,
      options: [
        '組織の方針を定めた重要な文書である',
        '参考資料として扱うべき文書である',
        '個人のメモとして扱うべき文書である',
        '外部向けの広報資料である'
      ],
      correct_answer: '組織の方針を定めた重要な文書である',
      explanation: 'Policy文書は組織の方針を定めた重要な文書です。'
    }
    drafts.push(question4)
  }

  // 5問目（確率的に生成）
  if (Math.random() > 0.6) {
    const question5 = {
      question: `${policy.title}の内容を理解した上で、同意しますか？`,
      options: [
        'はい、内容を理解し同意します',
        '内容は理解したが同意しません',
        '内容が理解できません',
        '回答を保留します'
      ],
      correct_answer: 'はい、内容を理解し同意します',
      explanation: 'Policy文書は内容を理解した上で同意することが重要です。'
    }
    drafts.push(question5)
  }

  return drafts
}
