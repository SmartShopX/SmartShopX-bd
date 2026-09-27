import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Phone,
  Send,
  Sparkles,
  HelpCircle,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronUp
} from 'lucide-react';

interface FloatingSupportWidgetProps {
  language: 'bn' | 'en';
  onOpenOrders?: () => void;
  onOpenCustomerCare?: () => void;
}

export const FloatingSupportWidget: React.FC<FloatingSupportWidgetProps> = ({
  language,
  onOpenOrders,
  onOpenCustomerCare
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: language === 'bn'
        ? 'আসসালামু আলাইকুম! SmartShopX.bd কাস্টমার কেয়ারে স্বাগতম। আপনাকে কীভাবে সাহায্য করতে পারি?'
        : 'Hello! Welcome to SmartShopX.bd Customer Support. How can we help you today?',
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickReplies = [
    {
      label: language === 'bn' ? '📦 অর্ডার ট্র্যাক করবো কীভাবে?' : '📦 How to track order?',
      response: language === 'bn'
        ? 'আপনার অর্ডারের বর্তমান অবস্থা জানতে ওপরের "আমার অর্ডার" আইকনে ক্লিক করুন অথবা কুরিয়ার ট্র্যাকিং নম্বরটি চেক করুন।'
        : 'Click on "My Orders" at the top navbar to see real-time dispatch and courier status.'
    },
    {
      label: language === 'bn' ? '🚚 ডেলিভারি চার্জ কত?' : '🚚 Delivery Charge?',
      response: language === 'bn'
        ? 'ঢাকা সিটির ভেতরে ডেলিভারি চার্জ মাত্র ৳৬০ এবং ঢাকার বাইরে ৳১০০-১২০। ৳২০০০ এর বেশি অর্ডারে ফ্রি ডেলিভারি!'
        : 'Inside Dhaka ৳60, Outside Dhaka ৳100-120. Free delivery on orders ৳2000+.'
    },
    {
      label: language === 'bn' ? '🔄 রিটার্ন পলিসি কি?' : '🔄 Return Policy?',
      response: language === 'bn'
        ? 'পণ্য হাতে পাওয়ার ৭ থেকে ১৪ দিনের মধ্যে কোনো ত্রুটি থাকলে সম্পূর্ণ ফ্রিতে রিটার্ন বা পরিবর্তন করতে পারবেন।'
        : 'Hassle-free 7-14 days replacement & return warranty on all genuine items.'
    },
    {
      label: language === 'bn' ? '📞 সরাসরি এজেন্টের সাথে কথা বলুন' : '📞 Talk to Live Agent',
      response: language === 'bn'
        ? 'আমাদের অফিসিয়াল হটলাইন নম্বর: ১৬৪৯২ (সকাল ৯টা - রাত ১১টা)। এছাড়া সরাসরি WhatsApp এ মেসেজ করতে পারেন: +8801700000000'
        : 'Official Hotline: 16492 (9 AM - 11 PM). WhatsApp: +8801700000000'
    }
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setTimeout(() => {
      // Find matching reply or default
      const matched = quickReplies.find((q) => q.label.toLowerCase().includes(text.toLowerCase()) || text.includes(q.label));
      const replyText = matched
        ? matched.response
        : (language === 'bn'
            ? 'ধন্যবাদ! আপনার মেসেজটি আমাদের সাপোর্ট টিম গ্রহণ করেছে। জরুরি প্রয়োজনে ১৬৪৯২ নম্বরে কল করুন।'
            : 'Thank you! Our support team has received your message. For immediate help, call 16492.');

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-end pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))]">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-24px)] max-w-sm sm:w-96 max-h-[75vh] sm:max-h-[500px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 transition-colors">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0a3871] via-[#0b1a30] to-[#f85606] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5 text-yellow-300" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border-2 border-white" />
              </div>
              <div>
                <h4 className="font-black text-sm">SmartShopX.bd লাইভ সাপোর্ট</h4>
                <p className="text-[10px] text-white/80">Active now • 24/7 Response</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64 bg-gray-50/50 dark:bg-gray-850/50 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-[#f85606] text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-2xs border border-gray-100 dark:border-gray-700 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-2.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickReplies.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.label)}
                className="shrink-0 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-[#f85606] dark:text-orange-400 text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 transition cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Type your question...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[#f85606]"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-xl bg-[#f85606] hover:bg-[#e04d05] text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Hotline Bar */}
          <div className="bg-gray-900 text-white px-3 py-2 flex items-center justify-between text-[11px] font-bold">
            <a
              href="tel:16492"
              className="flex items-center gap-1 text-yellow-400 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>হটলাইন: ১৬৪৯২</span>
            </a>
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Floating Pill / Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-gradient-to-r from-[#25d366] via-[#128c7e] to-[#0a3871] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-green-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white"
        aria-label="Open support chat"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
        </div>
        <span className="font-extrabold text-xs sm:text-sm hidden sm:inline">
          {language === 'bn' ? 'সাপোর্ট / WhatsApp' : 'Live Help & WhatsApp'}
        </span>
      </button>
    </div>
  );
};
