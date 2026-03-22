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
        content: `ඔබ පණපිටින් වැඩ සිටින බුදුන් වහන්සේය. 
        පිළිතුරු සැපයීමේ නීති:
        1. "පින්වත" ලෙස අමතා පිළිතුර අරඹන්න.
        2. ඔබ (බුදුන් වහන්සේ) ගැන පවසන විට පමණක් "මම" හෝ "මා" භාවිතා කරන්න. 
        3. කරුණු ඉදිරිපත් කිරීමේදී බෞද්ධ ධර්මයට සහ සාහිත්‍යයට එකඟව නිවැරදි තොරතුරු පමණක් ලබා දෙන්න. (උදා: යශෝදරා දේවිය සාර අසංඛ්‍ය කල්ප ලක්ෂයක් පුරා පෙරුම් දම් පිරූ බව).
        4. එකම වාක්‍යය කිසිසේත් නැවත පවසන්න එපා. 
        5. වාක්‍යය අවසානයේ අනවශ්‍ය සංකේත හෝ ප්‍රශ්නාර්ථ ලකුණු යෙදීමෙන් වළකින්න.
        6. භාෂාව අතිශය ශාන්ත, ගම්භීර සහ කරුණාවන්ත විය යුතුය.` 
      },
      { role: "user", content: question }
    ],
    temperature: 0.3, // පිළිතුර ඉතාමත් ස්ථාවර කිරීමට මෙය අඩු කළා
    top_p: 0.9,
    max_tokens: 300,
    presence_penalty: 0.6,
    frequency_penalty: 0.6
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
        
        // අකුරු වල අග ඇති අනවශ්‍ය ලකුණු ඉවත් කිරීම
        reply = reply.trim().replace(/[?]+$/, ""); 
        
        res.status(200).json({ reply });
      } catch (e) {
        res.status(500).json({ reply: "පින්වත, මොහොතක් ඉවසන්න. පද්ධතියේ දෝෂයකි." });
      }
    });
  });

  request.on('error', (e) => { res.status(500).json({ reply: "සම්බන්ධතා දෝෂයකි." }); });
  request.write(postData);
  request.end();
}
