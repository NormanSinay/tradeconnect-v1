# TradeConnect Frontend Services

This directory contains all API service modules for the TradeConnect frontend application. Each service provides a clean interface to interact with backend endpoints.

## Service Architecture

All services follow a consistent pattern:
- Use the central `apiService` from `api.ts`
- Return `ApiResponse<T>` format with type safety
- Include comprehensive JSDoc comments
- Handle errors consistently
- Support TypeScript type inference

## Available Services

### 1. Authentication Service (`authService`)
**File:** `api.ts`

Handles user authentication and authorization.

```typescript
import { authService } from '@/services';

// Login
await authService.login({ email, password, rememberMe });

// Register
await authService.register({ firstName, lastName, email, password, phone, acceptTerms });

// Logout
await authService.logout();

// Profile management
const profile = await authService.getProfile();
await authService.updateProfile(data);
await authService.changePassword({ currentPassword, newPassword });

// 2FA operations
await authService.enable2FA();
await authService.verify2FA(code);
await authService.disable2FA(code);
const status = await authService.get2FAStatus();

// Password recovery
await authService.forgotPassword(email);
await authService.resetPassword(token, password);

// Email verification
await authService.verifyEmail(token);
```

### 2. User Service (`userService`)
**File:** `userService.ts`

Enhanced user profile and account management.

```typescript
import { userService } from '@/services';

// Profile operations
const profile = await userService.getProfile();
await userService.updateProfile({ firstName, lastName, bio });
await userService.uploadAvatar(file);
await userService.deleteAvatar();

// Security
await userService.changePassword({ currentPassword, newPassword, confirmPassword });
const twoFaSetup = await userService.enable2FA(); // Returns QR code & backup codes
await userService.disable2FA(code);
await userService.regenerate2FABackupCodes();

// User data
const registrations = await userService.getUserRegistrations();
const payments = await userService.getUserPayments();
const certificates = await userService.getUserCertificates();

// Favorites
await userService.addToFavorites(eventId);
await userService.removeFromFavorites(eventId);
const favorites = await userService.getUserFavorites();

// Preferences
const prefs = await userService.getPreferences();
await userService.updatePreferences({ theme: 'dark', language: 'es' });

// Account management
await userService.deleteAccount(password);
const exportId = await userService.requestDataExport(); // GDPR
const dataBlob = await userService.downloadDataExport(exportId);
```

### 3. Events Service (`eventsService`)
**File:** `eventsService.ts`, `api.ts`

Event browsing and management.

```typescript
import { eventsService, publicEventsService } from '@/services';

// Search and browse
const results = await eventsService.searchEvents(filters, page, limit);
const event = await eventsService.getEventById(id);
const featured = await eventsService.getFeaturedEvents(6);
const related = await eventsService.getRelatedEvents(eventId, 4);

// Categories and types
const categories = await eventsService.getEventCategories();
const types = await eventsService.getEventTypes();

// Availability
const availability = await eventsService.checkEventAvailability(eventId, quantity);

// User events
const myEvents = await eventsService.getUserEvents();

// Favorites
await eventsService.addToFavorites(eventId);
await eventsService.removeFromFavorites(eventId);
const isFavorite = await eventsService.isEventFavorite(eventId);

// Admin operations (from api.ts)
import { eventsService as adminEvents } from '@/services/api';
await adminEvents.createEvent(data);
await adminEvents.updateEvent(id, data);
await adminEvents.publishEvent(id);
await adminEvents.duplicateEvent(id);
await adminEvents.uploadMedia(id, formData);
```

### 4. Cart Service (`cartService`)
**File:** `cartService.ts`

Shopping cart management.

```typescript
import { cartService } from '@/services';

// Cart operations
const cart = await cartService.getCart();
await cartService.addItem({ eventId, quantity, participantType });
await cartService.updateItem(itemId, { quantity: 2 });
await cartService.removeItem(itemId);
await cartService.clearCart();

// Promo codes
await cartService.applyPromoCode('SUMMER2025');
await cartService.removePromoCode();

// Calculations
const updatedCart = await cartService.calculateTotal();

// Validation
const validation = await cartService.validateCart();

// Admin operations
const abandonedCarts = await cartService.getAbandonedCarts();
await cartService.restoreCart(sessionId);
```

