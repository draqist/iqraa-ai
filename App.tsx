import React, { useState } from 'react';
import { 
  BookOpen, 
  Mic, 
  MicOff, 
  Volume2, 
  ChevronRight, 
  Play, 
  Square, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Activity
} from 'lucide-react';
import { useGeminiLive } from './hooks/useGeminiLive';
import { DEMO_BOOKS } from './constants';
import { Book, ContentNode } from './types';
import { AudioVisualizer } from './components/AudioVisualizer';

interface ContentNodeDisplayProps {
  node: ContentNode;
  blurLevel: 'none' | 'partial' | 'full';
}

export default function App() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [blurLevel, setBlurLevel] = useState<'none' | 'partial' | 'full'>('none');
  
  const { 
    connect, 
    disconnect, 
    connectionState, 
    isMicOn, 
    toggleMic, 
    userStream, 
    aiIsSpeaking, 
    errorMsg 
  } = useGeminiLive({ selectedBook });

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };

  const handleBack = () => {
    disconnect();
    setSelectedBook(null);
  };

  if (!selectedBook) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
        <header className="max-w-4xl mx-auto mb-12 mt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <BookOpen size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Iqraa Hifdh Engine</h1>
          </div>
          <p className="text-slate-500 text-lg">Select a text to begin your memorization journey with your AI Muhaffiz.</p>
        </header>

        <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEMO_BOOKS.map(book => (
            <button 
              key={book.id}
              onClick={() => handleBookSelect(book)}
              className="group relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl transition-all text-left flex items-start gap-4 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              
              <img 
                src={book.cover_image} 
                alt={book.title_en} 
                className="w-20 h-28 object-cover rounded shadow-md z-10"
              />
              
              <div className="z-10 flex-1">
                <h3 className="text-xl font-bold font-serif mb-1 group-hover:text-emerald-700 transition-colors">{book.title_en}</h3>
                <p className="font-arabic text-lg text-slate-600 mb-2">{book.title_ar}</p>
                <div className="flex items-center text-sm text-slate-400 font-medium">
                   <span>{book.author}</span>
                   <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </button>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden h-screen">
      {/* Left Panel: The Book (Scrollable) */}
      <div className="flex-1 h-full overflow-y-auto bg-white border-r border-slate-200 relative">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center gap-1"
          >
            ← Library
          </button>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setBlurLevel('none')}
              className={`p-1.5 rounded ${blurLevel === 'none' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
              title="Show All"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => setBlurLevel('partial')}
              className={`p-1.5 rounded ${blurLevel === 'partial' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
              title="Blur Words"
            >
              <EyeOff size={16} />
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-arabic font-bold text-slate-800 mb-2">{selectedBook.title_ar}</h2>
            <p className="text-slate-500">{selectedBook.title_en}</p>
          </div>

          <div className="space-y-8 dir-rtl" dir="rtl">
            {selectedBook.nodes.map((node) => (
              <ContentNodeDisplay 
                key={node.id} 
                node={node} 
                blurLevel={blurLevel} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: The AI Muhaffiz (Fixed) */}
      <div className="w-full md:w-96 bg-slate-50 border-l border-slate-200 flex flex-col h-[30vh] md:h-full border-t md:border-t-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-none z-30">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="text-emerald-500" size={18} />
            AI Muhaffiz
          </h3>
          <p className="text-xs text-slate-400 mt-1">Powered by Gemini 2.5 Live</p>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center relative bg-slate-50/50">
          {/* Status Indicator */}
          <div className={`
            w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative
            ${connectionState === 'connected' ? 'bg-emerald-50 scale-100' : 'bg-slate-100 scale-95'}
          `}>
             {connectionState === 'connected' && (
                <div className="absolute inset-0 rounded-full border border-emerald-200 animate-ping opacity-20"></div>
             )}
            
            {connectionState === 'connecting' ? (
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : aiIsSpeaking ? (
               <div className="w-20 h-10">
                 <AudioVisualizer stream={null} isActive={true} isAI={true} />
               </div>
            ) : (
              <div className={`text-4xl ${connectionState === 'connected' ? 'text-emerald-600' : 'text-slate-300'}`}>
                <Volume2 />
              </div>
            )}
          </div>
          
          <div className="mt-8 w-full h-16 bg-white rounded-lg border border-slate-200 overflow-hidden relative flex items-center justify-center">
            {isMicOn && userStream ? (
               <AudioVisualizer stream={userStream} isActive={isMicOn} />
            ) : (
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                {connectionState === 'connected' ? 'Mic Muted' : 'Microphone Off'}
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 w-full">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-white border-t border-slate-200">
          {connectionState === 'disconnected' || connectionState === 'error' ? (
            <button 
              onClick={connect}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} fill="currentColor" />
              Start Session
            </button>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={toggleMic}
                className={`flex-1 py-4 rounded-xl font-semibold border transition-all flex items-center justify-center gap-2
                  ${isMicOn 
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' 
                    : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                  }`}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                {isMicOn ? 'Mute' : 'Unmute'}
              </button>
              <button 
                onClick={disconnect}
                className="flex-none w-16 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-100"
              >
                <Square size={20} fill="currentColor" />
              </button>
            </div>
          )}
          <p className="text-center text-xs text-slate-400 mt-4">
            {connectionState === 'connected' 
              ? "Listening... Recite correctly to continue." 
              : "Connect to start reciting to the AI."}
          </p>
        </div>
      </div>
    </div>
  );
}

const ContentNodeDisplay: React.FC<ContentNodeDisplayProps> = ({ node, blurLevel }) => {
  // Simple logic to blur random words if partial, or everything except start if full
  const words = node.text_arabic.split(' ');
  
  return (
    <div className="relative group">
      <div className="flex gap-4 items-start">
        <span className="flex-none w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-serif text-sm flex items-center justify-center mt-3 border border-emerald-100">
          {node.order}
        </span>
        <div className="flex-1">
          <p className="font-arabic text-3xl md:text-4xl leading-[2.5] text-slate-800 text-right">
            {words.map((word, idx) => {
              let isBlurred = false;
              if (blurLevel === 'full') isBlurred = true;
              if (blurLevel === 'partial' && Math.random() > 0.6) isBlurred = true; // Random blur
              
              return (
                <span 
                  key={idx} 
                  className={`inline-block ml-2 transition-all duration-300 ${isBlurred ? 'blur-md bg-slate-200 text-transparent select-none rounded' : ''}`}
                >
                  {word}
                </span>
              );
            })}
          </p>
          <p className="text-slate-400 text-sm mt-2 text-right dir-ltr opacity-0 group-hover:opacity-100 transition-opacity">
            {node.text_english}
          </p>
        </div>
      </div>
    </div>
  );
};