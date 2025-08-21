// api/generate.js
import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS so the browser extension can call this API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { thread, userHistory } = req.body || {};
    if (!thread) return res.status(400).json({ error: "Missing `thread`" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: "You are an assistant that drafts email replies. Match the user’s tone exactly based on the provided examples of their writing. Output BODY text only (no subject)." },
        { role: "user", content: `EMAIL THREAD:\n${thread}\n\nPAST WRITING STYLE (EXAMPLES):\n${userHistory || "(none provided)"}` }
      ],
    });

    const draft = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!draft) throw new Error("No draft returned");

    return res.status(200).json({ draft });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || String(error) });
  }
}
