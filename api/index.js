export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { question } = req.body;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBpL6mO6H8_BuSh-Hv0mRq-BrU`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] })
      }
    );
    const data = await response.json();
    res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
  } catch (e) {
    res.status(200).json({ reply: "පින්වත, නැවත විමසන්න." });
  }
}
