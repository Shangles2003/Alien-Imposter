import React from 'react';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import { PRIVACY_POLICY } from '@/legal/privacy-policy-content';

export function PrivacyPolicyView() {
  return <LegalDocumentView document={PRIVACY_POLICY} />;
}
