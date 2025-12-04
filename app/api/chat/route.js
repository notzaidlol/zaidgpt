import { NextResponse } from "next/server";
import Groq from "groq-js";

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// In-memory storage for messages (simple memory)
let conversationHistory = [];

export async function POST(req) {
  try {
    const { message } = await req.json();

    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: message });

    // Call Groq API with full conversation for memory
    const response = await groqClient.chat({
      model: "llama-3.1-8b-instant", // replace with your chosen model
      messages: conversationHistory
    });

    const assistantReply = response?.reply || "Sorry, I didn't get that.";

    // Save assistant reply to history
    conversationHistory.push({ role: "assistant", content: assistantReply });

    return NextResponse.json({ reply: assistantReply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Optional: reset memory endpoint (if you want)
export async function DELETE() {
  conversationHistory = [];
  return NextResponse.json({ message: "Memory cleared" });
}
