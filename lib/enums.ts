/**
 * Domain Enums
 * 
 * TypeScript enums for domain values that would be database enums in PostgreSQL.
 * Since this project uses SQLite, we use TypeScript enums for type safety.
 * 
 * When migrating to PostgreSQL, convert these to Prisma enums.
 * 
 * Usage:
 *   import { UserRole, PaymentStatus } from '@/lib/enums'
 *   
 *   const role: UserRole = UserRole.ADMIN
 *   if (user.role === UserRole.ADMIN) { ... }
 */

// ============================================
// User & Auth
// ============================================

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT',
}

export const USER_ROLES = [UserRole.OWNER, UserRole.ADMIN, UserRole.RESIDENT] as const

// ============================================
// Subscriptions
// ============================================

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export const SUBSCRIPTION_STATUSES = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.SUSPENDED,
  SubscriptionStatus.CANCELLED,
  SubscriptionStatus.EXPIRED,
] as const

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export const BILLING_CYCLES = [BillingCycle.MONTHLY, BillingCycle.YEARLY] as const

// ============================================
// Residence
// ============================================

export enum ResidenceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export const RESIDENCE_STATUSES = [
  ResidenceStatus.ACTIVE,
  ResidenceStatus.INACTIVE,
  ResidenceStatus.MAINTENANCE,
] as const

// ============================================
// Apartment
// ============================================

export enum ApartmentType {
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  T4 = 'T4',
  STUDIO = 'Studio',
}

export const APARTMENT_TYPES = [
  ApartmentType.T1,
  ApartmentType.T2,
  ApartmentType.T3,
  ApartmentType.T4,
  ApartmentType.STUDIO,
] as const

export enum ApartmentStatus {
  OCCUPIED = 'OCCUPIED',
  VACANT = 'VACANT',
}

export const APARTMENT_STATUSES = [
  ApartmentStatus.OCCUPIED,
  ApartmentStatus.VACANT,
] as const

export enum OccupancyType {
  OWNER_OCCUPIED = 'OWNER_OCCUPIED',
  RENTED = 'RENTED',
}

export const OCCUPANCY_TYPES = [
  OccupancyType.OWNER_OCCUPIED,
  OccupancyType.RENTED,
] as const

// ============================================
// Payments & Charges
// ============================================

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export const PAYMENT_STATUSES = [
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.OVERDUE,
] as const

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  CHEQUE = 'CHEQUE',
}

export const PAYMENT_METHODS = [
  PaymentMethod.CASH,
  PaymentMethod.CARD,
  PaymentMethod.TRANSFER,
  PaymentMethod.CHEQUE,
] as const

export enum ChargeCategory {
  WATER = 'WATER',
  ELECTRICITY = 'ELECTRICITY',
  ELEVATOR = 'ELEVATOR',
  CLEANING = 'CLEANING',
  SECURITY = 'SECURITY',
  OTHER = 'OTHER',
}

export const CHARGE_CATEGORIES = [
  ChargeCategory.WATER,
  ChargeCategory.ELECTRICITY,
  ChargeCategory.ELEVATOR,
  ChargeCategory.CLEANING,
  ChargeCategory.SECURITY,
  ChargeCategory.OTHER,
] as const

// ============================================
// Maintenance
// ============================================

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const MAINTENANCE_STATUSES = [
  MaintenanceStatus.PENDING,
  MaintenanceStatus.IN_PROGRESS,
  MaintenanceStatus.COMPLETED,
  MaintenanceStatus.CANCELLED,
] as const

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const MAINTENANCE_PRIORITIES = [
  MaintenancePriority.LOW,
  MaintenancePriority.MEDIUM,
  MaintenancePriority.HIGH,
  MaintenancePriority.URGENT,
] as const

export enum MaintenanceCategory {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  ELEVATOR = 'ELEVATOR',
  HVAC = 'HVAC',
  OTHER = 'OTHER',
}

export const MAINTENANCE_CATEGORIES = [
  MaintenanceCategory.PLUMBING,
  MaintenanceCategory.ELECTRICAL,
  MaintenanceCategory.ELEVATOR,
  MaintenanceCategory.HVAC,
  MaintenanceCategory.OTHER,
] as const

// ============================================
// Announcements
// ============================================

