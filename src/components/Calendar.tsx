'use client'

import { useState, useEffect } from 'react'

interface CalendarProps {
    selectedDate: string
    onDateSelect: (date: string) => void
    loggedDates: string[] // Array of date strings that have logged entries
}

export default function Calendar({ selectedDate, onDateSelect, loggedDates }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const getMonthData = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDay = firstDay.getDay()
        const totalDays = lastDay.getDate()

        const days = []
        for (let i = 0; i < startDay; i++) {
            days.push(null)
        }
        for (let i = 1; i <= totalDays; i++) {
            days.push(new Date(year, month, i))
        }

        return { days, monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
    }

    const { days, monthName } = getMonthData(currentMonth)

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    const isToday = (date: Date) => {
        return formatDate(date) === todayStr
    }

    const isSelected = (date: Date) => {
        return formatDate(date) === selectedDate
    }

    const isLogged = (date: Date) => {
        return loggedDates.includes(formatDate(date))
    }

    const isFuture = (date: Date) => {
        return formatDate(date) > todayStr
    }

    return (
        <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            maxWidth: 320,
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <button
                    onClick={prevMonth}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: 'var(--muted)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--primary)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--muted)'}
                >
                    ‹
                </button>
                <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--foreground)',
                }}>
                    {monthName}
                </span>
                <button
                    onClick={nextMonth}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: 'var(--muted)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--primary)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--muted)'}
                >
                    ›
                </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} style={{
                        textAlign: 'center',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                    }}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                {days.map((date, i) => {
                    if (!date) {
                        return <div key={i} style={{ height: 32 }} />
                    }

                    const dateStr = formatDate(date)
                    const today = isToday(date)
                    const selected = isSelected(date)
                    const logged = isLogged(date)
                    const future = isFuture(date)

                    return (
                        <button
                            key={dateStr}
                            onClick={() => !future && onDateSelect(dateStr)}
                            disabled={future}
                            style={{
                                height: 32,
                                borderRadius: 'var(--radius-sm)',
                                border: selected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                                background: today ? 'var(--primary-light)' : (selected ? 'var(--primary)' : 'var(--card)'),
                                color: selected ? 'white' : (today ? 'var(--primary)' : (future ? 'var(--card-border)' : 'var(--foreground)')),
                                cursor: future ? 'not-allowed' : 'pointer',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: '0.8rem',
                                fontWeight: today ? 700 : 500,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                opacity: future ? 0.4 : 1,
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                if (!future && !selected) {
                                    (e.currentTarget as HTMLElement).style.background = 'var(--muted-light)'
                                }
                            }}
                            onMouseLeave={e => {
                                if (!future && !selected) {
                                    (e.currentTarget as HTMLElement).style.background = today ? 'var(--primary-light)' : 'var(--card)'
                                }
                            }}
                        >
                            {date.getDate()}
                            {logged && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 2,
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    background: selected ? 'var(--card)' : 'var(--primary)',
                                }} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
