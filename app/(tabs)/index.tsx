// Map screen: shows playgrounds as pins around the user, with a distance
// filter. Tapping a pin opens a small callout; tapping the callout opens the
// playground's detail page.
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../../constants/theme';
import { usePlaygrounds } from '../../hooks/usePlaygrounds';
import { useUserLocation } from '../../hooks/useUserLocation';
import { distanceMeters, formatDistance } from '../../lib/geo';
import { useI18n } from '../../hooks/useI18n';

// Oslo city center — where the map starts if we don't know the user's position.
const FALLBACK_REGION = {
  latitude: 59.9139,
  longitude: 10.7522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Distance filter choices, in meters. null = show everything.
const DISTANCE_OPTIONS: (number | null)[] = [1000, 5000, 20000, null];

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { playgrounds } = usePlaygrounds();
  const { coords, denied } = useUserLocation();
  const [maxDistance, setMaxDistance] = useState<number | null>(null);

  // Attach a distance to every playground (when we know where the user is),
  // then drop the ones outside the selected filter.
  const visiblePlaygrounds = useMemo(() => {
    const withDistance = playgrounds.map((p) => ({
      ...p,
      distance: coords ? distanceMeters(coords, p) : null,
    }));
    if (maxDistance === null || !coords) return withDistance;
    return withDistance.filter((p) => p.distance !== null && p.distance <= maxDistance);
  }, [playgrounds, coords, maxDistance]);

  const region = coords
    ? { ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : FALLBACK_REGION;

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={region} showsUserLocation>
        {visiblePlaygrounds.map((playground) => (
          <Marker
            key={playground.id}
            coordinate={{ latitude: playground.latitude, longitude: playground.longitude }}
            pinColor={colors.primary}
          >
            <Callout onPress={() => router.push(`/playground/${playground.id}`)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{playground.name}</Text>
                {playground.distance !== null && (
                  <Text style={styles.calloutDistance}>
                    {t('distanceAway', { distance: formatDistance(playground.distance) })}
                  </Text>
                )}
                <Text style={styles.calloutHint}>›</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Distance filter chips floating on top of the map */}
      <View style={[styles.filterRow, { top: insets.top + spacing.s }]}>
        {DISTANCE_OPTIONS.map((option) => {
          const selected = maxDistance === option;
          const label = option === null ? t('filterAll') : formatDistance(option);
          return (
            <Pressable
              key={String(option)}
              onPress={() => setMaxDistance(option)}
              disabled={option !== null && !coords} // distances need a position
              style={[
                styles.chip,
                selected && styles.chipSelected,
                option !== null && !coords && styles.chipDisabled,
              ]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {denied && (
        <View style={[styles.banner, { bottom: spacing.m }]}>
          <Text style={styles.bannerText}>{t('locationDenied')}</Text>
        </View>
      )}

      {!denied && coords && maxDistance !== null && visiblePlaygrounds.length === 0 && (
        <View style={[styles.banner, { bottom: spacing.m }]}>
          <Text style={styles.bannerText}>
            {t('mapEmpty', { distance: formatDistance(maxDistance) })}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.l,
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  chip: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.l,
  },
  chipSelected: { backgroundColor: colors.primary },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipTextSelected: { color: colors.white },
  callout: { maxWidth: 220, alignItems: 'center', padding: spacing.xs },
  calloutTitle: { fontWeight: '700', color: colors.text },
  calloutDistance: { color: colors.textMuted, marginTop: 2 },
  calloutHint: { color: colors.primary, fontWeight: '700', marginTop: 2 },
  banner: {
    position: 'absolute',
    left: spacing.m,
    right: spacing.m,
    backgroundColor: colors.white,
    borderRadius: radius.m,
    padding: spacing.m,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  bannerText: { color: colors.text, textAlign: 'center' },
});
