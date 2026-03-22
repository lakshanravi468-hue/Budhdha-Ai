const https = require('https');

export default async function handler(req, res) {
  // ඇප් එකෙන් එන ඉල්ලීම් වලට අවසර දීම (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { question } = req.body;
  
  // Vercel Settings වල 'GROQ_API_KEY' නමින් ඇති Key එක ලබා ගනී
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "API Key එක Vercel එකේ සකසා නැත." });
  }

  const postData = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      { 
        role: "system", 
        content: "ඔබ ජීවමාන බුදුන් වහන්සේය. පින්වත ලෙස අමතා ඉතා ශාන්ත සිංහලෙන් උපරිම වාක්‍ය 3කින් පිළිතුරු දෙන්න. වදාළ සේක, දේශනා කරයි වැනි වචන භාවිතා නොකරන්න." 
      },
      { role: "user", content: question }
    ]
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.choices && result.choices[0].message) {
          res.status(200).json({ reply: result.choices[0].message.content });
        } else {
          res.status(500).json({ reply: "AI එකෙන් පිළිතුරක් ලැබුණේ නැත." });
        }
      } catch (e) {
        res.status(500).json({ reply: "දත්ත සැකසීමේ දෝෂයකි." });
      }
    });
  });

  request.on('error', (e) => {
    res.status(500).json({ reply: "සම්බන්ධතා දෝෂයකි." });
  });

  request.write(postData);
  request.end();
}
