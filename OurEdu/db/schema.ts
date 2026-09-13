import { pgTable, serial, text, integer, timestamp, date, unique } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: serial().primaryKey(),
  firebaseUid: text("firebase_uid").unique(),
  email: text().notNull().unique(),
  name: text().notNull(),
  role: text().notNull(),
  mobile: text(),
  rollNo: text("roll_no"),
  department: text(),
  branch: text(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  phone: text(),
  department: text(),
  rollNo: text("roll_no").unique(),
  year: integer().default(1),
  attendance: integer().default(0),
  feesStatus: text("fees_status").default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: serial().primaryKey(),
  studentId: integer("student_id").notNull(),
  date: date().notNull(),
  subject: text(),
  status: text().notNull(),
  verificationPhoto: text("verification_photo"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.studentId, table.date, table.subject),
]);
