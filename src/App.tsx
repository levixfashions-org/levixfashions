import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'

import { RootLayout } from './components/common/RootLayout'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { AdminRoute } from './components/common/AdminRoute'
import { RouteErrorBoundary } from './components/common/RouteErrorBoundary'

// Core Storefront Pages (Eagerly loaded for instant first paint)
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { NotFound } from './pages/NotFound'

// Admin Pages (Code-split with safeLazy to keep customer bundle lean while maintaining resilient chunk reload)
const AdminLayout = safeLazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminLogin = safeLazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })))
const AdminDashboard = safeLazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminProducts = safeLazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })))
const AdminCategories = safeLazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })))
const AdminOrders = safeLazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })))
const AdminSettings = safeLazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })))

// Resilient Lazy Wrapper that auto-reloads if a new deployment changes chunk hashes
function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T } | { [key: string]: any }>
) {
  return lazy(async () => {
    try {
      const module = await factory()
      if ('default' in module) {
        return { default: module.default }
      }
      const key = Object.keys(module)[0]
      return { default: module[key] }
    } catch (err: any) {
      console.warn('[LEVIX] Lazy chunk import failed, refreshing for latest deployment...', err)
      const key = 'levix_chunk_reload_' + window.location.pathname
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, 'true')
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }
      sessionStorage.removeItem(key)
      throw err
    }
  })
}

// Lazy-loaded Storefront & Customer Pages
const CategoryPage = safeLazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })))
const Wishlist = safeLazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })))
const Checkout = safeLazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })))
const OrderConfirmation = safeLazy(() => import('./pages/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })))
const Login = safeLazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Register = safeLazy(() => import('./pages/Register').then(m => ({ default: m.Register })))
const ForgotPassword = safeLazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const Offline = safeLazy(() => import('./pages/Offline').then(m => ({ default: m.Offline })))

// Customer Account Pages
const AccountLayout = safeLazy(() => import('./pages/account/AccountLayout').then(m => ({ default: m.AccountLayout })))
const AccountProfile = safeLazy(() => import('./pages/account/AccountProfile').then(m => ({ default: m.AccountProfile })))
const AccountOrders = safeLazy(() => import('./pages/account/AccountOrders').then(m => ({ default: m.AccountOrders })))
const OrderDetail = safeLazy(() => import('./pages/account/OrderDetail').then(m => ({ default: m.OrderDetail })))
const AccountAddresses = safeLazy(() => import('./pages/account/AccountAddresses').then(m => ({ default: m.AccountAddresses })))

// Legal Pages
const PrivacyPolicy = safeLazy(() => import('./pages/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })))
const TermsAndConditions = safeLazy(() => import('./pages/legal/TermsAndConditions').then(m => ({ default: m.TermsAndConditions })))
const ShippingReturns = safeLazy(() => import('./pages/legal/ShippingReturns').then(m => ({ default: m.ShippingReturns })))

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-levix-orange border-t-transparent rounded-full animate-spin" />
  </div>
)

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <Shop /> },
      { path: 'category/:slug', element: withSuspense(CategoryPage) },
      { path: 'product/:slug', element: <ProductDetail /> },
      { path: 'cart', element: <Cart /> },
      { path: 'wishlist', element: withSuspense(Wishlist) },
      { path: 'checkout', element: withSuspense(Checkout) },
      { path: 'order-confirmation/:orderId', element: withSuspense(OrderConfirmation) },
      { path: 'login', element: withSuspense(Login) },
      { path: 'register', element: withSuspense(Register) },
      { path: 'forgot-password', element: withSuspense(ForgotPassword) },
      { path: 'offline', element: withSuspense(Offline) },
      { path: 'legal/privacy', element: withSuspense(PrivacyPolicy) },
      { path: 'legal/terms', element: withSuspense(TermsAndConditions) },
      { path: 'legal/shipping', element: withSuspense(ShippingReturns) },

      // Protected Customer Routes
      {
        path: 'account',
        element: (
          <ProtectedRoute>
            {withSuspense(AccountLayout)}
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: withSuspense(AccountProfile) },
          { path: 'orders', element: withSuspense(AccountOrders) },
          { path: 'orders/:orderId', element: withSuspense(OrderDetail) },
          { path: 'addresses', element: withSuspense(AccountAddresses) },
        ],
      },
    ],
  },
  // Admin Login (Standalone)
  {
    path: '/admin/login',
    element: withSuspense(AdminLogin),
    errorElement: <RouteErrorBoundary />,
  },
  // Protected Admin Management Area (Lazy chunked with safeLazy retry protection)
  {
    path: '/admin',
    element: (
      <AdminRoute>
        {withSuspense(AdminLayout)}
      </AdminRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'products', element: withSuspense(AdminProducts) },
      { path: 'categories', element: withSuspense(AdminCategories) },
      { path: 'orders', element: withSuspense(AdminOrders) },
      { path: 'settings', element: withSuspense(AdminSettings) },
    ],
  },
  // Wildcard 404
  {
    path: '*',
    element: <NotFound />,
    errorElement: <RouteErrorBoundary />,
  },
])

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <WishlistProvider>
            <RouterProvider router={router} />
          </WishlistProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  )
}

export default App
