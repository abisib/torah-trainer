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

const BOOK_COLORS: Record<string, string> = {
  Genesis: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-900',
  Exodus: 'bg-red-50 border-red-200 hover:border-red-400 text-red-900',
  Leviticus: 'bg-green-50 border-green-200 hover:border-green-400 text-green-900',
  Numbers: 'bg-orange-50 border-orange-200 hover:border-orange-400 text-orange-900',
  Deuteronomy: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-900',
};

// const HEBREW_BOOK_NAMES: Record<string, string> = {
//   Genesis: 'בראשית',
//   Exodus: 'שמות',
//   Leviticus: 'ויקרא',
//   Numbers: 'במדבר',
//   Deuteronomy: 'דברים',
// };

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
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading Library...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans" dir="rtl">
      <header className="max-w-5xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">מאמן קריאה בתורה</h1>
        <p className="text-gray-600">בחר חומש כדי להתחיל</p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => {
          const colorClass = BOOK_COLORS[book.book] || 'bg-white border-gray-200';
          
          return (
            <Link
              key={book.book}
              to={`/book/${book.book.toLowerCase()}`}
              className={`block p-6 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${colorClass} flex flex-col items-center justify-center text-center h-48`}
            >
              <h2 className="text-3xl font-bold mb-2">{book.hebrew}</h2>
              <span className="text-sm opacity-75 uppercase tracking-wide">{book.book}</span>
              <div className="mt-4 text-xs font-medium opacity-60">
                {book.parashot.length} פרשות
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
