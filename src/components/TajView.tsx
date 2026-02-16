import type { Aliyah } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface TajViewProps {
  aliyot: Aliyah[];
}

const ALIYAH_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי", "מפטיר"];

export default function TajView({ aliyot }: TajViewProps) {
  const { nusach } = useSettings();

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 font-serif scroll-smooth" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {aliyot.map((aliyah, idx) => (
          <div key={aliyah.num} className="mb-8">
            <div className="flex items-center gap-2 mb-4 sticky top-0 bg-gray-50/95 py-2 z-10 backdrop-blur-sm border-b border-gray-200">
               <span className="text-lg font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                 {ALIYAH_NAMES[idx] || `עליה ${aliyah.num}`}
               </span>
               <span className="text-sm text-gray-500 font-sans" dir="ltr">
                 {aliyah.range}
               </span>
            </div>
            
            <div className="space-y-4">
              {aliyah.verses.map((verse) => {
                const textFull = verse.versions?.[nusach]?.text_full || verse.text_full;
                
                return (
                  <div key={verse.verse_num} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-xl font-bold mb-2 font-serif text-gray-900 leading-relaxed">
                      <span className="text-sm font-sans text-gray-400 font-normal ml-3 select-none inline-block min-w-[1.5rem]">
                        {verse.verse_num}.
                      </span>
                      {textFull}
                    </div>
                    <div className="text-lg text-gray-600 font-serif leading-relaxed border-t pt-2 border-gray-100 mt-2">
                      {verse.targum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
