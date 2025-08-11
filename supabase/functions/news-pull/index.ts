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
    // Supabaseクライアント作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // テストモード用の会社ID
    const testCompanyId = '00000000-0000-0000-0000-000000000001'

    // 1. activeなRSSソースを取得
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('*')
      .eq('company_id', testCompanyId)
      .eq('is_active', true)

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`)
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'No active RSS sources found',
          inserted: 0,
          skipped: 0,
          failed: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const results = {
      inserted: 0,
      skipped: 0,
      failed: [] as string[]
    }

    // 2. 各RSSソースから記事を取得（スタブ実装）
    for (const source of sources) {
      try {
        // 実際のRSS取得処理（現在はスタブ）
        const mockArticles = generateMockArticles(source, testCompanyId)
        
        for (const article of mockArticles) {
          try {
            // 重複チェック（hashベース）
            const { data: existing } = await supabase
              .from('news_articles')
              .select('id')
              .eq('hash', article.hash)
              .single()

            if (existing) {
              results.skipped++
              continue
            }

            // 記事を挿入
            const { error: insertError } = await supabase
              .from('news_articles')
              .insert(article)

            if (insertError) {
              results.failed.push(`${source.name}: ${insertError.message}`)
            } else {
              results.inserted++
            }
          } catch (articleError) {
            results.failed.push(`${source.name}: ${articleError.message}`)
          }
        }
      } catch (sourceError) {
        results.failed.push(`${source.name}: ${sourceError.message}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        ...results,
        message: `Processed ${sources.length} sources`
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
        inserted: 0,
        skipped: 0,
        failed: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// スタブ用のモック記事生成
function generateMockArticles(source: any, companyId: string) {
  const now = new Date()
  const articles = []
  
  // 各ソースから2-3件のモック記事を生成
  for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
    const article = {
      company_id: companyId,
      source_id: source.id,
      title: `${source.name} - サンプル記事 ${i + 1}`,
      url: `${source.url}/article-${i + 1}`,
      published_at: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      summary: `これは${source.name}からのサンプル記事${i + 1}の要約です。`,
      topics: ['サンプル', 'テスト'],
      status: 'new',
      trust_score: 3 + Math.floor(Math.random() * 3),
      hash: `${source.id}-${i}-${Date.now()}`,
      created_at: now.toISOString()
    }
    articles.push(article)
  }
  
  return articles
}
