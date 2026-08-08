// Rating screen: pick an age group, give 1–5 stars in three categories and
// optionally leave a comment. One rating per user per playground — submitting
// again overwrites the previous one (enforced by the database too).
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../../../components/Button';
import { StarInput } from '../../../components/Stars';
import { colors, radius, spacing } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useI18n } from '../../../hooks/useI18n';
import { isValidStars } from '../../../lib/ratings';
import { supabase } from '../../../lib/supabase';
import { AGE_GROUPS, AgeGroup } from '../../../lib/types';

export default function RateScreen() {
  const { id: playgroundId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { session } = useAuth();

  const [ageGroup, setAgeGroup] = useState<AgeGroup>('3_6');
  const [safety, setSafety] = useState(0);
  const [facilities, setFacilities] = useState(0);
  const [variety, setVariety] = useState(0);
  const [comment, setComment] = useState('');
  const [hadExistingRating, setHadExistingRating] = useState(false);
  const [saving, setSaving] = useState(false);

  // If the user rated this playground before, pre-fill the form with it.
  useEffect(() => {
    if (!session || !playgroundId) return;
    supabase
      .from('ratings')
      .select('*')
      .eq('playground_id', playgroundId)
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setHadExistingRating(true);
          setAgeGroup(data.age_group);
          setSafety(data.safety_rating);
          setFacilities(data.facilities_rating);
          setVariety(data.variety_rating);
          setComment(data.comment ?? '');
        }
      });
  }, [session, playgroundId]);

  // The rate button on the detail screen sends anonymous users to login
  // first, but guard here too in case the session expired meanwhile.
  useEffect(() => {
    if (!session) router.replace('/auth');
  }, [session, router]);
  if (!session) return null;

  const allStarsSet = isValidStars(safety) && isValidStars(facilities) && isValidStars(variety);

  async function save() {
    if (!allStarsSet) {
      Alert.alert(t('starsRequired'));
      return;
    }
    setSaving(true);
    // Upsert: inserts a new rating, or updates the existing one thanks to the
    // UNIQUE (playground_id, user_id) constraint in the database.
    const { error } = await supabase.from('ratings').upsert(
      {
        playground_id: playgroundId,
        user_id: session!.user.id,
        age_group: ageGroup,
        safety_rating: safety,
        facilities_rating: facilities,
        variety_rating: variety,
        comment: comment.trim() || null,
      },
      { onConflict: 'playground_id,user_id' }
    );
    setSaving(false);
    if (error) {
      Alert.alert(t('genericError'), error.message);
    } else {
      router.back(); // detail screen re-fetches on focus and shows the rating
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: t('rateTitle') }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {hadExistingRating && <Text style={styles.notice}>{t('yourExistingRating')}</Text>}

          <Text style={styles.label}>{t('chooseAgeGroup')}</Text>
          <View style={styles.ageRow}>
            {AGE_GROUPS.map((group) => {
              const selected = ageGroup === group;
              return (
                <Pressable
                  key={group}
                  onPress={() => setAgeGroup(group)}
                  style={[styles.ageChip, selected && styles.ageChipSelected]}
                >
                  <Text style={[styles.ageChipText, selected && styles.ageChipTextSelected]}>
                    {t(`age_${group}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <StarRow label={t('safety')} value={safety} onChange={setSafety} />
          <StarRow label={t('facilities')} value={facilities} onChange={setFacilities} />
          <StarRow label={t('variety')} value={variety} onChange={setVariety} />

          <Text style={styles.label}>{t('commentLabel')}</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder={t('commentPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
          />

          <View style={{ marginTop: spacing.l }}>
            <Button
              title={t('submitRating')}
              onPress={save}
              loading={saving}
              disabled={!allStarsSet}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function StarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (stars: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      <Text style={styles.starLabel}>{label}</Text>
      <StarInput value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.m, paddingBottom: spacing.xl * 2 },
  notice: {
    backgroundColor: '#FFF6E5',
    color: '#8A6D1D',
    padding: spacing.m,
    borderRadius: radius.m,
    marginBottom: spacing.s,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  ageRow: { flexDirection: 'row', flexWrap: 'wrap' },
  ageChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  ageChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  ageChipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  ageChipTextSelected: { color: colors.white },
  starRow: { marginTop: spacing.m },
  starLabel: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.m - 2,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
  },
});
