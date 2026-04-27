import Link from 'next/link'
import { auth } from '@/auth'
import HomeCTA from '@/components/HomeCTA'
import ScrollReveal from '@/components/ScrollReveal'

export default async function Home() {
    const session = await auth()

    return (
        <div>
            {/* Hero */}
            <div className="texture-overlay" style={{
                background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--background) 50%, var(--accent-light) 100%)',
                padding: '6rem 1.5rem 5rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: -80, right: -80, width: 320, height: 320,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,107,69,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: -60, left: -60, width: 240, height: 240,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,119,58,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div className="animate-fade-up" style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{
                        display: 'inline-block',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '0.35rem 1rem',
                        borderRadius: 999,
                        marginBottom: '1.5rem',
                        border: '1px solid #c8e6c9',
                    }}>
                        Your personal kitchen & calorie companion
                    </span>

                    <h1 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                        fontWeight: 700,
                        color: 'var(--foreground)',
                        marginBottom: '1.25rem',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                    }}>
                        Cook smarter with{' '}
                        <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Caloracle</span>
                    </h1>

                    <p style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '1.15rem',
                        color: 'var(--muted)',
                        maxWidth: 540,
                        margin: '0 auto 2.5rem',
                        lineHeight: 1.7,
                        fontWeight: 300,
                    }}>
                        Save your favorite recipes, plan your meals for the week, track your calories, and generate a grocery list automatically — all in one place.
                    </p>

                    <HomeCTA />
                </div>
            </div>

            {/* Stats bar — intentionally always dark for contrast */}
            <div style={{ background: '#1c1917', padding: '1.25rem 1.5rem' }}>
                <div style={{
                    maxWidth: 900, margin: '0 auto',
                    display: 'flex', justifyContent: 'center',
                    gap: '3rem', flexWrap: 'wrap',
                }}>
                    {[
                        { value: '30+', label: 'Preset Recipes' },
                        { value: '7', label: 'Days Planned' },
                        { value: '4', label: 'Meal Types' },
                        { value: '∞', label: 'Possibilities' },
                    ].map(({ value, label }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', fontWeight: 700, color: 'white' }}>{value}</div>
                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#a8a29e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem' }}>
                <ScrollReveal style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <h2 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                        fontWeight: 700,
                        color: 'var(--foreground)',
                        marginBottom: '0.75rem',
                    }}>
                        Everything you need to eat well
                    </h2>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '1rem', fontWeight: 300 }}>
                        From recipe to table, we&apos;ve got you covered.
                    </p>
                </ScrollReveal>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {[
                        {
                            icon: '📖',
                            title: 'Recipe Manager',
                            desc: 'Save, organize, and search your recipes with dietary tags and category filters.',
                            accent: 'var(--primary-light)',
                            delay: 1 as const,
                        },
                        {
                            icon: '📅',
                            title: 'Meal Planner',
                            desc: 'Plan breakfast, lunch, dinner, and snacks for every day of the week.',
                            accent: 'var(--accent-light)',
                            delay: 2 as const,
                        },
                        {
                            icon: '🔥',
                            title: 'Calorie Tracker',
                            desc: 'Track your calories and macros to stay on top of your health and weight goals.',
                            accent: 'var(--muted-light)',
                            delay: 3 as const,
                        },
                        {
                            icon: '🛒',
                            title: 'Grocery List',
                            desc: 'Automatically generate a shopping list from your weekly meal plan — ingredients totaled up.',
                            accent: 'var(--primary-light)',
                            delay: 4 as const,
                        },
                    ].map(({ icon, title, desc, accent, delay }) => (
                        <ScrollReveal key={title} delay={delay}>
                            <div className="card" style={{ padding: '2rem', height: '100%' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    background: accent,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.6rem', marginBottom: '1.25rem',
                                }}>
                                    {icon}
                                </div>
                                <h3 style={{
                                    fontFamily: 'Playfair Display, serif',
                                    fontSize: '1.2rem', fontWeight: 600,
                                    color: 'var(--foreground)', marginBottom: '0.6rem',
                                }}>
                                    {title}
                                </h3>
                                <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.65, fontWeight: 300 }}>
                                    {desc}
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div style={{
                margin: '0 1.5rem 5rem',
                maxWidth: 1100,
                marginLeft: 'auto',
                marginRight: 'auto',
                background: 'var(--primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '4rem 2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: -60, left: -20, width: 160, height: 160,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
                }} />
                <h2 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                    fontWeight: 700, color: 'white',
                    marginBottom: '0.75rem', position: 'relative',
                }}>
                    Ready to start cooking smarter?
                </h2>
                <p style={{
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'rgba(255,255,255,0.75)', fontSize: '1rem',
                    marginBottom: '2rem', fontWeight: 300, position: 'relative',
                }}>
                    Sign up free and start building your personal recipe collection with calorie tracking.
                </p>
                {session ? (
                    <Link href="/recipes/new" style={{
                        background: 'var(--card)', color: 'var(--primary)',
                        padding: '0.85rem 2rem', borderRadius: 'var(--radius-sm)',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                        fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block',
                        position: 'relative',
                    }}>
                        + Add Your First Recipe
                    </Link>
                ) : (
                    <Link href="/register" style={{
                        background: 'var(--card)', color: 'var(--primary)',
                        padding: '0.85rem 2rem', borderRadius: 'var(--radius-sm)',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                        fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block',
                        position: 'relative',
                    }}>
                        Create Free Account
                    </Link>
                )}
            </div>
        </div>
    )
}
