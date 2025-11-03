/**
 * @fileoverview Inicialización de modelos Sequelize TypeScript
 * @version 1.0.0
 * @author TradeConnect Team
 */

// Importar la instancia de Sequelize
import sequelize from '../config/database';

// Importar todos los modelos
import { Permission } from './Permission';
import { Role } from './Role';
import { User } from './User';
import { RolePermission } from './RolePermission';
import { UserRole } from './UserRole';
import { Session } from './Session';
import { AuditLog } from './AuditLog';
import { TwoFactorAuth } from './TwoFactorAuth';

// Importar modelos de eventos
import { EventType } from './EventType';
import { EventCategory } from './EventCategory';
import { EventStatus } from './EventStatus';
import { Event } from './Event';
import { EventTemplate } from './EventTemplate';
import { EventDuplication } from './EventDuplication';
import { EventRegistration } from './EventRegistration';
import { EventMedia } from './EventMedia';
import { EventSession } from './EventSession';

// Importar modelos de speakers
import { Specialty } from './Specialty';
import { Speaker } from './Speaker';
import { SpeakerSpecialty } from './SpeakerSpecialty';
import { SpeakerAvailabilityBlock } from './SpeakerAvailabilityBlock';
import { SpeakerEvent } from './SpeakerEvent';
import { Contract } from './Contract';
import { SpeakerPayment } from './SpeakerPayment';
import { SpeakerEvaluation } from './SpeakerEvaluation';

// Importar modelos de inscripciones
import { Registration } from './Registration';
import { GroupRegistration } from './GroupRegistration';
import { Cart } from './Cart';
import { CartItem } from './CartItem';
import { CartSession } from './CartSession';
import { AbandonedCart } from './AbandonedCart';

// Importar modelos de pagos
import { Payment } from './Payment';
import { PaymentMethod } from './PaymentMethod';
import { Refund } from './Refund';
import { PaymentReconciliation } from './PaymentReconciliation';

// Importar modelos FEL
import { Invoice } from './Invoice';
import { FelDocument } from './FelDocument';
import { FelToken } from './FelToken';
import { NitValidation } from './NitValidation';
import { CuiValidation } from './CuiValidation';
import { FelError } from './FelError';
import { FelAuditLog } from './FelAuditLog';

// Importar modelos de promociones y descuentos
import { Promotion } from './Promotion';
import { PromoCode } from './PromoCode';
import { VolumeDiscount } from './VolumeDiscount';
import { EarlyBirdDiscount } from './EarlyBirdDiscount';
import { PromoCodeUsage } from './PromoCodeUsage';
import { AdvancedCoupon } from './AdvancedCoupon';
import { AdvancedCouponUsage } from './AdvancedCouponUsage';

// Importar modelos de gestión de aforos
import { Capacity } from './Capacity';
import { AccessType } from './AccessType';
import { Overbooking } from './Overbooking';
import { CapacityRule } from './CapacityRule';
import { Waitlist } from './Waitlist';

// Importar modelos QR y control de acceso
import { QRCode } from './QRCode';
import { Attendance } from './Attendance';
import { AccessLog } from './AccessLog';
import { QrSyncLog } from './QrSyncLog';
import { BlockchainHash } from './BlockchainHash';

// Importar modelos de certificados
import { CertificateTemplate } from './CertificateTemplate';
import { Certificate } from './Certificate';
import { CertificateValidationLog } from './CertificateValidationLog';

// Importar modelos de notificaciones
import { Notification } from './Notification';
import { NotificationLog } from './NotificationLog';
import { EmailTemplate } from './EmailTemplate';
import { NotificationRule } from './NotificationRule';
import { UserNotificationPreferences } from './UserNotificationPreferences';

// Importar modelo de configuración del sistema
import { SystemConfig } from './SystemConfig';

// Importar modelos de banners y anuncios promocionales
import { Banner } from './Banner';
import { PromotionalAd } from './PromotionalAd';

// Importar modelos de blog/artículos
import { Article } from './Article';
import { ArticleCategory } from './ArticleCategory';
import { Tag } from './Tag';
import { ArticleTag } from './ArticleTag';
import { Comment } from './Comment';

// Importar modelos de CMS
import { StaticPage } from './StaticPage';
import { Term } from './Term';
import { Policy } from './Policy';
import { Faq } from './Faq';

// Importar modelos de referidos
import { ReferralCode } from './ReferralCode';
import { Referral } from './Referral';
import { ReferralTracking } from './ReferralTracking';
import { ReferralReward } from './ReferralReward';

// Importar modelos de gamificación
import { LoyaltyPoint } from './LoyaltyPoint';
import { Badge } from './Badge';
import { UserBadge } from './UserBadge';

// Importar modelos avanzados de RBAC
import { PermissionGroup } from './PermissionGroup';
import { PermissionContext } from './PermissionContext';
import { PermissionPolicy } from './PermissionPolicy';

// Importar modelos avanzados de gamificación
import { Quest } from './Quest';
import { Achievement } from './Achievement';
import { Level } from './Level';
import { Reward } from './Reward';

// Importar modelos de importación masiva de usuarios
import { UserImport } from './UserImport';
import { UserImportError } from './UserImportError';

