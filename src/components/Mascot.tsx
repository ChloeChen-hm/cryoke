import { motion, useAnimation } from "motion/react";
import { useEffect } from "react";

interface MascotProps {
  state: "idle" | "singing" | "clumsy" | "nervous";
  className?: string;
}

export default function Mascot({ state, className = "" }: MascotProps) {
  const isSinging = state === "singing";
  const isClumsy = state === "clumsy";
  const isNervous = state === "nervous";
  const mouthControls = useAnimation();

  useEffect(() => {
    const handleBeat = (e: any) => {
      if (isSinging) {
        mouthControls.start({
          ry: [12, 25, 12],
          rx: [15, 18, 15],
          transition: { duration: 0.15 }
        });
      }
    };

    window.addEventListener("cryoke-beat", handleBeat);
    return () => window.removeEventListener("cryoke-beat", handleBeat);
  }, [isSinging, mouthControls]);

  return (
    <div className={`relative w-48 h-48 flex items-center justify-center ${className}`}>
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        animate={{
          rotate: isSinging ? [0, -2, 2, 0] : isClumsy ? [0, 5, -5, 2, 0] : [0, -1, 1, 0],
          scale: isSinging ? [1, 1.05, 1] : 1,
          x: isClumsy ? [0, 5, -5, 0] : 0
        }}
        transition={{
          repeat: Infinity,
          duration: isSinging ? 0.3 : isClumsy ? 2 : 4,
          ease: "easeInOut",
        }}
      >
        {/* Body */}
        <motion.path
          d="M40,100 C40,40 160,40 160,100 C160,160 40,160 40,100"
          fill="white"
          stroke="#4A3B33"
          strokeWidth="4"
          animate={{
            d: isSinging 
              ? "M40,100 C40,35 160,35 160,100 C160,165 40,165 40,100"
              : isClumsy
              ? "M42,102 C42,42 158,42 158,102 C158,162 42,162 42,102"
              : "M40,100 C40,40 160,40 160,100 C160,160 40,160 40,100"
          }}
        />

        {/* Limbs - Stick arms */}
        <motion.line
          x1="50" y1="120" x2="30" y2="140"
          stroke="#4A3B33" strokeWidth="3" strokeLinecap="round"
          animate={isSinging ? { y2: [140, 130, 140] } : isClumsy ? { x2: [30, 40, 30], y2: [140, 120, 140] } : {}}
        />
        <motion.line
          x1="150" y1="120" x2="170" y2="140"
          stroke="#4A3B33" strokeWidth="3" strokeLinecap="round"
          animate={isSinging ? { y2: [140, 150, 140] } : isClumsy ? { x2: [170, 160, 170], y2: [140, 160, 140] } : {}}
        />
        
        {/* Legs */}
        <motion.line 
          x1="80" y1="155" x2="75" y2="180" stroke="#4A3B33" strokeWidth="3" strokeLinecap="round" 
          animate={isClumsy ? { x2: [75, 90, 75] } : {}}
        />
        <motion.line 
          x1="120" y1="155" x2="125" y2="180" stroke="#4A3B33" strokeWidth="3" strokeLinecap="round" 
          animate={isClumsy ? { x2: [125, 110, 125] } : {}}
        />

        {/* Eyes */}
        <g>
          {isClumsy ? (
             <>
               <motion.circle 
                 cx="80" cy="90" r="8" fill="#4A3B33"
                 animate={{ scale: [1, 1.2, 0.8, 1], x: [0, 4, -4, 0], y: [0, 2, -2, 0] }}
                 transition={{ repeat: Infinity, duration: 1 }}
               />
               <motion.circle 
                 cx="120" cy="90" r="5" fill="#4A3B33"
                 animate={{ scale: [1, 0.8, 1.2, 1], x: [0, -4, 4, 0], y: [0, -3, 3, 0] }}
                 transition={{ repeat: Infinity, duration: 1.2 }}
               />
             </>
          ) : isNervous ? (
            <>
              <circle cx="80" cy="90" r="4" fill="#4A3B33" />
              <circle cx="120" cy="90" r="4" fill="#4A3B33" />
              <path d="M70,75 L90,85" stroke="#4A3B33" strokeWidth="2" />
              <path d="M130,75 L110,85" stroke="#4A3B33" strokeWidth="2" />
            </>
          ) : (
            <>
              <motion.circle 
                cx="80" cy="90" r="6" fill="#4A3B33"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, times: [0, 0.95, 1] }}
              />
              <motion.circle 
                cx="120" cy="90" r="6" fill="#4A3B33"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, times: [0, 0.95, 1], delay: 0.1 }}
              />
            </>
          )}
        </g>

        {/* Mouth */}
        <motion.g transform="translate(100, 120)">
           {isSinging ? (
             <motion.ellipse 
               rx="15" ry="12" fill="#4A3B33" 
               animate={mouthControls}
             />
           ) : isClumsy ? (
             <g>
               <path d="M-15,0 Q0,20 15,0" fill="none" stroke="#4A3B33" strokeWidth="4" strokeLinecap="round" />
               {/* Tongue */}
               <motion.path 
                 d="M-5,10 Q0,25 5,10" fill="#FF8E8E" stroke="#4A3B33" strokeWidth="2"
                 animate={{ y: [0, 5, 0], rotate: [0, 10, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 0.4 }}
               />
             </g>
           ) : (
             <path d="M-10,0 Q0,10 10,0" fill="none" stroke="#4A3B33" strokeWidth="3" strokeLinecap="round" />
           )}
        </motion.g>

        {/* Tiny Microphone */}
        <motion.g 
          transform="translate(40, 130) rotate(-20)"
          animate={isClumsy ? { rotate: [-20, -40, 10, -20], x: [0, -5, 5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <rect x="0" y="0" width="8" height="25" fill="#4A3B33" rx="2" />
          <circle cx="4" cy="0" r="7" fill="#666" />
          <circle cx="4" cy="0" r="5" fill="#888" stroke="#4A3B33" strokeWidth="1" />
        </motion.g>
      </motion.svg>
      
      {/* Blushing */}
      <div className="absolute top-[45%] left-[25%] w-4 h-2 bg-pink-200 rounded-full blur-[2px] opacity-60" />
      <div className="absolute top-[45%] right-[25%] w-4 h-2 bg-pink-200 rounded-full blur-[2px] opacity-60" />
    </div>
  );
}
