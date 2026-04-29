'use client'

import { useState } from 'react'

interface CalendarProps {
    selectedDate: string
    onDateSelect: (date: string) => void
    loggedDates: string[]
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function pad(n: number): string {
    return String(n).padStart(2, '0')
}

function fmt(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function Calendar({ selectedDate, onDateSelect, loggedDates }: CalendarProps) {
    const [cursor, setCursor] = useState(() => {
        const d = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date()
        return new Date(d.getFullYear(), d.getMonth(), 1)
    })

    const today = new Date()
    const todayStr = fmt(today)
    const loggedSet = new Set(loggedDates)

    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDow = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrev = new Date(year, month, 0).getDate()

    const cells: { date: Date; inMonth: boolean }[] = []
    for (let i = startDow - 1; i >= 0; i--) {
        cells.push({ date: new Date(year, month - 1, daysInPrev - i), inMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
        cells.push({ date: new Date(year, month, i), inMonth: true })
    }
    while (cells.length < 42) {
        const last = cells[cells.length - 1].date
        cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false })
    }

    const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    const goPrev = () => setCursor(new Date(year, month - 1, 1))
    const goNext = () => setCursor(new Date(year, month + 1, 1))

    const navBtn: React.CSSProperties = {
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
        color: 'var(--muted)', fontSize: '1rem', lineHeight: 1,
        transition: 'color 0.15s ease, background 0.15s ease',
    }

    return (
        <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius)',
            padding: '1rem 0.85rem 0.85rem',
            width: '100%',
            maxWidth: 360,
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', padding: '0 0.25rem' }}>
                <button
                    onClick={goPrev}
                    aria-label="Previous month"
                    style={navBtn}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--muted-light)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}
                >
                    ‹
                </button>
                <span style={{
                    fontFamily: 'Playfair Display, serif',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'var(--foreground)',
                    letterSpacing: '-0.01em',
                }}>
                    {monthLabel}
                </span>
                <button
                    onClick={goNext}
                    aria-label="Next month"
                    style={navBtn}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--muted-light)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}
                >
                    ›
                </button>
            </div>

            {/* Weekday labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.35rem' }}>
                {DAY_LABELS.map((d, i) => (
                    <div key={i} style={{
                        textAlign: 'center',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '0.35rem 0',
                    }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {cells.map(({ date, inMonth }, i) => {
                    const dateStr = fmt(date)
                    const isToday = dateStr === todayStr
                    const isSelected = dateStr === selectedDate
                    const isLogged = loggedSet.has(dateStr)
                    const isFuture = dateStr > todayStr

                    const classes = ['cal-cell']
                    if (isSelected) classes.push('cal-selected')
                    else if (isToday) classes.push('cal-today')
                    if (!inMonth) classes.push('cal-muted')

                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={isFuture}
                            onClick={() => onDateSelect(dateStr)}
                            className={classes.join(' ')}
                        >
                            {date.getDate()}
                            {isLogged && <span className="cal-dot" />}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
