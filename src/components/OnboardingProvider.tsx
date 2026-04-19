'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import OnboardingModal from './OnboardingModal'

export default function OnboardingProvider() {
    const { status } = useSession()
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (status !== 'authenticated' || checked) return
        setChecked(true)

        fetch('/api/user/onboarding')
            .then(r => r.json())
            .then(data => {
                if (!data.onboardingSeen) setShowOnboarding(true)
            })
            .catch(() => {})
    }, [status, checked])

    if (!showOnboarding) return null

    return (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
    )
}
