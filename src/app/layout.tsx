import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import AuthSessionProvider from "@/components/SessionProvider";
import PageTransition from "@/components/PageTransition";

const geist = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Caloracle",
    description: "Your personal recipe manager, meal planner and calorie tracker",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <AuthSessionProvider>
            <Navbar />
            <Toaster position="top-right" />
            <main className="flex-1"><PageTransition>{children}</PageTransition></main>
        </AuthSessionProvider>
        </body>
        </html>
    );
}