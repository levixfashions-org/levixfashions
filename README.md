# LEVIX — Production-Ready E-Commerce Platform & PWA

**LEVIX** is an e-commerce platform and Progressive Web Application (PWA) crafted with a minimalist, contemporary brand identity. Engineered with heavyweight natural textiles, architectural silhouettes, and pure aesthetic restraint.

---

## 🎨 BRAND IDENTITY & DESIGN SYSTEM

- **Pure White (`#FFFFFF`):** Dominates the entire interface for clean whitespace and gallery-like breathing room.
- **LEVIX Primary Orange (`#E87524`):** Used selectively for Add to Cart, Buy Now, interactive badges, active tabs, and primary CTAs.
- **Orange Hover (`#C85D16`):** Smooth interactive hover state.
- **Dark Charcoal (`#222222`):** Primary headings, product titles, prices, and high-contrast typography.
- **Soft Orange Background (`#FFF5ED`):** Promotional accents, free shipping progress bars, and subtle highlights.
- **Light Border (`#EAEAEA`):** Minimal geometric separation without visual clutter.
- **Subtle Gray (`#F8F8F8`):** Micro-surfaces, tags, and product thumbnail backdrops.
- **Typography:** Inter & Manrope with high readability, balanced line-heights, and responsive scale.

---

## ⚡ TECH STACK

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router v7, Lucide Icons.
- **PWA:** Vite PWA Plugin (`vite-plugin-pwa`), Workbox Service Worker, Web App Manifest, Install Prompt & iOS Safari Add-to-Home guide.
- **Authentication:** Firebase Authentication (Email/Password, Google Sign-In, Password Reset).
- **Database:** Cloud Firestore with strict security rules (`firestore.rules`) and composite indexes (`firestore.indexes.json`).
- **Payments:** Razorpay Online Gateway (UPI, Cards, NetBanking) & Cash on Delivery (COD).
- **Forms & Validation:** React Hook Form + Zod schema validation.
- **Trusted Backend:** Express.js API located in `/server` for server-side trusted price calculation and HMAC-SHA256 signature verification.
- **Hosting:** Hostinger Web Hosting ready with `.htaccess` for Apache SPA rewrites.

---

## 🚀 QUICK START & SCRIPTS

### 1. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies (in /server)
cd server && npm install && cd ..
```

### 2. Run Development Servers
```bash
# Start frontend Vite dev server (runs on http://localhost:5173)
npm run dev

# In a separate terminal, start backend API server (runs on http://localhost:5000)
npm run server:dev
```

### 3. Run Automated Tests
```bash
# Executes unit & integration test suite verifying calculations, HMAC signatures & cart logic
npm test
```

### 4. Build for Production
```bash
# Type checks and builds minified, code-split bundle to /dist
npm run build
```

---

## 📱 KEY FEATURES IMPLEMENTED

1. **Responsive Editorial Homepage:**
   - Configurable Announcement Bar from admin store settings.
   - Editorial Hero Banner with high-resolution photography and primary/secondary CTAs.
   - Dynamic Category Grid with live product counters.
   - Featured Pieces & New Arrivals showcase.
   - Brand Ethos & Studio Tailoring story section.
   - Verified Client Reviews section.

2. **Full Product Catalogue (`/shop` & `/category/:slug`):**
   - Instant search across product names, descriptions, and SKUs.
   - Multi-factor filtering: Category, Price Range slider, and In-Stock Only filter.
   - Sorting options: Featured, Newest Releases, Bestsellers, Price Low-High, Price High-Low.
   - Responsive filter sidebar for desktop and slide-out filter drawer for mobile.

3. **Product Detail Page (`/product/:slug`):**
   - High-res image gallery with interactive thumbnail selector and zoom view.
   - Variant selection (Size, Color) with real-time stock availability.
   - Quantity selector with low-stock warning indicators.
   - Add to Bag & Instant Buy Now (direct to checkout).
   - Wishlist toggle button.
   - Tabbed specifications: Details & Fit, Express Shipping, 7-Day Returns.
   - Related pieces recommendations.

4. **Cart & Slide-Out Bag Drawer (`/cart`):**
   - Live item badge count in header.
   - Real-time Free Shipping progress bar (e.g. "Add ₹499 more for Free Shipping").
   - Promo code validation engine (e.g. `LEVIX10` for 10% discount).
   - Persistent across page reloads via local persistence and user account sync.

5. **Secure Checkout & Order Placement (`/checkout`):**
   - Complete shipping address collection with Zod schema validation.
   - Option to select from saved customer addresses with 1-click.
   - Payment method toggle: Razorpay Online Payment & Cash on Delivery.
   - Server-side trusted calculation in integer paise (never trusts client-calculated totals).
   - Order Confirmation receipt page (`/order-confirmation/:orderId`) with celebratory confetti and tracking link.

6. **Customer Portal (`/account`):**
   - Protected routes guarded by authentication state.
   - Personal profile information and phone number management.
   - Saved Delivery Addresses book (add, edit, delete, set default).
   - Order history with live visual status tracking timeline (Pending -> Confirmed -> Processing -> Shipped -> Delivered).
   - AWB tracking numbers with courier partner links.

7. **Protected Administrator Dashboard (`/admin`):**
   - Secure admin gate requiring verified administrative privilege.
   - Executive Analytics: Paid Revenue in INR, Total Orders, Pending Dispatch count, and Low-Stock SKU alerts.
   - Product Management: Add, edit, delete, publish/draft toggle, feature on home toggle, SKU generator, and variant stock manager.
   - Category Management: Create, edit, and organize seasonal departments.
   - Order Fulfillment Manager: Update fulfillment status, assign courier partner & tracking numbers, record COD payment collection, and add internal audit notes.
   - Store Settings: Configure free shipping thresholds, standard shipping fees, COD toggles, announcement bar text/link, hero banner imagery, and 1-click Firestore database seeding.

8. **Progressive Web Application (PWA):**
   - Web App Manifest (`/manifest.webmanifest`) with LEVIX branding and theme color `#E87524`.
   - Workbox Service Worker caching static assets, Google fonts, and Unsplash images.
   - Native Install banner on Android/Chromium.
   - Guided step-by-step installation modal for iOS Safari users.
   - Offline fallback page (`/offline`) with friendly reconnect button.

9. **Hostinger Production Deployment:**
   - Pre-configured `public/.htaccess` for Apache/LiteSpeed SPA fallback and caching headers.
   - Production documentation in `DEPLOYMENT.md`.

---

## 🔒 SECURITY PRACTICES

- **Integer Paise Money Calculations:** Prevents floating-point rounding errors across all monetary transactions.
- **Server-Side HMAC-SHA256 Verification:** Cryptographically validates Razorpay signatures using private key secrets.
- **Restrictive Firestore Security Rules:** Zero anonymous write access to sensitive collections; customers can only access their own private data.
- **Credentials Isolation:** Secret keys and administrative credentials remain strictly server-side.
