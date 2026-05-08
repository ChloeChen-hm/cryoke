/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Music, Heart, Coffee, Skull, Zap, RefreshCw, Send } from "lucide-react";
import Mascot from "./components/Mascot";
import { generateComfortSong, ComfortSong, LyricLine } from "./services/geminiService";

type AppState = "landing" | "loading" | "singing" | "ending";

// Cute Melodic Synth (Toy Piano / Bell sound)
const playNote = (audioCtx: AudioContext, frequency: number, duration: number, volume = 0.15) => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  oscillator.type = "triangle"; // Soft and cute woodwind/bell sound
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  filter.type = "lowpass";
  filter.frequency.value = 1800;

  // Plucky ADSR envelope
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

// Global Audio Context 
let audioCtx: AudioContext | null = null;

const playSongLine = (lineLength: number) => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Pentatonic scale - always sounds wholesome and harmonic
  const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; 
  
  const beatDuration = 0.35;
  const numBeats = Math.floor(lineLength / beatDuration);

  for (let i = 0; i < numBeats; i++) {
    const time = i * beatDuration;
    setTimeout(() => {
      // Pick a note from the cute scale
      const baseNote = notes[Math.floor(Math.random() * notes.length)];
      // 15% chance to be "clumsy" / off-key
      const isOffKey = Math.random() > 0.85;
      const freq = isOffKey ? baseNote * 1.04 : baseNote;
      
      if (audioCtx) playNote(audioCtx, freq, beatDuration * 0.95);
      
      // Dispatch custom event for lip-sync
      window.dispatchEvent(new CustomEvent("cryoke-beat", { detail: { isOffKey } }));
    }, time * 1000);
  }
};

const MOOD_OPTIONS = [
  { id: "bad_day", label: "i had a bad day", icon: <Skull className="w-5 h-5" />, color: "bg-red-100" },
  { id: "heartbreak", label: "someone hurt me", icon: <Heart className="w-5 h-5" />, color: "bg-pink-100" },
  { id: "tired", label: "i’m tired", icon: <Coffee className="w-5 h-5" />, color: "bg-blue-100" },
  { id: "support", label: "i want emotional support", icon: <Music className="w-5 h-5" />, color: "bg-green-100" },
  { id: "random", label: "random comfort song", icon: <Zap className="w-5 h-5" />, color: "bg-yellow-100" },
];

