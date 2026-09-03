import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import type { ReactElement } from 'react'
import { RequireAuth } from './components/RequireAuth'
import { SlugRoute } from './components/SlugRoute'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './lib/auth'
import { AnonymousPage } from './pages/AnonymousPage'
import { CelebrantCard } from './pages/CelebrantCard'
import { CelebrantWall } from './pages/CelebrantWall'
import { CelebrantWish } from './pages/CelebrantWish'
import { Dashboard } from './pages/Dashboard'
import { DashboardC } from './pages/DashboardC'
import { DashboardNew } from './pages/DashboardNew'
import { Account } from './pages/Account'
import { DesignSystem } from './pages/DesignSystem'
import { Kit } from './pages/Kit'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { NotFound } from './pages/NotFound'
import { ResetPassword } from './pages/ResetPassword'
import { Signup } from './pages/Signup'

function PublicPageShell({ children }: { children: (slug: string) => ReactElement }) {
  const { slug } = useParams<{ slug: string }>()
  return children(slug ?? '')
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="/kit" element={<Kit />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/new"
        element={
          <RequireAuth>
            <DashboardNew />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/c/:id"
        element={
          <RequireAuth>
            <DashboardC />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/account"
        element={
          <RequireAuth>
            <Account />
          </RequireAuth>
        }
      />
      <Route
        path="/:slug/wish"
        element={
          <PublicPageShell>
            {(slug) => <CelebrantWish slug={slug} />}
          </PublicPageShell>
        }
      />
      <Route
        path="/:slug/wall"
        element={
          <PublicPageShell>
            {(slug) => <CelebrantWall slug={slug} />}
          </PublicPageShell>
        }
      />
      <Route
        path="/:slug/anonymous"
        element={
          <PublicPageShell>
            {(slug) => <AnonymousPage slug={slug} />}
          </PublicPageShell>
        }
      />
      <Route
        path="/:slug/card"
        element={
          <PublicPageShell>
            {(slug) => <CelebrantCard slug={slug} />}
          </PublicPageShell>
        }
      />
      <Route path="/:slug" element={<SlugRoute />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
