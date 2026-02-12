"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/components/header"
import { DashboardContent } from "@/components/dashboard-content"
import { useAuthContext, AuthProvider } from "@/components/auth/auth-provider"
import { LoginForm } from "@/components/auth/login-form"
import { CartProvider } from "@/components/cart/cart-provider"

function DashboardGate() {
  const { user, loading } = useAuthContext()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <LoginForm />
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <DashboardContent />
        </main>
      </SidebarInset>
    </>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <CartProvider>
        <DashboardGate />
      </CartProvider>
    </AuthProvider>
  )
}
