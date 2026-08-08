// Loads the list of playgrounds for the map, re-fetching whenever the map
// screen regains focus (so a newly added playground shows up right away).
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { supabase } from '../lib/supabase';
import type { Playground } from '../lib/types';

export function usePlaygrounds() {
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from('playgrounds')
      .select('*')
      .order('created_at', { ascending: false });
    if (dbError) {
      setError(dbError.message);
    } else {
      setPlaygrounds(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { playgrounds, loading, error, reload };
}
