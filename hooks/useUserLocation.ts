// Asks for location permission once and returns the user's position.
// If permission is denied the app still works — the map just starts at a
// default region and distances are hidden.
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { LatLng } from '../lib/geo';

export function useUserLocation() {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setDenied(true);
        return;
      }
      // Balanced accuracy is plenty for "playgrounds near me" and saves battery.
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!cancelled) {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { coords, denied };
}
