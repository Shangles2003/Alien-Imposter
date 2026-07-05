import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '@/theme';

export function SettingsSectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function SettingsGroup({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeIn.duration(240).delay(delay)} style={styles.group}>
      {children}
    </Animated.View>
  );
}

export function SettingsRow({
  icon,
  label,
  value,
  showChevron,
  showCopy,
  destructive,
  isLast,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  showChevron?: boolean;
  showCopy?: boolean;
  destructive?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={[styles.iconWrap, destructive && styles.iconWrapDanger]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, destructive && styles.labelDanger]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.trailing}>
        {value ? (
          <Text style={[styles.value, destructive && styles.labelDanger]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {showCopy ? <Text style={styles.copyIcon}>📋</Text> : null}
        {showChevron ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.row, !isLast && styles.rowBorder]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.row, !isLast && styles.rowBorder, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

export function SettingsHeader({
  title,
  onBack,
  style,
}: {
  title: string;
  onBack: () => void;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.header, style]}>
      <Pressable
        style={({ pressed }) => [styles.backBtn, pressed && styles.rowPressed]}
        onPress={onBack}
        hitSlop={12}
        accessibilityLabel="Go back"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '300',
  },
  headerTitle: {
    ...typography.title,
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSpacer: { width: 44 },
  sectionTitle: {
    ...typography.small,
    color: colors.primaryLight,
    opacity: 0.85,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 0.3,
  },
  group: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    minHeight: 56,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: { opacity: 0.72, backgroundColor: colors.surfaceElevated },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(168,85,247,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: {
    backgroundColor: 'rgba(244,63,94,0.15)',
  },
  icon: { fontSize: 18 },
  label: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  labelDanger: { color: colors.danger },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '46%',
  },
  value: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  chevron: {
    fontSize: 22,
    color: colors.textDim,
    fontWeight: '300',
    marginTop: -2,
  },
  copyIcon: { fontSize: 16, opacity: 0.85 },
});
