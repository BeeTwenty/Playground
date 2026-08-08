// Add-playground screen: name, position (GPS-prefilled, adjustable by
// dragging the pin or tapping the map), practical info and photos.
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Button } from '../../components/Button';
import { colors, radius, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { useUserLocation } from '../../hooks/useUserLocation';
import type { LatLng } from '../../lib/geo';
import { uploadPlaygroundImage } from '../../lib/images';
import { supabase } from '../../lib/supabase';

const FALLBACK_POSITION: LatLng = { latitude: 59.9139, longitude: 10.7522 };

export default function AddPlaygroundScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { session } = useAuth();
  const { coords } = useUserLocation();

  const [name, setName] = useState('');
  // Only set once the user adjusts the pin; until then we follow the GPS.
  const [position, setPosition] = useState<LatLng | null>(null);
  const [isFenced, setIsFenced] = useState(false);
  const [winterOpen, setWinterOpen] = useState(false);
  const [hasShopNearby, setHasShopNearby] = useState(false);
  const [hasRestroomNearby, setHasRestroomNearby] = useState(false);
  const [parkingDistance, setParkingDistance] = useState('');
  const [localImageUris, setLocalImageUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Contributing requires an account — explain and offer login instead of a form.
  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.explainer}>{t('authRequiredExplainer')}</Text>
        <Button title={t('signIn')} onPress={() => router.push('/auth')} />
      </View>
    );
  }

  // The pin follows the GPS position until the user adjusts it manually.
  const pinPosition = position ?? coords ?? FALLBACK_POSITION;

  async function pickImages(fromCamera: boolean) {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'] })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: 5,
        });
    if (!result.canceled) {
      setLocalImageUris((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
    }
  }

  async function save() {
    if (!name.trim()) {
      Alert.alert(t('nameRequired'));
      return;
    }
    setSaving(true);
    try {
      // 1. Create the playground row and get its id back.
      const { data: created, error } = await supabase
        .from('playgrounds')
        .insert({
          name: name.trim(),
          latitude: pinPosition.latitude,
          longitude: pinPosition.longitude,
          is_fenced: isFenced,
          winter_open: winterOpen,
          parking_distance_m: parkingDistance.trim() ? Number(parkingDistance) : null,
          has_shop_nearby: hasShopNearby,
          has_restroom_nearby: hasRestroomNearby,
          created_by: session!.user.id,
        })
        .select()
        .single();
      if (error) throw error;

      // 2. Compress + upload each photo, then register it in the database.
      let failedUploads = 0;
      for (const uri of localImageUris) {
        try {
          const storagePath = await uploadPlaygroundImage(created.id, uri);
          const { error: imageError } = await supabase.from('playground_images').insert({
            playground_id: created.id,
            storage_path: storagePath,
            uploaded_by: session!.user.id,
          });
          if (imageError) throw imageError;
        } catch {
          failedUploads += 1;
        }
      }
      if (failedUploads > 0) Alert.alert(t('photoUploadFailed'));

      // 3. Reset the form and jump to the new playground's detail page.
      setName('');
      setLocalImageUris([]);
      setPosition(null);
      setIsFenced(false);
      setWinterOpen(false);
      setHasShopNearby(false);
      setHasRestroomNearby(false);
      setParkingDistance('');
      router.push(`/playground/${created.id}`);
    } catch (e) {
      Alert.alert(t('genericError'), e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t('nameLabel')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('namePlaceholder')}
          placeholderTextColor={colors.textMuted}
          maxLength={120}
        />

        <Text style={styles.hint}>{t('adjustPin')}</Text>
        <MapView
          style={styles.map}
          region={{ ...pinPosition, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          onPress={(event) => setPosition(event.nativeEvent.coordinate)}
        >
          <Marker
            coordinate={pinPosition}
            draggable
            onDragEnd={(event) => setPosition(event.nativeEvent.coordinate)}
            pinColor={colors.primary}
          />
        </MapView>

        {/* Practical info toggles */}
        <ToggleRow label={t('fenced')} value={isFenced} onChange={setIsFenced} />
        <ToggleRow label={t('winterOpen')} value={winterOpen} onChange={setWinterOpen} />
        <ToggleRow label={t('shopNearby')} value={hasShopNearby} onChange={setHasShopNearby} />
        <ToggleRow
          label={t('restroomNearby')}
          value={hasRestroomNearby}
          onChange={setHasRestroomNearby}
        />

        <Text style={styles.label}>{t('parkingDistanceLabel')}</Text>
        <TextInput
          style={styles.input}
          value={parkingDistance}
          onChangeText={(text) => setParkingDistance(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.hint}>{t('parkingDistanceHint')}</Text>

        {/* Photos */}
        <Text style={styles.label}>{t('addPhotos')}</Text>
        <View style={styles.photoButtons}>
          <View style={{ flex: 1, marginRight: spacing.s }}>
            <Button title={t('takePhoto')} variant="secondary" onPress={() => pickImages(true)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={t('pickFromGallery')}
              variant="secondary"
              onPress={() => pickImages(false)}
            />
          </View>
        </View>
        {localImageUris.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {localImageUris.map((uri, index) => (
              <Pressable
                key={`${uri}-${index}`}
                onLongPress={() =>
                  setLocalImageUris((prev) => prev.filter((_, i) => i !== index))
                }
              >
                <Image source={{ uri }} style={styles.thumbnail} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={{ marginTop: spacing.l }}>
          <Button
            title={saving ? t('saving') : t('save')}
            onPress={save}
            loading={saving}
            disabled={!name.trim()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.l, gap: spacing.m },
  explainer: { fontSize: 16, color: colors.text, textAlign: 'center', marginBottom: spacing.m },
  content: { padding: spacing.m, paddingBottom: spacing.xl * 2 },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  hint: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.s },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.m - 2,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  map: { height: 220, borderRadius: radius.m, marginBottom: spacing.s },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  toggleLabel: { fontSize: 15, color: colors.text, flex: 1, paddingRight: spacing.m },
  photoButtons: { flexDirection: 'row', marginBottom: spacing.s },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: radius.s,
    marginRight: spacing.s,
    backgroundColor: colors.surface,
  },
});
