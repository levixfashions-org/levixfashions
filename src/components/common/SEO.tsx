import React, { useEffect } from 'react'
import type { Product } from '../../types/product'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  product?: Product
  type?: 'website' | 'product'
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'LEVIX — Minimal, premium, contemporary apparel and lifestyle essentials. Engineered for modern retail with unmatched quality.',
  image = 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
  url = window.location.href,
  product,
  type = 'website',
}) => {
  useEffect(() => {
    // Update document title
    const formattedTitle = title ? `${title} | LEVIX` : 'LEVIX | Contemporary Lifestyle & Apparel'
    document.title = formattedTitle

    // Update or create meta tags helper
    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`) as HTMLMetaElement
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, nameOrProperty)
        document.head.appendChild(el)
      }
      el.content = content
    }

    setMeta('description', description)
    setMeta('og:title', formattedTitle, true)
    setMeta('og:description', description, true)
    setMeta('og:image', image, true)
    setMeta('og:url', url, true)
    setMeta('og:type', type === 'product' ? 'product' : 'website', true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', formattedTitle)
    setMeta('twitter:description', description)
    setMeta('twitter:image', image)

    // JSON-LD structured data injection
    const scriptId = 'levix-json-ld'
    let script = document.getElementById(scriptId) as HTMLScriptElement
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    if (product && type === 'product') {
      const priceInRupees = (product.salePrice || product.price) / 100
      script.text = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: 'LEVIX',
        },
        offers: {
          '@type': 'Offer',
          url: window.location.href,
          priceCurrency: 'INR',
          price: priceInRupees,
          availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      })
    } else {
      script.text = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Organization',
        name: 'LEVIX',
        url: window.location.origin,
        logo: `${window.location.origin}/favicon.svg`,
        sameAs: [
          'https://instagram.com/levix.official',
          'https://x.com/levix_official',
        ],
      })
    }
  }, [title, description, image, url, product, type])

  return null
}
