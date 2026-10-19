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

// Core Pages (Eagerly loaded for instant first paint)
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { NotFound } from './pages/NotFound'

// Lazy-loaded Pages (Code Splitting)
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })))
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })))
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })))
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const Offline = lazy(() => import('./pages/Offline').then(m => ({ default: m.Offline })))

// Customer Account Pages
const AccountLayout = lazy(() => import('./pages/account/AccountLayout').then(m => ({ default: m.AccountLayout })))
const AccountProfile = lazy(() => import('./pages/account/AccountProfile').then(m => ({ default: m.AccountProfile })))
const AccountOrders = lazy(() => import('./pages/account/AccountOrders').then(m => ({ default: m.AccountOrders })))
const OrderDetail = lazy(() => import('./pages/account/OrderDetail').then(m => ({ default: m.OrderDetail })))
const AccountAddresses = lazy(() => import('./pages/account/AccountAddresses').then(m => ({ default: m.AccountAddresses })))

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })))

// Legal Pages
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })))
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions').then(m => ({ default: m.TermsAndConditions })))
const ShippingReturns = lazy(() => import('./pages/legal/ShippingReturns').then(m => ({ default: m.ShippingReturns })))

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
    errorElement: <NotFound />,
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
  },
  // Protected Admin Management Area
  {
    path: '/admin',
    element: (
      <AdminRoute>
        {withSuspense(AdminLayout)}
      </AdminRoute>
    ),
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
