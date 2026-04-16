'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import SignInModal from './SignInModal'

export default function HomeCTA() {
    const { data: session, status } = useSession()
    const [showModal, setShowModal] = useState(false)

    if (status === 'authenticated') {
        return (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/recipes" className="btn-primary">Browse Recipes</Link>
                <Link href="/mealplan" className="btn-outline">Plan My Week</Link>
            </div>
        )
    }

    return (
        <>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setShowModal(true)} className="btn-primary">Browse Recipes</button>
                <button onClick={() => setShowModal(true)} className="btn-outline">Plan My Week</button>
            </div>
            <SignInModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    )
}
