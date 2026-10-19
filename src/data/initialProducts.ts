import type { Product } from '../types/product'

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'LEVIX Arc Oversized Trench Coat',
    slug: 'levix-arc-oversized-trench-coat',
    description: 'An architectural silhouette crafted from heavyweight 380 GSM Japanese cotton twill with water-repellent finishing. Features a concealed horn-button placket, storm storm collar, deep welt pockets, and back vent for graceful movement.',
    shortDescription: 'Japanese water-repellent cotton twill trench with architectural drape.',
    sku: 'LVX-OT-001',
    categoryId: 'cat-outerwear',
    categoryName: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 849900, // ₹8,499
    salePrice: 749900, // ₹7,499
    stock: 24,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: false,
    hasVariants: true,
    variants: [
      { id: 'v-001-s', name: 'Charcoal / S', size: 'S', color: 'Charcoal', sku: 'LVX-OT-001-S', stock: 6 },
      { id: 'v-001-m', name: 'Charcoal / M', size: 'M', color: 'Charcoal', sku: 'LVX-OT-001-M', stock: 8 },
      { id: 'v-001-l', name: 'Charcoal / L', size: 'L', color: 'Charcoal', sku: 'LVX-OT-001-L', stock: 7 },
      { id: 'v-001-xl', name: 'Charcoal / XL', size: 'XL', color: 'Charcoal', sku: 'LVX-OT-001-XL', stock: 3 }
    ],
    details: {
      'Composition': '100% Japanese Cotton Twill (380 GSM)',
      'Fit': 'Oversized Relaxed Drop-Shoulder',
      'Hardware': 'Natural Buffalo Horn Buttons',
      'Care': 'Specialist dry clean only'
    },
    seoTitle: 'LEVIX Arc Oversized Trench Coat | Premium Outerwear',
    seoDescription: 'Shop the LEVIX Arc Oversized Trench Coat in Japanese water-repellent cotton twill.',
    createdAt: new Date('2026-09-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-01T10:00:00Z').toISOString()
  },
  {
    id: 'prod-002',
    name: 'Heavyweight Raw French Terry Hoodie',
    slug: 'heavyweight-raw-french-terry-hoodie',
    description: 'Constructed from 480 GSM custom loopback French terry without drawstrings for an uncompromising minimal look. Ribbed side gussets provide natural ease of movement and shape retention over years of wear.',
    shortDescription: '480 GSM loopback cotton hoodie with double-layer crossover hood.',
    sku: 'LVX-HD-002',
    categoryId: 'cat-essentials',
    categoryName: 'Minimal Essentials',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 429900, // ₹4,299
    salePrice: null,
    stock: 45,
    isPublished: true,
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-002-s', name: 'Bone White / S', size: 'S', color: 'Bone White', sku: 'LVX-HD-002-S', stock: 10 },
      { id: 'v-002-m', name: 'Bone White / M', size: 'M', color: 'Bone White', sku: 'LVX-HD-002-M', stock: 15 },
      { id: 'v-002-l', name: 'Bone White / L', size: 'L', color: 'Bone White', sku: 'LVX-HD-002-L', stock: 12 },
      { id: 'v-002-xl', name: 'Bone White / XL', size: 'XL', color: 'Bone White', sku: 'LVX-HD-002-XL', stock: 8 }
    ],
    details: {
      'Composition': '100% Combed Organic Cotton (480 GSM)',
      'Fit': 'Boxy Contemporary Silhouette',
      'Origin': 'Ethically knitted and milled in Portugal',
      'Care': 'Machine wash cold inside out, hang dry'
    },
    seoTitle: 'Heavyweight Raw French Terry Hoodie | LEVIX Essentials',
    seoDescription: 'Premium 480 GSM loopback French terry hoodie with minimal crossover hood.',
    createdAt: new Date('2026-09-05T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-02T10:00:00Z').toISOString()
  },
  {
    id: 'prod-003',
    name: 'Minimal Low-Top Vulcanized Sneaker',
    slug: 'minimal-low-top-vulcanized-sneaker',
    description: 'A timeless silhouette stripped of all exterior branding. Handcrafted with buttery Italian calfskin leather, reinforced waxed cotton laces, and a custom Margom-style natural rubber cupsole.',
    shortDescription: 'Italian calfskin low-top court sneaker with cushioned leather footbed.',
    sku: 'LVX-SN-003',
    categoryId: 'cat-footwear',
    categoryName: 'Footwear',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 699900, // ₹6,999
    salePrice: 629900, // ₹6,299
    stock: 18,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-003-40', name: 'Pristine White / EU 40', size: 'EU 40', color: 'White', sku: 'LVX-SN-003-40', stock: 4 },
      { id: 'v-003-41', name: 'Pristine White / EU 41', size: 'EU 41', color: 'White', sku: 'LVX-SN-003-41', stock: 5 },
      { id: 'v-003-42', name: 'Pristine White / EU 42', size: 'EU 42', color: 'White', sku: 'LVX-SN-003-42', stock: 6 },
      { id: 'v-003-43', name: 'Pristine White / EU 43', size: 'EU 43', color: 'White', sku: 'LVX-SN-003-43', stock: 3 }
    ],
    details: {
      'Upper': 'Full-grain Italian Nappa Calfskin',
      'Lining': 'Breathable calfskin leather lining',
      'Sole': '100% Natural Rubber vulcanized sole',
      'Construction': 'Stitched 360-degree sidewall'
    },
    seoTitle: 'Minimal Low-Top Vulcanized Sneaker | LEVIX Footwear',
    seoDescription: 'Handcrafted Italian calfskin low-top court sneakers.',
    createdAt: new Date('2026-09-08T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-03T10:00:00Z').toISOString()
  },
  {
    id: 'prod-004',
    name: 'Levix Utility Leather Crossbody Pouch',
    slug: 'levix-utility-leather-crossbody-pouch',
    description: 'A modular everyday companion cut from vegetable-tanned 2.2mm Tuscan leather. Features matte gunmetal hardware, an adjustable nylon webbing strap, and an exterior quick-access slot for passports and cards.',
    shortDescription: 'Vegetable-tanned leather modular crossbody bag with waterproof zip.',
    sku: 'LVX-AC-004',
    categoryId: 'cat-accessories',
    categoryName: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 349900, // ₹3,499
    salePrice: null,
    stock: 30,
    isPublished: true,
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    hasVariants: false,
    details: {
      'Material': 'Full-grain Vegetable-tanned Tuscan Leather',
      'Zippers': 'YKK Excella matte black metal zipper',
      'Dimensions': '21cm x 15cm x 5cm',
      'Strap Drop': 'Adjustable 40cm - 70cm'
    },
    seoTitle: 'Utility Leather Crossbody Pouch | LEVIX Accessories',
    seoDescription: 'Full-grain vegetable-tanned leather crossbody pouch with modular strap.',
    createdAt: new Date('2026-09-10T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T10:00:00Z').toISOString()
  },
  {
    id: 'prod-005',
    name: '300 GSM Heavyweight Relaxed Tee',
    slug: '300-gsm-heavyweight-relaxed-tee',
    description: 'The definitive everyday t-shirt. Milled from combed 300 GSM long-staple cotton with a dense handfeel that refuses to cling. Tailored with a thick 1.25" bound collar that stays flat wash after wash.',
    shortDescription: 'Heavyweight 300 GSM combed cotton t-shirt with seamless bound collar.',
    sku: 'LVX-TS-005',
    categoryId: 'cat-essentials',
    categoryName: 'Minimal Essentials',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 189900, // ₹1,899
    salePrice: 159900, // ₹1,599
    stock: 60,
    isPublished: true,
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-005-s', name: 'Charcoal / S', size: 'S', color: 'Charcoal', sku: 'LVX-TS-005-S', stock: 15 },
      { id: 'v-005-m', name: 'Charcoal / M', size: 'M', color: 'Charcoal', sku: 'LVX-TS-005-M', stock: 20 },
      { id: 'v-005-l', name: 'Charcoal / L', size: 'L', color: 'Charcoal', sku: 'LVX-TS-005-L', stock: 15 },
      { id: 'v-005-xl', name: 'Charcoal / XL', size: 'XL', color: 'Charcoal', sku: 'LVX-TS-005-XL', stock: 10 }
    ],
    details: {
      'Fabric': '100% Long-Staple Combed Cotton (300 GSM)',
      'Pre-shrunk': 'Sanforized to minimize post-wash shrinkage (<1%)',
      'Collar': '1.25" 1x1 rib knit binding',
      'Fit': 'Relaxed, drop shoulder boxy cut'
    },
    seoTitle: '300 GSM Heavyweight Relaxed Tee | LEVIX Essentials',
    seoDescription: 'Ultra-durable 300 GSM cotton t-shirt with structured collar and drop-shoulder fit.',
    createdAt: new Date('2026-09-12T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-05T10:00:00Z').toISOString()
  },
  {
    id: 'prod-006',
    name: 'Structured 6-Panel Twill Cap',
    slug: 'structured-6-panel-twill-cap',
    description: 'Precision engineered from heavy brushed cotton twill. Features an understated tonal LEVIX crest embroidery, antique brass sliding buckle strap, and reinforced buckram front panels.',
    shortDescription: 'Brushed cotton twill cap with brass clasp and tonal minimal embroidery.',
    sku: 'LVX-CP-006',
    categoryId: 'cat-headwear',
    categoryName: 'Headwear',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 149900, // ₹1,499
    salePrice: null,
    stock: 40,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: false,
    hasVariants: false,
    details: {
      'Material': '100% Brushed Cotton Chino Twill',
      'Closure': 'Self-fabric strap with antique brass buckle',
      'Profile': 'Mid-crown structured fit',
      'Size': 'One size fits most (54-60cm)'
    },
    seoTitle: 'Structured 6-Panel Twill Cap | LEVIX Headwear',
    seoDescription: 'Premium brushed cotton 6-panel cap with antique brass hardware.',
    createdAt: new Date('2026-09-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-06T10:00:00Z').toISOString()
  },
  {
    id: 'prod-007',
    name: 'Levix Studio Technical Coach Jacket',
    slug: 'levix-studio-technical-coach-jacket',
    description: 'A modern reimagining of the classic sideline silhouette. Engineered in windproof matte micro-ripstop with an interior cupro lining, dual zip hand pockets, and custom LEVIX engraved snap closures.',
    shortDescription: 'Windproof micro-ripstop coach jacket with cupro lining.',
    sku: 'LVX-JK-007',
    categoryId: 'cat-outerwear',
    categoryName: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 549900, // ₹5,499
    salePrice: 479900, // ₹4,799
    stock: 20,
    isPublished: true,
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    hasVariants: true,
    variants: [
      { id: 'v-007-s', name: 'Pitch Black / S', size: 'S', color: 'Black', sku: 'LVX-JK-007-S', stock: 4 },
      { id: 'v-007-m', name: 'Pitch Black / M', size: 'M', color: 'Black', sku: 'LVX-JK-007-M', stock: 8 },
      { id: 'v-007-l', name: 'Pitch Black / L', size: 'L', color: 'Black', sku: 'LVX-JK-007-L', stock: 5 },
      { id: 'v-007-xl', name: 'Pitch Black / XL', size: 'XL', color: 'Black', sku: 'LVX-JK-007-XL', stock: 3 }
    ],
    details: {
      'Shell': '100% Recycled Technical Micro-Ripstop',
      'Lining': '100% Breathable Cupro',
      'Pockets': 'Dual side hand-warmer zip pockets + 1 interior passport welt',
      'Closure': 'Powder-coated matte metal snap closures'
    },
    seoTitle: 'Technical Coach Jacket | LEVIX Outerwear',
    seoDescription: 'Matte technical coach jacket with cupro lining and windproof finish.',
    createdAt: new Date('2026-09-18T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-07T10:00:00Z').toISOString()
  },
  {
    id: 'prod-008',
    name: 'Full-Grain Slim Cardholder',
    slug: 'full-grain-slim-cardholder',
    description: 'Sleek, pocket-friendly design featuring 4 card slots and a central bill compartment. Beveled hand-painted edges and burnished seams deliver supreme longevity and a rich patina over time.',
    shortDescription: 'Tuscan vegetable-tanned leather card wallet with 5 functional slots.',
    sku: 'LVX-WL-008',
    categoryId: 'cat-accessories',
    categoryName: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 129900, // ₹1,299
    salePrice: null,
    stock: 50,
    isPublished: true,
    isFeatured: false,
    isNewArrival: false,
    isBestseller: true,
    hasVariants: false,
    details: {
      'Leather': '100% Full-grain Buttero Vegetable Tanned Leather',
      'Capacity': 'Comfortably holds 6-8 cards plus folded cash notes',
      'Dimensions': '10.2cm x 7.3cm x 0.4cm',
      'Finishing': 'Hand-beveled and beeswax burnished edges'
    },
    seoTitle: 'Full-Grain Slim Cardholder | LEVIX Leather Goods',
    seoDescription: 'Compact full-grain leather wallet hand-finished in vegetable-tanned leather.',
    createdAt: new Date('2026-09-20T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-08T10:00:00Z').toISOString()
  },
  {
    id: 'prod-009',
    name: 'LEVIX Raw-Edge Overlength Curved Hem Tee',
    slug: 'levix-raw-edge-overlength-curved-hem-tee',
    description: 'Engineered with an elongated curved back hem and raw-cut cuffs for an effortlessly layered aesthetic. Made from 260 GSM combed cotton that retains structure wash after wash.',
    shortDescription: '260 GSM combed cotton elongated tee with curved hem and raw-edge cuffs.',
    sku: 'LVX-OT-009',
    categoryId: 'cat-overlength-t-shirts',
    categoryName: 'Overlength T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80'
    ],
    colorImages: {
      'Vintage White': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
      'Washed Charcoal': 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80',
      'Pitch Black': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80',
    },
    price: 189900, // ₹1,899
    salePrice: 159900, // ₹1,599
    stock: 75,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-009-w-s', name: 'Vintage White / S', size: 'S', color: 'Vintage White', sku: 'LVX-OT-009-WHT-S', stock: 8, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-009-w-m', name: 'Vintage White / M', size: 'M', color: 'Vintage White', sku: 'LVX-OT-009-WHT-M', stock: 12, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-009-w-l', name: 'Vintage White / L', size: 'L', color: 'Vintage White', sku: 'LVX-OT-009-WHT-L', stock: 10, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-009-c-s', name: 'Washed Charcoal / S', size: 'S', color: 'Washed Charcoal', sku: 'LVX-OT-009-CHR-S', stock: 7, imageUrl: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-009-c-m', name: 'Washed Charcoal / M', size: 'M', color: 'Washed Charcoal', sku: 'LVX-OT-009-CHR-M', stock: 11, imageUrl: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-009-c-l', name: 'Washed Charcoal / L', size: 'L', color: 'Washed Charcoal', sku: 'LVX-OT-009-CHR-L', stock: 8, imageUrl: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-009-b-s', name: 'Pitch Black / S', size: 'S', color: 'Pitch Black', sku: 'LVX-OT-009-BLK-S', stock: 6, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-009-b-m', name: 'Pitch Black / M', size: 'M', color: 'Pitch Black', sku: 'LVX-OT-009-BLK-M', stock: 10, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-009-b-l', name: 'Pitch Black / L', size: 'L', color: 'Pitch Black', sku: 'LVX-OT-009-BLK-L', stock: 7, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80' },
    ],
    details: {
      'Composition': '100% Combed Compact Cotton (260 GSM)',
      'Fit': 'Overlength Elongated Cut with Curved Hem',
      'Finish': 'Silicone enzyme wash for peach-soft touch',
      'Care': 'Machine wash cold, air dry'
    },
    seoTitle: 'LEVIX Raw-Edge Overlength Curved Hem Tee',
    seoDescription: 'Premium overlength heavyweight cotton tee with curved hemline and raw edge details.',
    createdAt: new Date('2026-10-10T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-10T10:00:00Z').toISOString()
  },
  {
    id: 'prod-010',
    name: 'LEVIX Elongated Split-Hem Heavyweight Tee',
    slug: 'levix-elongated-split-hem-heavyweight-tee',
    description: 'Modern extended length silhouette with reinforced side split seams. Tailored drop shoulders and high-density 280 GSM organic cotton knit.',
    shortDescription: '280 GSM split-hem overlength tee designed for contemporary layering.',
    sku: 'LVX-OT-010',
    categoryId: 'cat-overlength-t-shirts',
    categoryName: 'Overlength T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 219900, // ₹2,199
    salePrice: null,
    stock: 28,
    isPublished: true,
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    hasVariants: true,
    variants: [
      { id: 'v-010-s', name: 'Charcoal / S', size: 'S', color: 'Charcoal', sku: 'LVX-OT-010-S', stock: 7 },
      { id: 'v-010-m', name: 'Charcoal / M', size: 'M', color: 'Charcoal', sku: 'LVX-OT-010-M', stock: 9 },
      { id: 'v-010-l', name: 'Charcoal / L', size: 'L', color: 'Charcoal', sku: 'LVX-OT-010-L', stock: 8 },
      { id: 'v-010-xl', name: 'Charcoal / XL', size: 'XL', color: 'Charcoal', sku: 'LVX-OT-010-XL', stock: 4 }
    ],
    details: {
      'Composition': '100% Organic Ring-Spun Cotton (280 GSM)',
      'Fit': 'Extended Length with 4-inch Side Splits',
      'Collar': 'High-density 1x1 rib collar that never sags',
      'Care': 'Machine wash cold inside out'
    },
    seoTitle: 'LEVIX Elongated Split-Hem Heavyweight Tee',
    seoDescription: 'Heavyweight 280 GSM elongated split-hem t-shirt for luxury layering.',
    createdAt: new Date('2026-10-11T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-11T10:00:00Z').toISOString()
  },
  {
    id: 'prod-011',
    name: 'LEVIX Mineral Acid Wash Vintage Boxy Tee',
    slug: 'levix-mineral-acid-wash-vintage-boxy-tee',
    description: 'Individually garment-dyed and mineral acid washed for an authentic 90s vintage finish. Every piece possesses a unique washed patina and broken-in hand feel.',
    shortDescription: 'Garment-dyed mineral acid wash tee with distinct weathered visual texture.',
    sku: 'LVX-AW-011',
    categoryId: 'cat-acid-wash-t-shirts',
    categoryName: 'Acid Wash T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80'
    ],
    colorImages: {
      'Acid Slate': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
      'Mineral Charcoal': 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1200&q=80',
      'Washed Olive': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80',
    },
    price: 229900, // ₹2,299
    salePrice: 199900, // ₹1,999
    stock: 60,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-011-s-s', name: 'Acid Slate / S', size: 'S', color: 'Acid Slate', sku: 'LVX-AW-011-SLT-S', stock: 10, imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-011-s-m', name: 'Acid Slate / M', size: 'M', color: 'Acid Slate', sku: 'LVX-AW-011-SLT-M', stock: 14, imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-011-s-l', name: 'Acid Slate / L', size: 'L', color: 'Acid Slate', sku: 'LVX-AW-011-SLT-L', stock: 11, imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-011-c-s', name: 'Mineral Charcoal / S', size: 'S', color: 'Mineral Charcoal', sku: 'LVX-AW-011-CHR-S', stock: 8, imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-011-c-m', name: 'Mineral Charcoal / M', size: 'M', color: 'Mineral Charcoal', sku: 'LVX-AW-011-CHR-M', stock: 12, imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-011-c-l', name: 'Mineral Charcoal / L', size: 'L', color: 'Mineral Charcoal', sku: 'LVX-AW-011-CHR-L', stock: 9, imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-011-o-s', name: 'Washed Olive / S', size: 'S', color: 'Washed Olive', sku: 'LVX-AW-011-OLV-S', stock: 6, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80' },
      { id: 'v-011-o-m', name: 'Washed Olive / M', size: 'M', color: 'Washed Olive', sku: 'LVX-AW-011-OLV-M', stock: 8, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80' },
    ],
    details: {
      'Fabric': '100% Pre-Shrunk Heavy Cotton (290 GSM)',
      'Processing': 'Artisanal Mineral Wash & Acid Crystal Treatment',
      'Collar': 'Reinforced crew neck with twin-needle finish',
      'Care': 'Wash separately with dark colors'
    },
    seoTitle: 'LEVIX Mineral Acid Wash Vintage Boxy Tee',
    seoDescription: 'Handcrafted acid wash streetwear t-shirt with boxy silhouette and vintage patina.',
    createdAt: new Date('2026-10-12T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-12T10:00:00Z').toISOString()
  },
  {
    id: 'prod-012',
    name: 'LEVIX Smoke Grey Distressed Acid Wash Tee',
    slug: 'levix-smoke-grey-distressed-acid-wash-tee',
    description: 'Heavy 300 GSM cotton tee subjected to a double acid rinse and subtle micro-abrasion along the collar and hemline. Substantial heavyweight drape.',
    shortDescription: 'Double acid rinsed heavyweight 300 GSM vintage tee with distressed details.',
    sku: 'LVX-AW-012',
    categoryId: 'cat-acid-wash-t-shirts',
    categoryName: 'Acid Wash T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 249900, // ₹2,499
    salePrice: null,
    stock: 30,
    isPublished: true,
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    hasVariants: true,
    variants: [
      { id: 'v-012-s', name: 'Smoke Grey / S', size: 'S', color: 'Grey', sku: 'LVX-AW-012-S', stock: 6 },
      { id: 'v-012-m', name: 'Smoke Grey / M', size: 'M', color: 'Grey', sku: 'LVX-AW-012-M', stock: 12 },
      { id: 'v-012-l', name: 'Smoke Grey / L', size: 'L', color: 'Grey', sku: 'LVX-AW-012-L', stock: 8 },
      { id: 'v-012-xl', name: 'Smoke Grey / XL', size: 'XL', color: 'Grey', sku: 'LVX-AW-012-XL', stock: 4 }
    ],
    details: {
      'Fabric': '100% Combed Cotton (300 GSM)',
      'Fit': 'Oversized Boxy Dropped Shoulder',
      'Finish': 'Double Acid Stone Bath Wash',
      'Care': 'Gentle cold cycle'
    },
    seoTitle: 'LEVIX Smoke Grey Distressed Acid Wash Tee',
    seoDescription: 'Heavy 300 GSM distressed acid wash tee in smoke grey tone.',
    createdAt: new Date('2026-10-12T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-12T10:00:00Z').toISOString()
  },
  {
    id: 'prod-013',
    name: 'LEVIX Thermal Waffle Boxyfit Long Sleeve',
    slug: 'levix-thermal-waffle-boxyfit-long-sleeve',
    description: 'Knitted from 340 GSM heavy thermal honeycombed waffle knit. Features an exaggerated dropped shoulder, boxy body width, and ribbed snug cuffs.',
    shortDescription: '340 GSM thermal honeycomb waffle long-sleeve tee with boxy dropped cut.',
    sku: 'LVX-WF-013',
    categoryId: 'cat-waffle-boxyfit',
    categoryName: 'Waffle Boxyfits Full Sleeves',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 279900, // ₹2,799
    salePrice: 249900, // ₹2,499
    stock: 25,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-013-s', name: 'Off-White / S', size: 'S', color: 'Off-White', sku: 'LVX-WF-013-S', stock: 6 },
      { id: 'v-013-m', name: 'Off-White / M', size: 'M', color: 'Off-White', sku: 'LVX-WF-013-M', stock: 10 },
      { id: 'v-013-l', name: 'Off-White / L', size: 'L', color: 'Off-White', sku: 'LVX-WF-013-L', stock: 6 },
      { id: 'v-013-xl', name: 'Off-White / XL', size: 'XL', color: 'Off-White', sku: 'LVX-WF-013-XL', stock: 3 }
    ],
    details: {
      'Knit': '100% Thermal Honeycomb Cotton (340 GSM)',
      'Silhouette': 'Modern Boxy Fit with Full Length Sleeves',
      'Cuffs': '2x2 Heavy Elastane-Reinforced Cuffs',
      'Care': 'Hand wash cold or gentle cycle'
    },
    seoTitle: 'LEVIX Thermal Waffle Boxyfit Long Sleeve',
    seoDescription: 'Heavy honeycomb waffle knit boxy full-sleeve t-shirt by LEVIX.',
    createdAt: new Date('2026-10-13T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-13T10:00:00Z').toISOString()
  },
  {
    id: 'prod-014',
    name: 'LEVIX Midnight Ribbed Waffle Crew Long Sleeve',
    slug: 'levix-midnight-ribbed-waffle-crew-long-sleeve',
    description: 'Deep textured micro-waffle weave with thermal temperature-regulating cotton fibers. Finished with double-stitched flatlock seams for durability.',
    shortDescription: 'Thermal micro-waffle full sleeve tee in pitch black with flatlock seams.',
    sku: 'LVX-WF-014',
    categoryId: 'cat-waffle-boxyfit',
    categoryName: 'Waffle Boxyfits Full Sleeves',
    images: [
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 299900, // ₹2,999
    salePrice: null,
    stock: 20,
    isPublished: true,
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    hasVariants: true,
    variants: [
      { id: 'v-014-s', name: 'Pitch Black / S', size: 'S', color: 'Black', sku: 'LVX-WF-014-S', stock: 5 },
      { id: 'v-014-m', name: 'Pitch Black / M', size: 'M', color: 'Black', sku: 'LVX-WF-014-M', stock: 8 },
      { id: 'v-014-l', name: 'Pitch Black / L', size: 'L', color: 'Black', sku: 'LVX-WF-014-L', stock: 5 },
      { id: 'v-014-xl', name: 'Pitch Black / XL', size: 'XL', color: 'Black', sku: 'LVX-WF-014-XL', stock: 2 }
    ],
    details: {
      'Knit': 'Heavy Cotton-Rich Micro Waffle (360 GSM)',
      'Fit': 'Structured Boxy Drop-Shoulder',
      'Seams': '4-thread flatlock anti-chafing construction',
      'Care': 'Machine wash cold'
    },
    seoTitle: 'LEVIX Midnight Ribbed Waffle Crew Long Sleeve',
    seoDescription: 'Pitch black heavy waffle long-sleeve boxy tee with ribbed cuffs.',
    createdAt: new Date('2026-10-13T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-13T10:00:00Z').toISOString()
  },
  {
    id: 'prod-015',
    name: 'LEVIX Monolith Heavyweight Fleece Hoodie',
    slug: 'levix-monolith-heavyweight-fleece-hoodie',
    description: 'Luxurious 500 GSM loopback cotton fleece engineered without drawstrings. Clean crossover hood neckline, concealed kangaroo pouch, and snug ribbed hem.',
    shortDescription: '500 GSM luxury loopback cotton hoodie with double-layer seamless hood.',
    sku: 'LVX-HD-015',
    categoryId: 'cat-hoodies',
    categoryName: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 449900, // ₹4,499
    salePrice: 399900, // ₹3,999
    stock: 32,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-015-s', name: 'Jet Black / S', size: 'S', color: 'Black', sku: 'LVX-HD-015-S', stock: 7 },
      { id: 'v-015-m', name: 'Jet Black / M', size: 'M', color: 'Black', sku: 'LVX-HD-015-M', stock: 12 },
      { id: 'v-015-l', name: 'Jet Black / L', size: 'L', color: 'Black', sku: 'LVX-HD-015-L', stock: 9 },
      { id: 'v-015-xl', name: 'Jet Black / XL', size: 'XL', color: 'Black', sku: 'LVX-HD-015-XL', stock: 4 }
    ],
    details: {
      'Fleece': '100% Combed Organic Cotton (500 GSM)',
      'Hood': 'Double-layer structured crossover hood without cords',
      'Pockets': 'Integrated seamless bar-tacked kangaroo pocket',
      'Care': 'Machine wash cold inside out, dry flat'
    },
    seoTitle: 'LEVIX Monolith Heavyweight Fleece Hoodie',
    seoDescription: 'Architectural 500 GSM heavyweight cotton hoodie in Jet Black.',
    createdAt: new Date('2026-10-14T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-14T10:00:00Z').toISOString()
  },
  {
    id: 'prod-016',
    name: 'LEVIX Structured Poplin Relaxed Overshirt',
    slug: 'levix-structured-poplin-relaxed-overshirt',
    description: 'Tailored from high-density crisp poplin cotton with a clean modern box placket, spread collar, and chest utility pocket. Ideal as an overshirt or standalone button-down.',
    shortDescription: 'High-density poplin overshirt with box placket and clean chest pocket.',
    sku: 'LVX-SH-016',
    categoryId: 'cat-shirts',
    categoryName: 'Shirts',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 349900, // ₹3,499
    salePrice: 299900, // ₹2,999
    stock: 22,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: false,
    hasVariants: true,
    variants: [
      { id: 'v-016-s', name: 'Crisp White / S', size: 'S', color: 'White', sku: 'LVX-SH-016-S', stock: 5 },
      { id: 'v-016-m', name: 'Crisp White / M', size: 'M', color: 'White', sku: 'LVX-SH-016-M', stock: 9 },
      { id: 'v-016-l', name: 'Crisp White / L', size: 'L', color: 'White', sku: 'LVX-SH-016-L', stock: 5 },
      { id: 'v-016-xl', name: 'Crisp White / XL', size: 'XL', color: 'White', sku: 'LVX-SH-016-XL', stock: 3 }
    ],
    details: {
      'Cloth': '100% Long-Staple Egyptian Cotton Poplin (180 GSM)',
      'Hardware': 'Natural Mother-of-Pearl buttons',
      'Fit': 'Contemporary Relaxed Boxy Cut',
      'Care': 'Machine wash cold, warm iron'
    },
    seoTitle: 'LEVIX Structured Poplin Relaxed Overshirt',
    seoDescription: 'Crisp long-staple cotton poplin overshirt with architectural box cut.',
    createdAt: new Date('2026-10-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-15T10:00:00Z').toISOString()
  },
  {
    id: 'prod-017',
    name: 'LEVIX Camp Collar Linen-Cotton Shirt',
    slug: 'levix-camp-collar-linen-cotton-shirt',
    description: 'Breathable 55% French linen and 45% organic cotton blend. Features a retro-inspired camp collar, straight hem with side vents, and pearlized buttons.',
    shortDescription: 'French linen-cotton camp collar shirt with breathable weave.',
    sku: 'LVX-SH-017',
    categoryId: 'cat-shirts',
    categoryName: 'Shirts',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 319900, // ₹3,199
    salePrice: null,
    stock: 18,
    isPublished: true,
    isFeatured: false,
    isNewArrival: false,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-017-s', name: 'Natural Ecru / S', size: 'S', color: 'Ecru', sku: 'LVX-SH-017-S', stock: 4 },
      { id: 'v-017-m', name: 'Natural Ecru / M', size: 'M', color: 'Ecru', sku: 'LVX-SH-017-M', stock: 7 },
      { id: 'v-017-l', name: 'Natural Ecru / L', size: 'L', color: 'Ecru', sku: 'LVX-SH-017-L', stock: 5 },
      { id: 'v-017-xl', name: 'Natural Ecru / XL', size: 'XL', color: 'Ecru', sku: 'LVX-SH-017-XL', stock: 2 }
    ],
    details: {
      'Composition': '55% Normandy Linen, 45% Organic Cotton',
      'Collar': 'Cuban / Camp Notch Lapel Collar',
      'Hem': 'Straight hem with side seam slits',
      'Care': 'Gentle wash, line dry'
    },
    seoTitle: 'LEVIX Camp Collar Linen-Cotton Shirt',
    seoDescription: 'Summer luxury camp collar relaxed shirt in organic linen-cotton blend.',
    createdAt: new Date('2026-10-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-15T10:00:00Z').toISOString()
  },
  {
    id: 'prod-018',
    name: 'LEVIX Pleated Wide-Leg Tailored Trousers',
    slug: 'levix-pleated-wide-leg-tailored-trousers',
    description: 'Double forward-pleated silhouette cut with a relaxed high rise and clean fluid drape through the leg. Features side adjusters and concealed hook-and-bar closure.',
    shortDescription: 'High-waisted double pleated wide leg trousers with fluid drape.',
    sku: 'LVX-PT-018',
    categoryId: 'cat-pants',
    categoryName: 'Pants',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 419900, // ₹4,199
    salePrice: 369900, // ₹3,699
    stock: 26,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-018-30', name: 'Charcoal / 30', size: '30', color: 'Charcoal', sku: 'LVX-PT-018-30', stock: 6 },
      { id: 'v-018-32', name: 'Charcoal / 32', size: '32', color: 'Charcoal', sku: 'LVX-PT-018-32', stock: 10 },
      { id: 'v-018-34', name: 'Charcoal / 34', size: '34', color: 'Charcoal', sku: 'LVX-PT-018-34', stock: 7 },
      { id: 'v-018-36', name: 'Charcoal / 36', size: '36', color: 'Charcoal', sku: 'LVX-PT-018-36', stock: 3 }
    ],
    details: {
      'Cloth': '65% Wool, 35% Recycled Poly Twill (310 GSM)',
      'Rise': 'High Rise with Double Inverted Pleats',
      'Waistband': 'Internal curtain waistband with adjustable side tabs',
      'Care': 'Dry clean recommended'
    },
    seoTitle: 'LEVIX Pleated Wide-Leg Tailored Trousers',
    seoDescription: 'Wide leg pleated tailored trousers in wool twill by LEVIX.',
    createdAt: new Date('2026-10-16T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-16T10:00:00Z').toISOString()
  },
  {
    id: 'prod-019',
    name: 'LEVIX Heavy Canvas Relaxed Carpenter Pants',
    slug: 'levix-heavy-canvas-relaxed-carpenter-pants',
    description: 'Crafted from 12 oz heavy-duty duck cotton canvas. Features utilitarian tool pockets, hammer loop, reinforced knee panels, and triple-needle chain stitching.',
    shortDescription: '12 oz heavy duck canvas carpenter pants with reinforced double knees.',
    sku: 'LVX-PT-019',
    categoryId: 'cat-pants',
    categoryName: 'Pants',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 389900, // ₹3,899
    salePrice: null,
    stock: 24,
    isPublished: true,
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    hasVariants: true,
    variants: [
      { id: 'v-019-30', name: 'Washed Black / 30', size: '30', color: 'Washed Black', sku: 'LVX-PT-019-30', stock: 6 },
      { id: 'v-019-32', name: 'Washed Black / 32', size: '32', color: 'Washed Black', sku: 'LVX-PT-019-32', stock: 9 },
      { id: 'v-019-34', name: 'Washed Black / 34', size: '34', color: 'Washed Black', sku: 'LVX-PT-019-34', stock: 6 },
      { id: 'v-019-36', name: 'Washed Black / 36', size: '36', color: 'Washed Black', sku: 'LVX-PT-019-36', stock: 3 }
    ],
    details: {
      'Canvas': '100% Heavy Duck Cotton Canvas (12 oz)',
      'Fit': 'Relaxed Straight Utility Leg',
      'Details': 'Double knee panels with clean rivet reinforcement',
      'Care': 'Machine wash cold inside out'
    },
    seoTitle: 'LEVIX Heavy Canvas Relaxed Carpenter Pants',
    seoDescription: 'Workwear-inspired 12 oz heavy canvas double knee carpenter trousers.',
    createdAt: new Date('2026-10-16T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-16T10:00:00Z').toISOString()
  },
  {
    id: 'prod-020',
    name: 'LEVIX Minimalist Zip-Through Blouson Jacket',
    slug: 'levix-minimalist-zip-through-blouson-jacket',
    description: 'Precision-tailored blouson in water-resistant matte twill. Features a two-way brushed silver YKK zipper, stand collar, tailored welt pockets, and clean elasticated hem.',
    shortDescription: 'Matte water-resistant twill blouson jacket with two-way silver zipper.',
    sku: 'LVX-JK-020',
    categoryId: 'cat-jackets',
    categoryName: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 649900, // ₹6,499
    salePrice: 549900, // ₹5,499
    stock: 15,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-020-s', name: 'Matte Black / S', size: 'S', color: 'Black', sku: 'LVX-JK-020-S', stock: 3 },
      { id: 'v-020-m', name: 'Matte Black / M', size: 'M', color: 'Black', sku: 'LVX-JK-020-M', stock: 6 },
      { id: 'v-020-l', name: 'Matte Black / L', size: 'L', color: 'Black', sku: 'LVX-JK-020-L', stock: 4 },
      { id: 'v-020-xl', name: 'Matte Black / XL', size: 'XL', color: 'Black', sku: 'LVX-JK-020-XL', stock: 2 }
    ],
    details: {
      'Shell': 'Weatherproof High-Density Polyester-Cotton Matte Twill',
      'Lining': 'Silky Breathable Cupro Lining',
      'Hardware': 'Two-way custom engraved brushed metal zipper',
      'Care': 'Dry clean only'
    },
    seoTitle: 'LEVIX Minimalist Zip-Through Blouson Jacket',
    seoDescription: 'Clean zip blouson jacket in matte water-resistant twill.',
    createdAt: new Date('2026-10-17T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-17T10:00:00Z').toISOString()
  },
  {
    id: 'prod-021',
    name: 'LEVIX Heavy Wool-Blend Boxy Chore Jacket',
    slug: 'levix-heavy-wool-blend-boxy-chore-jacket',
    description: 'Constructed from a premium 420 GSM recycled wool blend. Features 3 deep patch pockets, point collar, and custom engraved matte buttons in a structured workwear cut.',
    shortDescription: '420 GSM wool blend chore jacket with 3 functional patch pockets.',
    sku: 'LVX-JK-021',
    categoryId: 'cat-jackets',
    categoryName: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 729900, // ₹7,299
    salePrice: null,
    stock: 14,
    isPublished: true,
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    hasVariants: true,
    variants: [
      { id: 'v-021-s', name: 'Dark Espresso / S', size: 'S', color: 'Espresso', sku: 'LVX-JK-021-S', stock: 3 },
      { id: 'v-021-m', name: 'Dark Espresso / M', size: 'M', color: 'Espresso', sku: 'LVX-JK-021-M', stock: 5 },
      { id: 'v-021-l', name: 'Dark Espresso / L', size: 'L', color: 'Espresso', sku: 'LVX-JK-021-L', stock: 4 },
      { id: 'v-021-xl', name: 'Dark Espresso / XL', size: 'XL', color: 'Espresso', sku: 'LVX-JK-021-XL', stock: 2 }
    ],
    details: {
      'Composition': '70% Recycled Wool, 30% Polyamide (420 GSM)',
      'Pockets': 'Dual waist patch pockets + single chest utility pocket',
      'Buttons': 'Natural Horn buttons with cross-stitching',
      'Care': 'Specialist dry clean'
    },
    seoTitle: 'LEVIX Heavy Wool-Blend Boxy Chore Jacket',
    seoDescription: 'Heavy 420 GSM wool chore jacket in dark espresso tone.',
    createdAt: new Date('2026-10-17T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-17T10:00:00Z').toISOString()
  },
  {
    id: 'prod-022',
    name: 'LEVIX Signature 300 GSM Heavyweight Tee',
    slug: 'levix-signature-300-gsm-heavyweight-tee',
    description: 'The foundation of the LEVIX wardrobe. 300 GSM combed French cotton knit with a tailored drop shoulder and high collar that sits cleanly without collapsing.',
    shortDescription: 'Signature 300 GSM compact combed cotton oversized basic tee.',
    sku: 'LVX-TS-022',
    categoryId: 'cat-t-shirts',
    categoryName: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80'
    ],
    price: 199900, // ₹1,999
    salePrice: null,
    stock: 50,
    isPublished: true,
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    hasVariants: true,
    variants: [
      { id: 'v-022-s', name: 'Bone White / S', size: 'S', color: 'Bone White', sku: 'LVX-TS-022-S', stock: 12 },
      { id: 'v-022-m', name: 'Bone White / M', size: 'M', color: 'Bone White', sku: 'LVX-TS-022-M', stock: 18 },
      { id: 'v-022-l', name: 'Bone White / L', size: 'L', color: 'Bone White', sku: 'LVX-TS-022-L', stock: 14 },
      { id: 'v-022-xl', name: 'Bone White / XL', size: 'XL', color: 'Bone White', sku: 'LVX-TS-022-XL', stock: 6 }
    ],
    details: {
      'Composition': '100% Combed Compact Cotton (300 GSM)',
      'Fit': 'Oversized Boxy Silhouette with Drop Shoulder',
      'Collar': '1.25" High-density ribbed crewneck',
      'Care': 'Machine wash cold, air dry'
    },
    seoTitle: 'LEVIX Signature 300 GSM Heavyweight Tee',
    seoDescription: 'Signature luxury heavyweight basic tee by LEVIX.',
    createdAt: new Date('2026-10-18T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-18T10:00:00Z').toISOString()
  }
]
