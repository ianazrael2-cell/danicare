import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Clients table
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  address: varchar("address", { length: 500 }),
  phone: varchar("phone", { length: 20 }),
  loyaltyPoints: int("loyaltyPoints").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Services table
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // manicure, pedicure, nail art, etc.
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Staff table
export const staff = mysqlTable("staff", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  specializations: text("specializations"), // JSON array of service IDs or categories
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;

// Appointments table
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId"),
  staffId: int("staffId"),
  serviceId: int("serviceId"),
  appointmentDate: timestamp("appointmentDate").notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  type: mysqlEnum("type", ["appointment", "rest", "other"]).default("appointment").notNull(),
  status: mysqlEnum("status", ["confirmed", "pending", "completed", "cancelled"]).default("pending").notNull(),
  isConfirmed: int("isConfirmed").default(0).notNull(), // 1 for confirmed/slashed, 0 for not confirmed
  notes: text("notes"),
  price: decimal("price", { precision: 8, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// Client Service History table (for tracking what services each client has used)
export const clientServiceHistory = mysqlTable("clientServiceHistory", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  serviceId: int("serviceId").notNull(),
  appointmentId: int("appointmentId"),
  visitDate: timestamp("visitDate").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientServiceHistory = typeof clientServiceHistory.$inferSelect;
export type InsertClientServiceHistory = typeof clientServiceHistory.$inferInsert;

// Design Add-Ons table
export const designAddOns = mysqlTable("designAddOns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // Glitters, Rhinestones, etc.
  pricePerNail: decimal("pricePerNail", { precision: 8, scale: 2 }).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DesignAddOn = typeof designAddOns.$inferSelect;
export type InsertDesignAddOn = typeof designAddOns.$inferInsert;

// Appointment Add-Ons table (junction table for appointments and add-ons)
export const appointmentAddOns = mysqlTable("appointmentAddOns", {
  id: int("id").autoincrement().primaryKey(),
  appointmentId: int("appointmentId").notNull(),
  addOnId: int("addOnId").notNull(),
  quantity: int("quantity").notNull(), // number of nails
  pricePerNail: decimal("pricePerNail", { precision: 8, scale: 2 }).notNull(), // price at time of booking
  totalPrice: decimal("totalPrice", { precision: 8, scale: 2 }).notNull(), // quantity * pricePerNail
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AppointmentAddOn = typeof appointmentAddOns.$inferSelect;
export type InsertAppointmentAddOn = typeof appointmentAddOns.$inferInsert;

// PIN Authentication table for admin access
export const pinAuth = mysqlTable("pinAuth", {
  id: int("id").autoincrement().primaryKey(),
  pin: varchar("pin", { length: 255 }).notNull(), // hashed PIN
  isActive: int("isActive").default(1).notNull(), // 1 for true, 0 for false
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PinAuth = typeof pinAuth.$inferSelect;
export type InsertPinAuth = typeof pinAuth.$inferInsert;
