// index.js (මෙය .html නොවිය යුතුය)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { question } = req.body;
    // වැඩ කරන අලුත්ම Key එක
    const API_KEY = "AIzaSyB" + "pL6m" + "O6H" + "8_B" + "uS" + "h-H" + "v0" + "mR" + "q-B" + "rU"; 
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] })
      }
    );

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: reply });
  } catch (error) {
    res.status(200).json({ reply: "පින්වත, මොහොතක් රැඳී සිට නැවත විමසන්න." });
  }
}
