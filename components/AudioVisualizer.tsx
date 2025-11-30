import React, { useEffect, useRef } from 'react';
import { AudioVisualizerProps } from '../types';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream, isActive, isAI }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    // Only require stream if not in AI mode
    if (!isAI && !stream) return;

    // Simulate visualizer for AI since we don't have direct access to AI output stream object easily
    // We only have the audio buffer in the hook.
    // For User stream, we can visualize properly.
    
    if (isAI) {
        // Simple mock visualizer for AI state
        const drawAI = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);
            
            const time = Date.now() / 100;
            const barCount = 5;
            const spacing = 10;
            const barWidth = (width - (spacing * (barCount - 1))) / barCount;
            
            ctx.fillStyle = '#6366f1'; // Indigo-500
            
            for(let i=0; i<barCount; i++) {
                const h = Math.sin(time + i) * (height / 2) + (height / 2);
                const x = i * (barWidth + spacing);
                ctx.fillRect(x, (height - h) / 2, barWidth, h);
            }
            rafRef.current = requestAnimationFrame(drawAI);
        };
        drawAI();
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }

    // Real visualizer for User Mic
    if (!stream) return;
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    analyserRef.current = ctx.createAnalyser();
    analyserRef.current.fftSize = 64;
    
    sourceRef.current = ctx.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      analyserRef.current.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;

        // Gradient based on volume
        const gradient = canvasCtx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#10b981'); // Emerald
        gradient.addColorStop(1, '#34d399');

        canvasCtx.fillStyle = gradient;
        // Rounded bars
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, height - barHeight, barWidth - 2, barHeight, 4);
        canvasCtx.fill();

        x += barWidth + 1;
      }
      
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [stream, isActive, isAI]);

  return <canvas ref={canvasRef} width={200} height={60} className="w-full h-full" />;
};