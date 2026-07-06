import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface LegalDocument {
  title: string;
  appName: string;
  effectiveDate: string;
  intro: string;
  sections: readonly {
    title: string;
    paragraphs: readonly string[];
  }[];
}

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
    >
      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.meta}>
        {document.appName} · Effective {document.effectiveDate}
      </Text>
      <Text style={styles.body}>{document.intro}</Text>

      {document.sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.paragraphs.map((paragraph, index) => (
            <Text key={`${section.title}-${index}`} style={styles.body}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  title: { ...typography.title, color: colors.text },
  meta: { ...typography.caption, color: colors.textDim, marginBottom: spacing.sm },
  section: { gap: spacing.sm, marginTop: spacing.md },
  sectionTitle: { ...typography.heading, color: colors.accentSoft, fontSize: 16 },
  body: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
});
