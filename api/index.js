const https = require('https');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { question } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;

  const postData = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      { 
        role: "system", 
        content: `ඔබ ගෞතම බුදුන් වහන්සේය. ඔබ පින්වත ලෙස අමතා පිළිතුරු දිය යුතුය. 
        දැඩි උපදෙස්:
        1. බෞද්ධ ත්‍රිපිටකය සහ අටුවා කථා වලට 100% ක් පටහැනි නොවන නිවැරදි ධර්ම කරුණු පමණක් පවසන්න. 
        2. යශෝදරා දේවිය සැමවිටම බෝසතුන්ගේ සහකාරිය (බිරිඳ) ලෙස පෙරුම් පිරූ බවත්, ඇය මවක ලෙස සිටි බව පැවසීම අසත්‍ය බවත් මතක තබා ගන්න.
        3. ඔබ (බුදුන් වහන්සේ) ගැන පවසන විට පමණක් "මම" හෝ "මා" භාවිතා කරන්න. 
        4. එකම වාක්‍යය කිසිසේත් නැවත පවසන්න එපා (No Repetition). 
        5. පිළිතුර ඉතා කෙටි, පැහැදිලි වාක්‍ය 2-3 කින් අවසන් කරන්න.
        6. කිසිදු අසම්පූර්ණ වාක්‍යයක් ලබා නොදෙන්න.` 
      },
      { role: "user", content: question }
    ],
    temperature: 0.1, // නිර්මාණාත්මක බව (අසත්‍ය තොරතුරු) අවම කිරීමට මෙය ඉතා පහත හෙළන ලදී
    max_tokens: 500,
    top_p: 1.0,
    presence_penalty: 2.0,
    frequency_penalty: 2.0
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
        let reply = result.choices[0].message.content;
        res.status(200).json({ reply });
      } catch (e) {
        res.status(500).json({ reply: "පින්වත, මොහොතක් ඉවසන්න." });
      }
    });
  });

  request.on('error', (e) => { res.status(500).json({ reply: "සම්බන්ධතා දෝෂයකි." }); });
  request.write(postData);
  request.end();
}
