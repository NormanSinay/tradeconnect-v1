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
  BlockchainHash
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
  BlockchainHash
};

// Exportar por defecto
export default sequelize;