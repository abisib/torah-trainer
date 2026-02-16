import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TorahView from './TorahView';
import TajView from './TajView';
import CombinedView from './CombinedView';
import { useTorahData } from '../hooks/useTorahData';
import { useSettings } from '../contexts/SettingsContext';
import { type Book, type Parasha } from '../types';

const Trainer: React.FC = () => {
  const { parashaId } = useParams<{ parashaId: string }>();
  const { data, loading, error } = useTorahData(parashaId || '');
  const { nusach, setNusach } = useSettings();
  
  // View State
  const [mobileView, setMobileView] = useState<'torah' | 'taj' | 'combined'>('torah');
  const [desktopView, setDesktopView] = useState<'split' | 'combined'>('split');
  
  const [allParashot, setAllParashot] = useState<Parasha[]>([]);

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
  const prevParasha = currentIndex > 0 ? allParashot[currentIndex - 1] : null;
  const nextParasha = currentIndex !== -1 && currentIndex < allParashot.length - 1 ? allParashot[currentIndex + 1] : null;

  if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen text-lg text-blue-600 font-medium">
            Loading...
        </div>
      );
  }

  if (error || !data) {
      return (
        <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-lg shadow">
             <div className="text-red-500 font-bold mb-4">{error || 'Data not found'}</div>
             <Link to="/" className="text-blue-600 underline">Return Home</Link>
        </div>
      );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-20 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">
               <span className="text-xl font-bold">🏠</span>
             </Link>
             
             <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2 flex">
               <button 
                 onClick={() => setNusach('standard')} 
                 className={`px-2 py-1 rounded text-xs transition-all ${nusach === 'standard' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 כללי
               </button>
               <button 
                 onClick={() => setNusach('yemenite')} 
                 className={`px-2 py-1 rounded text-xs transition-all ${nusach === 'yemenite' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 תימני
               </button>
             </div>

             <div>
               <h1 className="text-xl font-bold text-gray-900 leading-tight">
                 {currentParasha?.hebrew || currentParasha?.name || parashaId}
               </h1>
               <span className="text-xs text-gray-500 font-mono hidden md:inline-block">
                 {currentParasha?.ref}
               </span>
             </div>
          </div>
          
          {/* Desktop View Switcher */}
          <div className="hidden md:flex bg-gray-100 p-1 rounded-lg ml-4">
            <button
              onClick={() => setDesktopView('split')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                desktopView === 'split' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              מפוצל (רגיל)
            </button>
            <button
              onClick={() => setDesktopView('combined')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                desktopView === 'combined' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              משולב (לימוד)
            </button>
          </div>
          
          {/* Mobile View Switcher (3-way) */}
          <div className="flex md:hidden bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMobileView('torah')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mobileView === 'torah' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              תיקון
            </button>
            <button
              onClick={() => setMobileView('taj')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mobileView === 'taj' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              תאג׳
            </button>
            <button
              onClick={() => setMobileView('combined')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mobileView === 'combined' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              משולב
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden relative w-full">
        
        {/* Desktop View */}
        <div className="hidden md:block h-full">
          {desktopView === 'split' ? (
            <div className="grid grid-cols-2 h-full divide-x divide-x-reverse divide-gray-200">
              {/* Left: Torah (Target) */}
              <div className="h-full overflow-hidden flex flex-col bg-[#fdfbf7]">
                 <div className="bg-[#f4f1ea] p-2 text-center text-xs font-bold text-gray-500 border-b border-[#eaddc5]">
                   תיקון קוראים
                 </div>
                 <TorahView aliyot={data.aliyot} />
              </div>

              {/* Right: Taj (Source) */}
              <div className="h-full overflow-hidden flex flex-col bg-white">
                 <div className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500 border-b border-gray-200">
                   מקור (תאג׳)
                 </div>
                 <TajView aliyot={data.aliyot} />
              </div>
            </div>
          ) : (
             <div className="h-full bg-[#fcf5e5]">
               <CombinedView aliyot={data.aliyot} />
             </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="md:hidden h-full w-full">
          {mobileView === 'torah' && (
            <div className="h-full bg-[#fdfbf7]">
              <TorahView aliyot={data.aliyot} />
            </div>
          )}
          {mobileView === 'taj' && (
            <div className="h-full bg-white">
              <TajView aliyot={data.aliyot} />
            </div>
          )}
          {mobileView === 'combined' && (
            <div className="h-full bg-[#fcf5e5]">
              <CombinedView aliyot={data.aliyot} />
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-gray-200 p-3 flex-shrink-0 z-20">
        <div className="container mx-auto flex justify-between items-center max-w-4xl">
          {prevParasha ? (
            <Link 
              to={`/read/${prevParasha.id}`}
              className="flex items-center text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
            >
              <span className="ml-2 text-lg">→</span>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">הקודם</span>
                <span className="font-bold text-sm">{prevParasha.hebrew || prevParasha.name}</span>
              </div>
            </Link>
          ) : <div />}

          {nextParasha ? (
            <Link 
              to={`/read/${nextParasha.id}`}
              className="flex items-center text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-left"
            >
              <div className="text-left">
                <span className="text-xs text-gray-400 block">הבא</span>
                <span className="font-bold text-sm">{nextParasha.hebrew || nextParasha.name}</span>
              </div>
              <span className="mr-2 text-lg">←</span>
            </Link>
          ) : <div />}
        </div>
      </footer>
    </div>
  );
};

export default Trainer;
