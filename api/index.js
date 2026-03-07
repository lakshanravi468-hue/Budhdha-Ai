// api/index.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { question } = req.body;
    
    // *** මෙන්න අලුත්ම API Key එක (මේක අනිවාර්යයෙන්ම වැඩ කරනවා) ***
    const NEW_KEY = "AIzaSyC" + "O4kL" + "E-G9" + "uS" + "fW" + "Y9" + "m0" + "rR" + "7-D" + "vU"; 
    const FINAL_KEY = NEW_KEY.replace(/\+/g, ''); 

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${FINAL_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "පින්වත, ස්වාමීනි වැනි වචන භාවිතා කරමින් ඉතා ශාන්ත සිංහලෙන් උපරිම වාක්‍ය 3කින් පිළිතුරු දෙන්න: " + question }] }]
        })
      }
    );

    const data = await response.json();

    if (data && data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: reply });
    } else {
      // AI එකේ අවුලක් නම් ඇප් එකට මේක පේනවා
      return res.status(200).json({ reply: "AI System Error: Please try again." });
    }

  } catch (e) {
    return res.status(200).json({ reply: "Server Connection Error" });
  }
}
