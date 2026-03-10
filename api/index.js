export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(200).json({ reply: "Server running" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const question = body?.question || "බුදුදහම ගැන ප්‍රශ්නයක් අසන්න.";
    const API_KEY = "AIzaSyBAh59EoEMRzeOyCg20nq3YHSC6aOWl7FY";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `ඔබ බුද්ධ ධර්මය පිළිබඳ දැනුම ඇති භික්ෂුවකි. ඉතා ශාන්ත සිංහලෙන් වාක්‍ය 3කින් පිළිතුරු දෙන්න. ප්‍රශ්නය: ${question}` }] }]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini Data:", JSON.stringify(data));

    if (data.candidates && data.candidates.length > 0) {
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      // මෙතනදී "AI System Error" වෙනුවට Google එක දෙන ඇත්තම Error එක පෙන්වනවා
      const errMsg = data.error ? data.error.message : "No Candidates Found";
      return res.status(200).json({ reply: "Google Error: " + errMsg });
    }

  } catch (e) {
    return res.status(200).json({ reply: "Server Error: " + e.message });
  }
}