export enum AnnouncementType {
  GENERAL = 'GENERAL',
  URGENT = 'URGENT',
  EVENT = 'EVENT',
  MAINTENANCE = 'MAINTENANCE',
}

export const ANNOUNCEMENT_TYPES = [
  AnnouncementType.GENERAL,
  AnnouncementType.URGENT,
  AnnouncementType.EVENT,
  AnnouncementType.MAINTENANCE,
] as const

export enum AnnouncementPriority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

export const ANNOUNCEMENT_PRIORITIES = [
  AnnouncementPriority.NORMAL,
  AnnouncementPriority.HIGH,
] as const

// ============================================
// Documents
// ============================================

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  POLICY = 'POLICY',
  OTHER = 'OTHER',
}

export const DOCUMENT_TYPES = [
  DocumentType.CONTRACT,
  DocumentType.INVOICE,
  DocumentType.RECEIPT,
  DocumentType.POLICY,
  DocumentType.OTHER,
] as const

// ============================================
// Localization
// ============================================

export enum Language {
  FR = 'fr',
  AR = 'ar',
  EN = 'en',
}

export const LANGUAGES = [Language.FR, Language.AR, Language.EN] as const

// ============================================
// Subscription Requests
// ============================================

export enum SubscriptionRequestStatus {
  PENDING = 'PENDING',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAYMENT_PROOF_UPLOADED = 'PAYMENT_PROOF_UPLOADED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export const SUBSCRIPTION_REQUEST_STATUSES = [
  SubscriptionRequestStatus.PENDING,
  SubscriptionRequestStatus.WAITING_PAYMENT,
  SubscriptionRequestStatus.PAYMENT_PROOF_UPLOADED,
  SubscriptionRequestStatus.APPROVED,
  SubscriptionRequestStatus.REJECTED,
  SubscriptionRequestStatus.EXPIRED,
] as const

// ============================================
// Type Guards
// ============================================

export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole)
}

export function isBillingCycle(value: string): value is BillingCycle {
  return Object.values(BillingCycle).includes(value as BillingCycle)
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return Object.values(PaymentStatus).includes(value as PaymentStatus)
}

export function isPaymentMethod(value: string): value is PaymentMethod {
  return Object.values(PaymentMethod).includes(value as PaymentMethod)
}

export function isChargeCategory(value: string): value is ChargeCategory {
  return Object.values(ChargeCategory).includes(value as ChargeCategory)
}

export function isMaintenanceStatus(value: string): value is MaintenanceStatus {
  return Object.values(MaintenanceStatus).includes(value as MaintenanceStatus)
}

export function isMaintenancePriority(value: string): value is MaintenancePriority {
  return Object.values(MaintenancePriority).includes(value as MaintenancePriority)
}

export function isMaintenanceCategory(value: string): value is MaintenanceCategory {
  return Object.values(MaintenanceCategory).includes(value as MaintenanceCategory)
}

export function isApartmentStatus(value: string): value is ApartmentStatus {
  return Object.values(ApartmentStatus).includes(value as ApartmentStatus)
}

export function isApartmentType(value: string): value is ApartmentType {
  return Object.values(ApartmentType).includes(value as ApartmentType)
}

export function isResidenceStatus(value: string): value is ResidenceStatus {
  return Object.values(ResidenceStatus).includes(value as ResidenceStatus)
}

export function isSubscriptionStatus(value: string): value is SubscriptionStatus {
  return Object.values(SubscriptionStatus).includes(value as SubscriptionStatus)
}

export function isAnnouncementType(value: string): value is AnnouncementType {
  return Object.values(AnnouncementType).includes(value as AnnouncementType)
}

export function isAnnouncementPriority(value: string): value is AnnouncementPriority {
  return Object.values(AnnouncementPriority).includes(value as AnnouncementPriority)
}

export function isDocumentType(value: string): value is DocumentType {
  return Object.values(DocumentType).includes(value as DocumentType)
}

export function isLanguage(value: string): value is Language {
  return Object.values(Language).includes(value as Language)
}

export function isSubscriptionRequestStatus(value: string): value is SubscriptionRequestStatus {
  return Object.values(SubscriptionRequestStatus).includes(value as SubscriptionRequestStatus)
}
