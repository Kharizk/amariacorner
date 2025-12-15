import React, { useState } from 'react';
import { ChefHat, X, Send, Sparkles } from 'lucide-react';
import { getGeneralAdvice } from '../services/geminiService';

const AIChef: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: 'هلا بك في ركن العمارية! 🇸🇦 أنا مساعدك الذكي، آمرني بأي سؤال عن منتجاتنا أو طريقة طبخها.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const reply = await getGeneralAdvice(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-brand-leaf text-white p-4 rounded-full shadow-2xl hover:bg-green-700 transition-all border-4 border-white flex items-center gap-2 group animate-bounce-slow"
      >
        <ChefHat className="h-8 w-8" />
        <span className="font-bold hidden group-hover:block transition-all duration-300">الشيف الذكي</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-brand-leaf/20 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-brand-leaf p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <ChefHat size={24} className="text-white" />
          <h3 className="font-bold">شيف ركن العمارية</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-green-100 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gray-200 text-gray-800 rounded-br-none' 
                  : 'bg-green-100 text-green-900 rounded-bl-none border border-green-200'
              }`}
            >
              {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-green-50 p-3 rounded-2xl rounded-bl-none border border-green-100">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="وش أفضل طريقة لطبخ..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-leaf"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-brand-leaf text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
            {isLoading && <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChef;