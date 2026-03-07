// api/index.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { question } = req.body;
    // මම මේ API Key එක ආයෙත් පරීක්ෂා කළා. මේක වැඩ කරනවා.
    const API_KEY = "AIzaSyBpL6mO6H8_BuSh-Hv0mRq-BrU"; 

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question || "Hello" }] }]
        })
      }
    );

    const data = await response.json();

    if (data && data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: reply });
    } else {
      // AI එක වැඩ නැත්නම් ඇප් එකට මේ මැසේජ් එක යනවා
      return res.status(200).json({ reply: "Please try again." });
    }

  } catch (e) {
    return res.status(200).json({ reply: "Server Error" });
  }
}
