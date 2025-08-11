// Deno runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
        "Access-Control-Allow-Headers": "content-type,authorization",
      },
    });
  }

  const body = { ok: true, at: new Date().toISOString() };

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