// Agregar modelos a la instancia de Sequelize
sequelize.addModels([
  Permission,
  Role,
  User,
  RolePermission,
  UserRole,
  Session,
  AuditLog,
  TwoFactorAuth,
  // Modelos de eventos
  EventType,
  EventCategory,
  EventStatus,
  Event,
  EventTemplate,
  EventDuplication,
  EventRegistration,
  EventMedia,
  EventSession,
  // Modelos de speakers
  Specialty,
  Speaker,
  SpeakerSpecialty,
  SpeakerAvailabilityBlock,
  SpeakerEvent,
  Contract,
  SpeakerPayment,
  SpeakerEvaluation,
  // Modelos de inscripciones
  Registration,
  GroupRegistration,
  Cart,
  CartItem,
  CartSession,
  AbandonedCart,
  // Modelos de pagos
  Payment,
  PaymentMethod,
  Refund,
  PaymentReconciliation,
  // Modelos FEL
  Invoice,
  FelDocument,
  FelToken,
  NitValidation,
  CuiValidation,
  FelError,
  FelAuditLog,
  // Modelos de promociones y descuentos
  Promotion,
  PromoCode,
  VolumeDiscount,
  EarlyBirdDiscount,
  PromoCodeUsage,
  AdvancedCoupon,
  AdvancedCouponUsage,
  // Modelos de gestión de aforos
  Capacity,
  AccessType,
  Overbooking,
  CapacityRule,
  Waitlist,
  // Modelos QR y control de acceso
  QRCode,
  Attendance,
  AccessLog,
  QrSyncLog,
  BlockchainHash,
  // Modelos de certificados
  CertificateTemplate,
  Certificate,
  CertificateValidationLog,
  // Modelos de notificaciones
  Notification,
  NotificationLog,
  EmailTemplate,
  NotificationRule,
  UserNotificationPreferences,
  // Modelo de configuración del sistema
  SystemConfig,
  // Modelos de banners y anuncios promocionales
  Banner,
  PromotionalAd,
  // Modelos de blog/artículos
  Article,
  ArticleCategory,
  Tag,
  ArticleTag,
  Comment,
  // Modelos de CMS
  StaticPage,
  Term,
  Policy,
  Faq,
  // Modelos de referidos
  ReferralCode,
  Referral,
  ReferralTracking,
  ReferralReward,
  // Modelos de gamificación
  LoyaltyPoint,
  Badge,
  UserBadge,
  // Modelos avanzados de RBAC
  PermissionGroup,
  PermissionContext,
  PermissionPolicy,
  // Modelos avanzados de gamificación
  Quest,
  Achievement,
  Level,
  Reward,
  // Modelos de importación masiva de usuarios
  UserImport,
  UserImportError
  ]);

// Exportar modelos y sequelize
export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  UserRole,
  Session,
  AuditLog,
  TwoFactorAuth,
  // Modelos de eventos
  EventType,
  EventCategory,
  EventStatus,
  Event,
  EventTemplate,
  EventDuplication,
  EventRegistration,
  EventMedia,
  EventSession,
  // Modelos de speakers
  Specialty,
  Speaker,
  SpeakerSpecialty,
  SpeakerAvailabilityBlock,
  SpeakerEvent,
  Contract,
  SpeakerPayment,
  SpeakerEvaluation,
  // Modelos de inscripciones
  Registration,
  GroupRegistration,
  Cart,
  CartItem,
  CartSession,
  AbandonedCart,
  // Modelos de pagos
  Payment,
  PaymentMethod,
  Refund,
  PaymentReconciliation,
  // Modelos FEL
  Invoice,
  FelDocument,
  FelToken,
  NitValidation,
  CuiValidation,
  FelError,
  FelAuditLog,
  // Modelos de promociones y descuentos
  Promotion,
  PromoCode,
  VolumeDiscount,
  EarlyBirdDiscount,
  PromoCodeUsage,
  AdvancedCoupon,
  AdvancedCouponUsage,
  // Modelos de gestión de aforos
  Capacity,
  AccessType,
  Overbooking,
  CapacityRule,
  Waitlist,
  // Modelos QR y control de acceso
  QRCode,
  Attendance,
  AccessLog,
  QrSyncLog,
  BlockchainHash,
  // Modelos de certificados
  CertificateTemplate,
  Certificate,
  CertificateValidationLog,
  // Modelos de notificaciones
  Notification,
  NotificationLog,
  EmailTemplate,
  NotificationRule,
  UserNotificationPreferences,
  // Modelo de configuración del sistema
  SystemConfig,
  // Modelos de banners y anuncios promocionales
  Banner,
  PromotionalAd,
  // Modelos de blog/artículos
  Article,
  ArticleCategory,
  Tag,
  ArticleTag,
  Comment,
  // Modelos de CMS
  StaticPage,
  Term,
  Policy,
  Faq,
  // Modelos de referidos
  ReferralCode,
  Referral,
  ReferralTracking,
  ReferralReward,
  // Modelos de gamificación
  LoyaltyPoint,
  Badge,
  UserBadge,
  // Modelos avanzados de RBAC
  PermissionGroup,
  PermissionContext,
  PermissionPolicy,
  // Modelos avanzados de gamificación
  Quest,
  Achievement,
  Level,
  Reward,
  // Modelos de importación masiva de usuarios
  UserImport,
  UserImportError
  };

// Exportar por defecto
export default sequelize;
