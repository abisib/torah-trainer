import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type Book } from '../types';

export default function BookView() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/manifest.json')
      .then((res) => res.json())
      .then((data: Book[]) => {
        const foundBook = data.find(
          (b) => b.book.toLowerCase() === bookId?.toLowerCase()
        );
        setBook(foundBook || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load manifest:', err);
        setLoading(false);
      });
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-400">
        <div className="animate-pulse">טוען פרשות...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-500">
        <h2 className="text-3xl font-bold mb-6">חומש לא נמצא</h2>
        <Link to="/" className="px-6 py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors">
          חזרה לבית
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <nav className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md"
          >
            <span className="ml-2 text-xl">→</span> חזרה לספרייה
          </Link>
        </nav>

        <header className="mb-12">
          <h1 className="text-6xl font-black text-slate-900 mb-2">{book.hebrew}</h1>
          <div className="h-1.5 w-24 bg-amber-500 rounded-full mb-4"></div>
          <span className="text-xl text-slate-400 font-medium tracking-widest uppercase">
            {book.book}
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {book.parashot.map((parasha, index) => (
            <Link
              key={parasha.id}
              to={`/read/${parasha.id}`}
              className="group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-slate-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 text-slate-400 text-xs font-bold px-3 py-1 rounded-full">
                  #{index + 1}
                </div>
                <span className="text-slate-300 group-hover:text-amber-500 transition-colors transform group-hover:-translate-x-1">
                  ←
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">
                {parasha.hebrew || parasha.name}
              </h3>
              
              <div className="text-sm text-slate-400 font-mono bg-slate-50 inline-block px-2 py-1 rounded">
                {parasha.ref}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
