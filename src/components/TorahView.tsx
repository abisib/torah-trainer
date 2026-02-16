import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Aliyah } from '../types';
import HintTooltip from './HintTooltip';
import { useSettings } from '../contexts/SettingsContext';

interface TorahViewProps {
  aliyot: Aliyah[];
}

const ALIYAH_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי", "מפטיר"];
const WORDS_PER_PAGE = 300;

interface Token {
  id: string;
  type: 'word' | 'space' | 'aliyah_start';
  text: string;
  hint?: string;
  subtext?: string;
}

export default function TorahView({ aliyot }: TorahViewProps) {
  const { nusach } = useSettings();
  const [currentPage, setCurrentPage] = useState(0);

  // Flatten words and spaces
  const tokens: Token[] = useMemo(() => {
    const flat: Token[] = [];
    
    aliyot.forEach((aliyah, aIdx) => {
      // Add Aliyah Start Marker
      flat.push({
        id: `aliyah-${aliyah.num}`,
        type: 'aliyah_start',
        text: ALIYAH_NAMES[aIdx] || `עליה ${aliyah.num}`,
        subtext: `(${aliyah.range})`
      });

      aliyah.verses.forEach((verse) => {
        const textClean = verse.versions?.[nusach]?.text_clean || verse.text_clean;
        const textFull = verse.versions?.[nusach]?.text_full || verse.text_full;
        
        // Split keeping delimiters to preserve whitespace/newlines
        const cleanSegments = textClean.split(/(\s+)/);
        const fullSegments = textFull.split(/(\s+)/);
        
        cleanSegments.forEach((segment, sIdx) => {
          if (!segment) return;

          // Check if it's purely whitespace
          if (/^\s+$/.test(segment)) {
             flat.push({
               id: `${verse.verse_num}-${sIdx}-space`,
               type: 'space',
               text: segment
             });
          } else {
             // It's a word
             flat.push({
               id: `${verse.verse_num}-${sIdx}`,
               type: 'word',
               text: segment,
               hint: fullSegments[sIdx] || segment
             });
          }
        });
      });
    });
    return flat;
  }, [aliyot, nusach]);

  const totalPages = Math.ceil(tokens.length / WORDS_PER_PAGE) || 1;

  // Ensure current page is valid if tokens change
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // Pagination Logic
  const nextPage = useCallback(() => {
    setCurrentPage(p => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(p => Math.max(p - 1, 0));
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') nextPage(); // RTL logical next
      if (e.key === 'ArrowRight') prevPage(); // RTL logical prev
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);
  
  // Current Page Slice
  const currentTokens = tokens.slice(currentPage * WORDS_PER_PAGE, (currentPage + 1) * WORDS_PER_PAGE);

  return (
    <div className="flex flex-col h-full bg-[#fcf5e5] text-gray-900 font-serif relative" dir="rtl">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-8 bg-[#fcf5e5] scroll-smooth">
        <div 
          className="mx-auto min-h-[600px] text-justify font-bold text-black"
          style={{ 
            fontFamily: "'StamCustom', 'Frank Ruhl Libre', serif",
            fontSize: '32px',
            lineHeight: '1.6',
            maxWidth: '550px',
            textAlignLast: 'justify',
            direction: 'rtl',
            whiteSpace: 'pre-wrap'
          }}
        >
           {currentTokens.map((token) => {
             if (token.type === 'aliyah_start') {
               return (
                 <div key={token.id} className="w-full mt-6 mb-2 text-gray-500 text-lg font-bold border-b border-gray-200 pb-1">
                   {token.text}
                   <span className="text-xs font-normal mr-2 text-gray-400">{token.subtext}</span>
                 </div>
               );
             }
             
             if (token.type === 'space') {
                return <span key={token.id}>{token.text}</span>;
             }

             return (
               <span key={token.id} className="inline-block">
                  <HintTooltip 
                    word={token.text.replace(/\|/g, ' ')} 
                    hint={token.hint || token.text} 
                    active={true} 
                  />
               </span>
             );
           })}
        </div>
      </div>

      {/* Controls Footer */}
      <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center shadow-md z-10">
         <button 
           onClick={prevPage} 
           disabled={currentPage === 0}
           className="px-6 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg text-lg font-medium transition-colors"
         >
           הקודם
         </button>
         
         <span className="text-gray-600 font-mono" dir="ltr">
           Page {currentPage + 1} / {totalPages}
         </span>

         <button 
           onClick={nextPage} 
           disabled={currentPage === totalPages - 1}
           className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-lg text-lg font-medium transition-colors shadow-sm"
         >
           הבא
         </button>
      </div>
    </div>
  );
}
