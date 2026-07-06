import React from 'react';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import { TERMS_OF_SERVICE } from '@/legal/terms-of-service-content';

export function TermsOfServiceView() {
  return <LegalDocumentView document={TERMS_OF_SERVICE} />;
}
