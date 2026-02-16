import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Parasha {
  name: string;
  id: string;
  ref: string;
}

interface Book {
  book: string;
  hebrew: string;
  parashot: Parasha[];
}

const BOOK_THEMES: Record<string, { bg: string, text: string, icon: string }> = {
  Genesis: { bg: 'bg-blue-50', text: 'text-blue-900', icon: '🌍' },
  Exodus: { bg: 'bg-red-50', text: 'text-red-900', icon: '🔥' },
  Leviticus: { bg: 'bg-green-50', text: 'text-green-900', icon: '🕊️' },
  Numbers: { bg: 'bg-amber-50', text: 'text-amber-900', icon: '⛺' },
  Deuteronomy: { bg: 'bg-purple-50', text: 'text-purple-900', icon: '📜' },
};

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/manifest.json')
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load manifest:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-400">
        <div className="animate-pulse">טוען ספרייה...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans" dir="rtl">
      <header className="max-w-5xl mx-auto mb-16 text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">מאמן קריאה בתורה</h1>
        <p className="text-lg text-slate-500 font-medium">הכלי המתקדם ללימוד קריאה בנוסח תימן ואשכנז</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book) => {
          const theme = BOOK_THEMES[book.book] || { bg: 'bg-white', text: 'text-gray-900', icon: '📚' };
          
          return (
            <Link
              key={book.book}
              to={`/book/${book.book.toLowerCase()}`}
              className="group relative block bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`h-3 w-full ${theme.bg.replace('bg-', 'bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ' + theme.text)}`}></div>
              <div className="p-8 flex flex-col items-center justify-center text-center h-56">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                  {theme.icon}
                </div>
                <h2 className={`text-4xl font-bold mb-2 ${theme.text}`}>{book.hebrew}</h2>
                <span className="text-sm text-slate-400 font-medium uppercase tracking-widest">{book.book}</span>
                <div className="mt-6 px-4 py-1.5 bg-slate-50 rounded-full text-xs font-bold text-slate-500 group-hover:bg-slate-100 transition-colors">
                  {book.parashot.length} פרשות
                </div>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
