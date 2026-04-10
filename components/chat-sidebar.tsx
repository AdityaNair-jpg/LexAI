"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Shield, User, Loader2, Sparkles } from "lucide-react";
import type { Annotation } from "@/types";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  documentText?: string;
  annotations: Annotation[];
  initialMessage?: string;
};

export function ChatSidebar({
  isOpen,
  onClose,
  documentText = "",
  annotations = [],
  initialMessage,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const userMsg: Message = { id: Date.now().toString(), role: "user", content: initialMessage };
      setMessages([userMsg]);
      handleSendMessage(initialMessage, [userMsg]);
    }
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string, currentMessages?: Message[]) => {
    const activeMessages = currentMessages || messages;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    if (!currentMessages) {
      setMessages((prev) => [...prev, userMessage]);
    }
    
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...activeMessages, ...(currentMessages ? [] : [userMessage])],
          documentContext: {
            fullText: documentText,
            annotations: annotations.map((ann) => ({
              riskType: ann.riskType,
              riskLevel: ann.riskLevel,
              explanation: ann.explanation,
              proposedSolution: ann.proposedSolution,
              replacementClause: ann.replacementClause,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to consult AI counsel");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      const assistantMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessageObj]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantMessage += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageObj.id
              ? { ...msg, content: assistantMessage }
              : msg
          )
        );
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-stone-200 shadow-[-12px_0_40px_rgba(0,0,0,0.08)] z-[60] flex flex-col animate-in slide-in-from-right duration-500">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-stone-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#9a7b4f]" />
          </div>
          <div>
            <h3 className="text-stone-900 font-serif font-medium text-lg leading-tight">AI Counsel</h3>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Always active</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-stone-200 group"
        >
          <X className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </button>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-white">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
            <div className="w-20 h-20 rounded-[2.5rem] bg-stone-50 border border-stone-100 shadow-inner flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 text-[#9a7b4f]/30" />
            </div>
            <div className="space-y-1">
              <p className="text-stone-900 font-serif font-medium text-xl">Consultation Started</p>
              <p className="text-stone-400 text-xs max-w-[220px] mx-auto leading-relaxed">
                Ask specific questions about clauses, risks, or negotiation strategies.
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-[#9a7b4f]/10 border border-[#9a7b4f]/20 flex items-center justify-center shrink-0 mt-1">
                <Shield className="w-4 h-4 text-[#9a7b4f]" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 shadow-sm ${
                message.role === "user"
                  ? "bg-stone-900 text-[#c5a368] rounded-tr-none border border-stone-800"
                  : "bg-stone-50 text-stone-700 rounded-tl-none border border-stone-100"
              }`}
            >
              <p className="text-xs leading-relaxed font-serif whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#9a7b4f]/10 border border-[#9a7b4f]/20 flex items-center justify-center shrink-0 mt-1">
              <Shield className="w-4 h-4 text-[#9a7b4f]" />
            </div>
            <div className="bg-stone-50 rounded-[1.5rem] px-5 py-4 border border-stone-100 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-[#9a7b4f] animate-spin" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest animate-pulse">Analyzing...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-700 text-[11px] font-medium flex items-center gap-3 animate-in shake-in-y duration-300">
            <X className="w-4 h-4" />
            Error: {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-6 border-t border-stone-100 bg-stone-50/30">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI counsel..."
            className="w-full bg-white border border-stone-200 rounded-2xl pl-5 pr-14 py-4 text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:border-[#9a7b4f]/50 focus:shadow-[0_0_0_4px_rgba(154,123,79,0.05)] transition-all shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-20 disabled:scale-95 text-[#c5a368] rounded-xl transition-all shadow-lg active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-stone-400 text-[9px] mt-4 font-bold uppercase tracking-widest">
          Secured by LexAI Protocol
        </p>
      </div>
    </div>
  );
}
