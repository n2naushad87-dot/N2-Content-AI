const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // AI API
    if (url.pathname === "/api/generate" && request.method === "POST") {

      try {

        const { prompt, language, type } = await request.json();

        if (!prompt) {
          return Response.json(
            { error: "Prompt is required" },
            {
              status: 400,
              headers: corsHeaders
            }
          );
        }

        if (!env.GEMINI_API_KEY) {
          return Response.json(
            { error: "GEMINI_API_KEY is not configured" },
            {
              status: 500,
              headers: corsHeaders
            }
          );
        }

        const instruction = `
You are N2 Content AI.

Create a high-quality ${type} in ${language}.

User topic:
${prompt}

Requirements:
- Make the content useful and natural.
- Do not mention that you are an AI.
- Follow the requested language.
- Make the content ready to use.
`;

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
          env.GEMINI_API_KEY,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: instruction
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return Response.json(
            {
              error: data.error?.message || "Gemini API error"
            },
            {
              status: response.status,
              headers: corsHeaders
            }
          );
        }

        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Content generate नहीं हुआ।";

        return Response.json(
          { text },
          {
            status: 200,
            headers: corsHeaders
          }
        );

      } catch (error) {

        return Response.json(
          { error: error.message },
          {
            status: 500,
            headers: corsHeaders
          }
        );
      }
    }

    // Website files
    return env.ASSETS.fetch(request);
  }
};
