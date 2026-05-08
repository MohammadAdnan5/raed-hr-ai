import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'رائد - مساعد الموارد البشرية'

interface SalaryCertificateIssuedProps {
  recipient?: string
  employeeName?: string
}

const SalaryCertificateIssuedEmail = ({
  recipient,
  employeeName,
}: SalaryCertificateIssuedProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>تم إصدار خطاب تعريف بالراتب</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>تم إصدار خطاب تعريف بالراتب ✅</Heading>
        <Text style={text}>
          {employeeName ? `مرحباً ${employeeName}،` : 'مرحباً،'}
        </Text>
        <Text style={text}>
          تم إصدار خطاب تعريف بالراتب الخاص بك بنجاح
          {recipient ? ` وموجّه إلى: ` : ''}
          {recipient ? <strong>{recipient}</strong> : null}.
        </Text>
        <Section style={card}>
          <Text style={cardLabel}>نوع الوثيقة</Text>
          <Text style={cardValue}>خطاب تعريف بالراتب</Text>
          {recipient && (
            <>
              <Text style={cardLabel}>الجهة المستفيدة</Text>
              <Text style={cardValue}>{recipient}</Text>
            </>
          )}
          <Text style={cardLabel}>الحالة</Text>
          <Text style={cardValue}>تم التوقيع الرقمي والاعتماد</Text>
        </Section>
        <Text style={text}>
          يمكنك العثور على نسخة من الخطاب في قسم "وثائقي" داخل المنصة.
        </Text>
        <Text style={footer}>
          مع تحيات فريق {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SalaryCertificateIssuedEmail,
  subject: 'تم إصدار خطاب تعريف بالراتب',
  displayName: 'خطاب تعريف بالراتب',
  previewData: { recipient: 'البنك الأهلي السعودي', employeeName: 'خالد' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif',
  direction: 'rtl' as const,
}
const container = {
  padding: '24px',
  maxWidth: '560px',
  margin: '0 auto',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#0f172a',
  margin: '0 0 20px',
  textAlign: 'right' as const,
}
const text = {
  fontSize: '15px',
  color: '#334155',
  lineHeight: '1.7',
  margin: '0 0 14px',
  textAlign: 'right' as const,
}
const card = {
  backgroundColor: '#fff7f2',
  border: '1px solid #fcd9c6',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '20px 0',
}
const cardLabel = {
  fontSize: '11px',
  color: '#9a7363',
  margin: '8px 0 2px',
  textAlign: 'right' as const,
}
const cardValue = {
  fontSize: '14px',
  color: '#0f172a',
  fontWeight: 600 as const,
  margin: '0 0 6px',
  textAlign: 'right' as const,
}
const footer = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '28px 0 0',
  textAlign: 'right' as const,
}
