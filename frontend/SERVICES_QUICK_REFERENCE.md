# TradeConnect Services - Quick Reference Guide

## Import Services

```typescript
// Single service import
import { cartService } from '@/services';

// Multiple services
import { cartService, paymentService, userService } from '@/services';

// All services
import services from '@/services';

// Types
import type { ApiResponse, PaymentMethod } from '@/services';
```

## Cart Operations

```typescript
import { cartService } from '@/services';

// Get cart
const cart = await cartService.getCart();

// Add item
await cartService.addItem({ eventId: 1, quantity: 2, participantType: 'individual' });

// Update item
await cartService.updateItem(itemId, { quantity: 3 });

// Remove item
await cartService.removeItem(itemId);

// Clear cart
await cartService.clearCart();

// Apply promo code
await cartService.applyPromoCode('SUMMER2025');

// Calculate totals
await cartService.calculateTotal();
```

## Payment Processing

```typescript
import { paymentService } from '@/services';

// Process payment
const result = await paymentService.processPayment({
  registrationId: 123,
  gateway: 'paypal',
  amount: 100.00,
  currency: 'GTQ'
});

// Create PayPal payment
await paymentService.createPayPalPayment(100, 'GTQ');

// Get payment status
await paymentService.getPaymentStatus(transactionId);

// Get payment methods
const methods = await paymentService.getPaymentMethods();

// Request refund
await paymentService.requestRefund(paymentId, 50, 'Partial refund');
```

## User Management

```typescript
import { userService } from '@/services';

// Get profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({ firstName: 'John', lastName: 'Doe' });

// Upload avatar
await userService.uploadAvatar(file);

// Change password
await userService.changePassword({
  currentPassword: 'old',
  newPassword: 'new',
  confirmPassword: 'new'
});

// Enable 2FA
const setup = await userService.enable2FA(); // Returns QR code

// Favorites
await userService.addToFavorites(eventId);
const favorites = await userService.getUserFavorites();
```

## FEL (Guatemala Invoicing)

```typescript
import { felService } from '@/services';

// Validate NIT
const nitValidation = await felService.validateNIT('1234567-8');

// Validate CUI
const cuiValidation = await felService.validateCUI('1234567890123');

// Auto-generate invoice
await felService.autoGenerateInvoice(registrationId);

// Download PDF
const pdf = await felService.downloadPDF(uuid);
```

## Certificates

```typescript
import { certificateService } from '@/services';

// Get certificates
const certs = await certificateService.getCertificates();

// Download certificate
const pdf = await certificateService.downloadCertificate(id);

// Verify certificate
const verification = await certificateService.verifyCertificate(hash);

// Request certificate
await certificateService.requestCertificate(registrationId);

// Share certificate
await certificateService.shareCertificate(id, 'email@example.com');
```

## Admin Operations

```typescript
import { adminService } from '@/services';

// Dashboard stats
const stats = await adminService.getDashboardStats();

// Manage events
const events = await adminService.getEvents();
await adminService.createEvent(eventData);
await adminService.publishEvent(id);

// Manage registrations
const registrations = await adminService.getRegistrations();
await adminService.cancelRegistration(id, 'reason');

// Generate report
const reportBlob = await adminService.generateReport({
  type: 'revenue',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  format: 'pdf'
});
```

## Speakers

```typescript
import { speakerService } from '@/services';

// Get speakers
const speakers = await speakerService.getSpeakers();

// Create speaker
await speakerService.createSpeaker({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  bio: 'Expert speaker'
});

// Assign to event
await speakerService.assignToEvent(speakerId, eventId);

// Check availability
const availability = await speakerService.getAvailability(id);
```

## Analytics

```typescript
import { analyticsService } from '@/services';

// Track page view
await analyticsService.trackPageView('/events/123', 'Event Title');

// Track event
await analyticsService.trackEvent('button_click', {
  category: 'engagement',
  label: 'register'
});

// Track conversion
await analyticsService.trackConversion({
  type: 'registration',
  eventId: 123,
  value: 100
});

// Get analytics
const eventAnalytics = await analyticsService.getEventAnalytics(eventId);
const userAnalytics = await analyticsService.getUserAnalytics();
```

