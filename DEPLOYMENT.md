# LEVIX — PRODUCTION DEPLOYMENT & HANDOVER GUIDE

This documentation provides step-by-step instructions for deploying the **LEVIX E-Commerce Platform and PWA** to **Hostinger**, configuring **Firebase Authentication & Cloud Firestore**, setting up **Razorpay Payment Gateway**, and verifying **PWA installation**.

---

## 1. ARCHITECTURE OVERVIEW

LEVIX is architected into two decoupled tiers:

1. **Frontend Client & PWA (Hostinger Web Hosting)**:
   - High-performance Vite + React + TypeScript Single Page Application (SPA).
   - Installable Progressive Web App (PWA) with Workbox offline precaching, Service Worker, and Web Manifest.
   - Tailored minimalist luxury design system using brand colors:
     - Pure White: `#FFFFFF`
     - LEVIX Primary Orange: `#E87524` (Hover: `#C85D16`)
     - Dark Charcoal: `#222222`
     - Light Border: `#EAEAEA`
     - Soft Orange Highlight: `#FFF5ED`

2. **Trusted Backend API (Hostinger Node.js / Render / Railway / Firebase Cloud Functions)**:
   - Express server located in `/server`.
   - Performs independent, trusted price and stock verification before creating orders.
   - Handles Razorpay Order creation and server-side HMAC-SHA256 signature verification.
   - Receives and cryptographically verifies Razorpay webhooks.
   - Enforces administrative authorizations and custom claims.

---

## 2. HOSTINGER WEB HOSTING DEPLOYMENT

### Step 2.1: Build the Production Frontend
Run the build command from the project root:
```bash
npm run build
```
This generates the optimized production bundle in the `dist/` folder:
- `dist/index.html`
- `dist/assets/*` (hashed JavaScript and CSS chunks)
- `dist/manifest.webmanifest`
- `dist/sw.js` & `dist/registerSW.js` (PWA Service Worker)
- `dist/.htaccess` (Apache rewrite rules copied automatically from `public/.htaccess`)

### Step 2.2: Upload to Hostinger File Manager
1. Log in to your **Hostinger hPanel** (`https://hpanel.hostinger.com`).
2. Navigate to **Websites** -> Select your domain (e.g. `levix.in`) -> **File Manager**.
3. Open the `public_html` directory.
4. Upload all files and folders located **inside** `dist/` directly into `public_html`.
5. Ensure the hidden `.htaccess` file is present in `public_html`.

### Step 2.3: Verify Apache SPA Fallback (`.htaccess`)
Hostinger uses Apache/LiteSpeed web server. The provided `.htaccess` ensures that deep links (e.g., `https://levix.in/product/levix-arc-oversized-trench-coat` or `https://levix.in/account/orders`) do not trigger 404 errors upon browser reload:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>
```

### Step 2.4: Enable HTTPS & SSL
1. In Hostinger hPanel, go to **Security** -> **SSL**.
2. Install the free Lifetime Let's Encrypt SSL certificate.
3. Enable **Force HTTPS**.

---

## 3. FIREBASE SETUP & SECURITY RULES

### Step 3.1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add Project** (e.g., `levix-store`).
2. Navigate to **Authentication** -> **Sign-in method**:
   - Enable **Email/Password**.
   - Enable **Google** (optional).
3. Navigate to **Cloud Firestore** -> **Create Database** (start in production mode, select regional location e.g. `asia-south1` Mumbai).

### Step 3.2: Deploy Firestore Security Rules
Deploy the provided `firestore.rules` file via Firebase CLI or paste its contents directly into the Firebase Console Rules editor:
```bash
firebase deploy --only firestore:rules
```
Key security features in `firestore.rules`:
- Public customers can only read published products and categories.
- Customers can only read and write their own order history and profile details.
- Customers cannot elevate their own privileges or modify order totals.
- Only authorized administrators can manage inventory, categories, and fulfillments.

### Step 3.3: Deploy Firestore Indexes
Deploy composite indexes from `firestore.indexes.json`:
```bash
firebase deploy --only firestore:indexes
```

### Step 3.4: Populate Store Database (1-Click Seed)
Once Firebase environment variables are configured in `.env`, navigate to `/admin/settings` and click **"Seed Initial Firestore Database"**. This will populate Cloud Firestore with:
- Curated categories (Outerwear, Essentials, Footwear, Accessories, Headwear).
- 8 high-resolution luxury products with variants, integer paise prices, and specifications.
- Store settings, shipping rules, and announcement banner text.

---

## 4. RAZORPAY PAYMENT GATEWAY SETUP

### Step 4.1: Retrieve Razorpay Credentials
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** -> **API Keys**.
3. Generate **Key Id** and **Key Secret**.
   - Test mode keys begin with `rzp_test_`.
   - Live production keys begin with `rzp_live_`.

### Step 4.2: Configure Environment Variables
In your frontend `.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```
In your server environment (`/server/.env`):
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

### Step 4.3: Configure Webhook
In Razorpay Dashboard -> **Settings** -> **Webhooks**:
- Add Webhook URL: `https://api.yourdomain.com/api/orders/webhook`
- Secret: same as `RAZORPAY_WEBHOOK_SECRET`
- Active Events:
  - `payment.captured`
  - `order.paid`
  - `payment.failed`

---

## 5. TRUSTED BACKEND DEPLOYMENT

The backend server is located in `/server`. It can be run on:

### Option A: Hostinger Node.js Application (Cloud / VPS Hosting)
1. In Hostinger hPanel, go to **Advanced** -> **Node.js**.
2. Select Node.js version `20.x` or `22.x`.
3. Application root: `/server`.
4. Application startup file: `index.js`.
5. Add environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
6. Click **Save** and **Start Application**.

### Option B: Dedicated Cloud Service (Render / Railway)
1. Push repository to GitHub.
2. Link repository to Render or Railway with Root Directory set to `server`.
3. Build command: `npm install`
4. Start command: `node index.js`
5. Configure Environment Variables in the provider dashboard.

---

## 6. PWA INSTALLATION & VERIFICATION

### Verification Steps:
1. Open the website on Google Chrome / Chromium on desktop or Android.
2. A subtle install banner will appear: **"Install LEVIX App"**.
3. Clicking **Install** triggers the native browser installation modal.
4. On iOS Safari (iPhone/iPad):
   - Tap the **Instructions** button.
   - An elegant modal displays step-by-step guidance:
     1. Tap the Safari **Share** icon in the bottom bar.
     2. Tap **Add to Home Screen**.
     3. Tap **Add**.
5. When launched from the Home Screen, LEVIX operates in full-screen `standalone` mode with native feel, smooth transitions, and offline caching.

---

## 7. ADMINISTRATOR SETUP & ACCESS

### Default Demo Credentials:
- **Email:** `admin@levix.in`
- **Access:** Direct 1-Click Evaluation button on `/admin/login` or via email authentication.
- **Admin Capabilities:**
  - Executive KPI analytics (Paid Revenue, Total Orders, Pending Dispatch, Low Stock).
  - Create, edit, publish, feature, or delete products and manage SKU inventory.
  - Create and edit categories and display sequencing.
  - Manage order fulfillment states, attach courier tracking numbers, and record COD collections.
  - Configure announcement banners, free-shipping thresholds, and hero graphics.
