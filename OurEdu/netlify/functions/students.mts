import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { students } from "../../db/schema.js";

export default async (req: Request, context: Context) => {
  const id = context.params.id ? Number(context.params.id) : null;

  if (req.method === "GET" && id === null) {
    const rows = await db.select().from(students).orderBy(desc(students.id));
    return Response.json(rows);
  }

  if (req.method === "GET" && id !== null) {
    const [row] = await db.select().from(students).where(eq(students.id, id));
    if (!row) return Response.json({ error: "Student not found" }, { status: 404 });
    return Response.json(row);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { name, email, phone, department, rollNo, year } = body;
    if (!name || !email) return Response.json({ error: "name and email are required" }, { status: 400 });
    const [row] = await db.insert(students).values({
      name,
      email,
      phone: phone ?? null,
      department: department ?? null,
      rollNo: rollNo ?? null,
      year: year ?? 1,
    }).returning();
    return Response.json(row, { status: 201 });
  }

  if (req.method === "PUT" && id !== null) {
    const body = await req.json();
    const { name, email, phone, department, rollNo, year } = body;
    await db.update(students).set({ name, email, phone, department, rollNo, year }).where(eq(students.id, id));
    return Response.json({ message: "Student updated successfully" });
  }

  if (req.method === "DELETE" && id !== null) {
    await db.delete(students).where(eq(students.id, id));
    return Response.json({ message: "Student deleted" });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/students", "/api/students/:id"],
};
