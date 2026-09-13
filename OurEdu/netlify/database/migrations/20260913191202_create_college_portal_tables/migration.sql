CREATE TABLE "attendance_records" (
	"id" serial PRIMARY KEY,
	"student_id" integer NOT NULL,
	"date" date NOT NULL,
	"subject" text,
	"status" text NOT NULL,
	"verification_photo" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "attendance_records_student_id_date_subject_unique" UNIQUE("student_id","date","subject")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY,
	"firebase_uid" text UNIQUE,
	"email" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"mobile" text,
	"roll_no" text,
	"department" text,
	"branch" text,
	"profile_image" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"phone" text,
	"department" text,
	"roll_no" text UNIQUE,
	"year" integer DEFAULT 1,
	"attendance" integer DEFAULT 0,
	"fees_status" text DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now()
);
