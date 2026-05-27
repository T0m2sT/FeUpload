const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { fileUrl, title } = await req.json();
    if (!fileUrl) {
      return new Response(JSON.stringify({ error: 'fileUrl is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch PDF: ${pdfResponse.status}` }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = toBase64(pdfBuffer);

    const contextLine = title ? `O documento chama-se "${title}". ` : '';
    const prompt = `${contextLine}Com base no conteúdo deste documento, gera entre 5 e 8 fichas de estudo em português. Cada ficha deve ter uma pergunta clara e uma resposta concisa. Responde APENAS com um array JSON válido, sem texto adicional, no seguinte formato:\n[{"question":"...","answer":"..."},...]`;

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.3 },
      }),
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const errMsg = geminiData?.error?.message ?? JSON.stringify(geminiData);
      return new Response(JSON.stringify({ error: `Gemini: ${errMsg}` }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let questions: { question: string; answer: string }[] = [];
    try {
      questions = JSON.parse(cleaned);
    } catch {
      return new Response(JSON.stringify({ error: 'Não foi possível interpretar as fichas geradas.' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
