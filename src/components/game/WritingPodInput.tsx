import React, { useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '@/components/ui';
import { ActiveTaskFrame } from '@/components/game/CrewExperience';
import { GameState } from '@/types/game';
import { colors, radius, spacing, typography } from '@/theme';

interface WritingPodInputProps {
  game: GameState;
  prompt: string;
  onSubmit: (value: string) => void;
}

export function WritingPodInput({ game, prompt, onSubmit }: WritingPodInputProps) {
  const [text, setText] = React.useState('');
  const inputRef = useRef<TextInput>(null);

  const dismissKeyboard = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const handleSubmit = () => {
    const answer = text.trim();
    if (!answer) return;
    dismissKeyboard();
    onSubmit(answer);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
    >
      <ActiveTaskFrame
        game={game}
        prompt={prompt}
        footer={
          <View style={styles.footerRow}>
            <Pressable style={styles.dismissBtn} onPress={dismissKeyboard}>
              <Text style={styles.dismissText}>Hide keyboard</Text>
            </Pressable>
            <View style={styles.submitWrap}>
              <Button
                title="Submit answer"
                fullWidth
                size="md"
                disabled={!text.trim()}
                onPress={handleSubmit}
              />
            </View>
          </View>
        }
      >
        <Pressable style={styles.inputWrap} onPress={() => inputRef.current?.focus()}>
          <Text style={styles.inputLabel}>Your answer</Text>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Tap here and type…"
            placeholderTextColor={colors.textDim}
            style={styles.textInput}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={dismissKeyboard}
            maxLength={120}
            autoCorrect
            autoCapitalize="sentences"
          />
          <Text style={styles.charCount}>{text.length}/120</Text>
        </Pressable>
      </ActiveTaskFrame>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minHeight: 0 },
  inputWrap: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderBright,
    padding: spacing.md,
    gap: spacing.xs,
  },
  inputLabel: { ...typography.small, color: colors.accentSoft, fontWeight: '800' },
  textInput: {
    minHeight: 52,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: spacing.sm,
  },
  charCount: { ...typography.small, color: colors.textDim, alignSelf: 'flex-end', fontSize: 10 },
  footerRow: { gap: spacing.sm },
  dismissBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  dismissText: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  submitWrap: { width: '100%' },
});