## Notifications

```typescript
import { notificationService } from '@/services';

// Get notifications
const notifications = await notificationService.getNotifications();

// Mark as read
await notificationService.markAsRead(id);
await notificationService.markAllAsRead();

// Get unread count
const { count } = await notificationService.getUnreadCount();

// Update preferences
await notificationService.updatePreferences({
  emailNotifications: true,
  eventReminders: true
});

// Subscribe to push
await notificationService.subscribeToPush(subscription);
```

## Events

```typescript
import { eventsService } from '@/services';

// Search events
const results = await eventsService.searchEvents({
  search: 'conference',
  eventTypeId: 1,
  priceMax: 500
}, 1, 20);

// Get event
const event = await eventsService.getEventById('123');

// Get featured events
const featured = await eventsService.getFeaturedEvents(6);

// Check availability
const availability = await eventsService.checkEventAvailability('123', 2);
```

## Error Handling Pattern

```typescript
import { cartService } from '@/services';
import { toast } from '@/utils/toast';

try {
  const result = await cartService.addItem(item);

  if (result.success) {
    toast.success(result.message);
    // Handle success
  }
} catch (error) {
  toast.error('Failed to add item to cart');
  console.error(error);
}
```

## File Download Pattern

```typescript
import { certificateService } from '@/services';

// Download PDF
const pdfBlob = await certificateService.downloadCertificate(id);

// Create download link
const url = window.URL.createObjectURL(pdfBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'certificate.pdf';
link.click();
window.URL.revokeObjectURL(url);
```

## React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { cartService } from '@/services';
import type { Cart } from '@/types';

const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: any) => {
    try {
      const response = await cartService.addItem(item);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  return { cart, loading, error, addItem, reload: loadCart };
};

// Usage in component
const CartPage = () => {
  const { cart, loading, addItem } = useCart();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Cart ({cart?.totalItems})</h1>
      {/* Render cart items */}
    </div>
  );
};
```

## Response Format

All services return this format:

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

## Common Patterns

### Paginated Requests
```typescript
const events = await adminService.getEvents({
  page: 1,
  limit: 20,
  status: 'published'
});

console.log(events.pagination?.totalPages);
```

### File Upload
```typescript
const file = event.target.files[0];
await userService.uploadAvatar(file);
```

### Search with Filters
```typescript
const results = await eventsService.searchEvents({
  search: 'marketing',
  eventCategoryId: 5,
  priceMin: 0,
  priceMax: 1000,
  startDateFrom: '2025-01-01'
}, 1, 20);
```

### Conditional Operations
```typescript
if (user.role === 'admin') {
  const stats = await adminService.getDashboardStats();
} else {
  const profile = await userService.getProfile();
}
```

## Available Payment Gateways

- `paypal` - PayPal
- `stripe` - Stripe
- `neonet` - NeoNet (Guatemala)
- `bam` - BAM (Guatemala)

## Available Currencies

- `GTQ` - Guatemalan Quetzal
- `USD` - US Dollar

## Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:3001/api/v1
```

## Service Files Location

```
frontend/src/services/
├── index.ts              # Import from here
├── cartService.ts
├── paymentService.ts
├── felService.ts
├── certificateService.ts
├── userService.ts
├── adminService.ts
├── speakerService.ts
├── analyticsService.ts
├── notificationService.ts
└── eventsService.ts
```

## Quick Links

- Full Documentation: `frontend/src/services/README.md`
- Implementation Summary: `frontend/SERVICES_IMPLEMENTATION_SUMMARY.md`
- Type Definitions: `frontend/src/types/index.ts`
- Constants: `frontend/src/utils/constants.ts`

---

**Pro Tip:** Use TypeScript IntelliSense (Ctrl+Space) to see all available methods and their parameters!
