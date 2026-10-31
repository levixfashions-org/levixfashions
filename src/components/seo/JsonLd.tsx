import React from 'react';

export interface ProductJsonLdProps {
  name: string;
  description: string;
  images: string[];
  slug: string;
  sku: string;
  pricePaise: number;
  inStock: boolean;
  categoryName: string;
}

export function ProductJsonLd({
  name,
  description,
  images,
  slug,
  sku,
  pricePaise,
  inStock,
  categoryName,
}: ProductJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thelevix.com';
  const priceRupees = (pricePaise / 100).toFixed(2);

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    image: images,
    description,
    sku,
    category: categoryName,
    brand: {
      '@type': 'Brand',
      name: 'LEVIX',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${slug}`,
      priceCurrency: 'INR',
      price: priceRupees,
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'LEVIX',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thelevix.com';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LEVIX',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Premium heavyweight oversized streetwear t-shirts engineered in India.',
    sameAs: [
      'https://www.instagram.com/thelevix',
      'https://twitter.com/thelevix',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@thelevix.com',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
