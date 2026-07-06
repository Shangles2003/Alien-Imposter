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
import { Button } from '@/components/ui';
import { REPORT_REASONS, ReportReason } from '@/constants/reportReasons';
import { reportUser } from '@/services/moderation';
import { errorMessage } from '@/utils/errors';
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
      await reportUser({
        targetId,
        reason,
        details: details.trim() || undefined,
        context,
      });
      Alert.alert('Report submitted', 'Thanks — we will review this within 24 hours.');
      reset();
      onSubmitted?.();
      onClose();
    } catch (e) {
      Alert.alert('Report failed', errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Report {displayName}</Text>
          <Text style={styles.subtitle}>Select a reason (required)</Text>

          <ScrollView style={styles.reasonList} keyboardShouldPersistTaps="handled">
            {REPORT_REASONS.map((r) => (
              <Pressable
                key={r.value}
                style={[styles.reasonRow, reason === r.value && styles.reasonRowActive]}
                onPress={() => setReason(r.value)}
              >
                <Text style={[styles.reasonText, reason === r.value && styles.reasonTextActive]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Additional details (optional)</Text>
          <TextInput
            style={styles.input}
            value={details}
            onChangeText={setDetails}
            placeholder="What happened?"
            placeholderTextColor={colors.textDim}
            multiline
            maxLength={500}
          />

          <View style={styles.actions}>
            <Button title="Cancel" variant="ghost" onPress={handleClose} style={styles.btn} />
            <Button
              title="Submit"
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
