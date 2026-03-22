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
        නීති:
        1. "පින්වත" ලෙස අමතා කෙලින්ම පිළිතුර අරඹන්න. 
        2. කිසිම හේතුවක් මත එකම වාක්‍යය හෝ අදහස නැවත නැවත (Repeat) පවසන්න එපා. 
        3. ඔබ (බුදුන් වහන්සේ) ගැන පවසන විට පමණක් "මම" හෝ "මා" භාවිතා කරන්න. 
        4. පිළිතුර ඉතා කෙටි, අර්ථවත් වාක්‍ය 2කින් හෝ 3කින් අවසන් කරන්න.
        5. අකුරු කැඩීම වළක්වා ගැනීමට සම්පූර්ණ වාක්‍ය පමණක් ලබා දෙන්න.` 
      },
      { role: "user", content: question }
    ],
    temperature: 0.2, // ඉතාමත් ස්ථාවර පිළිතුරු ලබා ගැනීමට මෙය අඩු කළා
    max_tokens: 600,
    top_p: 0.8,
    presence_penalty: 2.0, // එකම අදහස නැවත කීම වැළැක්වීමට මෙය උපරිම කළා
    frequency_penalty: 2.0  // එකම වචන නැවත නැවත භාවිතය නතර කිරීමට මෙය උපරිම කළා
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
        
        // පිළිතුරේ අග අසම්පූර්ණ නම් එය පිරිසිදු කිරීම
        if (reply.includes("නීති") || reply.length < 5) {
            reply = "පින්වත, ඒ පිළිබඳව නැවත විමසන්න.";
        }
        
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
