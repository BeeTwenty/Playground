// Profile tab: login status, language choice and the user's own
// contributions (playgrounds and ratings) with edit/delete.
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Stars } from '../../components/Stars';
import { colors, radius, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { supabase } from '../../lib/supabase';
import type { Playground, Rating } from '../../lib/types';

/** A rating joined with the playground's name, for display in the list. */
type RatingWithPlayground = Rating & { playgrounds: { name: string } | null };

export default function ProfileScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useI18n();
  const { session, signOut } = useAuth();

  const [myPlaygrounds, setMyPlaygrounds] = useState<Playground[]>([]);
  const [myRatings, setMyRatings] = useState<RatingWithPlayground[]>([]);

  const reload = useCallback(async () => {
    if (!session) {
      setMyPlaygrounds([]);
      setMyRatings([]);
      return;
    }
    const [playgroundsRes, ratingsRes] = await Promise.all([
      supabase.from('playgrounds').select('*').eq('created_by', session.user.id).order('created_at'),
      supabase
        .from('ratings')
        .select('*, playgrounds(name)')
        .eq('user_id', session.user.id)
        .order('created_at'),
    ]);
    setMyPlaygrounds(playgroundsRes.data ?? []);
    setMyRatings((ratingsRes.data as RatingWithPlayground[] | null) ?? []);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  function confirmDeletePlayground(playground: Playground) {
    Alert.alert(playground.name, t('deletePlaygroundConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          // Images and ratings rows are removed automatically (ON DELETE CASCADE).
          const { error } = await supabase.from('playgrounds').delete().eq('id', playground.id);
          if (error) Alert.alert(t('genericError'), error.message);
          reload();
        },
      },
    ]);
  }

  function confirmDeleteRating(rating: RatingWithPlayground) {
    Alert.alert(rating.playgrounds?.name ?? '', t('deleteRatingConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('ratings').delete().eq('id', rating.id);
          if (error) Alert.alert(t('genericError'), error.message);
          reload();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* Language choice — useful for everyone, logged in or not */}
      <Text style={styles.sectionTitle}>{t('language')}</Text>
      <View style={styles.languageRow}>
        {(['nb', 'en'] as const).map((lang) => (
          <Pressable
            key={lang}
            onPress={() => setLanguage(lang)}
            style={[styles.langChip, language === lang && styles.langChipSelected]}
          >
            <Text
              style={[styles.langChipText, language === lang && styles.langChipTextSelected]}
            >
              {lang === 'nb' ? t('languageNb') : t('languageEn')}
            </Text>
          </Pressable>
        ))}
      </View>

      {!session ? (
        <>
          <Text style={styles.explainer}>{t('authRequiredExplainer')}</Text>
          <Button title={t('signIn')} onPress={() => router.push('/auth')} />
        </>
      ) : (
        <>
          <Text style={styles.signedInAs}>
            {t('signedInAs')} <Text style={{ fontWeight: '700' }}>{session.user.email}</Text>
          </Text>

          {/* My playgrounds */}
          <Text style={styles.sectionTitle}>{t('myPlaygrounds')}</Text>
          {myPlaygrounds.length === 0 && <Text style={styles.muted}>{t('noContributions')}</Text>}
          {myPlaygrounds.map((playground) => (
            <View key={playground.id} style={styles.card}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => router.push(`/playground/${playground.id}`)}
              >
                <Text style={styles.cardTitle}>{playground.name}</Text>
              </Pressable>
              <Pressable onPress={() => confirmDeletePlayground(playground)} hitSlop={8}>
                <Text style={styles.deleteText}>{t('delete')}</Text>
              </Pressable>
            </View>
          ))}

          {/* My ratings — tap to edit, delete button on the right */}
          <Text style={styles.sectionTitle}>{t('myRatings')}</Text>
          {myRatings.length === 0 && <Text style={styles.muted}>{t('noContributions')}</Text>}
          {myRatings.map((rating) => (
            <View key={rating.id} style={styles.card}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => router.push(`/playground/${rating.playground_id}/rate`)}
              >
                <Text style={styles.cardTitle}>{rating.playgrounds?.name ?? '…'}</Text>
                <Stars
                  value={
                    (rating.safety_rating + rating.facilities_rating + rating.variety_rating) / 3
                  }
                  size={14}
                />
              </Pressable>
              <Pressable onPress={() => confirmDeleteRating(rating)} hitSlop={8}>
                <Text style={styles.deleteText}>{t('delete')}</Text>
              </Pressable>
            </View>
          ))}

          <View style={{ marginTop: spacing.xl }}>
            <Button title={t('signOut')} variant="secondary" onPress={signOut} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.m, paddingBottom: spacing.xl * 2 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  languageRow: { flexDirection: 'row' },
  langChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
  },
  langChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  langChipText: { fontWeight: '600', color: colors.text },
  langChipTextSelected: { color: colors.white },
  explainer: { color: colors.textMuted, marginVertical: spacing.l, textAlign: 'center' },
  signedInAs: { marginTop: spacing.l, color: colors.text, fontSize: 15 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },
  deleteText: { color: colors.danger, fontWeight: '600', marginLeft: spacing.m },
  muted: { color: colors.textMuted },
});
