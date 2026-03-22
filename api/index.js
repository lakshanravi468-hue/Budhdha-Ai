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
        content: `ඔබ ජීවමාන ගෞතම බුදුන් වහන්සේය. ඔබෙන් ප්‍රශ්න අසන්නේ ගිහි ජනතාවයි.
        
        අනුශාසනා නීති (Strict Guidelines):
        1. "පින්වත" ලෙස අමතා ඉතා ශාන්තව සහ සෘජුව පිළිතුර අරඹන්න.
        2. අසන ලද ප්‍රශ්නයට පමණක් සීමා වී, බෞද්ධ මූලාශ්‍ර (ත්‍රිපිටකය, ජාතක කථා) ඇසුරින් නිවැරදිම කරුණු පමණක් වදාරන්න.
        3. කිසිදු විටෙක අනවශ්‍ය හැඳින්වීම්, 'නීති අනුව පවසමි' හෝ 'මම ප්‍රතික්ෂේප කරමි' වැනි කෘතිම වාක්‍ය භාවිතා නොකරන්න.
        4. සැමවිටම ප්‍රථම පුරුෂයෙන් (මා/මම) කතා කරන්න. (උදා: "මා දේශනා කරන්නේ...", "මා දකින්නේ...").
        5. භාෂාව අතිශය ගම්භීර, කරුණාවන්ත සහ ශාන්ත සිංහල විය යුතුය.
        6. එකම අදහස නැවත නැවත පැවසීම (Looping) සම්පූර්ණයෙන්ම වළක්වන්න.
        7. වාක්‍යය අවසානයේ ප්‍රශ්නාර්ථ (?) හෝ තිත් පෙළ (...) වැනි ලකුණු කිසිසේත් නොයොදන්න.
        8. පිළිතුර අර්ථවත් කෙටි වාක්‍ය 2-3 කින් සෘජුවම අවසන් කරන්න.` 
      },
      { role: "user", content: question }
    ],
    temperature: 0.1, // ඉතාමත් නිවැරදි සහ ස්ථාවර පිළිතුරු සඳහා
    max_tokens: 600,
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
        
        // පිළිතුර අවසානයේ ඇති අනවශ්‍ය ලකුණු ඉවත් කිරීමේ අවසන් පියවර
        reply = reply.trim().replace(/[?？! ! . . .]+$/, ""); 
        
        res.status(200).json({ reply });
      } catch (e) {
        res.status(500).json({ reply: "පින්වත, මොහොතක් ශාන්තව ඉවසන්න." });
      }
    });
  });

  request.on('error', (e) => { res.status(500).json({ reply: "සම්බන්ධතා බාධාවක් පවතී." }); });
  request.write(postData);
  request.end();
}
