'use client'

import { useEffect, useRef } from 'react'

interface Props {
    children: React.ReactNode
    className?: string
    delay?: 0 | 1 | 2 | 3 | 4
    style?: React.CSSProperties
}

export default function ScrollReveal({ children, className = '', delay = 0, style }: Props) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect() } },
            { threshold: 0.12 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const delayClass = delay > 0 ? ` reveal-delay-${delay}` : ''
    return (
        <div ref={ref} className={`reveal${delayClass} ${className}`} style={style}>
            {children}
        </div>
    )
}
