import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dayflow — Sign In',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8"
      suppressHydrationWarning
    >
      <div className="w-full max-w-[420px]" suppressHydrationWarning>
        <div className="text-center mb-8" suppressHydrationWarning>
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-4 shadow-sm"
            suppressHydrationWarning
          >
            D
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Dayflow</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every workday, perfectly aligned.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
