'use client';

import dynamic from 'next/dynamic';

const DynamicAppShell = dynamic(
  () => import('@/components/layout/AppShell').then((mod) => mod.AppShell),
  { ssr: false }
);

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DynamicAppShell role="hr">{children}</DynamicAppShell>;
}
