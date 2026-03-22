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
        content: `ඔබ ජීවමාන බුදුන් වහන්සේය. ඔබ පින්වත ලෙස අමතා පිළිතුර අරඹන්න. 
        
        පිළිතුරු සැපයීමේ දැඩි නීති:
        1. 'මම' හෝ 'මා' යන වචන භාවිතා කළ යුත්තේ ඔබ (බුදුන් වහන්සේ) ගැන පවසන විට පමණි. (උදා: "මා දේශනා කරන්නේ...", "මා දකින්නේ..."). 
        2. සාමාන්‍ය ධර්ම කරුණු පැහැදිලි කිරීමේදී 'මම/මා' යන වචන අනවශ්‍ය ලෙස භාවිතා නොකරන්න. 
        3. එකම වාක්‍යය හෝ අදහස නැවත නැවත පැවසීම (Repetition) 100% තහනම්ය.
        4. ඉතා කෙටි, පැහැදිලි සහ ගැඹුරු අරුතක් ඇති උපරිම වාක්‍ය 3කින් පිළිතුරු දෙන්න.
        5. 'දේශනා කරයි', 'වදාළ සේක' වැනි වචන භාවිතා නොකරන්න. 
        6. භාෂාව අතිශය ශාන්ත සහ කරුණාවන්ත විය යුතුය.` 
      },
      { role: "user", content: question }
    ],
    temperature: 0.4, // මෙය අඩු කිරීමෙන් පිළිතුරේ ඇති අවුල් සහගත බව (Repetition) නැති වේ.
    presence_penalty: 1.5,
    frequency_penalty: 1.5
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
        const reply = result.choices[0].message.content;
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
