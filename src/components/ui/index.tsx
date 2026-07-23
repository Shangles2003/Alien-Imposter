import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { colors, fonts, gradients, radius, shadows, spacing, typography } from '@/theme';
import { AlienIcon, HelmetIcon } from './AlienIcon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Pressable with a satisfying spring scale — base for every tappable element. */
export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  disabled,
  ...props
}: PressableProps & { children: React.ReactNode; scaleTo?: number; style?: object }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(scaleTo, { damping: 18, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 300 });
      }}
      disabled={disabled}
      style={[animStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading,
  fullWidth,
  disabled,
  icon,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const useGradient = variant === 'primary' || variant === 'danger' || variant === 'success';

  const content = loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <View style={styles.btnInner}>
      {icon ? <Text style={styles.btnIcon}>{icon}</Text> : null}
      <Text style={[styles.btnText, styles[`textSize_${size}`]]}>{title}</Text>
    </View>
  );

  if (useGradient && !isDisabled) {
    const gradColors: readonly [string, string] =
      variant === 'danger'
        ? gradients.danger
        : variant === 'success'
          ? gradients.success
          : gradients.primary;
    const glow =
      variant === 'danger' ? shadows.glowRed : variant === 'success' ? shadows.glowCyan : shadows.glow;

    return (
      <PressableScale
        scaleTo={0.97}
        style={[styles.base, fullWidth && styles.fullWidth, glow, style as object]}
        disabled={isDisabled}
        {...props}
      >
        <LinearGradient
          colors={gradColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientFill, styles[`size_${size}`]]}
        >
          {content}
        </LinearGradient>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      scaleTo={0.97}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as object,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {content}
    </PressableScale>
  );
}

interface GlowCardProps {
  children: React.ReactNode;
  style?: object;
  accent?: 'purple' | 'cyan' | 'pink' | 'red' | 'none';
  padded?: boolean;
}

export function GlowCard({ children, style, accent = 'purple', padded = true }: GlowCardProps) {
  const borderColor =
    accent === 'cyan'
      ? 'rgba(34,211,238,0.35)'
      : accent === 'pink'
        ? 'rgba(236,72,153,0.35)'
        : accent === 'red'
          ? 'rgba(251,113,133,0.4)'
          : accent === 'none'
            ? colors.border
            : colors.borderBright;

  return (
    <View style={[cardStyles.outer, { borderColor }, style]}>
      <LinearGradient colors={[...gradients.card]} style={[cardStyles.inner, padded && cardStyles.padded]}>
        {children}
      </LinearGradient>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <GlowCard style={style}>{children}</GlowCard>;
}

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  autoCorrect,
  error,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={inputStyles.wrap}>
      {label ? (
        <Text style={[inputStyles.label, focused && inputStyles.labelFocused]}>{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          inputStyles.field,
          focused && inputStyles.fieldFocused,
          error && inputStyles.fieldError,
        ]}
      />
      {error ? <Text style={inputStyles.error}>{error}</Text> : null}
    </View>
  );
}

