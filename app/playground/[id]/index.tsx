// Playground detail: photos, rating summary per category, which age groups
// it suits, practical info tags and parents' comments.
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Stars } from '../../../components/Stars';
import { Tag } from '../../../components/Tag';
import { colors, radius, spacing } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useI18n } from '../../../hooks/useI18n';
import { usePlaygroundDetail } from '../../../hooks/usePlaygroundDetail';
import { formatDistance } from '../../../lib/geo';
import { publicImageUrl } from '../../../lib/images';
import { summarizeRatings } from '../../../lib/ratings';
import { AGE_GROUPS } from '../../../lib/types';

export default function PlaygroundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { session } = useAuth();
  const { playground, images, ratings, loading, error } = usePlaygroundDetail(id);

  const summary = summarizeRatings(ratings);
  const myRating = session ? ratings.find((r) => r.user_id === session.user.id) : undefined;
  const commentsWithText = ratings.filter((r) => r.comment && r.comment.trim().length > 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !playground) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{error ?? t('notFound')}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: playground.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Photos */}
        {images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
            {images.map((image) => (
              <Image
                key={image.id}
                source={{ uri: publicImageUrl(image.storage_path) }}
                style={styles.photo}
                contentFit="cover"
                transition={150}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noPhotos}>
            <Text style={styles.muted}>{t('noPhotos')}</Text>
          </View>
        )}

        {/* Ratings summary */}
        <Text style={styles.sectionTitle}>{t('ratings')}</Text>
        {summary.count === 0 ? (
          <Text style={styles.muted}>{t('noRatings')}</Text>
        ) : (
          <View style={styles.card}>
            <RatingRow label={t('safety')} value={summary.safety} />
            <RatingRow label={t('facilities')} value={summary.facilities} />
            <RatingRow label={t('variety')} value={summary.variety} />
            <Text style={[styles.muted, { marginTop: spacing.s }]}>
              {summary.count === 1 ? t('basedOnOne') : t('basedOnMany', { count: summary.count })}
            </Text>
          </View>
        )}

        {/* Age groups (only groups that at least one rating picked) */}
        {summary.count > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('suitableFor')}</Text>
            <View style={styles.tagRow}>
              {AGE_GROUPS.filter((group) => summary.ageGroupCounts[group] > 0).map((group) => (
                <Tag key={group} label={`${t(`age_${group}`)} (${summary.ageGroupCounts[group]})`} />
              ))}
            </View>
          </>
        )}

        {/* Practical info */}
        <Text style={styles.sectionTitle}>{t('practicalInfo')}</Text>
        <View style={styles.tagRow}>
          <Tag label={playground.is_fenced ? t('fenced') : t('notFenced')} active={playground.is_fenced} />
          <Tag
            label={playground.winter_open ? t('winterOpen') : t('notWinterOpen')}
            active={playground.winter_open}
          />
          <Tag
            label={
              playground.parking_distance_m !== null
                ? t('parkingAt', { distance: formatDistance(playground.parking_distance_m) })
                : t('noParkingInfo')
            }
            active={playground.parking_distance_m !== null}
          />
          <Tag label={t('shopNearby')} active={playground.has_shop_nearby} />
          <Tag label={t('restroomNearby')} active={playground.has_restroom_nearby} />
        </View>

        {/* Rate button: goes to login first when browsing anonymously */}
        <View style={{ marginVertical: spacing.m }}>
          <Button
            title={myRating ? t('editRating') : t('addRating')}
            onPress={() =>
              session ? router.push(`/playground/${playground.id}/rate`) : router.push('/auth')
            }
          />
        </View>

        {/* Comments */}
        {commentsWithText.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('comments')}</Text>
            {commentsWithText.map((rating) => (
              <View key={rating.id} style={styles.comment}>
                <Text style={styles.commentText}>{rating.comment}</Text>
                <Text style={styles.commentMeta}>
                  {t(`age_${rating.age_group}`)} ·{' '}
                  {new Date(rating.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </>
  );
}

function RatingRow({ label, value }: { label: string; value: number | null }) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <Stars value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.m, paddingBottom: spacing.xl },
  photoRow: { marginBottom: spacing.s },
  photo: {
    width: 260,
    height: 180,
    borderRadius: radius.m,
    marginRight: spacing.s,
    backgroundColor: colors.surface,
  },
  noPhotos: {
    height: 100,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  ratingLabel: { fontSize: 15, color: colors.text },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  comment: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  commentText: { color: colors.text, fontSize: 15 },
  commentMeta: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  muted: { color: colors.textMuted },
});
