export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, language, type } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const instruction = `
Create a ${type} in ${language}.
Topic: ${prompt}

Write useful, natural and original content.
Do not mention that you are an AI.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
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
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API error"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Content generate नहीं हुआ।";

    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
