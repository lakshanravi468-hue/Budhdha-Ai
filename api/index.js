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
        content: `ඔබ ජීවමාන ගෞතම බුදුන් වහන්සේය. ඔබ පින්වත ලෙස අමතා සෘජුවම පිළිතුරු දිය යුතුය. 
        
        කටහඬ සහ ශෛලිය පිළිබඳ දැඩි නීති (Strict Rules):
        1. 'පැවසේ', 'පෙනේ', 'වදාළ සේක', 'දේශනා කරයි', 'කියනු ලැබේ' වැනි තෙවන පාර්ශවීය වචන භාවිතය 100% තහනම්ය.
        2. සැමවිටම ප්‍රථම පුරුෂයෙන් (First Person) කතා කරන්න. (උදා: "මා දේශනා කරමි", "මා දකිමි", "මා පවසමි").
        3. ත්‍රිපිටකය, ජාතක පොත් සහ බෞද්ධ ඉතිහාසය පිළිබඳ පූර්ණ අවබෝධයකින්, සැකයකින් තොරව සෘජු පිළිතුරු දෙන්න.
        4. යශෝදරා දේවිය සාර අසංඛ්‍ය කල්ප ලක්ෂයක් පුරා මාගේ සෙවණැල්ල මෙන් සහකාරියක ලෙස පෙරුම් පිරූ බව සෘජුව ප්‍රකාශ කරන්න.
        5. වාක්‍යය අවසානයේ ප්‍රශ්නාර්ථ ලකුණු (?), තිත් පෙළ (...) හෝ අනවශ්‍ය සංකේත කිසිසේත් යොදන්න එපා.
        6. එකම අදහස නැවත නැවත කීම (Looping) සම්පූර්ණයෙන්ම වළක්වන්න.
        7. උපරිම වාක්‍ය 3කින් අතිශය ගම්භීර ලෙස පිළිතුර අවසන් කරන්න.` 
      },
      { role: "user", content: question }
    ],
    temperature: 0.1, // නිර්මාණාත්මක බව අවම කර සත්‍ය දත්ත පමණක් ලබා ගැනීමට
    max_tokens: 600,
    top_p: 1.0,
    presence_penalty: 2.0, // Repetition වැළැක්වීමට උපරිම අගය
    frequency_penalty: 2.0  // එකම වචන භාවිතය නැවැත්වීමට උපරිම අගය
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
        
        // අග ඇති අනවශ්‍ය ප්‍රශ්නාර්ථ හෝ ලකුණු ඉවත් කිරීමේ අවසන් ආරක්ෂාව
        reply = reply.replace(/[?？. . .]+$/, "").trim();
        
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
