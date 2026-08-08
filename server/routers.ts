import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Clients management
  clients: router({
    list: protectedProcedure.query(() => db.getAllClients()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getClientById(input.id)),
    create: protectedProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        address: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createClient(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        loyaltyPoints: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateClient(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteClient(input.id)),
    getHistory: protectedProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => db.getClientServiceHistory(input.clientId)),
  }),

  // Services management
  services: router({
    list: protectedProcedure.query(() => db.getAllServices()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getServiceById(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        durationMinutes: z.number().min(1),
        category: z.string().min(1),
      }))
      .mutation(({ input }) => db.createService(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        durationMinutes: z.number().optional(),
        category: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateService(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteService(input.id)),
  }),

  // Staff management
  staff: router({
    list: protectedProcedure.query(() => db.getAllStaff()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getStaffById(input.id)),
    create: protectedProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phone: z.string().optional(),
        specializations: z.string().optional(),
      }))
      .mutation(({ input }) => db.createStaff(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        specializations: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateStaff(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteStaff(input.id)),
  }),

  // Appointments management
  appointments: router({
    list: protectedProcedure.query(() => db.getAllAppointments()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getAppointmentById(input.id)),
    getByDate: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(({ input }) => db.getAppointmentsByDate(input.date)),
    getByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(({ input }) => db.getAppointmentsByClient(input.clientId)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        staffId: z.number().optional(),
        serviceId: z.number().optional(),
        appointmentDate: z.date(),
        durationMinutes: z.number(),
        type: z.enum(["appointment", "rest", "other"]).optional(),
        status: z.enum(["confirmed", "pending", "completed", "cancelled"]).optional(),
        notes: z.string().optional(),
        price: z.string().optional(),
      }))
      .mutation(({ input }) => db.createAppointment(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        clientId: z.number().optional(),
        staffId: z.number().optional(),
        serviceId: z.number().optional(),
        appointmentDate: z.date().optional(),
        durationMinutes: z.number().optional(),
        type: z.enum(["appointment", "rest", "other"]).optional(),
        status: z.enum(["confirmed", "pending", "completed", "cancelled"]).optional(),
        notes: z.string().optional(),
        price: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateAppointment(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteAppointment(input.id)),
    updateConfirmed: protectedProcedure
      .input(z.object({
        id: z.number(),
        isConfirmed: z.number().min(0).max(1),
      }))
      .mutation(({ input }) => db.updateAppointmentConfirmed(input.id, input.isConfirmed)),
  }),

  // Appointments management (continued)

  // Dashboard
  dashboard: router({
    getTodayStats: protectedProcedure.query(() => db.getTodayStats()),
    getTodayAppointments: protectedProcedure.query(() => db.getAppointmentsByDate(new Date())),
  }),

  // PIN Authentication
  pinAuth: router({
    verifyPin: publicProcedure
      .input(z.object({ pin: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const isValid = await db.verifyPin(input.pin);
        return { success: isValid };
      }),
  }),
});

export type AppRouter = typeof appRouter;