### 5. Payment Service (`paymentService`)
**File:** `paymentService.ts`

Payment processing across multiple gateways.

```typescript
import { paymentService } from '@/services';

// Process payment
const result = await paymentService.processPayment({
  registrationId,
  gateway: 'paypal',
  amount: 100.00,
  currency: 'GTQ',
  returnUrl: '/payment/success',
  cancelUrl: '/payment/cancel',
});

// Gateway-specific payments
const paypal = await paymentService.createPayPalPayment(100, 'GTQ');
const stripe = await paymentService.createStripePayment(100, 'GTQ');
const neonet = await paymentService.createNeoNetPayment({ amount, orderId, customerEmail });
const bam = await paymentService.createBAMPayment({ amount, orderId, customerEmail });

// Payment status and history
const status = await paymentService.getPaymentStatus(transactionId);
const methods = await paymentService.getPaymentMethods();
const history = await paymentService.getPaymentHistory({ page: 1, limit: 20 });

// Refunds
await paymentService.requestRefund(paymentId, amount, 'Customer request');
await paymentService.cancelPayment(paymentId);

// Receipt
const receiptBlob = await paymentService.getPaymentReceipt(paymentId);
```

### 6. FEL Service (`felService`)
**File:** `felService.ts`

Guatemala electronic invoicing (Factura Electrónica en Línea).

```typescript
import { felService } from '@/services';

// Validation
const nitValidation = await felService.validateNIT('1234567-8');
const cuiValidation = await felService.validateCUI('1234567890123');

// Authentication
await felService.authenticateFEL();
const tokenStatus = await felService.getTokenStatus();
await felService.refreshToken();

// DTE operations
await felService.certifyDTE(dteData);
await felService.cancelDTE({ uuid, reason });
const dteStatus = await felService.consultDTE(uuid);

// Documents
const pdfBlob = await felService.downloadPDF(uuid);
await felService.autoGenerateInvoice(registrationId);
```

### 7. Certificate Service (`certificateService`)
**File:** `certificateService.ts`

Certificate generation and verification.

```typescript
import { certificateService } from '@/services';

// Get certificates
const certificates = await certificateService.getCertificates();
const certificate = await certificateService.getCertificateById(id);

// Download
const pdfBlob = await certificateService.downloadCertificate(id);
const qrBlob = await certificateService.getCertificateQRCode(id);

// Verification
const verification = await certificateService.verifyCertificate(hash);
const blockchainVerification = await certificateService.verifyByBlockchain(txHash);

// Templates
const templates = await certificateService.getCertificateTemplates();
const template = await certificateService.getTemplateById(id);

// Generation
await certificateService.requestCertificate(registrationId, templateId);
await certificateService.regenerateCertificate(id);

// Sharing
await certificateService.shareCertificate(id, email);

// Validation log
const logs = await certificateService.getValidationLog(id);

// Admin operations
await certificateService.revokeCertificate(id, reason);
```

### 8. Admin Service (`adminService`)
**File:** `adminService.ts`

Administrative operations and management.

