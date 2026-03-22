const https = require('https');

export default async function handler(req, res) {
  // CORS Permissions
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { question } = req.body;
  
  // වැදගත්: දැන් API Key එක ගන්නේ Environment Variables හරහායි
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ reply: "API Key එක පද්ධතියේ සොයාගත නොහැක." });
  }

  const postData = JSON.stringify({
    contents: [{ 
      parts: [{ 
        text: "ඔබ ජීවමාන බුදුන් වහන්සේය. පින්වත, ශාන්ත සම්භාව්‍ය සිංහලෙන් උපරිම වාක්‍ය 3කින් පිළිතුරු දෙන්න: " + question 
      }] 
    }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.candidates && result.candidates[0].content) {
          res.status(200).json({ reply: result.candidates[0].content.parts[0].text });
        } else {
          res.status(200).json({ reply: "පද්ධතියේ දෝෂයක්. නැවත උත්සාහ කරන්න." });
        }
      } catch (e) {
        res.status(500).json({ reply: "දත්ත සැකසීමේ දෝෂයකි." });
      }
    });
  });

  request.on('error', (e) => {
    res.status(500).json({ reply: "සම්බන්ධතාවය අසාර්ථකයි." });
  });

  request.write(postData);
  request.end();
}
