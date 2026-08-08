import { and, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, services, staff, appointments, clientServiceHistory, pinAuth } from "../drizzle/schema";
import type { InsertClient, InsertService, InsertStaff, InsertAppointment, InsertClientServiceHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Clients queries
export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients);
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result;
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(clients).where(eq(clients.id, id));
}

// Services queries
export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).where(eq(services.isActive, 1));
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0];
}

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(services).values(data);
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(services).set(data).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(services).set({ isActive: 0 }).where(eq(services.id, id));
}

// Staff queries
export async function getAllStaff() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staff).where(eq(staff.isActive, 1));
}

export async function getStaffById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
  return result[0];
}

export async function createStaff(data: InsertStaff) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(staff).values(data);
}

export async function updateStaff(id: number, data: Partial<InsertStaff>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(staff).set(data).where(eq(staff.id, id));
}

export async function deleteStaff(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(staff).set({ isActive: 0 }).where(eq(staff.id, id));
}

// Appointments queries
export async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments);
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result[0];
}

export async function getAppointmentsByDate(date: Date) {
  const db = await getDb();
  if (!db) return [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return db.select().from(appointments).where(
    and(
      gte(appointments.appointmentDate, startOfDay),
      lte(appointments.appointmentDate, endOfDay)
    )
  );
}

export async function getAppointmentsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.clientId, clientId));
}

export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(appointments).values(data);
}

export async function updateAppointment(id: number, data: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(appointments).set(data).where(eq(appointments.id, id));
}

export async function deleteAppointment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(appointments).where(eq(appointments.id, id));
}

export async function updateAppointmentConfirmed(id: number, isConfirmed: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(appointments).set({ isConfirmed }).where(eq(appointments.id, id));
}

// Client Service History queries
export async function getClientServiceHistory(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientServiceHistory).where(eq(clientServiceHistory.clientId, clientId));
}

export async function addClientServiceHistory(data: InsertClientServiceHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(clientServiceHistory).values(data);
}

// Dashboard queries
export async function getDailyRevenue(date: Date) {
  const db = await getDb();
  if (!db) return 0;
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  const result = await db.select().from(appointments).where(
    and(
      gte(appointments.appointmentDate, startOfDay),
      lte(appointments.appointmentDate, endOfDay),
      eq(appointments.status, "completed")
    )
  );
  return result.reduce((sum, apt) => sum + (parseFloat(apt.price?.toString() || "0")), 0);
}

export async function getTodayStats() {
  const db = await getDb();
  if (!db) return { appointmentCount: 0, completedCount: 0, revenue: 0 };
  const today = new Date();
  const appointments_today = await getAppointmentsByDate(today);
  const completedCount = appointments_today.filter(a => a.status === "completed").length;
  const revenue = await getDailyRevenue(today);
  return {
    appointmentCount: appointments_today.length,
    completedCount,
    revenue,
  };
}


// PIN Authentication queries
export async function getPinAuth() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pinAuth).where(eq(pinAuth.isActive, 1)).limit(1);
  return result[0] || null;
}

export async function verifyPin(inputPin: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const pinRecord = await getPinAuth();
  if (!pinRecord) return false;
  
  // Simple PIN verification (in production, use proper hashing like bcrypt)
  return pinRecord.pin === inputPin;
}

export async function initializePinAuth(pin: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete existing PIN records
  await db.delete(pinAuth);
  
  // Insert new PIN
  return db.insert(pinAuth).values({
    pin: pin, // In production, hash this with bcrypt
    isActive: 1,
  });
}
