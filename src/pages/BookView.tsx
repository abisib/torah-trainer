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
        // Find the book matching the URL param (case-insensitive)
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
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading Book...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
        <Link to="/" className="text-blue-600 hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <span className="ml-2">→</span> חזרה לרשימת החומשים
        </Link>

        <header className="mb-8 border-b pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{book.hebrew}</h1>
          <span className="text-xl text-gray-500 font-light uppercase tracking-wide">
            {book.book}
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {book.parashot.map((parasha) => (
            <Link
              key={parasha.id}
              to={`/read/${parasha.id}`}
              className="group block p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700">
                  {parasha.hebrew || parasha.name}
                </h3>
                <span className="text-sm text-gray-400 font-mono mt-1 block">
                  {parasha.ref}
                </span>
              </div>
              <span className="text-gray-300 group-hover:text-blue-500 transform group-hover:-translate-x-1 transition-transform">
                ←
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
