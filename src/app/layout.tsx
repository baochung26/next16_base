import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ErrorBoundaryProvider } from "@/components/providers/error-boundary-provider";
import { Toaster } from "@/components/ui/toaster";
import { APP_CONFIG } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.NAME,
  description: APP_CONFIG.DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            <AuthProvider>
              <ErrorBoundaryProvider>
                {children}
                <Toaster />
              </ErrorBoundaryProvider>
            </AuthProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
