import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function optimizeImageUrl(url, width = 1200) {
    if (!url || typeof url !== 'string') return url
    if (!url.includes('/upload/')) return url
    const transform = `f_auto,q_auto,c_limit,w_${width}`
    return url.replace('/upload/', `/upload/${transform}/`)
}

export function buildSrcSet(url, widths = [480, 768, 1200]) {
    if (!url) return undefined
    return widths.map(w => `${optimizeImageUrl(url, w)} ${w}w`).join(', ')
}

export function getAppBaseUrl() {
    const envUrl = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_APP_URL
    if (envUrl && typeof envUrl === 'string') {
        return envUrl.replace(/\/+$/, '')
    }
    if (typeof window !== 'undefined' && window.location) {
        return window.location.origin
    }
    return ''
}

export async function compressImage(file, maxWidth = 1600, quality = 0.8) {
    if (!file || !file.type.startsWith('image/')) return file
    const img = await new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = URL.createObjectURL(file)
    })
    const scale = Math.min(1, maxWidth / img.width)
    const targetWidth = Math.round(img.width * scale)
    const targetHeight = Math.round(img.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const blob = await new Promise(resolve => canvas.toBlob(resolve, type, quality))
    URL.revokeObjectURL(img.src)
    if (!blob) return file
    return new File([blob], file.name, { type })
}
