import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { toHebrewNumeral } from '../utils/hebrewNumerals';
import { type Aliyah } from '../types';

interface CombinedViewProps {
  aliyah: Aliyah;
  aliyahName: string;
}

const CombinedView: React.FC<CombinedViewProps> = ({ aliyah, aliyahName }) => {
  const { nusach, stamFont } = useSettings();

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8" dir="rtl">
      <div className="text-center pb-6">
        <h2 className="text-2xl font-bold text-slate-800">{aliyahName}</h2>
        <div className="h-1 w-12 bg-blue-500/20 mx-auto mt-2 rounded-full"></div>
      </div>
      <div className="max-w-3xl mx-auto w-full pb-20">
        {aliyah.verses.map((verse, idx) => {
          const version = verse.versions?.[nusach];
          const textFull = version?.text_full || verse.text_full;
          const textClean = version?.text_clean || verse.text_clean;

          return (
            <div key={`${verse.verse_num}-${idx}`} className="mb-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
              
              {/* Card Header (Verse Info) */}
              <div className="bg-slate-50/50 px-3 py-1 border-b border-slate-100 flex justify-between items-center h-8">
                <span className="text-xs font-bold text-slate-400 bg-white px-2 rounded-md border border-slate-100 shadow-sm">
                  {verse.chapter && verse.verse 
                    ? `פרק ${toHebrewNumeral(verse.chapter)}, פסוק ${toHebrewNumeral(verse.verse)}`
                    : toHebrewNumeral(verse.verse_num)
                  }
                </span>
              </div>

              <div className="p-3 space-y-2">
                {/* Layer 1: Taj (Source) */}
                <div 
                  className="text-3xl font-bold leading-relaxed text-slate-900 font-serif text-justify"
                >
                  {textFull}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 w-1/3 mx-auto"></div>

                {/* Layer 2: Tikun (Practice/Scroll) */}
                <div 
                  className="text-3xl leading-relaxed text-amber-700/90 select-none text-justify"
                  style={{ fontFamily: `'${stamFont}', serif` }}
                >
                  {textClean}
                </div>

                {/* Layer 3: Targum (Aramaic) */}
                <div className="bg-slate-50 p-4 rounded-xl text-lg text-slate-500 font-serif leading-relaxed text-justify border border-slate-100">
                  <span className="text-xs text-slate-400 block mb-1 font-sans">תרגום אונקלוס</span>
                  {verse.targum}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CombinedView;