```typescript
import { adminService } from '@/services';

// Dashboard
const stats = await adminService.getDashboardStats();
const metrics = await adminService.getSystemMetrics();

// Event management
const events = await adminService.getEvents({ status: 'published' });
await adminService.createEvent(eventData);
await adminService.updateEvent(id, updates);
await adminService.deleteEvent(id);
await adminService.publishEvent(id);
await adminService.unpublishEvent(id);
await adminService.duplicateEvent(id, options);

// Registration management
const registrations = await adminService.getRegistrations({ eventId: 1 });
const registration = await adminService.getRegistration(id);
await adminService.cancelRegistration(id, reason);
await adminService.confirmRegistration(id);

// Payment management
await adminService.refundPayment(paymentId, amount, reason);

// User management
const users = await adminService.getUsers();
const user = await adminService.getUser(id);
await adminService.updateUser(id, updates);
await adminService.deleteUser(id);
await adminService.setUserStatus(id, true);

// Reports
const reportBlob = await adminService.generateReport({
  type: 'revenue',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  format: 'pdf',
});
const reportHistory = await adminService.getReportHistory();

// Settings
const settings = await adminService.getSettings();
await adminService.updateSettings({ maintenanceMode: false });

// Audit
const auditLogs = await adminService.getAuditLogs({ userId: 1 });
```

### 9. Speaker Service (`speakerService`)
**File:** `speakerService.ts`

Speaker management and assignments.

```typescript
import { speakerService } from '@/services';

// CRUD operations
const speakers = await speakerService.getSpeakers();
const speaker = await speakerService.getSpeakerById(id);
await speakerService.createSpeaker({ firstName, lastName, email, bio });
await speakerService.updateSpeaker(id, { bio: 'Updated bio' });
await speakerService.deleteSpeaker(id);
await speakerService.uploadAvatar(id, file);

// Specialties
const specialties = await speakerService.getSpecialties();
const speakersBySpecialty = await speakerService.getSpeakersBySpecialty(specialtyId);

// Events
const speakerEvents = await speakerService.getSpeakerEvents(id);
await speakerService.assignToEvent(speakerId, eventId, sessionId);
await speakerService.removeFromEvent(speakerId, eventId);

// Availability
const availability = await speakerService.getAvailability(id, startDate, endDate);
await speakerService.setAvailability(id, { startDate, endDate, isAvailable: false });

// Contracts and payments
const contracts = await speakerService.getContracts(id);
await speakerService.createContract({ speakerId, eventId, amount, contractType });
const payments = await speakerService.getPayments(id);
const evaluations = await speakerService.getEvaluations(id);

// Search
const results = await speakerService.searchSpeakers('John Doe', { specialty: 'AI' });
```

### 10. Analytics Service (`analyticsService`)
**File:** `analyticsService.ts`

Event tracking and analytics.

```typescript
import { analyticsService } from '@/services';

// Page tracking
await analyticsService.trackPageView('/events/123', 'Event Title');

// Event tracking
await analyticsService.trackEvent('button_click', {
  category: 'engagement',
  label: 'register_now',
  value: 1,
});

// Conversion tracking
await analyticsService.trackConversion({
  type: 'registration',
  eventId: 123,
  value: 100,
  currency: 'GTQ',
});

// Analytics retrieval
const eventAnalytics = await analyticsService.getEventAnalytics(eventId, startDate, endDate);
const userAnalytics = await analyticsService.getUserAnalytics();
const platformAnalytics = await analyticsService.getPlatformAnalytics(startDate, endDate);
const realTime = await analyticsService.getRealTimeAnalytics();

// Specific tracking
await analyticsService.trackSearch('conference', filters, 42);
await analyticsService.trackError('Payment failed', stackTrace);
await analyticsService.trackCartAction('add', eventId, quantity, value);

// Advanced analytics
const funnel = await analyticsService.getFunnelAnalytics('registration', startDate, endDate);
const cohort = await analyticsService.getCohortAnalysis('monthly', startDate, endDate);

// Export
const reportBlob = await analyticsService.exportReport('user_activity', { format: 'csv' });
```

### 11. Notification Service (`notificationService`)
**File:** `notificationService.ts`

Multi-channel notification management.

