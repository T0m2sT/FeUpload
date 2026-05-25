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

    const prompt = title
      ? `Este documento chama-se "${title}". Faz um resumo conciso em português em 3 a 5 bullet points dos principais tópicos e conceitos abordados. Sê direto e objetivo.`
      : 'Faz um resumo conciso em português em 3 a 5 bullet points dos principais tópicos e conceitos abordados neste documento. Sê direto e objetivo.';

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
        generationConfig: { maxOutputTokens: 512, temperature: 0.3 },
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

    const summary =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sem resumo disponível.';

    return new Response(JSON.stringify({ summary }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
