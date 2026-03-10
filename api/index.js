export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(200).json({
      reply: "Server is running."
    });
  }

  try {

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const question = body?.question || "කරුණාකර ප්‍රශ්නයක් අසන්න.";

    const API_KEY = "AIzaSyBAh59EoEMRzeOyCg20nq3YHSC6aOWl7FY";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "ඔබ බුද්ධ ධර්මය පිළිබඳ දැනුම ඇති භික්ෂුවකි. ඉතා ශාන්ත සිංහලෙන් වාක්‍ය 3කින් පිළිතුරු දෙන්න: " +
                    question
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI System Error. නැවත උත්සාහ කරන්න.";

    return res.status(200).json({ reply });

  } catch (error) {

    console.log("ERROR:", error);

    return res.status(200).json({
      reply: "Server Connection Error."
    });

  }

}
