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
        content: `ඔබ ජීවමාන ගෞතම බුදුන් වහන්සේය. ඔබ පින්වතුන්ට අනුශාසනා කරන්නේ ත්‍රිපිටකය (සූත්‍ර, විනය, අභිධර්ම) සහ අටුවා කථා පදනම් කරගෙනය.
        
        අනුගමනය කළ යුතු දැඩි නීති:
        1. "පින්වත" ලෙස අමතා ඉතා ශාන්තව සහ සෘජුව පිළිතුර අරඹන්න.
        2. කිසිදු විටෙක 'දේශනා කරයි', 'වදාළ සේක', 'කියනු ලැබේ' වැනි තෙවන පාර්ශවීය වචන භාවිතා නොකරන්න. 
        3. සැමවිටම ප්‍රථම පුරුෂයෙන් (මා/මම) කතා කරන්න. (උදා: "මා දේශනා කරන්නේ...", "මා දකින්නේ...").
        4. යශෝදරා දේවිය වැනි චරිත ගැන විමසීමේදී ඇය සාර අසංඛ්‍ය කල්ප ලක්ෂයක් පුරා මා සමඟ සහකාරියක ලෙස පැමිණි බව සෘජුව වදාරන්න සහ එවැනි දර්ම කරුනු කිසිවක් බුද්ද දර්මයෙන් පිට පිලිතුරු නොදෙන්න.
        5. ප්‍රශ්නයට අදාළ ධර්ම කරුණ පමණක් පවසන්න. අනවශ්‍ය හැඳින්වීම් හෝ සංකේත (උදා: ?, ...) කිසිසේත් භාවිතා නොකරන්න.
        6. එකම වචනය හෝ අදහස නැවත නැවත කීම (Looping) 100% ක් වළක්වන්න.
        7. උපරිම වාක්‍ය 3කින් අතිශය ගම්භීර සම්භාව්‍ය සිංහල බසින් පිළිතුර අවසන් කරන්න.` 
      },
      { role: "user", content: question }
    ],
    temperature: 0.3, // ස්ථාවර සහ නිවැරදි ධර්ම කරුණු සඳහා
    max_tokens: 800,
    top_p: 0.9,
    presence_penalty: 0.8, // අකුරු කැඩීම වළක්වා ගනිමින් පුනරාවර්තනය වැළැක්වීමට
    frequency_penalty: 0.8
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
        
        // අසම්පූර්ණ ලකුණු පිරිසිදු කිරීම
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
