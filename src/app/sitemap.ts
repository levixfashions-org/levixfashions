import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thelevix.com';

  // 1. Static Core Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shipping-returns`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Dynamic Categories
  const categoryRoutes: MetadataRoute.Sitemap = [
    'waffle-oversized',
    'boxy-fit',
    'full-sleeve-oversized',
    'acid-wash',
  ].map((slug) => ({
    url: `${baseUrl}/shop?category=${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Dynamic Products from Database
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    if (prisma?.product?.findMany) {
      const products = await prisma.product.findMany({
        where: { deletedAt: null },
        select: { slug: true, updatedAt: true },
      });

      productRoutes = products.map((prod: any) => ({
        url: `${baseUrl}/product/${prod.slug}`,
        lastModified: prod.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error('Failed to generate dynamic product sitemap:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
