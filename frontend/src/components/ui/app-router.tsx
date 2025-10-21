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
import { LoginPage } from '@/components/auth/LoginPage'
import { RegisterPage } from '@/components/auth/RegisterPage'
import { ForgotPasswordPage } from '@/components/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/components/auth/ResetPasswordPage'
import { EmailVerificationPage } from '@/components/auth/EmailVerificationPage'
import { TwoFactorSetupPage } from '@/components/auth/TwoFactorSetupPage'
import { ContactPage } from '@/components/pages/ContactPage'
import { PrivacyPolicyPage } from '@/components/pages/PrivacyPolicyPage'
import { CookiesPolicyPage } from '@/components/pages/CookiesPolicyPage'
import { TermsAndConditionsPage } from '@/components/pages/TermsAndConditionsPage'
import { FAQPage } from '@/components/pages/FAQPage'
import { EventCategoryPage } from '@/components/pages/EventCategoryPage'
import { EventSearchPage } from '@/components/pages/EventSearchPage'
import { ConferencesPage } from '@/components/pages/ConferencesPage'
import { WorkshopsPage } from '@/components/pages/WorkshopsPage'
import { SpeakersDirectoryPage } from '@/components/pages/SpeakersDirectoryPage'
import { SpeakerProfilePage } from '@/components/pages/SpeakerProfilePage'
import { CertificateVerificationPage } from '@/components/pages/CertificateVerificationPage'
import { AppDownloadPage } from '@/components/pages/AppDownloadPage'
import { PublicQRVerificationPage } from '@/components/pages/PublicQRVerificationPage'
import { UserDashboardPage } from '@/components/pages/UserDashboardPage'
import { UserProfilePage } from '@/components/pages/UserProfilePage'
import { UserSecurityPage } from '@/components/pages/UserSecurityPage'
import { UserNotificationsPage } from '@/components/pages/UserNotificationsPage'
import { UserRegistrationsPage } from '@/components/pages/UserRegistrationsPage'
import { UserEventsPage } from '@/components/pages/UserEventsPage'
import { UserCertificatesPage } from '@/components/pages/UserCertificatesPage'
import { UserQRCodesPage } from '@/components/pages/UserQRCodesPage'
import { UserInvoicesPage } from '@/components/pages/UserInvoicesPage'
import { UserPaymentsPage } from '@/components/pages/UserPaymentsPage'
import { UserAccountSettingsPage } from '@/components/pages/UserAccountSettingsPage'
import { UserPreferencesPage } from '@/components/pages/UserPreferencesPage'
import { UserActivityLogPage } from '@/components/pages/UserActivityLogPage'
import { QRCodeDownloadPage } from '@/components/pages/QRCodeDownloadPage'
import { InvoiceDetailPage } from '@/components/pages/InvoiceDetailPage'
import { InvoiceDownloadPage } from '@/components/pages/InvoiceDownloadPage'
import { InvoiceRequestPage } from '@/components/pages/InvoiceRequestPage'
import { PaymentDetailPage } from '@/components/pages/PaymentDetailPage'
import { PaymentReceiptPage } from '@/components/pages/PaymentReceiptPage'
import { } from '@/hooks/useWebSocket'
import { AuthProvider } from '@/hooks/useAuth'
import { AdminProvider } from '@/context/AdminContext'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminDashboardInicioPage from '@/pages/admin/AdminDashboardInicioPage'
import AdminKPIsPage from '@/pages/admin/AdminKPIsPage'
import AdminEventsPage from '@/pages/admin/AdminEventsPage'
import AdminEventCreatePage from '@/pages/admin/AdminEventCreatePage'
import AdminEventEditPage from '@/pages/admin/AdminEventEditPage'
import AdminEventDuplicatePage from '@/pages/admin/AdminEventDuplicatePage'
import AdminEventTemplatesPage from '@/pages/admin/AdminEventTemplatesPage'
import AdminEventConfigPage from '@/pages/admin/AdminEventConfigPage'
import AdminEventPublishPage from '@/pages/admin/AdminEventPublishPage'
import AdminEventParticipantsPage from '@/pages/admin/AdminEventParticipantsPage'
import AdminStreamingPage from '@/pages/admin/AdminStreamingPage'
import AdminRegistrationsPage from '@/pages/admin/AdminRegistrationsPage'
import AdminEventRegistrationsPage from '@/pages/admin/AdminEventRegistrationsPage'
import AdminRegistrationDetailPage from '@/pages/admin/AdminRegistrationDetailPage'
import AdminRegistrationCreatePage from '@/pages/admin/AdminRegistrationCreatePage'
import AdminRegistrationEditPage from '@/pages/admin/AdminRegistrationEditPage'
import AdminRegistrationCancelPage from '@/pages/admin/AdminRegistrationCancelPage'
import AdminRegistrationsExportPage from '@/pages/admin/AdminRegistrationsExportPage'
import AdminAttendancePage from '@/pages/admin/AdminAttendancePage'
import AdminCapacityPage from '@/pages/admin/AdminCapacityPage'
import AdminOverbookingPage from '@/pages/admin/AdminOverbookingPage'
import AdminCapacityStatsPage from '@/pages/admin/AdminCapacityStatsPage'
import AdminAccessControlPage from '@/pages/admin/AdminAccessControlPage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminAttendanceReportPage from '@/pages/admin/AdminAttendanceReportPage'
import AdminAuditPage from '@/pages/admin/AdminAuditPage'
import AdminBackupsPage from '@/pages/admin/AdminBackupsPage'
import AdminCertificateBlockchainPage from '@/pages/admin/AdminCertificateBlockchainPage'
import AdminCertificateBulkGeneratePage from '@/pages/admin/AdminCertificateBulkGeneratePage'
import AdminCertificateSentPage from '@/pages/admin/AdminCertificateSentPage'
import AdminCertificatesPage from '@/pages/admin/AdminCertificatesPage'
import AdminCertificatesReportPage from '@/pages/admin/AdminCertificatesReportPage'
import AdminCertificateTemplatesPage from '@/pages/admin/AdminCertificateTemplatesPage'
import AdminCompanyConfigPage from '@/pages/admin/AdminCompanyConfigPage'
import AdminConfigPage from '@/pages/admin/AdminConfigPage'
import AdminCustomReportPage from '@/pages/admin/AdminCustomReportPage'
import AdminFinancialReportPage from '@/pages/admin/AdminFinancialReportPage'
import AdminLocalizationConfigPage from '@/pages/admin/AdminLocalizationConfigPage'
import AdminLogsPage from '@/pages/admin/AdminLogsPage'
import AdminOfflineValidationPage from '@/pages/admin/AdminOfflineValidationPage'
import AdminPaymentConfigPage from '@/pages/admin/AdminPaymentConfigPage'
import AdminPaymentDetailPage from '@/pages/admin/AdminPaymentDetailPage'
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage'
import AdminPendingPaymentsPage from '@/pages/admin/AdminPendingPaymentsPage'
import AdminPromoCodeCreatePage from '@/pages/admin/AdminPromoCodeCreatePage'
import AdminPromoCodesPage from '@/pages/admin/AdminPromoCodesPage'
import AdminPromoCodeStatsPage from '@/pages/admin/AdminPromoCodeStatsPage'
import AdminPromotionCreatePage from '@/pages/admin/AdminPromotionCreatePage'
import AdminPromotionEditPage from '@/pages/admin/AdminPromotionEditPage'
import AdminPromotionsPage from '@/pages/admin/AdminPromotionsPage'
import AdminPromotionsReportPage from '@/pages/admin/AdminPromotionsReportPage'
import AdminQRScannerPage from '@/pages/admin/AdminQRScannerPage'
import AdminReconciliationPage from '@/pages/admin/AdminReconciliationPage'
import AdminRefundsPage from '@/pages/admin/AdminRefundsPage'
import AdminFelPage from '@/pages/admin/AdminFelPage'
import AdminFelPendingPage from '@/pages/admin/AdminFelPendingPage'
import AdminFelIssuedPage from '@/pages/admin/AdminFelIssuedPage'
import AdminFelVoidedPage from '@/pages/admin/AdminFelVoidedPage'
import AdminFelVoidPage from '@/pages/admin/AdminFelVoidPage'
import AdminFelCertificationPage from '@/pages/admin/AdminFelCertificationPage'
import AdminFelConfigPage from '@/pages/admin/AdminFelConfigPage'

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
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

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
                <Route path="/restablecer-password/:token" element={<ResetPasswordPage />} />
                <Route path="/verificar-email/:token" element={<EmailVerificationPage />} />
                <Route path="/configurar-2fa" element={<TwoFactorSetupPage />} />

                {/* Public Pages */}
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/politica-privacidad" element={<PrivacyPolicyPage />} />
                <Route path="/cookies" element={<CookiesPolicyPage />} />
                <Route path="/terminos-y-condiciones" element={<TermsAndConditionsPage />} />
                <Route path="/preguntas-frecuentes" element={<FAQPage />} />
                <Route path="/eventos/categoria/:categoria" element={<EventCategoryPage />} />
                <Route path="/eventos/buscar" element={<EventSearchPage />} />
                <Route path="/conferencias" element={<ConferencesPage />} />
                <Route path="/talleres" element={<WorkshopsPage />} />
                <Route path="/speakers" element={<SpeakersDirectoryPage />} />
                <Route path="/speakers/:id" element={<SpeakerProfilePage />} />
                <Route path="/verificar-certificado" element={<CertificateVerificationPage />} />
                <Route path="/descargar-app-qr" element={<AppDownloadPage />} />
                <Route path="/verificacion-publica/:codigo" element={<PublicQRVerificationPage />} />

                {/* User Dashboard Routes */}
                <Route path="/mi-cuenta" element={<UserDashboardPage />} />
                <Route path="/mi-cuenta/perfil" element={<UserProfilePage />} />
                <Route path="/mi-cuenta/seguridad" element={<UserSecurityPage />} />
                <Route path="/mi-cuenta/notificaciones" element={<UserNotificationsPage />} />
                <Route path="/mis-inscripciones" element={<UserRegistrationsPage />} />
                <Route path="/mis-inscripciones/:id" element={<UserRegistrationsPage />} />
                <Route path="/mis-eventos/proximos" element={<UserEventsPage />} />
                <Route path="/mis-eventos/pasados" element={<UserEventsPage />} />
                <Route path="/mis-eventos/cancelados" element={<UserEventsPage />} />
                <Route path="/mis-certificados" element={<UserCertificatesPage />} />
                <Route path="/certificado/:id/descargar" element={<UserCertificatesPage />} />
                <Route path="/certificado/:id/verificar" element={<UserCertificatesPage />} />

                {/* Additional User Dashboard Routes */}
                <Route path="/mis-codigos-qr" element={<UserQRCodesPage />} />
                <Route path="/codigo-qr/:registrationId/descargar" element={<QRCodeDownloadPage />} />
                <Route path="/mis-facturas" element={<UserInvoicesPage />} />
                <Route path="/factura/:id" element={<InvoiceDetailPage />} />
                <Route path="/factura/:id/descargar" element={<InvoiceDownloadPage />} />
                <Route path="/solicitar-factura/:orderId" element={<InvoiceRequestPage />} />
                <Route path="/mis-pagos" element={<UserPaymentsPage />} />
                <Route path="/pago/:id/detalle" element={<PaymentDetailPage />} />
                <Route path="/pago/:id/comprobante" element={<PaymentReceiptPage />} />
                <Route path="/configuracion-cuenta" element={<UserAccountSettingsPage />} />
                <Route path="/preferencias-usuario" element={<UserPreferencesPage />} />
                <Route path="/historial-actividad" element={<UserActivityLogPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/inicio" element={<AdminDashboardInicioPage />} />
                <Route path="/admin/kpis" element={<AdminKPIsPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/auditoria" element={<AdminAuditPage />} />
                <Route path="/admin/backups" element={<AdminBackupsPage />} />
                <Route path="/admin/logs" element={<AdminLogsPage />} />
                <Route path="/admin/configuracion" element={<AdminConfigPage />} />
                <Route path="/admin/configuracion-empresa" element={<AdminCompanyConfigPage />} />
                <Route path="/admin/configuracion-localizacion" element={<AdminLocalizationConfigPage />} />

                {/* Event Management Routes */}
                <Route path="/admin/eventos" element={<AdminEventsPage />} />
                <Route path="/admin/eventos/crear" element={<AdminEventCreatePage />} />
                <Route path="/admin/eventos/:id/editar" element={<AdminEventEditPage />} />
                <Route path="/admin/eventos/:id/duplicar" element={<AdminEventDuplicatePage />} />
                <Route path="/admin/eventos/templates" element={<AdminEventTemplatesPage />} />
                <Route path="/admin/eventos/:id/configuracion" element={<AdminEventConfigPage />} />
                <Route path="/admin/eventos/:id/publicar" element={<AdminEventPublishPage />} />
                <Route path="/admin/eventos/:id/participantes" element={<AdminEventParticipantsPage />} />
                <Route path="/admin/transmision/:eventoId" element={<AdminStreamingPage />} />

                {/* Registration Management Routes */}
                <Route path="/admin/inscripciones" element={<AdminRegistrationsPage />} />
                <Route path="/admin/inscripciones/:eventoId" element={<AdminEventRegistrationsPage eventId={parseInt(window.location.pathname.split('/')[3] || '0')} />} />
                <Route path="/admin/inscripciones/:id/detalle" element={<AdminRegistrationDetailPage registrationId={parseInt(window.location.pathname.split('/')[3] || '0')} />} />
                <Route path="/admin/inscripciones/crear" element={<AdminRegistrationCreatePage />} />
                <Route path="/admin/inscripciones/:id/editar" element={<AdminRegistrationEditPage registrationId={parseInt(window.location.pathname.split('/')[3] || '0')} />} />
                <Route path="/admin/inscripciones/:id/cancelar" element={<AdminRegistrationCancelPage registrationId={parseInt(window.location.pathname.split('/')[3] || '0')} />} />
                <Route path="/admin/inscripciones/exportar" element={<AdminRegistrationsExportPage />} />

                {/* Attendance Management Routes */}
                <Route path="/admin/asistencias/:eventoId" element={<AdminAttendancePage eventId={parseInt(window.location.pathname.split('/')[3] || '0')} />} />
                <Route path="/admin/asistencias/reporte" element={<AdminAttendanceReportPage />} />
                <Route path="/admin/control-acceso/:eventoId" element={<AdminAccessControlPage eventId={parseInt(window.location.pathname.split('/')[3] || '0')} />} />

                {/* Capacity Management Routes */}
                <Route path="/admin/aforos/:eventoId" element={<AdminCapacityPage />} />
                <Route path="/admin/aforos/:eventoId/overbooking" element={<AdminOverbookingPage />} />
                <Route path="/admin/aforos/:eventoId/estadisticas" element={<AdminCapacityStatsPage />} />

                {/* Certificate Management Routes */}
                <Route path="/admin/certificados" element={<AdminCertificatesPage />} />
                <Route path="/admin/certificados/templates" element={<AdminCertificateTemplatesPage />} />
                <Route path="/admin/certificados/generar-lote" element={<AdminCertificateBulkGeneratePage />} />
                <Route path="/admin/certificados/enviados" element={<AdminCertificateSentPage />} />
                <Route path="/admin/certificados/blockchain" element={<AdminCertificateBlockchainPage />} />
                <Route path="/admin/certificados/reporte" element={<AdminCertificatesReportPage />} />

                {/* Payment Management Routes */}
                <Route path="/admin/pagos" element={<AdminPaymentsPage />} />
                <Route path="/admin/pagos/:id/detalle" element={<AdminPaymentDetailPage />} />
                <Route path="/admin/pagos/pendientes" element={<AdminPendingPaymentsPage />} />
                <Route path="/admin/pagos/configuracion" element={<AdminPaymentConfigPage />} />
                <Route path="/admin/reembolsos" element={<AdminRefundsPage />} />
                <Route path="/admin/reconciliacion" element={<AdminReconciliationPage />} />

                {/* Promotion Management Routes */}
                <Route path="/admin/promociones" element={<AdminPromotionsPage />} />
                <Route path="/admin/promociones/crear" element={<AdminPromotionCreatePage />} />
                <Route path="/admin/promociones/:id/editar" element={<AdminPromotionEditPage />} />
                <Route path="/admin/promociones/reporte" element={<AdminPromotionsReportPage />} />

                {/* Promo Code Management Routes */}
                <Route path="/admin/codigos-promocionales" element={<AdminPromoCodesPage />} />
                <Route path="/admin/codigos-promocionales/crear" element={<AdminPromoCodeCreatePage />} />
                <Route path="/admin/codigos-promocionales/:id/estadisticas" element={<AdminPromoCodeStatsPage promoCodeId={parseInt(window.location.pathname.split('/')[3] || '0')} />} />

                {/* FEL Management Routes */}
                <Route path="/admin/fel" element={<AdminFelPage />} />
                <Route path="/admin/fel/pendientes" element={<AdminFelPendingPage />} />
                <Route path="/admin/fel/emitidas" element={<AdminFelIssuedPage />} />
                <Route path="/admin/fel/anuladas" element={<AdminFelVoidedPage />} />
                <Route path="/admin/fel/:id/anular" element={<AdminFelVoidPage />} />
                <Route path="/admin/fel/certificacion" element={<AdminFelCertificationPage />} />
                <Route path="/admin/fel/configuracion" element={<AdminFelConfigPage />} />

                {/* Reports Routes */}
                <Route path="/admin/reportes/financiero" element={<AdminFinancialReportPage />} />
                <Route path="/admin/reportes/personalizado" element={<AdminCustomReportPage />} />

                {/* QR Management Routes */}
                <Route path="/admin/qr/escaner" element={<AdminQRScannerPage />} />

                {/* Offline Validation Routes */}
                <Route path="/admin/validacion-offline" element={<AdminOfflineValidationPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </AdminProvider>
      </AuthProvider>
    </Router>
  )
}

export default AppRouter