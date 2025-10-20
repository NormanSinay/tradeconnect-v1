import React, { useState } from 'react'
import { useLazyImage } from '@/hooks/useLazyLoad'
import { cn } from '@/lib/utils'
import { ImageIcon, AlertCircle } from 'lucide-react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  blurDataURL?: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  onLoad?: () => void
  onError?: () => void
  sizes?: string
  loading?: 'lazy' | 'eager'
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder,
  blurDataURL,
  width,
  height,
  priority = false,
  quality = 75,
  onLoad,
  onError,
  sizes,
  loading = 'lazy',
  objectFit = 'cover',
  objectPosition = 'center'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || blurDataURL || '')
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const {
    ref,
    isIntersecting,
    hasIntersected,
    isLoaded,
    hasError,
    imgRef
  } = useLazyImage({
    src,
    alt,
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
    onLoad: () => {
      setIsImageLoaded(true)
      onLoad?.()
    },
    onError: () => {
      // Try to load a fallback image or show error state
      if (placeholder && imageSrc !== placeholder) {
        setImageSrc(placeholder)
      }
      onError?.()
    }
  })

  // For priority images, load immediately
  React.useEffect(() => {
    if (priority && imgRef.current) {
      imgRef.current.src = src
    }
  }, [priority, src])

  const handleImageLoad = () => {
    setIsImageLoaded(true)
    onLoad?.()
  }

  const handleImageError = () => {
    if (placeholder && imageSrc !== placeholder) {
      setImageSrc(placeholder)
    } else {
      onError?.()
    }
  }

  // Generate srcSet for responsive images (simplified)
  const generateSrcSet = () => {
    if (!src || !width) return undefined

    const baseUrl = src.split('?')[0]
    const params = new URLSearchParams(src.split('?')[1] || '')

    return [
      `${baseUrl}?${params}&w=${width}&q=${quality} ${width}w`,
      `${baseUrl}?${params}&w=${Math.round(width * 1.5)}&q=${quality} ${Math.round(width * 1.5)}w`,
      `${baseUrl}?${params}&w=${Math.round(width * 2)}&q=${quality} ${Math.round(width * 2)}w`
    ].join(', ')
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Blur placeholder / Loading state */}
      {(!isLoaded || !isImageLoaded) && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-muted animate-pulse',
            isImageLoaded && 'opacity-0 transition-opacity duration-300'
          )}
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: blurDataURL ? 'blur(10px)' : undefined
          }}
        >
          {!blurDataURL && (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && !placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={hasIntersected ? src : imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        sizes={sizes}
        srcSet={generateSrcSet()}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          isImageLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          objectPosition
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {/* Loading indicator for slow connections */}
      {hasIntersected && !isLoaded && !hasError && (
        <div className="absolute bottom-2 right-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export default LazyImage