```typescript
import { notificationService } from '@/services';

// Get notifications
const notifications = await notificationService.getNotifications({ page: 1, limit: 20 });
const notification = await notificationService.getNotification(id);
const unreadCount = await notificationService.getUnreadCount();

// Mark as read
await notificationService.markAsRead(id);
await notificationService.markAllAsRead();

// Delete
await notificationService.deleteNotification(id);
await notificationService.deleteAllNotifications();

// Preferences
const prefs = await notificationService.getPreferences();
await notificationService.updatePreferences({
  emailNotifications: true,
  smsNotifications: false,
  eventReminders: true,
});

// Test notifications
await notificationService.testNotification('email');

// Push notifications
await notificationService.subscribeToPush(pushSubscription);
await notificationService.unsubscribeFromPush();

// Admin operations
await notificationService.sendNotification({
  userIds: [1, 2, 3],
  type: 'event',
  title: 'New Event',
  message: 'Check out our new event!',
  channels: ['email', 'push'],
});

// Templates (admin)
const templates = await notificationService.getTemplates();
await notificationService.createTemplate({ name, type, subject, body, variables });
await notificationService.updateTemplate(id, updates);
await notificationService.deleteTemplate(id);

// Rules (admin)
const rules = await notificationService.getNotificationRules();
await notificationService.createNotificationRule(ruleData);

// Logs (admin)
const logs = await notificationService.getNotificationLogs({ userId: 1 });
```

## Import Patterns

### Individual Service Import
```typescript
import { cartService } from '@/services';
```

### Multiple Services Import
```typescript
import { cartService, paymentService, eventService } from '@/services';
```

### All Services Import
```typescript
import services from '@/services';

// Use as
services.cart.getCart();
services.payment.processPayment(data);
```

### Type Imports
```typescript
import type {
  ApiResponse,
  User,
  Event,
  PaymentGatewayResponse
} from '@/services';
```

## Response Format

All services return responses in the following format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## Error Handling

Services use the centralized error handler from `api.ts`:

- **401 Unauthorized**: Automatically attempts token refresh
- **403 Forbidden**: Logs access denied error
- **500+ Server Errors**: Logs server error

Example error handling in components:

```typescript
try {
  const result = await cartService.addItem(item);
  if (result.success) {
    // Handle success
  }
} catch (error) {
  // Error is already logged by interceptor
  // Handle UI error state
  console.error('Failed to add item:', error);
}
```

## Authentication

All authenticated requests automatically include the Bearer token from localStorage:

```typescript
// Token is automatically added by request interceptor
headers: {
  Authorization: `Bearer ${localStorage.getItem('tradeconnect_auth_token')}`
}
```

## File Downloads

Services that return files (PDFs, exports, etc.) return a Blob:

```typescript
const pdfBlob = await certificateService.downloadCertificate(id);

// Create download link
const url = window.URL.createObjectURL(pdfBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'certificate.pdf';
link.click();
window.URL.revokeObjectURL(url);
```

## Best Practices

1. **Use Type Safety**: Always specify generic types for better IDE support
2. **Handle Errors**: Wrap service calls in try-catch blocks
3. **Use Pagination**: For list endpoints, use pagination parameters
4. **Cache Wisely**: Consider caching frequently accessed data (categories, types)
5. **Batch Requests**: Where possible, batch related requests
6. **Loading States**: Show loading indicators during async operations
7. **Optimistic Updates**: Update UI immediately, revert on error

## Testing

All services can be mocked for testing:

```typescript
import { vi } from 'vitest';
import { cartService } from '@/services';

vi.mock('@/services', () => ({
  cartService: {
    getCart: vi.fn().mockResolvedValue({
      success: true,
      data: { items: [], total: 0 },
    }),
  },
}));
```

## API Base URL

Configured in `constants.ts`:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
```

Override with environment variable:
```bash
VITE_API_URL=https://api.tradeconnect.com/api/v1
```

## Backward Compatibility

Some services maintain legacy exports for backward compatibility:
- `cartServiceLegacy` (from api.ts)
- `felServiceLegacy` (from api.ts)

New code should use the enhanced services from individual files.

## Contributing

When adding new services:

1. Create new service file in `services/` directory
2. Follow existing patterns (JSDoc, types, error handling)
3. Export from `index.ts`
4. Update this README
5. Add unit tests

## License

Copyright © 2025 TradeConnect. All rights reserved.
