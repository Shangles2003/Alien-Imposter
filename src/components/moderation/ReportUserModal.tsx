import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { REPORT_REASONS, ReportReason } from '@/constants/reportReasons';
import { reportUser } from '@/services/moderation';
import { errorMessage } from '@/utils/errors';
import { censorProfanity } from '@/utils/profanityFilter';
import { colors, radius, spacing, typography } from '@/theme';

interface ReportUserModalProps {
  visible: boolean;
  targetId: string;
  displayName: string;
  context?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ReportUserModal({
  visible,
  targetId,
  displayName,
  context,
  onClose,
  onSubmitted,
}: ReportUserModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setReason(null);
    setDetails('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      const censoredDetails = censorProfanity(details.trim());
      await reportUser({
        targetId,
        reason,
        details: censoredDetails || undefined,
        context,
      });
      Alert.alert(t('moderation.reportSubmitted'), t('moderation.reportSubmittedBody'));
      reset();
      onSubmitted?.();
      onClose();
    } catch (e) {
      Alert.alert(t('moderation.reportFailed'), errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{t('moderation.reportTitle', { name: displayName })}</Text>
          <Text style={styles.subtitle}>{t('moderation.reportSubtitle')}</Text>

          <ScrollView style={styles.reasonList} keyboardShouldPersistTaps="handled">
            {REPORT_REASONS.map((r) => (
              <Pressable
                key={r.value}
                style={[styles.reasonRow, reason === r.value && styles.reasonRowActive]}
                onPress={() => setReason(r.value)}
              >
                <Text style={[styles.reasonText, reason === r.value && styles.reasonTextActive]}>
                  {t(`moderation.reasons.${r.value}`)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>{t('moderation.detailsLabel')}</Text>
          <TextInput
            style={styles.input}
            value={details}
            onChangeText={setDetails}
            placeholder={t('moderation.detailsPlaceholder')}
            placeholderTextColor={colors.textDim}
            multiline
            maxLength={500}
          />

          <View style={styles.actions}>
            <Button title={t('common.cancel')} variant="ghost" onPress={handleClose} style={styles.btn} />
            <Button
              title={t('moderation.submit')}
              loading={submitting}
              disabled={!reason}
              onPress={handleSubmit}
              style={styles.btn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '85%',
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderBright,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: { ...typography.heading, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  reasonList: { maxHeight: 200 },
  reasonRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  reasonRowActive: {
    borderColor: colors.accent,
    backgroundColor: colors.glowPurple,
  },
  reasonText: { ...typography.body, color: colors.text },
  reasonTextActive: { color: colors.accentSoft, fontWeight: '700' },
  label: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btn: { flex: 1 },
});
