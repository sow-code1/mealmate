import Link from 'next/link'
import { auth } from '@/auth'

export default async function Home() {
    const session = await auth()

    return (
        <div>
            {/* Hero */}
            <div className="texture-overlay" style={{
                background: 'linear-gradient(135deg, #eef4ef 0%, #faf9f6 50%, #fdf3eb 100%)',
                padding: '6rem 1.5rem 5rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{
                    position: 'absolute', top: -80, right: -80, width: 320, height: 320,
                    borderRadius: '50%', background: 'radial-gradient(circle, #3d6b4520 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: -60, left: -60, width: 240, height: 240,
                    borderRadius: '50%', background: 'radial-gradient(circle, #c8773a18 0%, transparent 70%)',
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
                        Your personal kitchen companion
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
                        <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>MealMate</span>
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
                        Save your favorite recipes, plan your meals for the week, and generate a grocery list automatically — all in one place.
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href={session ? '/recipes' : '/login'} className="btn-primary">
                            Browse Recipes
                        </Link>
                        <Link href={session ? '/mealplan' : '/login'} className="btn-outline">
                            Plan My Week
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div style={{ background: 'var(--foreground)', padding: '1.25rem 1.5rem' }}>
                <div style={{
                    maxWidth: 900, margin: '0 auto',
                    display: 'flex', justifyContent: 'center',
                    gap: '3rem', flexWrap: 'wrap',
                }}>
                    {[
                        { value: '5+', label: 'Preset Recipes' },
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
                <div className="animate-fade-up-delay-1" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
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
                        From recipe to table, we've got you covered.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {[
                        {
                            icon: '📖',
                            title: 'Recipe Manager',
                            desc: 'Save, organize, and search your recipes with dietary tags and category filters.',
                            accent: '#eef4ef',
                            delay: 'animate-fade-up-delay-2',
                        },
                        {
                            icon: '📅',
                            title: 'Meal Planner',
                            desc: 'Plan breakfast, lunch, dinner, and snacks for every day of the week.',
                            accent: '#fdf3eb',
                            delay: 'animate-fade-up-delay-3',
                        },
                        {
                            icon: '🛒',
                            title: 'Grocery List',
                            desc: 'Automatically generate a shopping list from your weekly meal plan — ingredients totaled up.',
                            accent: '#f0f4ff',
                            delay: 'animate-fade-up-delay-4',
                        },
                    ].map(({ icon, title, desc, accent, delay }) => (
                        <div key={title} className={`card ${delay}`} style={{ padding: '2rem' }}>
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
                    Ready to start cooking?
                </h2>
                <p style={{
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'rgba(255,255,255,0.75)', fontSize: '1rem',
                    marginBottom: '2rem', fontWeight: 300, position: 'relative',
                }}>
                    Sign up free and start building your personal recipe collection.
                </p>
                {session ? (
                    <Link href="/recipes/new" style={{
                        background: 'white', color: 'var(--primary)',
                        padding: '0.85rem 2rem', borderRadius: 'var(--radius-sm)',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                        fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        position: 'relative',
                    }}>
                        + Add Your First Recipe
                    </Link>
                ) : (
                    <Link href="/register" style={{
                        background: 'white', color: 'var(--primary)',
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