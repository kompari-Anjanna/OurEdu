import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { attendanceRecords } from "../../db/schema.js";

interface BulkRecord {
  studentId: number;
  status: "Present" | "Absent";
  verificationPhoto?: string | null;
}

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const body = await req.json();
  const { subject, date, records } = body as { subject?: string; date?: string; records?: BulkRecord[] };
  if (!date || !Array.isArray(records)) {
    return Response.json({ error: "date and records[] are required" }, { status: 400 });
  }

  for (const record of records) {
    await db.insert(attendanceRecords).values({
      studentId: record.studentId,
      date,
      subject: subject ?? null,
      status: record.status,
      verificationPhoto: record.verificationPhoto ?? null,
    }).onConflictDoUpdate({
      target: [attendanceRecords.studentId, attendanceRecords.date, attendanceRecords.subject],
      set: { status: record.status, verificationPhoto: record.verificationPhoto ?? null },
    });
  }

  return Response.json({ message: `Attendance saved for ${records.length} students` });
};

export const config: Config = {
  path: "/api/attendance/bulk",
};
