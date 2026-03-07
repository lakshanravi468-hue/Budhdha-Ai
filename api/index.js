// api/index.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { question } = req.body;
    // පාවිච්චි කරන API Key එක මෙතන තියෙනවා
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

    // AI එකෙන් උත්තරයක් ආවා නම් ඒක යවනවා
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: reply });
    } else {
      return res.status(200).json({ reply: "පින්වත, මා හට සවන් දෙන්න. නැවත විමසන්න." });
    }

  } catch (e) {
    // මොකක් හරි ලොකු අවුලක් වුණොත් විතරයි මේක වැටෙන්නේ
    return res.status(200).json({ reply: "සර්වර් එකේ දෝෂයකි: " + e.message });
  }
}
