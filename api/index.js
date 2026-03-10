// api/index.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { question } = req.body;
    // ඔයා එවපු අලුත්ම API Key එක
    const API_KEY = "AIzaSyBAh59EoEMRzeOyCg20nq3YHSC6aOWl7FY"; 

    // අපි v1beta වෙනුවට stable v1 එක පාවිච්චි කරමු
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "පින්වත, ශාන්ත සිංහලෙන් උපරිම වාක්‍ය 3කින් පිළිතුරු දෙන්න: " + question }] }]
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: reply });
    } else {
      // මෙතනින් අපිට තවමත් අවුලක් තිබේ නම් බලාගත හැක
      const errorMsg = data.error ? data.error.message : "Model mismatch";
      return res.status(200).json({ reply: "Google Error: " + errorMsg });
    }
  } catch (e) {
    return res.status(200).json({ reply: "Server Connection Error" });
  }
}
