'use client'

import { useEffect, useRef, useState } from 'react'

export const UNIT_OPTIONS = [
    'pieces', 'grams (g)', 'kilograms (kg)', 'milliliters (ml)', 'liters (L)',
    'cups', 'tablespoons (tbsp)', 'teaspoons (tsp)', 'ounces (oz)', 'pounds (lb)',
    'slices', 'cans', 'bottles', 'bags', 'boxes', 'bunches', 'cloves',
    'pinch', 'handful', 'servings', 'sheets', 'whole', 'heads', 'stalks',
    'sprigs', 'fillets', 'rashers', 'loaves', 'jars', 'packets',
] as const

interface Props {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    style?: React.CSSProperties
    compact?: boolean
}

export default function UnitSelect({ value, onChange, placeholder = 'Select unit', style, compact }: Props) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [activeIdx, setActiveIdx] = useState(0)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [open])

    useEffect(() => {
        if (open) {
            setQuery('')
            setActiveIdx(0)
            setTimeout(() => searchRef.current?.focus(), 10)
        }
    }, [open])

    const q = query.trim().toLowerCase()
    const filtered = q
        ? UNIT_OPTIONS.filter(u => u.toLowerCase().includes(q))
        : UNIT_OPTIONS

    const select = (v: string) => {
        onChange(v)
        setOpen(false)
    }

    const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIdx(i => Math.min(filtered.length - 1, i + 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIdx(i => Math.max(0, i - 1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filtered[activeIdx]) select(filtered[activeIdx])
        }
    }

    useEffect(() => {
        const node = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`)
        node?.scrollIntoView({ block: 'nearest' })
    }, [activeIdx])

    const triggerStyle: React.CSSProperties = {
        width: '100%',
        textAlign: 'left',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-sm)',
        padding: compact ? '0.4rem 0.6rem' : '0.55rem 0.8rem',
        fontSize: compact ? '0.8rem' : '0.875rem',
        fontFamily: 'DM Sans, sans-serif',
        color: value ? 'var(--foreground)' : 'var(--muted)',
        background: 'var(--background)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        outline: 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...style,
    }

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={triggerStyle}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {value || placeholder}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', flexShrink: 0 }}>▾</span>
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 100,
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        minWidth: 220,
                        background: 'var(--card)',
                        border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-md)',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--card-border)' }}>
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setActiveIdx(0) }}
                            onKeyDown={onKey}
                            placeholder="Search units..."
                            style={{
                                width: '100%',
                                border: '1px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.4rem 0.6rem',
                                fontSize: '0.85rem',
                                fontFamily: 'DM Sans, sans-serif',
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                                outline: 'none',
                            }}
                        />
                    </div>
                    <div ref={listRef} role="listbox" style={{ maxHeight: 240, overflowY: 'auto' }}>
                        {filtered.length === 0 ? (
                            <div style={{
                                padding: '0.75rem 0.85rem',
                                color: 'var(--muted)',
                                fontSize: '0.85rem',
                                fontFamily: 'DM Sans, sans-serif',
                            }}>
                                No matches
                            </div>
                        ) : filtered.map((u, i) => {
                            const isActive = i === activeIdx
                            const isSelected = u === value
                            return (
                                <button
                                    key={u}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    data-idx={i}
                                    onClick={() => select(u)}
                                    onMouseEnter={() => setActiveIdx(i)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.5rem 0.85rem',
                                        fontSize: '0.85rem',
                                        fontFamily: 'DM Sans, sans-serif',
                                        background: isActive ? 'var(--muted-light)' : 'transparent',
                                        color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                                        fontWeight: isSelected ? 600 : 400,
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    {u}
                                    {isSelected && <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>✓</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
