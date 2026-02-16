import { useMemo } from 'react';
import type { Aliyah } from '../types';
import HintTooltip from './HintTooltip';
import { useSettings } from '../contexts/SettingsContext';
import { toHebrewNumeral } from '../utils/hebrewNumerals';

interface TorahViewProps {
  aliyah: Aliyah;
  aliyahName: string;
}

interface Token {
  id: string;
  type: 'word' | 'space';
  text: string;
  hint?: string;
  verseInfo?: { chapter: number; verse: number };
}

export default function TorahView({ aliyah, aliyahName }: TorahViewProps) {
  const { nusach, stamFont } = useSettings();

  // Flatten words and spaces for single Aliyah
  const tokens: Token[] = useMemo(() => {
    const flat: Token[] = [];
    
    aliyah.verses.forEach((verse) => {
      const textClean = verse.versions?.[nusach]?.text_clean || verse.text_clean;
      const textFull = verse.versions?.[nusach]?.text_full || verse.text_full;
      
      // Split keeping delimiters to preserve whitespace/newlines
      // Guard against empty string (Haftarah clean text might be empty)
      if (!textClean) return;

      const cleanSegments = textClean.split(/(\s+)/);
      const fullSegments = textFull.split(/(\s+)/);
      
      cleanSegments.forEach((segment, sIdx) => {
        if (!segment) return;

        const isStartOfVerse = sIdx === 0 && verse.chapter && verse.verse;

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
              hint: fullSegments[sIdx] || segment,
              // Only attach verse info to the first word of the verse
              verseInfo: isStartOfVerse && sIdx === 0 ? { chapter: verse.chapter!, verse: verse.verse! } : undefined
            });
        }
      });
    });
    return flat;
  }, [aliyah, nusach]);

  return (
    <div className="flex flex-col h-full bg-[#fcf5e5] text-gray-900 font-serif relative overflow-hidden" dir="rtl">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-8 px-4 bg-[#fcf5e5] scroll-smooth">
        <div className="text-center py-4 mb-8 border-b-2 border-amber-900/5 w-full">
            <h2 className="text-2xl font-bold text-slate-400/80 font-sans">{aliyahName}</h2>
        </div>
        <div 
          className="mx-auto min-h-[600px] text-justify font-bold text-black max-w-full md:max-w-[550px]"
          style={{ 
            fontFamily: `'${stamFont}', serif`,
            fontSize: '32px',
            lineHeight: '1.6',
            textAlignLast: 'justify',
            direction: 'rtl',
            whiteSpace: 'pre-wrap'
          }}
        >
           {tokens.map((token) => {
             if (token.type === 'space') {
                return <span key={token.id}>{token.text}</span>;
             }

             return (
               <span key={token.id} className="inline-block relative group/marker">
                  {token.verseInfo && (
                    <span className="absolute -right-6 top-1 text-[10px] font-sans text-slate-300 select-none opacity-0 group-hover/marker:opacity-100 transition-opacity">
                      {toHebrewNumeral(token.verseInfo.chapter)}:{toHebrewNumeral(token.verseInfo.verse)}
                    </span>
                  )}
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
    </div>
  );
}
