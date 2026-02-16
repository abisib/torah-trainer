import { toHebrewNumeral } from '../utils/hebrewNumerals';
import type { Aliyah } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface TajViewProps {
  aliyah: Aliyah;
  aliyahName: string;
}

export default function TajView({ aliyah, aliyahName }: TajViewProps) {
  const { nusach } = useSettings();

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 font-serif scroll-smooth" dir="rtl">
      <div className="text-center pb-6">
        <h2 className="text-2xl font-bold text-slate-800 font-sans">{aliyahName}</h2>
        <div className="h-1 w-12 bg-blue-500/20 mx-auto mt-2 rounded-full"></div>
      </div>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="space-y-4">
          {aliyah.verses.map((verse) => {
            const textFull = verse.versions?.[nusach]?.text_full || verse.text_full;
            
            return (
              <div key={verse.verse_num} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200 group overflow-hidden">
                <div className="flex gap-4">
                  {/* Verse Number */}
                  <div className="flex-shrink-0 pt-1 text-right">
                    <span className="text-xs font-sans text-slate-300 font-bold group-hover:text-amber-500 transition-colors block">
                      {verse.chapter && verse.verse 
                        ? `${toHebrewNumeral(verse.chapter)}:${toHebrewNumeral(verse.verse)}`
                        : toHebrewNumeral(verse.verse_num)
                      }
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow">
                    <div className="text-2xl font-bold mb-4 font-serif text-slate-900 leading-relaxed">
                      {textFull}
                    </div>
                    <div className="text-lg text-slate-500 font-serif leading-relaxed border-t border-slate-50 pt-4">
                      {verse.targum}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
