'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  createdAt: string | Date;
  senderId: string;
  sender: { id: string; name: string | null; image: string | null };
}

interface ChatUser {
  id: string;
  name: string | null;
  image: string | null;
  mainField: string | null;
  university: string | null;
}

interface ChatClientProps {
  matchId: string;
  currentUserId: string;
  otherUser: ChatUser;
  initialMessages: Message[];
}

export function ChatClient({ matchId, currentUserId, otherUser, initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const content = input.trim();
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, content }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <Link href="/messages" className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        {otherUser.image ? (
          <Image src={otherUser.image} alt={otherUser.name || ''} width={42} height={42} className="rounded-full ring-2 ring-slate-700" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-white">
            {otherUser.name?.[0]}
          </div>
        )}
        <div>
          <p className="font-semibold text-white">{otherUser.name}</p>
          <p className="text-xs text-slate-500">{otherUser.mainField} · {otherUser.university}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            <p className="text-2xl mb-2">👋</p>
            Start the conversation! Introduce your research and potential collaboration ideas.
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={cn('flex gap-3', isMe && 'flex-row-reverse')}>
              {!isMe && (
                msg.sender.image ? (
                  <Image src={msg.sender.image} alt="" width={32} height={32} className="rounded-full flex-shrink-0 self-end" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 self-end">
                    {msg.sender.name?.[0]}
                  </div>
                )
              )}
              <div className={cn('max-w-[70%]', isMe && 'items-end flex flex-col')}>
                <div className={cn(
                  'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  isMe
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                )}>
                  {msg.content}
                </div>
                <p className="text-xs text-slate-600 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Write a message..."
            className="input flex-1"
            maxLength={2000}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="btn-primary px-4"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
