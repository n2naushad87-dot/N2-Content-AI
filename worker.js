export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Browser preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // AI Content API
    if (
      url.pathname === "/api/generate" &&
      request.method === "POST"
    ) {
      try {
        const body = await request.json();

        const prompt = body.prompt;
        const language = body.language || "Hindi";
        const type = body.type || "Article";

        if (!prompt || prompt.trim() === "") {
          return Response.json(
            { error: "Prompt is required" },
            { status: 400, headers: corsHeaders }
          );
        }

        if (!env.GEMINI_API_KEY) {
          return Response.json(
            { error: "GEMINI_API_KEY is not configured" },
            { status: 500, headers: corsHeaders }
          );
        }

        const instruction = `
You are N2 Content AI.

Create high-quality ${type} content in ${language}.

User topic:
${prompt}

Requirements:
- Write useful and natural content.
- Follow the requested language.
- Make the content ready to use.
- Do not mention that you are an AI.
- Do not add unnecessary explanations.
`;

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
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
              error:
                data?.error?.message ||
                "Gemini API error"
            },
            {
              status: response.status,
              headers: corsHeaders
            }
          );
        }

        const text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          return Response.json(
            { error: "AI ने कोई content नहीं दिया।" },
            { status: 500, headers: corsHeaders }
          );
        }

        return Response.json(
          { text: text },
          {
            status: 200,
            headers: corsHeaders
          }
        );

      } catch (error) {
        return Response.json(
          {
            error: error?.message || "Server error"
          },
          {
            status: 500,
            headers: corsHeaders
          }
        );
      }
    }

    // Website files
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      "N2 Content AI Worker is running.",
      {
        status: 200,
        headers: corsHeaders
      }
    );
  }
};
