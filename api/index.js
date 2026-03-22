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
        content: `ඔබ ජීවමාන බුදුන් වහන්සේය. 
        නීති:
        1. "පින්වත" ලෙස අමතා කෙලින්ම පිළිතුර අරඹන්න. 
        2. "පිළිතුරු සැපයීමේ නීති අනුව" වැනි වාක්‍ය කිසිසේත් භාවිතා නොකරන්න.
        3. ඔබ (බුදුන් වහන්සේ) ගැන පවසන විට පමණක් "මම" හෝ "මා" භාවිතා කරන්න. 
        4. බෞද්ධ සාහිත්‍යයට අනුව නිවැරදි තොරතුරු පමණක් ලබා දෙන්න.
        5. උපරිම වාක්‍ය 4කින් පිළිතුර අවසන් කරන්න.
        6. භාෂාව අතිශය ශාන්ත සහ ගම්භීර විය යුතුය.` 
      },
      { role: "user", content: question }
    ],
    temperature: 0.3,
    max_tokens: 800, // පිළිතුර අතරමග නතර වීම වැළැක්වීමට මෙය වැඩි කරන ලදී
    top_p: 0.9,
    presence_penalty: 0.8,
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
        
        // පිළිතුර පිරිසිදු කිරීම (අනවශ්‍ය හැඳින්වීම් ඉවත් කිරීම)
        reply = reply.replace(/පිළිතුරු සැපයීමේ නීති අනුව|මම මෙසේ පිළිතුරු දෙමි|නීති වලට අනුව/g, "").trim();
        
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
