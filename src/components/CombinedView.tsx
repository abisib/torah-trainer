import React, { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { type Aliyah } from '../types';

interface CombinedViewProps {
  aliyot: Aliyah[];
}

const CombinedView: React.FC<CombinedViewProps> = ({ aliyot }) => {
  const { nusach } = useSettings();

  const allVerses = useMemo(() => {
    return aliyot.flatMap(aliyah => 
      aliyah.verses.map(verse => ({
        ...verse,
        aliyahNum: aliyah.num
      }))
    );
  }, [aliyot]);

  return (
    <div className="flex flex-col h-full bg-[#fcf5e5] overflow-y-auto p-4" dir="rtl">
      <div className="max-w-3xl mx-auto w-full pb-20">
        {allVerses.map((verse, idx) => {
          const version = verse.versions?.[nusach];
          const textFull = version?.text_full || verse.text_full;
          const textClean = version?.text_clean || verse.text_clean;

          return (
            <div key={`${verse.verse_num}-${idx}`} className="mb-10 p-4 bg-white rounded-lg shadow-sm border border-[#eaddc5]">
              {/* Verse Header */}
              <div className="text-xs text-gray-400 mb-2 flex justify-between">
                <span>פסוק {verse.verse_num}</span>
                {idx === 0 || allVerses[idx-1].aliyahNum !== verse.aliyahNum ? (
                  <span className="font-bold text-blue-600">עליה {verse.aliyahNum}</span>
                ) : null}
              </div>

              {/* Layer 1: Taj (Source) */}
              <div 
                className="text-3xl leading-relaxed text-black mb-4 font-serif"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
              >
                {textFull}
              </div>

              {/* Layer 2: Tikun (Practice/Scroll) */}
              <div 
                className="text-3xl leading-relaxed text-[#8B4513] mb-4 select-none"
                style={{ fontFamily: "'StamCustom', serif" }}
              >
                {textClean}
              </div>

              {/* Layer 3: Targum (Aramaic) */}
              <div className="text-lg text-gray-500 italic font-serif border-t border-gray-100 pt-2 mt-2">
                {verse.targum}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CombinedView;
