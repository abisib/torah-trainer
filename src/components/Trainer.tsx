import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TorahView from './TorahView';
import TajView from './TajView';
import CombinedView from './CombinedView';
import { useTorahData } from '../hooks/useTorahData';
import { useSettings } from '../contexts/SettingsContext';
import { type Book, type Parasha } from '../types';

const ALIYAH_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי", "מפטיר", "הפטרה"];

const Trainer: React.FC = () => {
  const { parashaId } = useParams<{ parashaId: string }>();
  const { data, loading, error } = useTorahData(parashaId || '');
  const { nusach, setNusach, stamFont, setStamFont } = useSettings();
  
  // View State
  const [mobileView, setMobileView] = useState<'torah' | 'taj' | 'combined'>('combined');
  const [desktopView, setDesktopView] = useState<'split' | 'combined'>('split');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [allParashot, setAllParashot] = useState<Parasha[]>([]);
  const [currentAliyahIndex, setCurrentAliyahIndex] = useState(0);

  useEffect(() => {
    fetch('/data/manifest.json')
      .then(res => res.json())
      .then((books: Book[]) => {
        const flattened = books.flatMap(b => b.parashot);
        setAllParashot(flattened);
      })
      .catch(err => console.error("Failed to load manifest for navigation", err));
  }, []);

  const currentIndex = allParashot.findIndex(p => p.id === parashaId);
  const currentParasha = allParashot[currentIndex];

  // Reset Aliyah when Parasha changes
  useEffect(() => {
    setCurrentAliyahIndex(0);
  }, [parashaId]);

  const handleNextAliyah = () => {
      if (data && currentAliyahIndex < aliyotList.length - 1) {
          setCurrentAliyahIndex(prev => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const handlePrevAliyah = () => {
      if (currentAliyahIndex > 0) {
          setCurrentAliyahIndex(prev => prev - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen text-lg text-slate-600 font-medium bg-slate-50">
            <div className="animate-pulse">טוען טקסט...</div>
        </div>
      );
  }

  if (error || !data) {
      return (
        <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-2xl shadow-lg">
             <div className="text-red-500 font-bold mb-4">{error || 'Data not found'}</div>
             <Link to="/" className="text-blue-600 underline">Return Home</Link>
        </div>
      );
  }

  // Determine active Aliyot array based on Nusach
  // Logic: Combine Torah Aliyot + Haftarah
  const torahAliyot = (nusach === 'yemenite' && data?.aliyot_yemenite)
    ? data.aliyot_yemenite
    : (data?.aliyot || []);

  const haftaraAliyah = (nusach === 'yemenite' && data?.haftara_yemenite)
    ? data.haftara_yemenite
    : data?.haftara;

  const aliyotList = haftaraAliyah ? [...torahAliyot, haftaraAliyah] : torahAliyot;

  const currentAliyah = aliyotList[currentAliyahIndex];
  // Guard against undefined if switching mid-stream
  if (!currentAliyah && aliyotList.length > 0) {
      setCurrentAliyahIndex(0); // Reset if lost
  }
  // Guard against undefined if switching mid-stream
  if (!currentAliyah && aliyotList.length > 0) {
      setCurrentAliyahIndex(0); // Reset if lost
  }
  
  const aliyahName = ALIYAH_NAMES[currentAliyahIndex] || `Aliyah ${currentAliyahIndex + 1}`;
  
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100 shadow-sm flex-shrink-0 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
             {/* Mobile Menu Button */}
             <button 
               className="md:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full"
               onClick={() => setIsMenuOpen(true)}
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
               </svg>
             </button>

             <Link to="/" className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100 hidden md:block">
               <span className="text-xl font-bold">🏠</span>
             </Link>
             
             {/* Desktop Controls */}
             <div className="hidden md:flex items-center gap-3">
               {/* Nusach Selector */}
               <div className="flex items-center bg-slate-100 rounded-xl p-1">
                 <button 
                   onClick={() => setNusach('standard')} 
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${nusach === 'standard' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   כללי
                 </button>
                 <button 
                   onClick={() => setNusach('yemenite')} 
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${nusach === 'yemenite' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   תימני
                 </button>
               </div>

               {/* Font Selector */}
               <div className="flex items-center bg-slate-100 rounded-xl p-1">
                 <button 
                   onClick={() => setStamFont('StamAshkenaz')} 
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${stamFont === 'StamAshkenaz' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   אשכנז
                 </button>
                 <button 
                   onClick={() => setStamFont('StamSefarad')} 
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${stamFont === 'StamSefarad' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   ספרד
                 </button>
               </div>
             </div>

             <div>
               <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
                 {currentParasha?.hebrew || currentParasha?.name || parashaId}
               </h1>
               <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tracking-wide mt-1">
                 <div className="relative group">
                   <select
                     value={currentAliyahIndex}
                     onChange={(e) => {
                       setCurrentAliyahIndex(Number(e.target.value));
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                     }}
                     className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1 pr-2 pl-6 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors text-xs"
                   >
                     {ALIYAH_NAMES.map((name, idx) => (
                       <option key={idx} value={idx}>
                         {name}
                       </option>
                     ))}
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1 text-slate-500">
                     <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                       <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                     </svg>
                   </div>
                 </div>
                 <span className="hidden md:inline opacity-50">|</span>
                 <span className="hidden md:inline">{currentParasha?.ref}</span>
               </div>
             </div>
          </div>
          
          {/* Desktop View Switcher */}
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl ml-4">
            <button
              onClick={() => setDesktopView('split')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                desktopView === 'split' 
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              מפוצל
            </button>
            <button
              onClick={() => setDesktopView('combined')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                desktopView === 'combined' 
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              משולב
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Settings Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl p-6 transform transition-transform duration-300 ease-out overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">הגדרות</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              {/* Section: View */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">תצוגה</h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => { setMobileView('torah'); setIsMenuOpen(false); }}
                    className={`p-3 rounded-xl text-right font-bold transition-all ${mobileView === 'torah' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    תיקון קוראים
                  </button>
                  <button 
                    onClick={() => { setMobileView('taj'); setIsMenuOpen(false); }}
                    className={`p-3 rounded-xl text-right font-bold transition-all ${mobileView === 'taj' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    תאג׳ (מקור)
                  </button>
                  <button 
                    onClick={() => { setMobileView('combined'); setIsMenuOpen(false); }}
                    className={`p-3 rounded-xl text-right font-bold transition-all ${mobileView === 'combined' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    משולב (לימוד)
                  </button>
                </div>
              </div>

              {/* Section: Nusach */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">נוסח</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setNusach('standard')}
                    className={`p-3 rounded-xl text-center font-bold text-sm transition-all ${nusach === 'standard' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-slate-50 text-slate-600'}`}
                  >
                    כללי
                  </button>
                  <button 
                    onClick={() => setNusach('yemenite')}
                    className={`p-3 rounded-xl text-center font-bold text-sm transition-all ${nusach === 'yemenite' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-slate-50 text-slate-600'}`}
                  >
                    תימני
                  </button>
                </div>
              </div>

              {/* Section: Font */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">גופן סת״ם</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setStamFont('StamAshkenaz')}
                    className={`p-3 rounded-xl text-center font-bold text-sm transition-all ${stamFont === 'StamAshkenaz' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-slate-50 text-slate-600'}`}
                  >
                    אשכנז
                  </button>
                  <button 
                    onClick={() => setStamFont('StamSefarad')}
                    className={`p-3 rounded-xl text-center font-bold text-sm transition-all ${stamFont === 'StamSefarad' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-slate-50 text-slate-600'}`}
                  >
                    ספרד
                  </button>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium">
                  <span>🏠</span> חזרה לבית
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden relative w-full bg-slate-50">
        
        {/* Desktop View */}
        <div className="hidden md:block h-full">
          {desktopView === 'split' ? (
            <div className="grid grid-cols-2 h-full divide-x divide-x-reverse divide-slate-200">
              {/* Left: Torah (Target) */}
              <div className="h-full overflow-hidden flex flex-col bg-[#fdfbf7]">
                 <div className="bg-[#f4f1ea]/90 backdrop-blur-sm p-2 text-center text-xs font-bold text-slate-500 border-b border-[#eaddc5] sticky top-0 z-10">
                   תיקון קוראים
                 </div>
                 <TorahView aliyah={currentAliyah} aliyahName={aliyahName} />
              </div>

              {/* Right: Taj (Source) */}
              <div className="h-full overflow-hidden flex flex-col bg-white">
                 <div className="bg-slate-50/90 backdrop-blur-sm p-2 text-center text-xs font-bold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                   מקור (תאג׳)
                 </div>
                 <TajView aliyah={currentAliyah} aliyahName={aliyahName} />
              </div>
            </div>
          ) : (
             <div className="h-full bg-slate-50">
               <CombinedView aliyah={currentAliyah} aliyahName={aliyahName} />
             </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="md:hidden h-full w-full">
          {mobileView === 'torah' && (
            <div className="h-full bg-[#fdfbf7]">
              <TorahView aliyah={currentAliyah} aliyahName={aliyahName} />
            </div>
          )}
          {mobileView === 'taj' && (
            <div className="h-full bg-white">
              <TajView aliyah={currentAliyah} aliyahName={aliyahName} />
            </div>
          )}
          {mobileView === 'combined' && (
            <div className="h-full bg-slate-50">
              <CombinedView aliyah={currentAliyah} aliyahName={aliyahName} />
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation (Aliyah) */}
      <footer className="bg-white border-t border-slate-200 p-4 flex-shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto flex justify-between items-center max-w-4xl">
          <button 
            onClick={handlePrevAliyah}
            disabled={currentAliyahIndex === 0}
            className="flex items-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="ml-2 text-xl">→</span>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">הקודם</span>
              <span className="font-bold text-sm">{ALIYAH_NAMES[currentAliyahIndex - 1] || '---'}</span>
            </div>
          </button>

          <button 
            onClick={handleNextAliyah}
            disabled={!data || currentAliyahIndex >= aliyotList.length - 1}
            className="flex items-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all duration-200 text-left disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <div className="text-left">
              <span className="text-xs text-slate-400 block font-medium">הבא</span>
              <span className="font-bold text-sm">{ALIYAH_NAMES[currentAliyahIndex + 1] || '---'}</span>
            </div>
            <span className="mr-2 text-xl">←</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Trainer;