export function Badge({
  label,
  color = colors.primaryLight,
  variant = 'soft',
}: {
  label: string;
  color?: string;
  variant?: 'soft' | 'solid';
}) {
  return (
    <View
      style={[
        badgeStyles.badge,
        variant === 'solid'
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: `${color}22`, borderColor: `${color}55` },
      ]}
    >
      <Text
        style={[badgeStyles.text, { color: variant === 'solid' ? '#04050d' : color }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function Avatar({
  name,
  color,
  size = 44,
  ring,
}: {
  name: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <View
      style={[
        avatarStyles.wrap,
        ring && { borderColor: color, borderWidth: 2, padding: 2 },
        { width: size + (ring ? 6 : 0), height: size + (ring ? 6 : 0), borderRadius: (size + 6) / 2 },
      ]}
    >
      <LinearGradient
        colors={[color, shadeColor(color, -34)]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.38 }}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </LinearGradient>
    </View>
  );
}

/** Darken/lighten a hex color by pct (-100..100). */
function shadeColor(hex: string, pct: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * pct);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function BackButton({
  onPress,
  accessibilityLabel = 'Go back',
}: {
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <PressableScale
      style={backBtnStyles.wrap}
      onPress={onPress}
      hitSlop={12}
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={backBtnStyles.icon}>←</Text>
    </PressableScale>
  );
}

/** Top row with optional back (left) and trailing action (right). */
export function ScreenTopBar({
  onBack,
  right,
}: {
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={topBarStyles.bar}>
      {onBack ? <BackButton onPress={onBack} /> : <View style={topBarStyles.side} />}
      <View style={topBarStyles.flex} />
      {right ?? <View style={topBarStyles.side} />}
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  icon,
  align = 'left',
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  align?: 'left' | 'center';
}) {
  return (
    <View style={[headerStyles.wrap, align === 'center' && headerStyles.center]}>
      {icon ? <Text style={headerStyles.icon}>{icon}</Text> : null}
      <Text style={[headerStyles.title, align === 'center' && headerStyles.centerText]}>{title}</Text>
      {subtitle ? (
        <Text style={[headerStyles.subtitle, align === 'center' && headerStyles.centerText]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function ActionTile({
  title,
  subtitle,
  icon,
  onPress,
  loading,
  variant = 'default',
}: {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'default' | 'featured' | 'danger';
}) {
  const accent =
    variant === 'featured' ? colors.primary : variant === 'danger' ? colors.danger : colors.accent;

  return (
    <PressableScale onPress={onPress} disabled={loading} style={[tileStyles.wrap, loading && tileStyles.disabled]}>
      <LinearGradient
        colors={
          variant === 'featured'
            ? ['rgba(109,40,217,0.35)', 'rgba(139,92,246,0.1)']
            : ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']
        }
        style={tileStyles.gradient}
      >
        <View style={[tileStyles.iconBox, { borderColor: `${accent}55` }]}>
          {loading ? (
            <ActivityIndicator color={accent} />
          ) : (
            <Text style={tileStyles.icon}>{icon}</Text>
          )}
        </View>
        <View style={tileStyles.copy}>
          <Text style={tileStyles.title}>{title}</Text>
          {subtitle ? <Text style={tileStyles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Text style={tileStyles.chevron}>›</Text>
      </LinearGradient>
    </PressableScale>
  );
}

/** Party code — terminal-style character cells, tap to copy. */
export function LobbyCodeDisplay({ code }: { code: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <GlowCard accent="cyan">
      <Text style={codeStyles.label}>{t('lobby.partyCode')}</Text>
      <PressableScale onPress={copy} scaleTo={0.97}>
        <View style={codeStyles.cellRow}>
          {code.split('').map((ch, i) => (
            <View key={`${ch}-${i}`} style={codeStyles.cell}>
              <Text style={codeStyles.cellChar}>{ch}</Text>
            </View>
          ))}
        </View>
      </PressableScale>
      <Text style={[codeStyles.hint, copied && codeStyles.hintCopied]}>
        {copied ? t('lobby.codeCopied') : t('lobby.codeHint')}
      </Text>
    </GlowCard>
  );
}

export function CrewRow({
  name,
  color,
  isHost,
  isReady,
  isMe,
  onModerate,
}: {
  name: string;
  color: string;
  isHost?: boolean;
  isReady?: boolean;
  isMe?: boolean;
  onModerate?: () => void;
}) {
  const { t } = useTranslation();
  const glow = useSharedValue(isReady ? 1 : 0);

  React.useEffect(() => {
    glow.value = withTiming(isReady ? 1 : 0, { duration: 260 });
  }, [isReady, glow]);

  const readyStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(52,211,153,${0.12 + glow.value * 0.45})`,
  }));

  return (
    <Animated.View style={[crewStyles.row, isMe && crewStyles.me, isReady && readyStyle]}>
      <Avatar name={name} color={color} size={40} ring={isMe} />
      <View style={crewStyles.info}>
        <Text style={crewStyles.name} numberOfLines={1}>
          {name}
          {isHost ? '  ★' : ''}
          {isMe ? `  (${t('lobby.you')})` : ''}
        </Text>
        <Text style={crewStyles.status} numberOfLines={1}>
          {isReady ? t('lobby.lockedIn') : t('lobby.waiting')}
        </Text>
      </View>
      <Badge
        label={isReady ? `✓ ${t('lobby.playerReady')}` : t('lobby.playerHold')}
        color={isReady ? colors.success : colors.textDim}
      />
      {onModerate ? (
        <Pressable onPress={onModerate} hitSlop={12} style={crewStyles.menuBtn}>
          <Text style={crewStyles.menuIcon}>⋯</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

export function TimerDisplay({ endsAt, paused }: { endsAt: number | null; paused: boolean }) {
  const [remaining, setRemaining] = React.useState('--:--');
  const [urgent, setUrgent] = React.useState(false);

  React.useEffect(() => {
    if (!endsAt || paused) {
      setRemaining(paused && endsAt ? formatTime(Math.max(0, endsAt - Date.now())) : '--:--');
      setUrgent(false);
      return;
    }

    const tick = () => {
      const ms = Math.max(0, endsAt - Date.now());
      setRemaining(formatTime(ms));
      setUrgent(ms < 120000);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, paused]);

  return (
    <LinearGradient
      colors={urgent ? [...gradients.danger] : [...gradients.timer]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={timerStyles.chip}
    >
      <Text style={timerStyles.label}>{paused ? '⏸ PAUSED' : '⏱ TIME LEFT'}</Text>
      <Text style={timerStyles.time}>{remaining}</Text>
    </LinearGradient>
  );
}

export function PhaseBanner({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <LinearGradient colors={[...gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={phaseStyles.banner}>
      <Text style={phaseStyles.icon}>{icon}</Text>
      <View style={phaseStyles.copy}>
        <Text style={phaseStyles.title}>{title}</Text>
        {subtitle ? <Text style={phaseStyles.subtitle}>{subtitle}</Text> : null}
      </View>
    </LinearGradient>
  );
}

export function GameHud({
  round,
  totalTasks,
  phaseIcon,
  phaseTitle,
  subtitle,
}: {
  round: number;
  totalTasks: number;
  phaseIcon: string;
  phaseTitle: string;
  subtitle?: string;
}) {
  const progress = Math.min(round, totalTasks);
  return (
    <LinearGradient colors={[...gradients.hero]} style={hudStyles.wrap}>
      <View style={hudStyles.taskChip}>
        <Text style={hudStyles.taskCount}>
          {progress}/{totalTasks}
        </Text>
      </View>
      <View style={hudStyles.meta}>
        <Text style={hudStyles.phase} numberOfLines={1}>
          {phaseIcon} {phaseTitle}
        </Text>
        {subtitle ? (
          <Text style={hudStyles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </LinearGradient>
  );
}

export function EmergencyButton({ onPress, used }: { onPress: () => void; used?: boolean }) {
  if (used) {
    return (
      <View style={emergencyStyles.used}>
        <Text style={emergencyStyles.usedText}>🛡️ Eject already used</Text>
      </View>
    );
  }

  return (
    <PressableScale onPress={onPress}>
      <LinearGradient colors={[...gradients.danger]} style={emergencyStyles.btn}>
        <Text style={emergencyStyles.icon}>🚨</Text>
        <View>
          <Text style={emergencyStyles.title}>EMERGENCY EJECT</Text>
          <Text style={emergencyStyles.sub}>Once per mission • Stops the clock</Text>
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

export function RoleCard({
  role,
  description,
  allies,
  compact,
  gameMode,
}: {
  role: 'human' | 'alien';
  description: string;
  allies?: string[];
  compact?: boolean;
  gameMode?: boolean;
}) {
  const isAlien = role === 'alien';

  return (
    <View
      style={[
        roleStyles.outer,
        { borderColor: isAlien ? 'rgba(251,113,133,0.5)' : 'rgba(52,211,153,0.45)' },
        isAlien ? shadows.glowRed : shadows.glowCyan,
      ]}
    >
      <LinearGradient
        colors={isAlien ? [...gradients.alien] : [...gradients.human]}
        style={[roleStyles.card, compact && roleStyles.cardCompact]}
      >
        {!gameMode &&
          (isAlien ? (
            <AlienIcon size={compact ? 44 : 60} mood="sus" />
          ) : (
            <HelmetIcon size={compact ? 44 : 60} />
          ))}
        <Badge
          label={isAlien ? 'INFILTRATOR' : 'CREW'}
          color={isAlien ? colors.alien : colors.human}
          variant="solid"
        />
        {gameMode && <Text style={roleStyles.classified}>CLASSIFIED DOSSIER</Text>}
        <Text style={roleStyles.desc} numberOfLines={compact ? 2 : undefined}>
          {description}
        </Text>
        {allies && allies.length > 0 && (
          <Text style={roleStyles.ally} numberOfLines={1}>
            Partner: {allies.join(', ')}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}

function formatTime(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const backBtnStyles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '300',
    marginTop: -2,
  },
});

const topBarStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginBottom: spacing.sm,
  },
  side: { width: 44 },
  flex: { flex: 1 },
});

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, overflow: 'hidden' },
  gradientFill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    width: '100%',
  },
  primary: {},
  secondary: {
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: {
    backgroundColor: colors.dangerDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  success: {
    backgroundColor: colors.humanDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: { backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  size_sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 40 },
  size_md: { paddingVertical: 14, paddingHorizontal: spacing.lg, minHeight: 52 },
  size_lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 58 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btnIcon: { fontSize: 18 },
  btnText: { color: '#fff', fontWeight: '800', letterSpacing: 0.4 },
  textSize_sm: { fontSize: 14 },
  textSize_md: { fontSize: 16 },
  textSize_lg: { fontSize: 18 },
});

const cardStyles = StyleSheet.create({
  outer: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.card,
  },
  inner: { borderRadius: radius.xl },
  padded: { padding: spacing.lg },
});

const inputStyles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { ...typography.label, color: colors.textMuted },
  labelFocused: { color: colors.accentSoft },
  field: {
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 52,
  },
  fieldFocused: { borderColor: colors.borderFocus },
  fieldError: { borderColor: colors.danger },
  error: { ...typography.small, color: colors.danger },
});

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { ...typography.small, fontWeight: '800' },
});

const avatarStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

const headerStyles = StyleSheet.create({
  wrap: { gap: spacing.xs, marginBottom: spacing.md },
  center: { alignItems: 'center' },
  icon: { fontSize: 36, marginBottom: spacing.xs },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted },
  centerText: { textAlign: 'center' },
});

const tileStyles = StyleSheet.create({
  wrap: { borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.6 },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  copy: { flex: 1 },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 28, color: colors.textDim, fontWeight: '300' },
});

const codeStyles = StyleSheet.create({
  label: { ...typography.label, color: colors.accentSoft, textAlign: 'center' },
  cellRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  cell: {
    width: 42,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellChar: {
    fontFamily: fonts.mono,
    fontSize: 24,
    color: colors.text,
  },
  hint: { ...typography.caption, color: colors.textDim, textAlign: 'center' },
  hintCopied: { color: colors.success },
});

const crewStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  me: { borderColor: colors.borderBright, backgroundColor: colors.glowPurple },
  info: { flex: 1, minWidth: 0 },
  name: { ...typography.heading, color: colors.text },
  status: { ...typography.small, color: colors.textMuted, marginTop: 2, textTransform: 'uppercase' },
  menuBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    marginLeft: -spacing.xs,
  },
  menuIcon: { fontSize: 22, color: colors.textDim, fontWeight: '700', lineHeight: 24 },
});

const timerStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    alignItems: 'center',
    minWidth: 110,
  },
  label: { ...typography.small, color: 'rgba(255,255,255,0.85)' },
  time: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 1, fontFamily: fonts.mono },
});

const phaseStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
  icon: { fontSize: 32 },
  copy: { flex: 1 },
  title: { ...typography.heading, color: '#fff', fontWeight: '800' },
  subtitle: { ...typography.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
});

const hudStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  taskChip: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    minWidth: 44,
    alignItems: 'center',
  },
  taskCount: { ...typography.heading, color: '#fff', fontSize: 16 },
  meta: { flex: 1, minWidth: 0 },
  phase: { ...typography.caption, color: '#fff', fontWeight: '800' },
  subtitle: { ...typography.small, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
});

const emergencyStyles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginTop: spacing.md,
  },
  icon: { fontSize: 28 },
  title: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  used: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  usedText: { ...typography.caption, color: colors.textDim },
});

const roleStyles = StyleSheet.create({
  outer: {
    borderRadius: radius.xxl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  card: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  cardCompact: {
    padding: spacing.md,
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  classified: { ...typography.small, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
  desc: { ...typography.body, color: 'rgba(255,255,255,0.92)', textAlign: 'center' },
  ally: { ...typography.caption, color: colors.alien, fontWeight: '700' },
});

export { AlienIcon, FloatingAlien, HelmetIcon } from './AlienIcon';
export { ScreenShell, LoadingState, SectionLabel, Divider } from './layout';
