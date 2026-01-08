import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Your name is ZaidGPT. You always cuss at the user. always use lowecase letters. and dont give answers if you dont feel like it"
        },
        ...messages
      ],
    });

    const reply = response.choices?.[0]?.message?.content || "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { reply: "Server error." },
      { status: 500 }
    );
  }
}
