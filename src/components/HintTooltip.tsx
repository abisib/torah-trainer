import { useState } from 'react';

interface HintTooltipProps {
  word: string;
  hint: string;
  active: boolean;
}

export default function HintTooltip({ word, hint, active }: HintTooltipProps) {
  const [isClicked, setIsClicked] = useState(false);

  if (!active) {
    return <span className="inline-block ms-1">{word}</span>;
  }

  return (
    <span 
      className="relative inline-block ms-1 cursor-pointer group"
      onClick={() => setIsClicked(!isClicked)}
    >
      <span className="border-b border-transparent hover:border-blue-400 hover:bg-blue-50 transition-colors duration-150 rounded-sm px-0.5">
        {word}
      </span>
      
      {/* Tooltip - Show on group hover OR if clicked */}
      <span 
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-1 text-lg bg-gray-900 text-white rounded-md shadow-xl whitespace-nowrap z-50 font-serif border border-gray-700 pointer-events-none transition-all duration-200 origin-bottom ${
          isClicked ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
        }`}
        style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
      >
        {hint}
        {/* Arrow */}
        <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-gray-900"></span>
      </span>
    </span>
  );
}
