// Core types for TradeConnect Frontend

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  nit?: string;
  cui?: string;
  timezone?: string;
  locale?: string;
  roles: string[]; // Array de roles del backend
  isActive: boolean;
  isEmailVerified?: boolean;
  is2faEnabled?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  location?: string;
  virtualLocation?: string;
  isVirtual: boolean;
  price: number;
  currency: 'GTQ' | 'USD';
  capacity: number;
  availableSpots: number;
  minAge?: number;
  maxAge?: number;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  tags: string[];
  requirements?: string;
  isFeatured: boolean;
  isPublished: boolean;
  eventTypeId: number;
  eventCategoryId: number;
  eventStatusId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  eventType?: EventType;
  eventCategory?: EventCategory;
  eventStatus?: EventStatus;
  creator?: User;
  media?: EventMedia[];
  speakers?: Speaker[];
}

export interface EventType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface EventCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
}

export interface EventStatus {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export interface EventMedia {
  id: number;
  eventId: number;
  fileName: string;
  filePath: string;
  fileType: 'image' | 'video' | 'document';
  fileSize: number;
  mimeType: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Speaker {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  bio?: string;
  avatar?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  specialties: Specialty[];
  isActive: boolean;
}

export interface Specialty {
  id: number;
  name: string;
  description?: string;
}

export interface CartItem {
  id: number;
  eventId: number;
  participantType: 'individual' | 'empresa';
  quantity: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  total: number;
  isGroupRegistration: boolean;
  customFields?: Record<string, any>;
  participantData?: ParticipantData[];
  addedAt: string;
  // Relations
  event?: Event;
}

export interface ParticipantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nit?: string;
  cui?: string;
  position?: string;
  dietaryRestrictions?: string;
}

export interface Cart {
  id: number;
  sessionId?: string;
  userId?: number;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  promoCode?: string;
  promoDiscount: number;
  expiresAt?: string;
  lastActivity: string;
  isAbandoned: boolean;
  items: CartItem[];
}

export interface Payment {
  id: number;
  registrationId: number;
  transactionId: string;
  gateway: 'paypal' | 'stripe' | 'neonet' | 'bam';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded' | 'disputed' | 'expired';
  amount: number;
  currency: 'GTQ' | 'USD';
  description?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: number;
  registrationId: number;
  certificateTemplateId?: number;
  certificateNumber: string;
  hash: string;
  blockchainTxHash?: string;
  status: 'generated' | 'issued' | 'revoked';
  issuedAt: string;
  expiresAt?: string;
  downloadUrl?: string;
  qrCodeUrl?: string;
  // Relations
  registration?: EventRegistration;
  template?: CertificateTemplate;
}

export interface CertificateTemplate {
  id: number;
  name: string;
  description?: string;
  templateHtml: string;
  backgroundImageUrl?: string;
  logoUrl?: string;
  signatureImageUrl?: string;
  isActive: boolean;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  participantType: 'individual' | 'empresa';
  quantity: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  registrationStatus: 'confirmed' | 'pending' | 'cancelled';
  customFields?: Record<string, any>;
  participantData: ParticipantData[];
  registeredAt: string;
  // Relations
  event?: Event;
  user?: User;
  payments?: Payment[];
  certificate?: Certificate;
}

export interface ApiResponse<T = any> {
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

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface EventFilters extends PaginationParams {
  search?: string;
  eventTypeId?: number;
  eventCategoryId?: number;
  isVirtual?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  tags?: string[];
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

export interface CheckoutForm {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Billing Info (FEL)
  nit?: string;
  cui?: string;
  billingName?: string;
  billingAddress?: string;

  // Payment Method
  paymentMethod: 'card' | 'paypal' | 'bank_transfer';
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  holderName?: string;

  // Additional
  acceptTerms: boolean;
  newsletter?: boolean;
}

// Theme types
export interface ThemeColors {
  primary: string;
  'primary-light': string;
  'primary-dark': string;
  accent: string;
  secondary: string;
  'text-primary': string;
  'text-secondary': string;
  error: string;
  success: string;
  warning: string;
  info: string;
  background: string;
  surface: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => Promise<void>;
  updateItem: (itemId: number, updates: Partial<CartItem>) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Keys>> }[Keys];