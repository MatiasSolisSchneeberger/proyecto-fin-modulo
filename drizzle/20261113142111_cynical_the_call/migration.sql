CREATE TYPE "user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "watch_status" AS ENUM('watched', 'skipped');--> statement-breakpoint
CREATE TABLE "movie_types" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL UNIQUE,
	"description" text
);
--> statement-breakpoint
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
CREATE TABLE "user_watch_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"media_id" integer NOT NULL,
	"status" "watch_status" DEFAULT 'watched'::"watch_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_watch_progress_user_id_media_id_unique" UNIQUE("user_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" varchar(50) NOT NULL UNIQUE,
	"email" varchar(255) NOT NULL UNIQUE,
	"role" "user_role" DEFAULT 'user'::"user_role" NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY,
	"title" varchar(255) NOT NULL,
	"release_date" date NOT NULL,
	"duration_minutes" integer NOT NULL,
	"order_key" varchar(255) NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_notes" (
	"id" serial PRIMARY KEY,
	"media_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_spoiler" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_platforms" (
	"media_id" integer,
	"platform_id" integer,
	CONSTRAINT "media_platforms_pkey" PRIMARY KEY("media_id","platform_id")
);
--> statement-breakpoint
CREATE TABLE "media_production_studios" (
	"media_id" integer,
	"studio_id" integer,
	CONSTRAINT "media_production_studios_pkey" PRIMARY KEY("media_id","studio_id")
);
--> statement-breakpoint
CREATE TABLE "media_tags" (
	"media_id" integer,
	"tag_id" integer,
	"is_spoiler" boolean DEFAULT false NOT NULL,
	CONSTRAINT "media_tags_pkey" PRIMARY KEY("media_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"media_id" integer PRIMARY KEY,
	"movie_type_id" integer NOT NULL,
	"poster_url" text,
	"synopsis" text
);
--> statement-breakpoint
CREATE TABLE "post_credits_scenes" (
	"media_id" integer PRIMARY KEY,
	"source_movie_id" integer NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"media_id" integer PRIMARY KEY,
	"series_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	CONSTRAINT "episodes_series_id_season_number_episode_number_unique" UNIQUE("series_id","season_number","episode_number")
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" serial PRIMARY KEY,
	"title" varchar(255) NOT NULL,
	"release_date" date NOT NULL,
	"poster_url" text,
	"synopsis" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_tags_category" ON "tags" ("category_id");--> statement-breakpoint
CREATE INDEX "inx_media_order_key" ON "media" ("order_key");--> statement-breakpoint
CREATE INDEX "idx_media_release_date" ON "media" ("release_date");--> statement-breakpoint
CREATE INDEX "idx_media_title" ON "media" ("title");--> statement-breakpoint
CREATE INDEX "idx_notes_media" ON "media_notes" ("media_id");--> statement-breakpoint
CREATE INDEX "idx_episodes_series" ON "episodes" ("series_id");--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_category_id_tag_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tag_categories"("id");--> statement-breakpoint
ALTER TABLE "user_watch_progress" ADD CONSTRAINT "user_watch_progress_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_watch_progress" ADD CONSTRAINT "user_watch_progress_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media_notes" ADD CONSTRAINT "media_notes_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media_platforms" ADD CONSTRAINT "media_platforms_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media_platforms" ADD CONSTRAINT "media_platforms_platform_id_platforms_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media_production_studios" ADD CONSTRAINT "media_production_studios_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media_production_studios" ADD CONSTRAINT "media_production_studios_studio_id_production_studios_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "production_studios"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_movie_type_id_movie_types_id_fkey" FOREIGN KEY ("movie_type_id") REFERENCES "movie_types"("id");--> statement-breakpoint
ALTER TABLE "post_credits_scenes" ADD CONSTRAINT "post_credits_scenes_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_credits_scenes" ADD CONSTRAINT "post_credits_scenes_source_movie_id_movies_media_id_fkey" FOREIGN KEY ("source_movie_id") REFERENCES "movies"("media_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_series_id_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE;