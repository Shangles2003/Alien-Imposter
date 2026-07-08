import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { AlienIcon, Avatar, Badge, Button, HelmetIcon, PressableScale } from '@/components/ui';
import { AlienGlyph } from '@/components/game/AlienGlyph';
import { PhaseSyncGate } from '@/components/game/CrewExperience';
import { useGameAccent } from '@/context/GameAccentContext';
import { getIdentityNominationProgress, getRepairProgress } from '@/game/engine';
import {
  CONDUIT_RULES,
  ConduitColor,
  GLYPH_COLUMNS,
  GLYPH_LEGEND,
  getCurrentModule,
  RepairRunState,
} from '@/game/repairProtocol';
import { REPAIR_MODULE_COUNT } from '@/game/identityCheck';
import { GamePlayer, GameState } from '@/types/game';
import { colors, radius, shadows, spacing, typography } from '@/theme';

function MissionStrip({ label }: { label: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.55 + pulse.value * 0.45,
  }));

  return (
    <Animated.View style={[styles.strip, style]}>
      <Text style={styles.stripText}>◈ {label} ◈</Text>
    </Animated.View>
  );
}

/** Secret vote — crew nominates one player for the identity scan. */
export function IdentityNominatePhase({
  game,
  me,
  onSubmit,
}: {
  game: GameState;
  me: GamePlayer;
  onSubmit: (targetId: string) => void;
}) {
  const { accentSoft } = useGameAccent();
  const [selected, setSelected] = useState<string | null>(null);
  const alive = game.players.filter((p) => p.isAlive);
  const ic = game.identityCheck!;
  const myVote = ic.nominations[me.uid];
  const submitted = Boolean(myVote);
  const progress = getIdentityNominationProgress(game);
  const revote = ic.tieRevoteUsed;

  useEffect(() => {
    setSelected(null);
  }, [revote]);

  if (submitted) {
    return (
      <View style={styles.fillCenter}>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.lockedBadge}>
          <Text style={styles.lockedCheck}>✓</Text>
        </Animated.View>
        <Text style={styles.waitTitle}>Ballot cast</Text>
        <Text style={styles.waitCopy}>
          {progress.done}/{progress.total} ballots in — plurality picks the scan target
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <MissionStrip label={revote ? 'REVOTE — BREAK THE TIE' : 'SCANNER ONLINE'} />
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Who gets scanned?</Text>
          <Text style={styles.heroDesc}>
            {revote
              ? 'The vote split. Pick again — another tie aborts the scan.'
              : 'Reactor stable, scanner armed. Vote in secret — most votes gets scanned.'}
          </Text>
          <Text style={[styles.heroHint, { color: accentSoft }]}>
            BALLOTS IN {progress.done}/{progress.total}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.targetGrid}>
        {alive.map((p, i) => {
          const picked = selected === p.uid;
          const isMe = p.uid === me.uid;
          return (
            <Animated.View
              key={p.uid}
              entering={FadeInUp.delay(50 * i).duration(300)}
              style={styles.targetItem}
            >
              <Pressable
                disabled={isMe}
                style={[styles.targetBtn, picked && styles.targetBtnOn, isMe && styles.targetBtnMe]}
                onPress={() => setSelected(p.uid)}
              >
                <Avatar name={p.displayName} color={p.avatarColor} size={52} ring={picked} />
                <Text style={styles.targetName} numberOfLines={2}>
                  {p.displayName}
                  {isMe ? ' (you)' : ''}
                </Text>
                <Text style={[styles.targetMeta, picked && styles.targetMetaOn]}>
                  {isMe ? "Can't vote yourself" : picked ? 'NOMINATED' : 'Tap to nominate'}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <Button
        title={selected ? 'Cast secret ballot' : 'Pick a scan target'}
        variant="primary"
        fullWidth
        size="md"
        disabled={!selected}
        onPress={() => selected && onSubmit(selected)}
      />
    </View>
  );
}

const CONDUIT_HEX: Record<ConduitColor, string> = {
  red: '#fb4d6d',
  blue: '#38bdf8',
  yellow: '#fbbf24',
  green: '#34d399',
  white: '#f4f4f8',
};

const CONDUIT_LABEL: Record<ConduitColor, string> = {
  red: 'RED',
  blue: 'BLUE',
  yellow: 'YELLOW',
  green: 'GREEN',
  white: 'WHITE',
};

function useCountdown(endsAt: number) {
  const [ms, setMs] = useState(() => Math.max(0, endsAt - Date.now()));
  useEffect(() => {
    setMs(Math.max(0, endsAt - Date.now()));
    const id = setInterval(() => setMs(Math.max(0, endsAt - Date.now())), 250);
    return () => clearInterval(id);
  }, [endsAt]);
  return ms;
}

/** Meltdown clock — mono readout that flares red and pulses under 20s. */
function MeltdownTimer({ ms }: { ms: number }) {
  const urgent = ms < 20_000;
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (urgent) {
      pulse.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [urgent, pulse]);
  const animStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + pulse.value * 0.3,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));
  const totalSec = Math.ceil(ms / 1000);
  const label = `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, '0')}`;
  return (
    <Animated.View style={[rp.timerChip, urgent && rp.timerChipUrgent, animStyle]}>
      <Text style={rp.timerLabel}>MELTDOWN</Text>
      <Text style={[rp.timerValue, urgent && { color: colors.danger }]}>{label}</Text>
    </Animated.View>
  );
}

/** Hull integrity pips — one breaks per strike. */
function StrikePips({ strikes, max }: { strikes: number; max: number }) {
  return (
    <View style={rp.hullChip}>
      <Text style={rp.timerLabel}>HULL</Text>
      <View style={rp.pipRow}>
        {Array.from({ length: max }).map((_, i) => {
          const broken = i < strikes;
          return (
            <View
              key={i}
              style={[rp.pip, broken ? rp.pipBroken : rp.pipIntact]}
            >
              <Text style={[rp.pipText, broken && rp.pipTextBroken]}>{broken ? '✕' : '▮'}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Shared status bar seen by both operator and engineer. */
function RepairStatusBar({ repair, ms }: { repair: RepairRunState; ms: number }) {
  const moduleNum = Math.min(repair.modulesCompleted + 1, REPAIR_MODULE_COUNT);
  return (
    <View style={rp.statusBar}>
      <StrikePips strikes={repair.strikes} max={repair.maxStrikes} />
      <View style={rp.moduleDots}>
        {Array.from({ length: REPAIR_MODULE_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[
              rp.moduleDot,
              i < repair.modulesCompleted && rp.moduleDotDone,
              i === repair.modulesCompleted && rp.moduleDotActive,
            ]}
          />
        ))}
        <Text style={rp.moduleDotLabel}>
          SYS {moduleNum}/{REPAIR_MODULE_COUNT}
        </Text>
      </View>
      <MeltdownTimer ms={ms} />
    </View>
  );
}

// ─── Operator panels ─────────────────────────────────────────────────────────

function ConduitOperator({
  module,
  onCut,
}: {
  module: Extract<ReturnType<typeof getCurrentModule>, { type: 'conduit' }>;
  onCut: (id: string) => void;
}) {
  const [armed, setArmed] = useState<string | null>(null);
  useEffect(() => setArmed(null), [module.id]);
  const armedNum = module.conduits.findIndex((c) => c.id === armed) + 1;

  return (
    <View style={rp.panelBody}>
      <View style={rp.reactorIdChip}>
        <Text style={rp.reactorIdLabel}>REACTOR ID</Text>
        <Text style={rp.reactorIdValue}>{module.reactorId}</Text>
      </View>
      <ScrollView
        style={rp.conduitScroll}
        contentContainerStyle={rp.conduitList}
        showsVerticalScrollIndicator={false}
      >
        {module.conduits.map((c, i) => {
          const hex = CONDUIT_HEX[c.color];
          const on = armed === c.id;
          return (
            <PressableScale
              key={c.id}
              scaleTo={0.98}
              onPress={() => setArmed(on ? null : c.id)}
              style={[rp.conduitRow, on && { borderColor: hex, backgroundColor: `${hex}1f` }]}
            >
              <Text style={rp.conduitNum}>{i + 1}</Text>
              <View style={[rp.conduitBar, { backgroundColor: hex, shadowColor: hex }]} />
              <Text style={[rp.conduitColor, { color: hex }]}>{CONDUIT_LABEL[c.color]}</Text>
              <Text style={[rp.conduitState, on && { color: hex }]}>{on ? 'ARMED' : ''}</Text>
            </PressableScale>
          );
        })}
      </ScrollView>
      <Button
        title={armed ? `✂  SEVER CONDUIT ${armedNum}` : 'Arm a conduit to sever'}
        variant="danger"
        fullWidth
        disabled={!armed}
        onPress={() => armed && onCut(armed)}
      />
    </View>
  );
}

function GlyphOperator({
  module,
  onLock,
}: {
  module: Extract<ReturnType<typeof getCurrentModule>, { type: 'glyph_lock' }>;
  onLock: (order: number[]) => void;
}) {
  const [order, setOrder] = useState<number[]>([]);
  useEffect(() => setOrder([]), [module.id]);

  const toggle = (g: number) => {
    setOrder((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  return (
    <View style={rp.panelBody}>
      <View style={rp.glyphGrid}>
        {module.glyphs.map((g) => {
          const idx = order.indexOf(g);
          const on = idx >= 0;
          return (
            <PressableScale
              key={g}
              scaleTo={0.94}
              onPress={() => toggle(g)}
              style={[rp.glyphTile, on && rp.glyphTileOn]}
            >
              <AlienGlyph id={g} size={64} color={on ? colors.accent : colors.text} />
              {on ? (
                <View style={rp.glyphOrderBadge}>
                  <Text style={rp.glyphOrderText}>{idx + 1}</Text>
                </View>
              ) : null}
            </PressableScale>
          );
        })}
      </View>
      <View style={rp.rowBtns}>
        <Button
          title="Reset"
          variant="ghost"
          size="md"
          onPress={() => setOrder([])}
          style={rp.resetBtn}
        />
        <View style={rp.lockBtnWrap}>
          <Button
            title={order.length === 4 ? '🔒  LOCK SEQUENCE' : `Press all four (${order.length}/4)`}
            variant="success"
            fullWidth
            disabled={order.length !== 4}
            onPress={() => onLock(order)}
          />
        </View>
      </View>
    </View>
  );
}

function FrequencyOperator({
  module,
  onLock,
}: {
  module: Extract<ReturnType<typeof getCurrentModule>, { type: 'frequency' }>;
  onLock: (code: number[]) => void;
}) {
  const [code, setCode] = useState<number[]>([]);
  useEffect(() => setCode([]), [module.id]);

  const push = (d: number) => setCode((prev) => (prev.length >= 3 ? prev : [...prev, d]));
  const pop = () => setCode((prev) => prev.slice(0, -1));

  return (
    <View style={rp.panelBody}>
      <View style={rp.gaugeRow}>
        {module.gauges.map((g, i) => (
          <View key={i} style={rp.gaugeCard}>
            <Text style={rp.gaugeLabel}>GAUGE {i + 1}</Text>
            <AlienGlyph id={g} size={48} color={colors.accentSoft} />
          </View>
        ))}
        <View style={[rp.gaugeCard, rp.offsetCard]}>
          <Text style={rp.gaugeLabel}>OFFSET</Text>
          <Text style={rp.offsetValue}>+{module.offset}</Text>
        </View>
      </View>
      <View style={rp.codeDisplay}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[rp.codeSlot, code.length === i && rp.codeSlotActive]}>
            <Text style={rp.codeSlotText}>{code[i] ?? '–'}</Text>
          </View>
        ))}
      </View>
      <View style={rp.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <PressableScale key={d} scaleTo={0.9} onPress={() => push(d)} style={rp.key}>
            <Text style={rp.keyText}>{d}</Text>
          </PressableScale>
        ))}
        <PressableScale scaleTo={0.9} onPress={pop} style={[rp.key, rp.keyAlt]}>
          <Text style={rp.keyText}>⌫</Text>
        </PressableScale>
        <PressableScale scaleTo={0.9} onPress={() => push(0)} style={rp.key}>
          <Text style={rp.keyText}>0</Text>
        </PressableScale>
        <View style={[rp.key, rp.keyGhost]} />
      </View>
      <Button
        title={code.length === 3 ? '🔒  LOCK CODE' : `Enter 3 digits (${code.length}/3)`}
        variant="success"
        fullWidth
        disabled={code.length !== 3}
        onPress={() => onLock(code)}
      />
    </View>
  );
}

// ─── Engineer manual ─────────────────────────────────────────────────────────

function EngineerManual({ module }: { module: NonNullable<ReturnType<typeof getCurrentModule>> }) {
  return (
    <ScrollView style={rp.manualScroll} contentContainerStyle={rp.manualContent}>
      <View style={rp.manualCard}>
        <Text style={rp.manualBadge}>ENGINEERING SCHEMATIC · KEEP HIDDEN</Text>
        <Text style={rp.manualTitle}>{module.title}</Text>

        {module.type === 'conduit' ? (
          <>
            <Text style={rp.manualLead}>First rule that matches wins.</Text>
            {CONDUIT_RULES.map((rule, i) => (
              <View key={i} style={rp.ruleRow}>
                <Text style={rp.ruleNum}>{i + 1}</Text>
                <Text style={rp.ruleText}>{rule}</Text>
              </View>
            ))}
          </>
        ) : null}

        {module.type === 'glyph_lock' ? (
          <>
            <Text style={rp.manualLead}>Find the one column with all four glyphs. Read it top-down.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rp.columnsRow}>
              {GLYPH_COLUMNS.map((col, ci) => (
                <View key={ci} style={rp.glyphColumn}>
                  <Text style={rp.columnLabel}>COL {ci + 1}</Text>
                  {col.map((g, gi) => (
                    <View key={gi} style={rp.columnGlyph}>
                      <AlienGlyph id={g} size={30} color={colors.text} />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        {module.type === 'frequency' ? (
          <>
            <Text style={rp.manualLead}>Each glyph&apos;s number + the offset (9 wraps to 0).</Text>
            <View style={rp.legendGrid}>
              {Object.entries(GLYPH_LEGEND).map(([gid, digit]) => (
                <View key={gid} style={rp.legendCell}>
                  <AlienGlyph id={Number(gid)} size={30} color={colors.text} />
                  <Text style={rp.legendArrow}>→</Text>
                  <Text style={rp.legendDigit}>{digit}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

/** Reactor core status view for everyone not on the panel. */
function RepairSpectator({
  repair,
  engineer,
  operator,
}: {
  repair: RepairRunState;
  engineer?: GamePlayer;
  operator?: GamePlayer;
}) {
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [spin, pulse]);
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + pulse.value * 0.16 }],
    opacity: 0.7 + pulse.value * 0.3,
  }));
  const danger = repair.strikes >= repair.maxStrikes - 1;
  const coreColor = danger ? colors.danger : colors.accent;

  return (
    <View style={rp.spectator}>
      <View style={rp.coreWrap}>
        <Animated.View style={[rp.coreRing, { borderColor: `${coreColor}55` }, ringStyle]} />
        <Animated.View style={[rp.core, { backgroundColor: `${coreColor}22`, borderColor: coreColor }, coreStyle]}>
          <Text style={[rp.coreText, { color: coreColor }]}>{repair.modulesCompleted}/{REPAIR_MODULE_COUNT}</Text>
          <Text style={rp.coreSub}>SYSTEMS</Text>
        </Animated.View>
      </View>
      <Text style={rp.spectatorTitle}>Reactor bay sealed</Text>
      <Text style={rp.spectatorCopy}>
        {operator?.displayName ?? 'A crewmate'} is on the panel; {engineer?.displayName ?? 'a crewmate'}{' '}
        is reading the schematic. Watch the hull hold.
      </Text>
      <View style={rp.operatorRow}>
        <View style={rp.operatorCard}>
          <Avatar name={engineer?.displayName ?? 'E'} color={engineer?.avatarColor ?? colors.primary} size={44} />
          <Text style={rp.operatorRole}>ENGINEER</Text>
          <Text style={rp.operatorName} numberOfLines={1}>{engineer?.displayName ?? '—'}</Text>
        </View>
        <View style={rp.operatorCard}>
          <Avatar name={operator?.displayName ?? 'O'} color={operator?.avatarColor ?? colors.accent} size={44} />
          <Text style={rp.operatorRole}>OPERATOR</Text>
          <Text style={rp.operatorName} numberOfLines={1}>{operator?.displayName ?? '—'}</Text>
        </View>
      </View>
    </View>
  );
}

/** Compact role identity — your job + who you're paired with. */
function RepairRoleHeader({
  role,
  partner,
}: {
  role: 'operator' | 'engineer';
  partner?: GamePlayer;
}) {
  const isOp = role === 'operator';
  return (
    <View style={rp.roleHeader}>
      <View style={[rp.roleChip, isOp ? rp.roleChipOp : rp.roleChipEng]}>
        <Text style={rp.roleChipIcon}>{isOp ? '🔧' : '📋'}</Text>
        <Text style={[rp.roleChipText, { color: isOp ? colors.accent : colors.primaryLight }]}>
          {isOp ? 'OPERATOR' : 'ENGINEER'}
        </Text>
      </View>
      <Text style={rp.roleLink}>⇄</Text>
      <View style={rp.partnerChip}>
        <Avatar
          name={partner?.displayName ?? '?'}
          color={partner?.avatarColor ?? colors.primary}
          size={24}
        />
        <Text style={rp.partnerName} numberOfLines={1}>
          {partner?.displayName ?? '—'}
        </Text>
      </View>
    </View>
  );
}

/** Reactor Repair — asymmetric co-op that unlocks the identity scan. */
export function RepairProtocolPhase({
  game,
  me,
  onCutConduit,
  onLockGlyphs,
  onLockCode,
}: {
  game: GameState;
  me: GamePlayer;
  onCutConduit: (conduitId: string) => void;
  onLockGlyphs: (order: number[]) => void;
  onLockCode: (code: number[]) => void;
}) {
  const ic = game.identityCheck!;
  const repair = ic.repair!;
  const module = getCurrentModule(repair);
  const ms = useCountdown(repair.endsAt);

  const engineer = useMemo(
    () => game.players.find((p) => p.uid === repair.engineerId),
    [game.players, repair.engineerId]
  );
  const operator = useMemo(
    () => game.players.find((p) => p.uid === repair.operatorId),
    [game.players, repair.operatorId]
  );
  const isEngineer = repair.engineerId === me.uid;
  const isOperator = repair.operatorId === me.uid;

  // Screen shake + colour flash, driven by the shared last-event counter so
  // every device reacts to a strike / seal in sync.
  const shake = useSharedValue(0);
  const flash = useSharedValue(0);
  const [flashColor, setFlashColor] = useState(colors.danger);
  const evtSeq = repair.lastEvent?.seq ?? 0;
  const evtKind = repair.lastEvent?.kind;

  useEffect(() => {
    if (!evtKind) return;
    if (evtKind === 'success') {
      setFlashColor(colors.success);
      flash.value = withSequence(withTiming(0.45, { duration: 90 }), withTiming(0, { duration: 420 }));
    } else if (evtKind === 'strike' || evtKind === 'fail') {
      setFlashColor(colors.danger);
      flash.value = withSequence(withTiming(0.5, { duration: 70 }), withTiming(0, { duration: 460 }));
      shake.value = withSequence(
        withTiming(-9, { duration: 45 }),
        withTiming(9, { duration: 60 }),
        withTiming(-6, { duration: 55 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 45 })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evtSeq]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  // Remount the operator panel whenever the module advances OR a strike lands,
  // so a wrong lock-in clears the in-progress selection for a fresh attempt.
  const panelKey = module ? `${module.id}-${repair.strikes}` : 'none';

  let body: React.ReactNode;
  if (isOperator && module) {
    if (module.type === 'conduit')
      body = <ConduitOperator key={panelKey} module={module} onCut={onCutConduit} />;
    else if (module.type === 'glyph_lock')
      body = <GlyphOperator key={panelKey} module={module} onLock={onLockGlyphs} />;
    else body = <FrequencyOperator key={panelKey} module={module} onLock={onLockCode} />;
  } else if (isEngineer && module) {
    body = <EngineerManual module={module} />;
  } else {
    body = <RepairSpectator repair={repair} engineer={engineer} operator={operator} />;
  }

  return (
    <View style={styles.fill}>
      <Animated.View style={[rp.flashOverlay, { backgroundColor: flashColor }, flashStyle]} pointerEvents="none" />
      <Animated.View style={[styles.fill, shakeStyle]}>
        <RepairStatusBar repair={repair} ms={ms} />
        {isOperator ? (
          <RepairRoleHeader role="operator" partner={engineer} />
        ) : isEngineer ? (
          <RepairRoleHeader role="engineer" partner={operator} />
        ) : null}
        <View style={rp.stage}>{body}</View>
      </Animated.View>
    </View>
  );
}

/** Dramatic 3-2-1 bioscan animation shown to every player. */
function ScanningSequence({ nominee, seconds }: { nominee?: GamePlayer; seconds: number }) {
  const ring = useSharedValue(0);
  const sweep = useSharedValue(0);
  useEffect(() => {
    ring.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }), -1, false);
    sweep.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [ring, sweep]);
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring.value * 0.7 }],
    opacity: 0.55 * (1 - ring.value),
  }));
  const sweepStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -52 + sweep.value * 104 }] }));

  return (
    <View style={styles.fillCenter}>
      <Text style={rp.scanKicker}>◈ BIOSCAN IN PROGRESS ◈</Text>
      <View style={rp.scanAvatarWrap}>
        <Animated.View style={[rp.scanRing, ringStyle]} />
        <Avatar
          name={nominee?.displayName ?? '?'}
          color={nominee?.avatarColor ?? colors.primary}
          size={104}
        />
        <Animated.View style={[rp.scanSweep, sweepStyle]} />
      </View>
      <Text style={rp.scanName}>{nominee?.displayName ?? 'Target'}</Text>
      <Text style={rp.scanSub}>ANALYZING BIOSIGNATURE…</Text>
      <Animated.Text key={seconds} entering={ZoomIn.duration(300)} style={rp.scanCount}>
        {seconds}
      </Animated.Text>
    </View>
  );
}

/** Bioscan reveal — dramatic scan, then captain-only CREW/INFILTRATOR result. */
export function CaptainScanReveal({
  game,
  me,
  onAcknowledge,
  syncPending,
}: {
  game: GameState;
  me: GamePlayer;
  onAcknowledge: () => void;
  syncPending: boolean;
}) {
  const ic = game.identityCheck!;
  const nominee = game.players.find((p) => p.uid === ic.nomineeId);
  const captain = game.players.find((p) => p.uid === game.captainId);
  const isCaptain = game.captainId === me.uid;
  const isInfiltrator = ic.scanResult === 'alien';
  const [revealed, setRevealed] = useState(false);

  // Shared 3-second scan animation before anyone sees anything.
  const [countdown, setCountdown] = useState(3);
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  if (countdown > 0) {
    return <ScanningSequence nominee={nominee} seconds={countdown} />;
  }

  if (!isCaptain) {
    return (
      <View style={styles.fill}>
        <View style={styles.fillCenter}>
          <Animated.Text entering={FadeInDown.duration(400)} style={rp.classifiedLock}>
            🔒
          </Animated.Text>
          <Text style={rp.classifiedHead}>RESULT CLASSIFIED</Text>
          <Text style={rp.classifiedTarget}>{nominee?.displayName ?? 'Target'}</Text>
          <Text style={rp.classifiedBody}>
            Only {captain?.displayName ?? 'the captain'} sees whether {nominee?.displayName ?? 'the target'}{' '}
            is <Text style={{ color: colors.human }}>CREW</Text> or{' '}
            <Text style={{ color: colors.alien }}>INFILTRATOR</Text>.
          </Text>
          <Text style={rp.classifiedWatch}>Watch their face.</Text>
        </View>
        <Text style={rp.awaitCaptain}>Awaiting {captain?.displayName ?? 'the captain'}…</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {revealed ? (
        <Animated.View entering={ZoomIn.duration(320)} style={styles.roleWrap}>
          <View
            style={[
              styles.roleCard,
              isInfiltrator ? styles.roleCardAlien : styles.roleCardHuman,
              isInfiltrator ? shadows.glowRed : shadows.glowCyan,
            ]}
          >
            {isInfiltrator ? <AlienIcon size={72} mood="sus" /> : <HelmetIcon size={72} />}
            <Text style={styles.scanTargetName}>{nominee?.displayName ?? 'Unknown'}</Text>
            <Badge
              label={isInfiltrator ? 'INFILTRATOR' : 'CREW'}
              color={isInfiltrator ? colors.alien : colors.human}
              variant="solid"
            />
            <Text style={styles.roleDesc}>
              {isInfiltrator
                ? 'Scan confirms an infiltrator. This intel is captain-only — not logged.'
                : 'Scan confirms crew clearance. This intel is captain-only — not logged.'}
            </Text>
            <Pressable onPress={() => setRevealed(false)} hitSlop={8}>
              <Text style={styles.hideLink}>Hide result</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : (
        <PressableScale onPress={() => setRevealed(true)} style={styles.roleWrap} scaleTo={0.97}>
          <View style={[styles.roleCard, styles.roleCardHidden]}>
            <Animated.Text entering={FadeInDown.duration(600)} style={styles.classifiedIcon}>
              🔒
            </Animated.Text>
            <Text style={styles.classifiedTitle}>SCAN RESULT — CAPTAIN ONLY</Text>
            <Text style={styles.classifiedName}>{nominee?.displayName ?? 'Target'}</Text>
            <Text style={styles.classifiedHint}>
              Make sure nobody is looking,{'\n'}then tap to reveal the scan
            </Text>
            <View style={styles.tapChip}>
              <Text style={styles.tapChipText}>TAP TO REVEAL</Text>
            </View>
          </View>
        </PressableScale>
      )}

      <Button
        title={revealed ? 'Acknowledge & continue' : 'Reveal scan first'}
        fullWidth
        disabled={!revealed || syncPending}
        onPress={() => revealed && onAcknowledge()}
      />
    </View>
  );
}

/** Crew sync after identity check — scan complete or aborted. */
export function IdentityDebrief({
  game,
  me,
  onReady,
  syncPending,
}: {
  game: GameState;
  me: GamePlayer;
  onReady: () => void;
  syncPending: boolean;
}) {
  const ic = game.identityCheck!;
  const nominee = game.players.find((p) => p.uid === ic.nomineeId);

  let headline = 'Scan complete';
  let copy = 'Repairs held. The captain ran the scan — details stay classified.';

  if (ic.abortedNoConsensus) {
    headline = 'Scan aborted';
    copy = 'No consensus on a scan target. The identity check is skipped.';
  } else if (ic.coopPassed === false) {
    headline = 'Scan aborted';
    copy = 'Repair failed — scan aborted. No role data was recovered.';
  } else if (ic.coopPassed && nominee) {
    copy = `Scan on ${nominee.displayName} is complete. Only the captain knows the result.`;
  }

  return (
    <View style={styles.fill}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.debriefHero}>
        <MissionStrip label="IDENTITY DEBRIEF" />
        <Text style={styles.heroTitle}>{headline}</Text>
        <Text style={styles.heroDesc}>{copy}</Text>
      </Animated.View>
      <PhaseSyncGate
        game={game}
        me={me}
        actionLabel="Continue mission"
        loading={syncPending}
        onReady={onReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0, justifyContent: 'space-between', gap: spacing.sm },
  fillCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  strip: {
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
    borderRadius: radius.sm,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stripText: { ...typography.label, color: colors.primaryLight, fontSize: 11 },
  hero: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: spacing.md,
    gap: spacing.xs,
  },
  debriefHero: { gap: spacing.sm },
  heroTitle: { ...typography.heading, color: colors.text },
  heroDesc: { ...typography.caption, color: colors.textMuted, lineHeight: 20 },
  heroHint: { ...typography.label, marginTop: spacing.xs, fontSize: 9 },
  targetGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignContent: 'center',
    justifyContent: 'center',
    minHeight: 0,
  },
  targetItem: { width: '47%' },
  targetBtn: {
    minHeight: 116,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 2,
    borderColor: colors.border,
  },
  targetBtnOn: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(56,189,248,0.12)',
  },
  targetBtnMe: { opacity: 0.45 },
  targetName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },
  targetMeta: { ...typography.small, color: colors.textDim, fontSize: 10 },
  targetMetaOn: { color: colors.primaryLight, fontWeight: '800' },
  lockedBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(56,189,248,0.14)',
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCheck: { fontSize: 26, color: colors.primaryLight, fontWeight: '800' },
  waitTitle: { ...typography.heading, color: colors.text },
  waitCopy: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  operatorRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  operatorCard: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
  },
  operatorRole: { ...typography.label, color: colors.textDim, fontSize: 9 },
  operatorName: { ...typography.caption, color: colors.text, fontWeight: '700', maxWidth: 110 },
  manualScroll: { flex: 1, minHeight: 0 },
  manualContent: { paddingBottom: spacing.sm },
  manualCard: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderBright,
    padding: spacing.md,
    gap: spacing.sm,
  },
  manualBadge: { ...typography.label, color: colors.danger, fontSize: 9 },
  manualTitle: { ...typography.heading, color: colors.text },
  manualBrief: { ...typography.caption, color: colors.textMuted, lineHeight: 20 },
  manualStep: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  manualStepNum: { ...typography.label, fontSize: 11, width: 22 },
  manualStepText: { ...typography.body, color: colors.text, flex: 1, lineHeight: 22 },
  manualFooter: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  techPanel: {
    flex: 1,
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    minHeight: 0,
  },
  techModuleTitle: { ...typography.heading, color: colors.text, textAlign: 'center' },
  valveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  valveBtn: {
    minWidth: '44%',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  valveLabel: { ...typography.heading, color: colors.text, letterSpacing: 1 },
  dialSection: { gap: spacing.sm },
  dialDisplay: {
    ...typography.title,
    color: colors.primaryLight,
    textAlign: 'center',
    letterSpacing: 4,
  },
  dialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  dialBtn: {
    width: '28%',
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  dialBtnText: { ...typography.heading, color: colors.text },
  switchCol: { gap: spacing.sm },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  switchLabel: { ...typography.body, color: colors.text, fontWeight: '700' },
  switchState: { ...typography.label, color: colors.textDim },
  switchStateOn: { color: colors.success },
  roleWrap: { flex: 1, minHeight: 0 },
  roleCard: {
    flex: 1,
    borderRadius: radius.xxl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  roleCardHidden: {
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderBright,
    borderStyle: 'dashed',
  },
  roleCardAlien: {
    backgroundColor: '#2a0a14',
    borderColor: 'rgba(251,113,133,0.55)',
  },
  roleCardHuman: {
    backgroundColor: '#04211a',
    borderColor: 'rgba(52,211,153,0.5)',
  },
  classifiedIcon: { fontSize: 40 },
  classifiedTitle: { ...typography.label, color: colors.primaryLight, fontSize: 12 },
  classifiedName: { ...typography.title, color: colors.text },
  scanTargetName: { ...typography.heading, color: colors.text, textAlign: 'center' },
  classifiedHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  tapChip: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.glowPurple,
    borderWidth: 1,
    borderColor: colors.borderBright,
  },
  tapChipText: { ...typography.label, color: colors.primaryLight },
  roleDesc: {
    ...typography.body,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  hideLink: { ...typography.small, color: colors.textDim, textDecorationLine: 'underline' },
});

const rp = StyleSheet.create({
  // Shared chrome
  flashOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 20, borderRadius: radius.lg },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hullChip: { gap: 3 },
  pipRow: { flexDirection: 'row', gap: 4 },
  pip: {
    width: 20,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipIntact: { borderColor: 'rgba(52,211,153,0.5)', backgroundColor: 'rgba(52,211,153,0.14)' },
  pipBroken: { borderColor: colors.danger, backgroundColor: 'rgba(251,77,109,0.18)' },
  pipText: { fontSize: 12, fontWeight: '900', color: colors.success },
  pipTextBroken: { color: colors.danger },
  moduleDots: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  moduleDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  moduleDotDone: { backgroundColor: colors.success },
  moduleDotActive: { backgroundColor: colors.accent, width: 11, height: 11, borderRadius: 6 },
  moduleDotLabel: { ...typography.label, color: colors.textMuted, fontSize: 9, marginLeft: 4 },
  timerChip: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSolid,
    minWidth: 74,
  },
  timerChipUrgent: { borderColor: colors.danger },
  timerLabel: { ...typography.label, color: colors.textDim, fontSize: 8 },
  timerValue: { ...typography.mono, fontSize: 20, letterSpacing: 2, color: colors.text },

  stage: { flex: 1, minHeight: 0 },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  roleChipOp: { borderColor: 'rgba(34,211,238,0.5)', backgroundColor: colors.glowCyan },
  roleChipEng: { borderColor: colors.borderBright, backgroundColor: colors.glowPurple },
  roleChipIcon: { fontSize: 14 },
  roleChipText: { ...typography.label, fontSize: 11 },
  roleLink: { color: colors.textDim, fontSize: 16, fontWeight: '800' },
  partnerChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  partnerName: { ...typography.caption, color: colors.textMuted, fontWeight: '700', maxWidth: 120 },

  // Operator shell
  panelBody: { flex: 1, minHeight: 0, gap: spacing.sm },
  panelHint: { ...typography.caption, color: colors.textMuted, lineHeight: 19 },

  // Conduit
  reactorIdChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderBright,
    backgroundColor: colors.surfaceSolid,
  },
  reactorIdLabel: { ...typography.label, color: colors.textMuted },
  reactorIdValue: { ...typography.mono, fontSize: 24, color: colors.accentSoft, letterSpacing: 3 },
  conduitScroll: { flex: 1, minHeight: 0 },
  conduitList: { gap: spacing.sm, paddingBottom: spacing.xs },
  conduitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  conduitNum: {
    ...typography.mono,
    fontSize: 18,
    color: colors.textMuted,
    width: 24,
    textAlign: 'center',
  },
  conduitBar: {
    flex: 1,
    height: 18,
    borderRadius: radius.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 4,
  },
  conduitColor: { ...typography.small, fontWeight: '800', width: 62, textAlign: 'right' },
  conduitState: { ...typography.label, color: 'transparent', width: 46, fontSize: 9 },

  // Glyph lock
  glyphGrid: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignContent: 'center',
    justifyContent: 'center',
  },
  glyphTile: {
    width: '47%',
    aspectRatio: 1.35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSolid,
  },
  glyphTileOn: {
    borderColor: colors.accent,
    backgroundColor: colors.glowCyan,
    ...shadows.glowCyan,
  },
  glyphOrderBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphOrderText: { color: '#04050d', fontWeight: '900', fontSize: 13 },
  rowBtns: { flexDirection: 'row', gap: spacing.sm, alignItems: 'stretch' },
  resetBtn: { minWidth: 96, borderWidth: 1.5, borderColor: colors.border },
  lockBtnWrap: { flex: 1 },

  // Frequency
  gaugeRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  gaugeCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSolid,
  },
  offsetCard: { borderColor: colors.borderBright },
  gaugeLabel: { ...typography.label, color: colors.textDim, fontSize: 8 },
  offsetValue: { ...typography.mono, fontSize: 26, color: colors.primaryLight },
  codeDisplay: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  codeSlot: {
    width: 54,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeSlotActive: { borderColor: colors.accent, ...shadows.glowCyan },
  codeSlotText: { ...typography.mono, fontSize: 30, color: colors.accentSoft },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  key: {
    width: '30%',
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSolid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyAlt: { backgroundColor: colors.surface },
  keyGhost: { opacity: 0, borderWidth: 0 },
  keyText: { ...typography.heading, color: colors.text, fontSize: 22 },

  // Engineer manual
  manualScroll: { flex: 1, minHeight: 0 },
  manualContent: { paddingBottom: spacing.sm },
  manualCard: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderBright,
    padding: spacing.md,
    gap: spacing.sm,
  },
  manualBadge: { ...typography.label, color: colors.warning, fontSize: 9 },
  manualTitle: { ...typography.heading, color: colors.text },
  manualLead: { ...typography.caption, color: colors.textMuted, lineHeight: 20 },
  ruleRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  ruleNum: {
    ...typography.mono,
    fontSize: 15,
    color: colors.accentSoft,
    width: 22,
    textAlign: 'center',
  },
  ruleText: { ...typography.body, color: colors.text, flex: 1, lineHeight: 22, fontSize: 15 },
  columnsRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  glyphColumn: {
    alignItems: 'center',
    gap: 6,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  columnLabel: { ...typography.label, color: colors.textDim, fontSize: 8, marginBottom: 2 },
  columnGlyph: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  legendCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  legendArrow: { color: colors.textDim, fontSize: 14 },
  legendDigit: { ...typography.mono, fontSize: 20, color: colors.accentSoft },

  // Spectator
  spectator: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  coreWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  coreRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  core: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreText: { ...typography.title, fontSize: 30 },
  coreSub: { ...typography.label, color: colors.textMuted, fontSize: 9 },
  spectatorTitle: { ...typography.heading, color: colors.text, marginTop: spacing.sm },
  spectatorCopy: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  operatorRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  operatorCard: {
    alignItems: 'center',
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
  },
  operatorRole: { ...typography.label, color: colors.textDim, fontSize: 9 },
  operatorName: { ...typography.caption, color: colors.text, fontWeight: '700', maxWidth: 110 },

  // Bioscan sequence
  scanKicker: { ...typography.label, color: colors.accentSoft, fontSize: 11 },
  scanAvatarWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  scanRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  scanSweep: {
    position: 'absolute',
    width: 116,
    height: 2,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  scanName: { ...typography.title, color: colors.text },
  scanSub: { ...typography.label, color: colors.textMuted, marginTop: spacing.xs },
  scanCount: {
    ...typography.mono,
    fontSize: 60,
    color: colors.accent,
    marginTop: spacing.sm,
    letterSpacing: 0,
  },

  // Classified (non-captain) explainer
  classifiedLock: { fontSize: 44 },
  classifiedHead: { ...typography.label, color: colors.primaryLight, fontSize: 13, marginTop: spacing.sm },
  classifiedTarget: { ...typography.title, color: colors.text, marginTop: spacing.xs },
  classifiedBody: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  classifiedWatch: { ...typography.caption, color: colors.textDim, fontStyle: 'italic', marginTop: spacing.sm },
  awaitCaptain: { ...typography.small, color: colors.textDim, textAlign: 'center', paddingVertical: spacing.sm },
});
