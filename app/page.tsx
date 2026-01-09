"use client";
import { useState, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string | Array<{type: string; text?: string; image_url?: {url: string}}>;
  imagePreview?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    // Format message for API
    let userMessageContent: any;
    
    if (selectedImage && input.trim()) {
      // Both image and text
      userMessageContent = [
        {
          type: "image_url",
          image_url: { url: selectedImage }
        },
        {
          type: "text",
          text: input.trim()
        }
      ];
    } else if (selectedImage) {
      // Only image
      userMessageContent = [
        {
          type: "image_url",
          image_url: { url: selectedImage }
        },
        {
          type: "text",
          text: "What's in this image?"
        }
      ];
    } else {
      // Only text
      userMessageContent = input.trim();
    }

    const userMessage: Message = { 
      role: "user", 
      content: userMessageContent,
      imagePreview: selectedImage || undefined
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({
          role: m.role,
          content: m.content
        })) }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply || "No response." },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b-2 px-8 py-6 flex items-center justify-between`}>
        <div className="flex items-center gap-6">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ZaidGPT
          </h1>
          <div className="flex gap-3">
            <button 
              onClick={() => window.open('https://zaidsproxy.vercel.app', '_blank')}
              className={`${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} px-6 py-2 rounded-lg font-medium transition-colors`}
            >
              Zaid's Proxy
            </button>
            <button 
              onClick={() => window.open('https://zaidsproxy-v2.vercel.app', '_blank')}
              className={`${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} px-6 py-2 rounded-lg font-medium transition-colors`}
            >
              Zaid's Proxy v2
            </button>
            <button 
              onClick={() => window.open('https://classroom.google.com/c/NzA4NTQ0NzA3NTc5?cjc=5e644tru', '_blank')}
              className={`${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} px-6 py-2 rounded-lg font-medium transition-colors`}
            >
              Google Classroom
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setIsDark(!isDark)}
          className={`${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2`}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-120px)] flex flex-col">
        {/* Messages Area */}
        <div className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-8 mb-6 overflow-y-auto shadow-lg`}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="text-6xl">💬</div>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-2xl font-medium`}>
                  Start a conversation with ZaidGPT
                </p>
                <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-lg`}>
                  Ask me anything and I'll help you out!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-md ${
                      m.role === "user"
                        ? isDark 
                          ? "bg-gray-700 text-white" 
                          : "bg-gray-200 text-gray-900"
                        : isDark
                        ? "bg-gray-900 text-white border-2 border-gray-700"
                        : "bg-white text-gray-900 border-2 border-gray-300"
                    }`}
                  >
                    <div className={`text-xs font-bold mb-2 uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {m.role === "user" ? "You" : "ZaidGPT"}
                    </div>
                    {m.imagePreview && (
                      <img 
                        src={m.imagePreview} 
                        alt="Uploaded" 
                        className="rounded-lg mb-3 max-w-full h-auto"
                      />
                    )}
                    <div className="text-lg leading-relaxed whitespace-pre-wrap break-words">
                      {typeof m.content === 'string' ? m.content : 
                        Array.isArray(m.content) ? 
                          m.content.find(c => c.type === 'text')?.text || '' :
                          ''
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-4">
            <div className="relative inline-block">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className={`h-24 rounded-lg border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-6 shadow-lg`}>
          <div className="flex gap-4 items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} px-4 py-4 rounded-xl font-bold transition-all`}
            >
              📷
            </button>
            <input
              className={`flex-1 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} text-lg rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gray-500 border-2 placeholder-gray-400 transition-all`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  handleSubmit(e);
                }
              }}
            />
            <button
              className={`${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} font-bold text-lg rounded-xl px-10 py-4 shadow-md transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              type="submit"
              onClick={handleSubmit}
              disabled={!input.trim() && !selectedImage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
