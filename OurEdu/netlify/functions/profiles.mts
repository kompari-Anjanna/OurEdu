import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { profiles } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method === "GET") {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) return Response.json({ error: "email is required" }, { status: 400 });
    const [profile] = await db.select().from(profiles).where(eq(profiles.email, email));
    return Response.json(profile ?? null);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { uid, email, name, role, mobile, rollNo, department, branch, image } = body;
    if (!email || !name || !role) {
      return Response.json({ error: "email, name, and role are required" }, { status: 400 });
    }

    const [existing] = await db.select().from(profiles).where(eq(profiles.email, email));
    if (existing) {
      await db.update(profiles).set({
        firebaseUid: uid ?? existing.firebaseUid,
        name,
        role,
        mobile: mobile ?? null,
        rollNo: rollNo ?? null,
        department: department ?? null,
        branch: branch ?? null,
        profileImage: image ?? null,
        updatedAt: new Date(),
      }).where(eq(profiles.email, email));
    } else {
      await db.insert(profiles).values({
        firebaseUid: uid ?? null,
        email,
        name,
        role,
        mobile: mobile ?? null,
        rollNo: rollNo ?? null,
        department: department ?? null,
        branch: branch ?? null,
        profileImage: image ?? null,
      });
    }
    return Response.json({ message: "Profile saved successfully" });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/profiles",
};
