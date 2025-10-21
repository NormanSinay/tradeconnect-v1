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
// These components are not in components/pages, they are in pages/ as .astro files
// import NotFoundPage from '@/components/pages/NotFoundPage'
// import ServerErrorPage from '@/components/pages/ServerErrorPage'
// import MaintenancePage from '@/components/pages/MaintenancePage'
// import UnauthorizedPage from '@/components/pages/UnauthorizedPage'
// import ServiceStatusPage from '@/components/pages/ServiceStatusPage'
// import WebhookHandler from '@/components/pages/WebhookHandler'
import { } from '@/hooks/useWebSocket'
import { AuthProvider } from '@/hooks/useAuth'
import { AdminProvider } from '@/context/AdminContext'
import AdminDashboardPage from '@/components/admin/AdminDashboardPage'
import AdminDashboardInicioPage from '@/components/admin/AdminDashboardInicioPage'
import AdminKPIsPage from '@/components/admin/AdminKPIsPage'
import AdminEventsPage from '@/components/admin/AdminEventsPage'
import AdminEventCreatePage from '@/components/admin/AdminEventCreatePage'
import AdminEventEditPage from '@/components/admin/AdminEventEditPage'
import AdminEventDuplicatePage from '@/components/admin/AdminEventDuplicatePage'
import AdminEventTemplatesPage from '@/components/admin/AdminEventTemplatesPage'
import AdminEventConfigPage from '@/components/admin/AdminEventConfigPage'
import AdminEventPublishPage from '@/components/admin/AdminEventPublishPage'
import AdminEventParticipantsPage from '@/components/admin/AdminEventParticipantsPage'
import AdminStreamingPage from '@/components/admin/AdminStreamingPage'
import AdminRegistrationsPage from '@/components/admin/AdminRegistrationsPage'
import AdminEventRegistrationsPage from '@/components/admin/AdminEventRegistrationsPage'
import AdminRegistrationDetailPage from '@/components/admin/AdminRegistrationDetailPage'
import AdminRegistrationCreatePage from '@/components/admin/AdminRegistrationCreatePage'
import AdminRegistrationEditPage from '@/components/admin/AdminRegistrationEditPage'
import AdminRegistrationCancelPage from '@/components/admin/AdminRegistrationCancelPage'
import AdminRegistrationsExportPage from '@/components/admin/AdminRegistrationsExportPage'
import AdminAttendancePage from '@/components/admin/AdminAttendancePage'
import AdminCapacityPage from '@/components/admin/AdminCapacityPage'
import AdminOverbookingPage from '@/components/admin/AdminOverbookingPage'
import AdminCapacityStatsPage from '@/components/admin/AdminCapacityStatsPage'
import AdminAccessControlPage from '@/components/admin/AdminAccessControlPage'
import AdminAnalyticsPage from '@/components/admin/AdminAnalyticsPage'
import AdminAttendanceReportPage from '@/components/admin/AdminAttendanceReportPage'
import AdminAuditPage from '@/components/admin/AdminAuditPage'
import AdminBackupsPage from '@/components/admin/AdminBackupsPage'
import AdminCertificateBlockchainPage from '@/components/admin/AdminCertificateBlockchainPage'
import AdminCertificateBulkGeneratePage from '@/components/admin/AdminCertificateBulkGeneratePage'
import AdminCertificateSentPage from '@/components/admin/AdminCertificateSentPage'
import AdminCertificatesPage from '@/components/admin/AdminCertificatesPage'
import AdminCertificatesReportPage from '@/components/admin/AdminCertificatesReportPage'
import AdminCertificateTemplatesPage from '@/components/admin/AdminCertificateTemplatesPage'
import AdminCompanyConfigPage from '@/components/admin/AdminCompanyConfigPage'
import AdminConfigPage from '@/components/admin/AdminConfigPage'
import AdminCustomReportPage from '@/components/admin/AdminCustomReportPage'
import AdminFinancialReportPage from '@/components/admin/AdminFinancialReportPage'
import AdminLocalizationConfigPage from '@/components/admin/AdminLocalizationConfigPage'
import AdminLogsPage from '@/components/admin/AdminLogsPage'
import AdminOfflineValidationPage from '@/components/admin/AdminOfflineValidationPage'
import AdminPaymentConfigPage from '@/components/admin/AdminPaymentConfigPage'
import AdminPaymentDetailPage from '@/components/admin/AdminPaymentDetailPage'
import AdminPaymentsPage from '@/components/admin/AdminPaymentsPage'
import AdminPendingPaymentsPage from '@/components/admin/AdminPendingPaymentsPage'
import AdminPromoCodeCreatePage from '@/components/admin/AdminPromoCodeCreatePage'
import AdminPromoCodesPage from '@/components/admin/AdminPromoCodesPage'
import AdminPromoCodeStatsPage from '@/components/admin/AdminPromoCodeStatsPage'
import AdminPromotionCreatePage from '@/components/admin/AdminPromotionCreatePage'
import AdminPromotionEditPage from '@/components/admin/AdminPromotionEditPage'
import AdminPromotionsPage from '@/components/admin/AdminPromotionsPage'
import AdminPromotionsReportPage from '@/components/admin/AdminPromotionsReportPage'
import AdminQRScannerPage from '@/components/admin/AdminQRScannerPage'
import AdminReconciliationPage from '@/components/admin/AdminReconciliationPage'
import AdminRefundsPage from '@/components/admin/AdminRefundsPage'
import AdminFelPage from '@/components/admin/AdminFelPage'
import AdminFelPendingPage from '@/components/admin/AdminFelPendingPage'
import AdminFelIssuedPage from '@/components/admin/AdminFelIssuedPage'
import AdminFelVoidedPage from '@/components/admin/AdminFelVoidedPage'
import AdminFelVoidPage from '@/components/admin/AdminFelVoidPage'
import AdminFelCertificationPage from '@/components/admin/AdminFelCertificationPage'
import AdminFelConfigPage from '@/components/admin/AdminFelConfigPage'

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

                {/* Special Pages - These are handled by Astro pages, not React components */}
                {/* <Route path="/404" element={<NotFoundPage />} />
                <Route path="/500" element={<ServerErrorPage />} />
                <Route path="/mantenimiento" element={<MaintenancePage />} />
                <Route path="/no-autorizado" element={<UnauthorizedPage />} />
                <Route path="/estado-del-servicio" element={<ServiceStatusPage />} />
                <Route path="/webhook/:provider" element={<WebhookHandler />} /> */}

                {/* Catch all route for 404 - handled by Astro */}
                {/* <Route path="*" element={<NotFoundPage />} /> */}
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