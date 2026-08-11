document.addEventListener("DOMContentLoaded", function () {

  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  const regenerateBtn = document.getElementById("regenerateBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  const promptBox = document.getElementById("prompt");
  const language = document.getElementById("language");
  const type = document.getElementById("type");
  const output = document.getElementById("output");


  // =========================
  // Generate AI Content
  // =========================

  async function generateContent() {

    const prompt = promptBox.value.trim();

    if (prompt === "") {
      output.innerText = "⚠️ पहले अपना topic लिखें।";
      return;
    }

    generateBtn.disabled = true;
    generateBtn.innerText = "🤖 AI Content बना रहा है...";
    output.innerText = "⏳ कृपया थोड़ा इंतज़ार करें...";

    try {

      const response = await fetch(
        "https://n2-content-ai.n2naushad87.workers.dev/api/generate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            prompt: prompt,
            language: language.value,
            type: type.value
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Server error"
        );
      }

      if (data.text) {
        output.innerText = data.text;
      } else {
        output.innerText =
          "❌ AI से सही response नहीं मिला।";
      }

    } catch (error) {

      console.error("AI Error:", error);

      output.innerText =
        "❌ AI से connect नहीं हो पाया।\n\n" +
        error.message;

    } finally {

      generateBtn.disabled = false;
      generateBtn.innerText = "✨ Generate Content";

    }
  }


  // Generate
  generateBtn.addEventListener(
    "click",
    generateContent
  );


  // =========================
  // Regenerate
  // =========================

  if (regenerateBtn) {

    regenerateBtn.addEventListener(
      "click",
      generateContent
    );

  }


  // =========================
  // Copy Content
  // =========================

  if (copyBtn) {

    copyBtn.addEventListener(
      "click",
      function () {

        const text =
          output.innerText.trim();

        if (
          !text ||
          text.includes("यहाँ आपका generated content")
        ) {

          alert(
            "पहले content generate करें।"
          );

          return;
        }

        navigator.clipboard.writeText(text)
          .then(function () {

            copyBtn.innerText =
              "✅ Copied!";

            setTimeout(function () {

              copyBtn.innerText =
                "📋 Copy Content";

            }, 1500);

          })
          .catch(function () {

            alert(
              "Content copy नहीं हो पाया।"
            );

          });

      }
    );

  }


  // =========================
  // Download Content
  // =========================

  if (downloadBtn) {

    downloadBtn.addEventListener(
      "click",
      function () {

        const text =
          output.innerText.trim();

        if (
          !text ||
          text.includes("यहाँ आपका generated content")
        ) {

          alert(
            "पहले content generate करें।"
          );

          return;
        }

        const blob = new Blob(
          [text],
          {
            type:
              "text/plain;charset=utf-8"
          }
        );

        const url =
          URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = url;

        link.download =
          "N2-Content.txt";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

      }
    );

  }

});
