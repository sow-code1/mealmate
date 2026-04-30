import type { Metadata, Viewport } from "next";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://main.dgicjir07hk6h.amplifyapp.com";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Caloracle — Free Calorie Tracker, Meal Planner & Pantry Manager",
        template: "%s | Caloracle",
    },
    description:
        "Track calories, plan meals, manage your pantry and grocery list. Free nutrition tracker with recipe builder, macro tracking, and meal planning calendar.",
    keywords: [
        "calorie tracker", "calorie counter", "meal planner", "nutrition tracker",
        "macro tracker", "pantry manager", "grocery list", "recipe tracker",
        "food diary", "calorie calculator", "diet tracker", "healthy eating app",
        "meal prep planner", "food tracker", "daily calorie goal", "protein tracker",
        "carb tracker", "fat tracker", "free calorie app", "online meal planner",
    ],
    authors: [{ name: "Caloracle" }],
    creator: "Caloracle",
    publisher: "Caloracle",
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: "/" },
    openGraph: {
        title: "Caloracle — Free Calorie Tracker, Meal Planner & Pantry Manager",
        description:
            "Track calories, plan meals, manage your pantry and grocery list. Free nutrition tracker with recipe builder, macro tracking, and meal planning calendar.",
        type: "website",
        url: SITE_URL,
        siteName: "Caloracle",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "Caloracle — Free Calorie Tracker, Meal Planner & Pantry Manager",
        description:
            "Track calories, plan meals, manage your pantry and grocery list. Free nutrition tracker with recipe builder, macro tracking, and meal planning calendar.",
    },
    icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
        { media: "(prefers-color-scheme: dark)", color: "#0f0f10" },
    ],
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Caloracle",
    description:
        "Free calorie tracker, meal planner, recipe manager, pantry inventory and grocery list — all in one app.",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
        "Daily calorie and macro logging",
        "Weekly meal planner with breakfast, lunch, dinner, snack slots",
        "Recipe library with nutrition calculator",
        "Smart grocery list aggregated from meal plan",
        "Pantry inventory with expiry tracking",
        "Auto-deduction of pantry stock when logging meals",
        "Dark mode and light mode",
    ],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
        <head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </head>
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
