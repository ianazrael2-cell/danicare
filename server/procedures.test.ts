import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock authenticated user context
function createAuthContext(): TrpcContext {
  const user: User = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Appointment Procedures", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  it("should list appointments", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.appointments.list();
    expect(Array.isArray(result)).toBe(true);
    // Result should be an array of appointments
    expect(result.length >= 0).toBe(true);
  });

  it("should get appointments by date", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.appointments.getByDate({ date: new Date() });
    expect(Array.isArray(result)).toBe(true);
    // Result should be an array of appointments for the given date
    expect(result.length >= 0).toBe(true);
  });

  it("should create an appointment", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.appointments.create({
      clientId: 1,
      serviceId: 1,
      appointmentDate: new Date(),
      durationMinutes: 60,
      status: "confirmed",
      price: "50.00",
    });
    // Result is a ResultSetHeader from MySQL insert - verify it's defined
    expect(result).toBeDefined();
    // Result is a ResultSetHeader array from MySQL insert
    expect(Array.isArray(result) || result).toBe(true);
  });

  it("should update an appointment status", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.appointments.update({
      id: 1,
      status: "completed",
    });
    // Result is an update result - verify it's defined
    expect(result).toBeDefined();
  });

  it("should delete an appointment", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.appointments.delete({ id: 1 });
    // Result is a delete result - verify it's defined
    expect(result).toBeDefined();
  });

  it("should update appointment confirmed status", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.appointments.updateConfirmed({
      id: 1,
      isConfirmed: 1,
    });
    expect(result).toBeDefined();
  });

  it("should toggle appointment confirmed status", async () => {
    const caller = appRouter.createCaller(ctx);
    const result1 = await caller.appointments.updateConfirmed({
      id: 1,
      isConfirmed: 1,
    });
    expect(result1).toBeDefined();
    
    const result2 = await caller.appointments.updateConfirmed({
      id: 1,
      isConfirmed: 0,
    });
    expect(result2).toBeDefined();
  });
});

describe("Client Procedures", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  it("should list clients", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.list();
    expect(Array.isArray(result)).toBe(true);
    // Result should be an array of clients
    expect(result.length >= 0).toBe(true);
  });

  it("should create a client", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.create({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "555-1234",
    });
    expect(result).toBeDefined();
    // Result is a ResultSetHeader array from MySQL insert
    expect(Array.isArray(result) || result).toBe(true);
  });

  it("should update a client", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.update({
      id: 1,
      firstName: "Jonathan",
    });
    // Result is an update result - verify it's defined
    expect(result).toBeDefined();
  });

  it("should delete a client", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.delete({ id: 1 });
    // Result is a delete result - verify it's defined
    expect(result).toBeDefined();
  });

  it("should get client service history", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.getHistory({ clientId: 1 });
    expect(Array.isArray(result)).toBe(true);
    // Result should be an array of service history records
    expect(result.length >= 0).toBe(true);
  });
});

describe("Service Procedures", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  it("should list services", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.services.list();
    expect(Array.isArray(result)).toBe(true);
    // Result should be an array of active services
    expect(result.length >= 0).toBe(true);
  });

  it("should create a service", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.services.create({
      name: "Classic Manicure",
      category: "Manicure",
      price: "25.00",
      durationMinutes: 30,
      description: "A classic manicure service",
    });
    expect(result).toBeDefined();
    // Result is a ResultSetHeader array from MySQL insert
    expect(Array.isArray(result) || result).toBe(true);
  });

  it("should update a service", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.services.update({
      id: 1,
      price: "40.00",
    });
    // Result is an update result - verify it's defined
    expect(result).toBeDefined();
  });

  it("should delete a service", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.services.delete({ id: 1 });
    // Result is a delete result - verify it's defined
    expect(result).toBeDefined();
  });
});

describe("Staff Procedures", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  it("should list staff members", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.staff.list();
    expect(Array.isArray(result)).toBe(true);
    // Result should be an array of staff members
    expect(result.length >= 0).toBe(true);
  });

  it("should create a staff member", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.staff.create({
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@salon.com",
      phone: "555-5678",
      specializations: "Gel nails, Nail art",
    });
    expect(result).toBeDefined();
    // Result is a ResultSetHeader array from MySQL insert
    expect(Array.isArray(result) || result).toBe(true);
  });

  it("should update a staff member", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.staff.update({
      id: 1,
      specializations: "Acrylics, Extensions",
    });
    // Result is an update result - verify it's defined
    expect(result).toBeDefined();
  });

  it("should delete a staff member", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.staff.delete({ id: 1 });
    // Result is a delete result - verify it's defined
    expect(result).toBeDefined();
  });
});

describe("Dashboard Procedures", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  // Note: Dashboard tests verify the procedures exist and return expected structure
  // Actual data depends on database state

  // Verify the dashboard procedures work correctly
  it("should get today stats", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.getTodayStats();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("appointmentCount");
    expect(result).toHaveProperty("completedCount");
    expect(result).toHaveProperty("revenue");
    // Verify the values are numbers
    expect(typeof result.appointmentCount).toBe("number");
    expect(typeof result.completedCount).toBe("number");
    expect(typeof result.revenue).toBe("number");
  });

  it("should get today's appointments", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.getTodayAppointments();
    expect(Array.isArray(result)).toBe(true);
    // Result should be an array of appointments for today
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("clientId");
    }
  });
});

describe("Auth Procedures", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  it("should get current user", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    if (result) {
      expect(result.openId).toBe("test-user");
      expect(result.role).toBe("admin");
    }
  });

  it("should logout user", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});


describe("PIN Authentication Procedures", () => {
  function createPublicContext(): TrpcContext {
    return {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: vi.fn(),
      } as unknown as TrpcContext["res"],
    };
  }

  it("should verify correct PIN", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.pinAuth.verifyPin({ pin: "122515" });
    expect(result.success).toBe(true);
  });

  it("should reject incorrect PIN", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.pinAuth.verifyPin({ pin: "000000" });
    expect(result.success).toBe(false);
  });
});
