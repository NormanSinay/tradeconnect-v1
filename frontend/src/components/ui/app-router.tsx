import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './navigation'
import HomePage from './home-page'
import EventDetailPage from './event-detail-page'
import CartPageWrapper from './cart-page-wrapper'
import CheckoutPageWrapper from './checkout-page-wrapper'
import ProfilePageWrapper from './profile-page-wrapper'
import QRPageWrapper from './qr-page-wrapper'
import CertificatePageWrapper from './certificate-page-wrapper'
import Footer from './footer'
import { WebSocketProvider } from '@/hooks/useWebSocket'
import { AuthProvider } from '@/hooks/useAuth'

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <div id="app">
            <Navigation />

            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<HomePage />} />
                <Route path="/courses" element={<HomePage />} />
                <Route path="/event/:id" element={<EventDetailPage />} />
                <Route path="/cart" element={<CartPageWrapper />} />
                <Route path="/checkout" element={<CheckoutPageWrapper />} />
                <Route path="/profile" element={<ProfilePageWrapper />} />
                <Route path="/qr/:registrationId" element={<QRPageWrapper />} />
                <Route path="/certificate/:registrationId" element={<CertificatePageWrapper />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default AppRouter