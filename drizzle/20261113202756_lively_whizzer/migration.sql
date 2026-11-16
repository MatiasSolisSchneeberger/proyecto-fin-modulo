CREATE TYPE "item_segment" AS ENUM('full', 'main', 'post_credits', 'bonus', 'episode');--> statement-breakpoint
CREATE TYPE "title_kind" AS ENUM('movie', 'series', 'short', 'special');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "watch_status" AS ENUM('watched', 'skipped');--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL UNIQUE,
	"website_url" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "production_studios" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL UNIQUE,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "tag_categories" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL UNIQUE,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL UNIQUE,
	"description" text,
	"category_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universes" (
	"id" serial PRIMARY KEY,
	"code" varchar(50) NOT NULL UNIQUE,
	"name" varchar(150) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" serial PRIMARY KEY,
	"series_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"air_date" date,
	CONSTRAINT "uq_episodes_series_season_number" UNIQUE("series_id","season_number","episode_number")
);
--> statement-breakpoint
CREATE TABLE "title_editions" (
	"id" serial PRIMARY KEY,
	"title_id" integer NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"release_date" date NOT NULL,
	CONSTRAINT "uq_editions_title_slug" UNIQUE("title_id","slug")
);
--> statement-breakpoint
CREATE TABLE "title_platforms" (
	"title_id" integer,
	"platform_id" integer,
	CONSTRAINT "title_platforms_pkey" PRIMARY KEY("title_id","platform_id")
);
--> statement-breakpoint
CREATE TABLE "title_production_studios" (
	"title_id" integer,
	"studio_id" integer,
	CONSTRAINT "title_production_studios_pkey" PRIMARY KEY("title_id","studio_id")
);
--> statement-breakpoint
CREATE TABLE "title_tags" (
	"title_id" integer,
	"tag_id" integer,
	"is_spoiler" boolean DEFAULT false NOT NULL,
	CONSTRAINT "title_tags_pkey" PRIMARY KEY("title_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "titles" (
	"id" serial PRIMARY KEY,
	"kind" "title_kind" NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"release_date" date NOT NULL,
	"poster_url" text,
	"synopsis" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_entries" (
	"timeline_id" integer,
	"item_id" integer,
	"order_key" text COLLATE "C" NOT NULL,
	CONSTRAINT "timeline_entries_pkey" PRIMARY KEY("timeline_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "timeline_item_notes" (
	"id" serial PRIMARY KEY,
	"item_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_spoiler" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_items" (
	"id" serial PRIMARY KEY,
	"title_id" integer NOT NULL,
	"episode_id" integer UNIQUE,
	"edition_id" integer,
	"segment" "item_segment" DEFAULT 'full'::"item_segment" NOT NULL,
	"label" varchar(150),
	"description" text,
	"duration_minutes" integer NOT NULL,
	"universe_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_items_duration_positive" CHECK ("duration_minutes" > 0),
	CONSTRAINT "ck_items_episode_segment" CHECK (("episode_id" IS NOT NULL) = ("segment" = 'episode'))
);
--> statement-breakpoint
CREATE TABLE "timelines" (
	"id" serial PRIMARY KEY,
	"slug" varchar(100) NOT NULL UNIQUE,
	"name" varchar(150) NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_watch_progress" (
	"user_id" uuid,
	"item_id" integer,
	"status" "watch_status" DEFAULT 'watched'::"watch_status" NOT NULL,
	"watched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_watch_progress_pkey" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" varchar(50) NOT NULL UNIQUE,
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'user'::"user_role" NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_tags_category" ON "tags" ("category_id");--> statement-breakpoint
CREATE INDEX "idx_title_platforms_platform" ON "title_platforms" ("platform_id");--> statement-breakpoint
CREATE INDEX "idx_title_studios_studio" ON "title_production_studios" ("studio_id");--> statement-breakpoint
CREATE INDEX "idx_title_tags_tag" ON "title_tags" ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_titles_release_date" ON "titles" ("release_date");--> statement-breakpoint
CREATE INDEX "idx_titles_title" ON "titles" ("title");--> statement-breakpoint
CREATE INDEX "idx_titles_kind" ON "titles" ("kind");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_entries_timeline_order" ON "timeline_entries" ("timeline_id","order_key");--> statement-breakpoint
CREATE INDEX "idx_entries_item" ON "timeline_entries" ("item_id");--> statement-breakpoint
CREATE INDEX "idx_notes_item" ON "timeline_item_notes" ("item_id");--> statement-breakpoint
CREATE INDEX "idx_items_title" ON "timeline_items" ("title_id");--> statement-breakpoint
CREATE INDEX "idx_items_universe" ON "timeline_items" ("universe_id");--> statement-breakpoint
CREATE INDEX "idx_items_edition" ON "timeline_items" ("edition_id");--> statement-breakpoint
CREATE INDEX "idx_items_segment" ON "timeline_items" ("segment");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_items_title_main" ON "timeline_items" ("title_id","segment") WHERE "segment" IN ('full', 'main') AND "edition_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_timelines_default" ON "timelines" ("is_default") WHERE "is_default";--> statement-breakpoint
CREATE INDEX "idx_progress_item" ON "user_watch_progress" ("item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_users_email_lower" ON "users" (lower("email"));--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_category_id_tag_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tag_categories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_series_id_titles_id_fkey" FOREIGN KEY ("series_id") REFERENCES "titles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "title_editions" ADD CONSTRAINT "title_editions_title_id_titles_id_fkey" FOREIGN KEY ("title_id") REFERENCES "titles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "title_platforms" ADD CONSTRAINT "title_platforms_title_id_titles_id_fkey" FOREIGN KEY ("title_id") REFERENCES "titles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "title_platforms" ADD CONSTRAINT "title_platforms_platform_id_platforms_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "title_production_studios" ADD CONSTRAINT "title_production_studios_title_id_titles_id_fkey" FOREIGN KEY ("title_id") REFERENCES "titles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "title_production_studios" ADD CONSTRAINT "title_production_studios_studio_id_production_studios_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "production_studios"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "title_tags" ADD CONSTRAINT "title_tags_title_id_titles_id_fkey" FOREIGN KEY ("title_id") REFERENCES "titles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "title_tags" ADD CONSTRAINT "title_tags_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "timeline_entries" ADD CONSTRAINT "timeline_entries_timeline_id_timelines_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "timelines"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "timeline_entries" ADD CONSTRAINT "timeline_entries_item_id_timeline_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "timeline_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "timeline_item_notes" ADD CONSTRAINT "timeline_item_notes_item_id_timeline_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "timeline_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_title_id_titles_id_fkey" FOREIGN KEY ("title_id") REFERENCES "titles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_episode_id_episodes_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_edition_id_title_editions_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "title_editions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_universe_id_universes_id_fkey" FOREIGN KEY ("universe_id") REFERENCES "universes"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_watch_progress" ADD CONSTRAINT "user_watch_progress_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_watch_progress" ADD CONSTRAINT "user_watch_progress_item_id_timeline_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "timeline_items"("id") ON DELETE CASCADE;