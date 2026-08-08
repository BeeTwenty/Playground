// Loads everything the detail screen needs about one playground:
// the playground itself, its photos and all its ratings — in parallel.
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { supabase } from '../lib/supabase';
import type { Playground, PlaygroundImage, Rating } from '../lib/types';

export function usePlaygroundDetail(playgroundId: string | undefined) {
  const [playground, setPlayground] = useState<Playground | null>(null);
  const [images, setImages] = useState<PlaygroundImage[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!playgroundId) return;
    const [playgroundRes, imagesRes, ratingsRes] = await Promise.all([
      supabase.from('playgrounds').select('*').eq('id', playgroundId).maybeSingle(),
      supabase
        .from('playground_images')
        .select('*')
        .eq('playground_id', playgroundId)
        .order('created_at'),
      supabase
        .from('ratings')
        .select('*')
        .eq('playground_id', playgroundId)
        .order('created_at', { ascending: false }),
    ]);

    const firstError = playgroundRes.error ?? imagesRes.error ?? ratingsRes.error;
    if (firstError) {
      setError(firstError.message);
    } else {
      setPlayground(playgroundRes.data);
      setImages(imagesRes.data ?? []);
      setRatings(ratingsRes.data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [playgroundId]);

  // Re-fetch when returning from the rating screen so new ratings show up.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { playground, images, ratings, loading, error, reload };
}
