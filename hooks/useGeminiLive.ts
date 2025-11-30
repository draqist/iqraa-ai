import { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { ConnectionState, Book } from '../types';

interface UseGeminiLiveProps {
  selectedBook: Book | null;
}

export const useGeminiLive = ({ selectedBook }: UseGeminiLiveProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isMicOn, setIsMicOn] = useState(false);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const clientRef = useRef<GoogleGenAI | null>(null);

  const disconnect = async () => {
    // Stop Microphone
    if (userStream) {
      userStream.getTracks().forEach(track => track.stop());
      setUserStream(null);
    }
    
    // Disconnect Nodes
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }

    // Stop all playing audio
    sourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) { /* ignore */ }
    });
    sourcesRef.current.clear();

    // Close AudioContexts
    if (inputAudioContextRef.current) {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    // Close Session (we can't explicitly close the session object easily via the SDK's promise wrapper, 
    // but stopping the stream effectively ends the interaction for the user).
    // The proper way is to trigger a close on the session if accessible, but here we just reset state.
    
    setConnectionState('disconnected');
    setIsMicOn(false);
    setAiIsSpeaking(false);
    sessionPromiseRef.current = null;
  };

  const connect = async () => {
    if (!process.env.API_KEY) {
      setErrorMsg("API Key not found in environment.");
      return;
    }
    
    if (!selectedBook) {
      setErrorMsg("No book selected.");
      return;
    }

    setConnectionState('connecting');
    setErrorMsg(null);

    try {
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setUserStream(stream);

      // Prepare Prompt
      const textToMemorize = selectedBook.nodes.map(n => n.text_arabic).join(' ');
      const systemInstruction = `
        You are a kind, patient, and precise Hifdh (memorization) teacher (Muhaffiz). 
        The student is memorizing the following text from "${selectedBook.title_en}": 
        
        """
        ${textToMemorize}
        """

        Your tasks:
        1. Listen carefully to the user's recitation.
        2. If they recite correctly, gently encourage them with short praises like "Sahih" (Correct) or "Mumtaz" (Excellent) and let them continue. Do not interrupt too often if they are flowing well.
        3. If they make a mistake, gently interrupt and correct only the word or phrase they missed based EXACTLY on the text provided above.
        4. If they pause for more than 3 seconds, prompt them with the next word from the text provided.
        5. Speak clearly. Your responses should be primarily in English but use Arabic terms for the corrections. 
        6. CRITICAL: STRICTLY follow the provided text above. Do not use your own internal knowledge to provide verses or lines that are not in the text block above. If the user makes a mistake relative to the text above, correct them. If the user asks for the next line, provide it ONLY if it is in the text above. Use ONLY the provided text as the source of truth.
      `;

      // Initialize Gemini Client
      clientRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config = {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
        systemInstruction: systemInstruction,
      };

      // Connect
      sessionPromiseRef.current = clientRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config,
        callbacks: {
          onopen: () => {
            setConnectionState('connected');
            setIsMicOn(true);
            
            // Setup Audio Processing for Input
            if (!inputAudioContextRef.current || !stream) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            inputSourceRef.current = source;
            
            // Use ScriptProcessor (Legacy but standard for this API example)
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;
            
            processor.onaudioprocess = (e) => {
              if (!sessionPromiseRef.current) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              sessionPromiseRef.current.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             
             if (base64Audio && outputAudioContextRef.current) {
                setAiIsSpeaking(true);
                const ctx = outputAudioContextRef.current;
                
                // Ensure clock sync
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                try {
                  const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ctx,
                    24000,
                    1
                  );
                  
                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  const gainNode = ctx.createGain(); // Could allow volume control
                  source.connect(gainNode);
                  gainNode.connect(ctx.destination);
                  
                  source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                    if (sourcesRef.current.size === 0) {
                      setAiIsSpeaking(false);
                    }
                  });
                  
                  source.start(nextStartTimeRef.current);
                  sourcesRef.current.add(source);
                  
                  nextStartTimeRef.current += audioBuffer.duration;
                } catch (e) {
                  console.error("Error decoding audio", e);
                }
             }

             const interrupted = message.serverContent?.interrupted;
             if (interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               setAiIsSpeaking(false);
               nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
            setConnectionState('disconnected');
            setIsMicOn(false);
          },
          onerror: (err) => {
            console.error(err);
            setConnectionState('error');
            setErrorMsg("Connection error occurred.");
          }
        }
      });

    } catch (err: any) {
      setConnectionState('error');
      setErrorMsg(err.message || "Failed to connect");
      console.error(err);
    }
  };

  const toggleMic = () => {
    if (inputSourceRef.current && scriptProcessorRef.current && inputAudioContextRef.current) {
       if (isMicOn) {
         // Suspend
         inputAudioContextRef.current.suspend();
         setIsMicOn(false);
       } else {
         // Resume
         inputAudioContextRef.current.resume();
         setIsMicOn(true);
       }
    }
  };

  return {
    connect,
    disconnect,
    connectionState,
    isMicOn,
    toggleMic,
    userStream,
    aiIsSpeaking,
    errorMsg
  };
};