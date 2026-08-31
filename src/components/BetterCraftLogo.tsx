import React, { useState } from 'react';
import { Pickaxe, Box, Gamepad2 } from 'lucide-react';

interface BetterCraftLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const LOGO_CANDIDATES = [
  'https://raw.githubusercontent.com/wrxxnch/luanti-bettercraft/main/games/bettercraft/menu/icon.png',
  'https://raw.githubusercontent.com/wrxxnch/bettercraft/main/menu/icon.png',
  'https://raw.githubusercontent.com/wrxxnch/luanti-bettercraft/main/screenshot.png',
  'https://raw.githubusercontent.com/wrxxnch/bettercraft/main/screenshot.png'
];

export const BetterCraftLogo: React.FC<BetterCraftLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  const handleError = () => {
    if (candidateIndex < LOGO_CANDIDATES.length - 1) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setFailedAll(true);
    }
  };

  if (failedAll) {
    return (
      <div 
        className={`w-full h-full bg-gradient-to-br from-[#107040] via-[#0b4d2c] to-[#042012] flex items-center justify-center relative overflow-hidden rounded-[2px] ${className}`}
        title="BetterCraft Luanti"
      >
        {/* Pixel Art Block Icon as reliable CSS/SVG fallback */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#55ff55]/20 blur-sm rounded-full" />
          <Pickaxe className="w-3/4 h-3/4 text-[#55ff55] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={LOGO_CANDIDATES[candidateIndex]}
      alt="BetterCraft Logo"
      referrerPolicy="no-referrer"
      onError={handleError}
      className={`w-full h-full object-contain [image-rendering:pixelated] select-none ${className}`}
    />
  );
};
