import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import AuthSessionProvider from "@/components/SessionProvider";
import PageTransition from "@/components/PageTransition";
import OnboardingProvider from "@/components/OnboardingProvider";
import ThemeProvider from "@/components/ThemeProvider";

const geist = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: { default: "Caloracle", template: "%s | Caloracle" },
    description: "Your personal recipe manager, meal planner and calorie tracker.",
    openGraph: {
        title: "Caloracle",
        description: "Save recipes, plan meals, track calories — all in one place.",
        type: "website",
        siteName: "Caloracle",
    },
    twitter: {
        card: "summary",
        title: "Caloracle",
        description: "Save recipes, plan meals, track calories — all in one place.",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
        <body className="min-h-full flex flex-col">
        <ThemeProvider>
            <AuthSessionProvider>
                <Navbar />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: 'var(--card)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--card-border)',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: '0.9rem',
                        },
                    }}
                />
                <OnboardingProvider />
                <main className="flex-1"><PageTransition>{children}</PageTransition></main>
            </AuthSessionProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}