export default function App() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [mood, setMood] = useState("");
  const [song, setSong] = useState<ComfortSong | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [mascotState, setMascotState] = useState<"idle" | "singing" | "clumsy" | "nervous">("idle");

  const startCryoke = async (selectedMood: string) => {
    setMood(selectedMood);
    setAppState("loading");
    setMascotState("nervous");
    
    const generatedSong = await generateComfortSong(selectedMood);
    setSong(generatedSong);
    setAppState("singing");
    startSongSequence(generatedSong);
  };

  const startSongSequence = (song: ComfortSong) => {
    setMascotState("singing");
    let cumulativeTime = 0;
    
    song.lyrics.forEach((lyric: LyricLine, index: number) => {
      setTimeout(() => {
        setCurrentLyricIndex(index);
        playSongLine(lyric.duration);

        // Occasionally make him clumsy during lines
        if (lyric.text.includes("~") || Math.random() > 0.85) {
          setMascotState("clumsy");
          setTimeout(() => setMascotState("singing"), 1500);
        }
      }, cumulativeTime * 1000);
      cumulativeTime += lyric.duration;
    });

    setTimeout(() => {
      setAppState("ending");
      setMascotState("idle");
    }, cumulativeTime * 1000 + 1000);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {appState === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl w-full text-center space-y-8"
          >
            <div className="space-y-4">
              <Mascot state="idle" className="mx-auto scale-125 mb-4" />
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#4A3B33] animate-wobble">
                you look emotionally cooked.
              </h1>
              <p className="text-2xl font-doodle text-[#8B7365]">
                want a tiny guy to sing badly for you?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => startCryoke(opt.label)}
                  className={`doodle-btn flex items-center justify-center gap-3 ${opt.color}`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
            
            <div className="text-xs text-[#8B7365]/50 italic pt-8">
              * low-budget karaoke * 100% sincere * slightly off-key
            </div>
          </motion.div>
        )}

        {appState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6"
          >
            <Mascot state="nervous" className="mx-auto" />
            <div className="space-y-2">
              <p className="text-xl italic animate-pulse">nervously clearing throat...</p>
              <p className="text-sm font-doodle">adjusting tiny microphone...</p>
            </div>
          </motion.div>
        )}

        {appState === "singing" && song && (
          <motion.div
            key="singing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl h-[80vh] flex flex-col items-center justify-between relative overflow-hidden bg-[#1A1A1A] rounded-2xl wobbly-border p-8"
          >
            {/* Stage FX */}
            <div className="stage-light left-0 -rotate-12 translate-x-[-20%]" />
            <div className="stage-light right-0 rotate-12 translate-x-[20%] h-[120%]" />
            
            <div className="z-10 text-center">
              <h2 className="text-yellow-400 font-doodle text-2xl mb-2 tracking-widest uppercase">
                NOW SINGING: {song.title}
              </h2>
            </div>

            <div className="z-10 relative flex flex-col items-center">
               {/* Cheap sparkles/fx effects during high notes */}
               {currentLyricIndex >= 0 && song.lyrics[currentLyricIndex].text.includes("~") && (
                 <motion.div 
                   className="absolute inset-0 flex items-center justify-center pointer-events-none"
                   initial={{ scale: 0 }}
                   animate={{ scale: [0, 1.5, 0], rotate: [0, 90, 180] }}
                   transition={{ duration: 1 }}
                 >
                   <div className="text-4xl text-yellow-300">✨</div>
                   <div className="text-4xl text-white translate-x-20 -translate-y-10">💖</div>
                 </motion.div>
               )}
               <Mascot state={mascotState} className="scale-150 mb-12" />
            </div>

            <div className="z-10 w-full mb-8">
              <AnimatePresence mode="wait">
                {currentLyricIndex >= 0 && (
                  <motion.p
                    key={currentLyricIndex}
                    initial={{ y: 20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1.1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-4xl md:text-5xl font-bold text-white text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                  >
                    <span className="bg-[#4A3B33]/50 px-4 py-2 rounded-lg">
                      {song.lyrics[currentLyricIndex].text}
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>
              
              {/* Bouncing ball/progress bar simulation */}
              <div className="w-full max-w-sm mx-auto h-2 bg-white/20 mt-8 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-yellow-400"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: song.lyrics.reduce((acc, l) => acc + l.duration, 0),
                    ease: "linear"
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {appState === "ending" && song && (
          <motion.div
            key="ending"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full text-center space-y-10"
          >
            <Mascot state="idle" className="mx-auto scale-110" />
            
            <motion.div 
              initial={{ y: 10 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="bg-white p-8 wobbly-border sketch-shadow relative"
            >
               {/* Speech trail */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[20px] border-b-[#4A3B33]" />
              
              <p className="text-3xl font-bold text-[#4A3B33] mb-4">
                "{song.endingMessage}"
              </p>
              <p className="text-xl font-doodle text-[#8B7365]">
                i know i sing badly... but i meant it.
              </p>
            </motion.div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setAppState("landing")}
                className="doodle-btn bg-white hover:bg-yellow-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                sing another song
              </button>
              <button
                onClick={() => {
                  const text = "A tiny blob sang a comfort song for me at Cryoke! You look emotionally cooked, go listen: " + window.location.href;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
                }}
                className="doodle-btn bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                send to a sad friend
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative doodles */}
      <div className="fixed bottom-4 left-4 opacity-10 pointer-events-none hidden md:block">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <path d="M10,50 Q25,25 40,50 T70,50" fill="none" stroke="#4A3B33" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
