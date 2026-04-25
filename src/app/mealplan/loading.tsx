export default function MealPlanLoading() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div className="skeleton" style={{ height: 32, width: 180 }} />
                <div className="skeleton" style={{ height: 36, width: 120, borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead>
                        <tr>
                            <th style={{ width: 90, padding: '0.6rem' }} />
                            {days.map(d => (
                                <th key={d} style={{ padding: '0.6rem 0.5rem' }}>
                                    <div className="skeleton" style={{ height: 18, width: 36, margin: '0 auto' }} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {meals.map(meal => (
                            <tr key={meal}>
                                <td style={{ padding: '0.5rem' }}>
                                    <div className="skeleton" style={{ height: 16, width: 70 }} />
                                </td>
                                {days.map(d => (
                                    <td key={d} style={{ padding: '0.4rem 0.5rem' }}>
                                        <div className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-sm)' }} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
