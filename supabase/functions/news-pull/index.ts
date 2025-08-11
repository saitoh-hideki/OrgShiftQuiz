import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const url = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!;
const anon = Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")!;
const supa = createClient(url, anon);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors() });
  }

  // テストモード: news_articles にダミーを insert
  const { error } = await supa.from("news_articles").insert({
    title: "テスト記事 " + new Date().toLocaleString(),
    url: "https://example.com/news",
    summary: "これは関数から追加したダミー記事です。",
    status: "new",
    trust_score: 4,
    company_id: "00000000-0000-0000-0000-000000000001",
  });

  if (error) {
    return new Response(JSON.stringify({ ok:false, error: error.message }), { status: 500, headers: corsJson() });
  }
  return new Response(JSON.stringify({ ok:true }), { headers: corsJson() });
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,authorization",
  };
}
function corsJson() {
  return { ...cors(), "content-type": "application/json" };
}
