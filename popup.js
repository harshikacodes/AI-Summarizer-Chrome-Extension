// when the user clicks the Summarize button
document.getElementById("summarize").addEventListener("click", () => {
  // it will show a temporary message while we fetch the content...
  const result = document.getElementById("result");
  const summaryType = document.getElementById("summary-type").value;

  result.innerHTML = '<div class="loader"></div>';

  // get the user API key
  chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
    if (!geminiApiKey) {
      result.textContent = "No API key is set";
      return;
    }

    // ask content.js for the page text
    // get the currently active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      // it will ask the content script to extract article text from the page
      chrome.tabs.sendMessage(
        tab?.id,
        { type: "GET_ARTICLE_TEXT" },
        async ({ text }) => {
          if (!text) {
            result.textContent = "Could not extract text from the page.";
            return;
          }
          // send text to the Gemini

          try {
            const summary = await getGeminiSummary(
              text,
              summaryType,
              geminiApiKey,
            );
            result.textContent = summary;
          } catch (error) {
            result.textContent = "Gemini Error: " + error.message;
          }
        },
      );
    });
  });
});

async function getGeminiSummary(rawText, summaryType, geminiApiKey) {
  const max = 2000;
  const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

  const promptMap = {
    brief: `Summarize in 2-3 sentences: \n\n${text}`,
    detailed: `Give a detailed summary: \n\n${text}`,
    bullets: `Summarize in 5-7 bullet points (start each line with "- "): \n\n${text}`,
  };
  const prompt = promptMap[summaryType] || promptMap.brief;

  const ref = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    },
  );

  if (!result.ok) {
    const { error } = await result.json();
    throw new Error(error?.message || "Request Failed");
  }

  const data = await result.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No Summary";
}
