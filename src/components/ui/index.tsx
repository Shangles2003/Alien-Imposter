import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadows, spacing, typography } from '@/theme';

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

    return (
      <Pressable
        style={({ pressed }) => [
          styles.base,
          styles[`size_${size}`],
          fullWidth && styles.fullWidth,
          shadows.glow,
          pressed && styles.pressed,
          isDisabled && styles.disabled,
          style as object,
        ]}
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
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style as object,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {content}
    </Pressable>
  );
}

interface GlowCardProps {
  children: React.ReactNode;
  style?: object;
  accent?: 'purple' | 'cyan' | 'pink' | 'none';
  padded?: boolean;
}

export function GlowCard({ children, style, accent = 'purple', padded = true }: GlowCardProps) {
  const borderColor =
    accent === 'cyan'
      ? colors.borderBright
      : accent === 'pink'
        ? 'rgba(236,72,153,0.35)'
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
  error?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  error,
}: InputProps) {
  return (
    <View style={inputStyles.wrap}>
      {label ? <Text style={inputStyles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        style={[inputStyles.field, error && inputStyles.fieldError]}
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
      <Text style={[badgeStyles.text, { color: variant === 'solid' ? '#fff' : color }]}>{label}</Text>
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
      <View
        style={{
          backgroundColor: color,
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
      </View>
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
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [tileStyles.wrap, pressed && tileStyles.pressed, loading && tileStyles.disabled]}
    >
      <LinearGradient
        colors={
          variant === 'featured'
            ? ['rgba(124,58,237,0.35)', 'rgba(168,85,247,0.12)']
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
    </Pressable>
  );
}

export function LobbyCodeDisplay({ code }: { code: string }) {
  return (
    <GlowCard accent="cyan">
      <Text style={codeStyles.label}>PARTY CODE</Text>
      <Text style={codeStyles.code}>{code}</Text>
      <Text style={codeStyles.hint}>Share this code — friends join from the main menu</Text>
    </GlowCard>
  );
}

export function CrewRow({
  name,
  color,
  isHost,
  isReady,
  isMe,
}: {
  name: string;
  color: string;
  isHost?: boolean;
  isReady?: boolean;
  isMe?: boolean;
}) {
  return (
    <View style={[crewStyles.row, isMe && crewStyles.me]}>
      <Avatar name={name} color={color} size={40} ring={isMe} />
      <View style={crewStyles.info}>
        <Text style={crewStyles.name}>
          {name}
          {isHost ? '  ★' : ''}
          {isMe ? '  (You)' : ''}
        </Text>
        <Text style={crewStyles.status}>{isReady ? 'Locked in' : 'Waiting...'}</Text>
      </View>
      <Badge
        label={isReady ? 'READY' : 'HOLD'}
        color={isReady ? colors.success : colors.textDim}
        variant={isReady ? 'soft' : 'soft'}
      />
    </View>
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
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      <LinearGradient colors={[...gradients.danger]} style={emergencyStyles.btn}>
        <Text style={emergencyStyles.icon}>🚨</Text>
        <View>
          <Text style={emergencyStyles.title}>EMERGENCY EJECT</Text>
          <Text style={emergencyStyles.sub}>Once per mission • Stops the clock</Text>
        </View>
      </LinearGradient>
    </Pressable>
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
    <LinearGradient
      colors={isAlien ? [...gradients.alien] : [...gradients.human]}
      style={[roleStyles.card, compact && roleStyles.cardCompact]}
    >
      {!gameMode && (
        <Text style={[roleStyles.emoji, compact && roleStyles.emojiCompact]}>
          {isAlien ? '👽' : '🧑‍🚀'}
        </Text>
      )}
      <Badge
        label={isAlien ? 'INFILTRATOR' : 'CREW'}
        color={isAlien ? colors.alien : colors.human}
        variant="solid"
      />
      {gameMode && (
        <Text style={roleStyles.classified}>CLASSIFIED DOSSIER</Text>
      )}
      <Text style={roleStyles.desc} numberOfLines={compact ? 2 : undefined}>
        {description}
      </Text>
      {allies && allies.length > 0 && (
        <Text style={roleStyles.ally} numberOfLines={1}>
          Partner: {allies.join(', ')}
        </Text>
      )}
    </LinearGradient>
  );
}

function formatTime(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

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
  danger: {},
  success: {},
  ghost: { backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  size_sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 40 },
  size_md: { paddingVertical: 14, paddingHorizontal: spacing.lg, minHeight: 52 },
  size_lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 58 },
  fullWidth: { width: '100%' },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  disabled: { opacity: 0.45 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btnIcon: { fontSize: 18 },
  btnText: { color: '#fff', fontWeight: '800', letterSpacing: 0.3 },
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
  label: { ...typography.small, color: colors.textMuted, textTransform: 'uppercase' },
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
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.small, color: colors.accentSoft },
  code: { ...typography.mono, color: colors.text, marginVertical: spacing.md, textAlign: 'center' },
  hint: { ...typography.caption, color: colors.textDim, textAlign: 'center' },
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
  info: { flex: 1 },
  name: { ...typography.heading, color: colors.text },
  status: { ...typography.small, color: colors.textMuted, marginTop: 2, textTransform: 'uppercase' },
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
  time: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 1 },
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
  card: {
    padding: spacing.xl,
    borderRadius: radius.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  cardCompact: {
    padding: spacing.md,
    borderRadius: radius.xl,
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  emoji: { fontSize: 56 },
  emojiCompact: { fontSize: 40 },
  classified: { ...typography.small, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
  desc: { ...typography.body, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  ally: { ...typography.caption, color: colors.alien, fontWeight: '700' },
});

export { ScreenShell, LoadingState, SectionLabel, Divider } from './layout';
