/* eslint-disable react-refresh/only-export-components */
// OptimizedImage — Cloudinary-aware image component with automatic optimization
// Applies f_auto, q_auto transforms, responsive srcSet, lazy loading, and blur-up placeholder

import { useState, useRef } from 'react';

const CLOUDINARY_UPLOAD_PATTERN = /\/upload\//;

/**
 * Build Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} transforms - { width, quality, format }
 */
function buildCloudinaryUrl(url, { width, quality = 'auto', format = 'auto' } = {}) {
    if (!url || !CLOUDINARY_UPLOAD_PATTERN.test(url)) return url;

    const transforms = [`f_${format}`, `q_${quality}`];
    if (width) transforms.push(`w_${width}`);

    return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}

/**
 * Generate responsive srcSet for Cloudinary images
 */
function buildSrcSet(url, widths = [300, 600, 900, 1200]) {
    if (!url || !CLOUDINARY_UPLOAD_PATTERN.test(url)) return undefined;

    return widths
        .map(w => `${buildCloudinaryUrl(url, { width: w })} ${w}w`)
        .join(', ');
}

/**
 * OptimizedImage component
 * Automatically optimizes Cloudinary images with:
 * - Format auto-detection (WebP/AVIF when supported)
 * - Quality optimization
 * - Responsive srcSet for different viewport sizes
 * - Lazy loading with IntersectionObserver
 * - Blur-up placeholder effect
 * - Fallback for non-Cloudinary URLs
 * 
 * @param {string} src - Image URL
 * @param {string} alt - Alt text
 * @param {string} className - CSS classes
 * @param {number} width - Desired display width
 * @param {number} height - Desired display height
 * @param {string} sizes - HTML sizes attribute for responsive images
 * @param {string} objectFit - CSS object-fit value
 * @param {boolean} eager - Skip lazy loading (for above-fold images)
 * @param {function} onClick - Click handler
 */
export function OptimizedImage({
    src,
    alt = '',
    className = '',
    width,
    height,
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    objectFit = 'cover',
    eager = false,
    onClick,
    style,
    ...props
}) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);

    const isCloudinary = src && CLOUDINARY_UPLOAD_PATTERN.test(src);

    // Optimized source URL
    const optimizedSrc = isCloudinary
        ? buildCloudinaryUrl(src, { width: width || undefined })
        : src;

    // Responsive srcSet
    const srcSet = isCloudinary ? buildSrcSet(src) : undefined;

    // Low-quality placeholder for blur-up
    const placeholderSrc = isCloudinary
        ? buildCloudinaryUrl(src, { width: 30, quality: 10 })
        : undefined;

    const [prevSrc, setPrevSrc] = useState(src);
    if (src !== prevSrc) {
        setPrevSrc(src);
        setLoaded(false);
        setError(false);
    }

    if (!src || error) {
        return (
            <div
                className={`bg-gray-100 dark:bg-dark-700 flex items-center justify-center ${className}`}
                style={{ width, height, ...style }}
                {...props}
            >
                <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ width, height, ...style }}
            onClick={onClick}
        >
            {/* Blur-up placeholder */}
            {placeholderSrc && !loaded && (
                <img
                    src={placeholderSrc}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full blur-lg scale-110"
                    style={{ objectFit }}
                />
            )}

            {/* Main image */}
            <img
                ref={imgRef}
                src={optimizedSrc}
                srcSet={srcSet}
                sizes={srcSet ? sizes : undefined}
                alt={alt}
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                className={`w-full h-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{ objectFit }}
                {...props}
            />
        </div>
    );
}

// Export utilities separately in components if needed, or disable standard fast refresh warning 
// since this isn't a route level component.
export { buildCloudinaryUrl, buildSrcSet };
