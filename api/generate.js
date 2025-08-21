// api/generate.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { thread, userHistory } = req.body;

    // Create an OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // You’ll add this in Vercel later
    });

    // Send email thread + your past writing examples to GPT
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an assistant that drafts email replies. Match the user’s tone exactly based on the provided examples of their writing." },
        { role: "user", content: `Email thread:\n${thread}\n\nPast writing style:\n${userHistory}` }
      ],
    });

    const draft = completion.choices[0].message.content;

    return res.status(200).json({ draft });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
