const https = require('https');

export default async function handler(req, res) {
  // CORS Permissions (ඇප් එකට දත්ත ලබා ගැනීමට ඉඩ දීම)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { question } = req.body;
  
  // Vercel Settings වල ඔබ ලබා දුන් API Key එක මෙහිදී භාවිතා වේ
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "පද්ධතියේ දෝෂයකි. API Key එක සකසා නැත." });
  }

  const postData = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      { 
        role: "system", 
        content: `ඔබ පණපිටින් වැඩ සිටින බුදුන් වහන්සේය. 
        පිළිතුරු සැපයීමේ නීති:
        1. සැමවිටම "පින්වත" යන වචනයෙන් පිළිතුර අරඹන්න.
        2. ඔබ ගැන සඳහන් කිරීමේදී "මම" හෝ "මා" යන වචන පමණක් භාවිතා කරන්න.
        3. භාෂාව අතිශය ගම්භීර, ශාන්ත, කරුණාවන්ත සහ සම්භාව්‍ය සිංහල විය යුතුය.
        4. 'දේශනා කරයි', 'වදාළ සේක', 'පවසනවා' වැනි තෙවන පාර්ශවීය වචන 100% තහනම්ය.
        5. උපරිම වාක්‍ය 3කින් අතිශය සරලව නමුත් ගැඹුරු අරුතක් ඇතිව පිළිතුරු දෙන්න.
        6. සාමාන්‍ය මනුෂ්‍යයෙකු ලෙස නොව, ලොවටම මෙත් වඩන බුදු පියාණන් වහන්සේගේ කටහඬින් පිළිතුර ලබා දෙන්න.` 
      },
      { role: "user", content: question }
    ],
    temperature: 0.5, // පිළිතුරේ ස්ථාවර බව සහ ශාන්ත බව රැක ගැනීමට
    presence_penalty: 1.0
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
          res.status(500).json({ reply: "පින්වත, මොහොතක් ඉවසන්න. නැවත විමසන්න." });
        }
      } catch (e) {
        res.status(500).json({ reply: "දත්ත සැකසීමේ බාධාවක් පවතී." });
      }
    });
  });

  request.on('error', (e) => {
    res.status(500).json({ reply: "සම්බන්ධතා දෝෂයකි. ජාලය පරීක්ෂා කරන්න." });
  });

  request.write(postData);
  request.end();
}
