import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  Globe,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (transcript: string) => void;
  currentLanguage: 'bn' | 'en';
}

// Custom hook / helper for Web Audio feedback
const playMicChime = (type: 'start' | 'success') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      osc.frequency.setValueAtTime(1174.66, now + 0.16);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch {
    // Ignore audio context errors before user gesture
  }
};

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  currentLanguage
}) => {
  const [selectedLang, setSelectedLang] = useState<'bn-BD' | 'en-US'>(
    currentLanguage === 'bn' ? 'bn-BD' : 'en-US'
  );
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Sync selected voice language with prop language changes
  useEffect(() => {
    setSelectedLang(currentLanguage === 'bn' ? 'bn-BD' : 'en-US');
  }, [currentLanguage]);

  const suggestions = selectedLang === 'bn-BD' ? [
    { label: 'ইয়ারবাডস', query: 'ইয়ারবাডস' },
    { label: 'স্মার্টওয়াচ', query: 'স্মার্টওয়াচ' },
    { label: 'পাঞ্জাবি', query: 'পাঞ্জাবি' },
    { label: 'সুন্দরবনের খাঁটি মধু', query: 'মধু' },
    { label: 'টি-শার্ট', query: 'টি-শার্ট' },
    { label: 'এয়ার ফ্রায়ার', query: 'এয়ার ফ্রায়ার' }
  ] : [
    { label: 'Wireless Earbuds', query: 'earbuds' },
    { label: 'Smartwatch Ultra', query: 'smartwatch' },
    { label: 'Cotton Panjabi', query: 'panjabi' },
    { label: 'Pure Sundarban Honey', query: 'honey' },
    { label: 'Casual T-Shirt', query: 't-shirt' },
    { label: 'Air Fryer 4.5L', query: 'air fryer' }
  ];

  // Initialize SpeechRecognition
  const startListening = () => {
    setErrorMessage(null);
    setTranscript('');
    setInterimText('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage(
        selectedLang === 'bn-BD'
          ? 'আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থিত নয়। নিচের যেকোনো সাজেশনে ক্লিক করুন।'
          : 'Speech recognition is not supported in this browser. You can click any suggestion below.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore abort
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        playMicChime('start');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += trans;
          } else {
            currentInterim += trans;
          }
        }

        if (currentFinal) {
          setTranscript(currentFinal);
          setInterimText('');
          playMicChime('success');

          // Automatically search after short delay
          timerRef.current = setTimeout(() => {
            onSearch(currentFinal);
            onClose();
          }, 800);
        } else {
          setInterimText(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          setErrorMessage(
            selectedLang === 'bn-BD'
              ? 'কোনো কথা শোনা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
              : 'No speech detected. Please tap the mic and try again.'
          );
        } else if (event.error === 'not-allowed') {
          setErrorMessage(
            selectedLang === 'bn-BD'
              ? 'মাইক্রোফোন ব্যবহারের অনুমতি পাওয়া যায়নি। ব্রাউজারে পারমিশন অন করুন।'
              : 'Microphone permission denied. Please allow microphone access.'
          );
        } else {
          setErrorMessage(
            selectedLang === 'bn-BD'
              ? `ভয়েস এরর: ${event.error}`
              : `Voice error: ${event.error}`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setErrorMessage(
        selectedLang === 'bn-BD'
          ? 'মাইক্রোফোন শুরু করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Could not start microphone. Please try again.'
      );
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  // Start listening automatically when opened
  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      stopListening();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, selectedLang]);

  const handleApplySearch = (queryText: string) => {
    playMicChime('success');
    onSearch(queryText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92dvh] rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 animate-in zoom-in-95 duration-200 relative my-auto">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-[#f85606] via-[#e04d05] to-[#0a3871] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold shadow-inner">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {selectedLang === 'bn-BD' ? 'ভয়েস দিয়ে খুঁজুন' : 'Voice Search'}
              </h3>
              <p className="text-[10px] text-white/80">
                {selectedLang === 'bn-BD'
                  ? 'বাংলা ও ইংরেজিতে কথা বলে যেকোনো পণ্য খুঁজুন'
                  : 'Search products by speaking in Bengali or English'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector Tabs */}
        <div className="p-3 bg-gray-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[#f85606]" />
            <span>{currentLanguage === 'bn' ? 'ভয়েস ভাষা:' : 'Voice Language:'}</span>
          </span>

          <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setSelectedLang('bn-BD');
              }}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                selectedLang === 'bn-BD'
                  ? 'bg-[#f85606] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              🇧🇩 বাংলা
            </button>
            <button
              onClick={() => {
                setSelectedLang('en-US');
              }}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                selectedLang === 'en-US'
                  ? 'bg-[#0a3871] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Central Animated Microphone & Wave Area */}
        <div className="py-8 px-6 text-center flex flex-col items-center justify-center relative">
          {/* Animated pulsing concentric rings */}
          <div className="relative flex items-center justify-center my-4">
            {isListening && (
              <>
                <div className="absolute w-32 h-32 rounded-full bg-orange-400/20 dark:bg-orange-500/20 animate-ping" />
                <div className="absolute w-24 h-24 rounded-full bg-[#f85606]/30 dark:bg-[#f85606]/40 animate-pulse" />
              </>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-90 ${
                isListening
                  ? 'bg-gradient-to-tr from-[#f85606] to-amber-500 text-white ring-8 ring-orange-100 dark:ring-orange-950/60 scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 hover:text-[#f85606] border-2 border-dashed border-gray-300 dark:border-gray-600'
              }`}
            >
              {isListening ? (
                <Mic className="w-9 h-9 animate-bounce" />
              ) : (
                <MicOff className="w-9 h-9" />
              )}
            </button>
          </div>

          {/* Dynamic Audio Visualizer Bars when listening */}
          {isListening && (
            <div className="flex items-center justify-center gap-1.5 h-6 my-2">
              <span className="w-1.5 h-3 bg-[#f85606] rounded-full animate-[bounce_0.6s_infinite_100ms]" />
              <span className="w-1.5 h-5 bg-amber-500 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
              <span className="w-1.5 h-6 bg-[#f85606] rounded-full animate-[bounce_0.6s_infinite_300ms]" />
              <span className="w-1.5 h-4 bg-orange-600 rounded-full animate-[bounce_0.6s_infinite_150ms]" />
              <span className="w-1.5 h-5 bg-amber-500 rounded-full animate-[bounce_0.6s_infinite_250ms]" />
              <span className="w-1.5 h-2 bg-[#f85606] rounded-full animate-[bounce_0.6s_infinite_50ms]" />
            </div>
          )}

          {/* Status Label */}
          <div className="mt-2 min-h-[50px] flex flex-col items-center justify-center">
            {isListening ? (
              <p className="text-xs font-black text-[#f85606] dark:text-orange-400 flex items-center gap-1.5 animate-pulse">
                <Volume2 className="w-4 h-4" />
                <span>
                  {selectedLang === 'bn-BD'
                    ? 'শুনছি... আপনার কাঙ্ক্ষিত পণ্যের নাম বলুন'
                    : 'Listening... Say the name of the product'}
                </span>
              </p>
            ) : (
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {selectedLang === 'bn-BD'
                  ? 'কথা বলতে মাইক্রোফোন বাটনে ট্যাপ করুন'
                  : 'Tap the microphone to speak'}
              </p>
            )}

            {/* Live Transcript / Interim Text */}
            {(transcript || interimText) && (
              <div className="mt-3 p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-sm font-bold text-gray-900 dark:text-gray-100 max-w-sm">
                <span>"{transcript || interimText}"</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-1.5 max-w-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Voice Suggestions Chips */}
        <div className="p-4 bg-gray-50 dark:bg-gray-850 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{selectedLang === 'bn-BD' ? 'অথবা মুখে বলতে পারেন:' : 'Or tap a voice prompt:'}</span>
            </span>
            <button
              onClick={startListening}
              className="text-[10px] font-bold text-[#f85606] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{selectedLang === 'bn-BD' ? 'পুনরায় বলুন' : 'Try Again'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((item) => (
              <button
                key={item.label}
                onClick={() => handleApplySearch(item.query)}
                className="text-xs bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-750 hover:text-[#f85606] text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 transition font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-orange-300 active:scale-95"
              >
                <Search className="w-3 h-3 text-[#f85606]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Confirm & Cancel Footer */}
        {transcript && (
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              {selectedLang === 'bn-BD' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              onClick={() => handleApplySearch(transcript)}
              className="px-4 py-1.5 rounded-xl bg-[#f85606] hover:bg-[#e04d05] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{selectedLang === 'bn-BD' ? 'খুঁজুন' : 'Search Now'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
