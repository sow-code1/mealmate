import Spinner from '@/components/Spinner'

export default function Loading() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Spinner />
        </div>
    )
}
