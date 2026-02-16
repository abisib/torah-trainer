import React from 'react';
import { type Verse } from '../types';

interface VerseDisplayProps {
  verse: Verse;
  showTargum: boolean;
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({ verse, showTargum }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="text-2xl text-right font-serif mb-2" dir="rtl">
        <span className="text-sm text-gray-500 ml-2">({verse.verse_num})</span>
        {verse.text_full}
      </div>
      
      {showTargum && (
        <div className="text-lg text-right text-gray-700 font-serif mt-2 bg-gray-50 p-2 rounded" dir="rtl">
          <span className="font-bold text-xs text-gray-500 block mb-1">תרגום:</span>
          {verse.targum}
        </div>
      )}
    </div>
  );
};

export default VerseDisplay;
