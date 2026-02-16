import { useState, useEffect } from 'react';
import type { Aliyah, VerseData } from '../types';

export interface UseTorahDataResult {
  data: VerseData | null;
  loading: boolean;
  error: string | null;
}

export function useTorahData(parashaId: string): UseTorahDataResult {
  const [data, setData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/data/parashot/${parashaId}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load data for ${parashaId}`);
        }
        const jsonData = await response.json();
        
        if (jsonData && Array.isArray(jsonData.aliyot)) {
            setData(jsonData as VerseData);
        } else if (jsonData && Array.isArray(jsonData.verses)) {
            // Fallback: create one dummy aliyah for entire content
            const dummyAliyah: Aliyah = { 
                num: 1, 
                range: jsonData.ref || '', 
                verses: jsonData.verses 
            };
            // Ensure other fields exist
            const fallbackData: VerseData = {
                id: jsonData.id || parashaId,
                name: jsonData.name || parashaId,
                hebrew: jsonData.hebrew || '',
                ref: jsonData.ref || '',
                verses: jsonData.verses,
                aliyot: [dummyAliyah]
            };
            setData(fallbackData);
        } else {
             throw new Error('Invalid data format');
        }

      } catch (err: unknown) {
        if (err instanceof Error) {
           setError(err.message);
        } else {
           setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    if (parashaId) {
      fetchData();
    }
  }, [parashaId]);

  return { data, loading, error };
}
