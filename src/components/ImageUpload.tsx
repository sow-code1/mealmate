'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
    currentImageUrl?: string | null
    onUpload: (url: string) => void
    onRemove?: () => void
}

export default function ImageUpload({ currentImageUrl, onUpload, onRemove }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
        if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB'); return }
        setError(null)
        setUploading(true)
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            onUpload(data.url)
        } catch {
            setError('Upload failed, please try again')
            setPreview(currentImageUrl ?? null)
        } finally {
            setUploading(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    return (
        <div>
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--card-border)'}`,
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                    background: dragOver ? 'var(--primary-light)' : 'var(--muted-light)',
                    height: 280,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Recipe preview" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#00000010' }} />
                        {onRemove && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove(); setPreview(null); }}
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.6)',
                                    border: '2px solid white',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.8)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                            >
                                ×
                            </button>
                        )}
                        <div
                            style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(0,0,0,0.45)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: uploading ? 1 : 0,
                                transition: 'opacity 0.2s ease',
                                color: 'white',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: '0.9rem',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => { if (!uploading) e.currentTarget.style.opacity = '0' }}
                        >
                            {uploading ? (
                                <>
                                    <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 8 }} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: '1.5rem', marginBottom: 4 }}>📷</span>
                                    Change photo
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                        {uploading ? (
                            <>
                                <div style={{ width: 32, height: 32, border: '3px solid var(--card-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem' }} />
                                <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>Uploading...</p>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Upload a photo</p>
                                <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.8rem' }}>Click or drag & drop · Max 10MB</p>
                            </>
                        )}
                    </div>
                )}
            </div>
            {error && <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#dc2626', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
            <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} style={{ display: 'none' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}