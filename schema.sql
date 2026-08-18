


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."appointment_status" AS ENUM (
    'confirmed',
    'completed',
    'cancelled',
    'no_show',
    'holding'
);


ALTER TYPE "public"."appointment_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'barber',
    'client'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."appointments_broadcast"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  perform realtime.broadcast_changes(
    'barber-' || coalesce(new.barber_id, old.barber_id)::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    new,
    old
  );
  return null;
end;
$$;


ALTER FUNCTION "public"."appointments_broadcast"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_booked_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") RETURNS TABLE("start_time" timestamp with time zone, "end_time" timestamp with time zone, "status" "public"."appointment_status")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT start_time, end_time, status
  FROM appointments
  WHERE barber_id = p_barber_id
    AND (
      status = 'confirmed'
      OR (status = 'holding' AND expires_at > now())
    )
    AND start_time >= p_start_date::timestamptz
    AND start_time < (p_end_date::timestamptz + interval '1 day')
$$;


ALTER FUNCTION "public"."get_booked_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_busy_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") RETURNS TABLE("start_time" timestamp with time zone, "end_time" timestamp with time zone, "status" "public"."appointment_status")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select start_time, end_time, status
  from appointments
  where barber_id = p_barber_id
    and start_time >= p_start_date::timestamptz
    and start_time <= (p_end_date + 1)::timestamptz
    and status <> 'cancelled'
    and (status <> 'holding' or expires_at > now());
$$;


ALTER FUNCTION "public"."get_busy_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "public"."user_role"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_barber_role"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Si el rol nuevo es barber y no existe ya en barbers
  IF NEW.role = 'barber' AND OLD.role != 'barber' THEN
    INSERT INTO public.barbers (profile_id, name, is_active)
    VALUES (NEW.id, NEW.full_name, true)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;
  
  -- Si el rol cambia de barber a otro, desactivar en lugar de borrar
  IF OLD.role = 'barber' AND NEW.role != 'barber' THEN
    UPDATE public.barbers 
    SET is_active = false 
    WHERE profile_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_barber_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.email,
    'client'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "barber_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "service_id" "uuid",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "status" "public"."appointment_status" DEFAULT 'confirmed'::"public"."appointment_status",
    "created_by" "uuid",
    "notes" "text",
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."barber_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "barber_id" "uuid",
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_day_off" boolean DEFAULT false,
    CONSTRAINT "barber_schedules_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."barber_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."barbers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid",
    "name" "text" NOT NULL,
    "photo_url" "text",
    "color_code" "text" DEFAULT '#3b82f6'::"text",
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."barbers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "role" "public"."user_role" DEFAULT 'client'::"public"."user_role",
    "avatar_url" "text",
    "is_vip" boolean DEFAULT false,
    "internal_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name_es" "text" NOT NULL,
    "name_en" "text" NOT NULL,
    "duration_minutes" integer NOT NULL,
    "price" numeric NOT NULL,
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shop_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "opening_time" time without time zone DEFAULT '09:00:00'::time without time zone NOT NULL,
    "closing_time" time without time zone DEFAULT '21:00:00'::time without time zone NOT NULL,
    "timezone" "text" DEFAULT 'Europe/Madrid'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."shop_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."barber_schedules"
    ADD CONSTRAINT "barber_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."barbers"
    ADD CONSTRAINT "barbers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."barbers"
    ADD CONSTRAINT "barbers_profile_id_unique" UNIQUE ("profile_id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "no_overlapping_appointments" EXCLUDE USING "gist" ("barber_id" WITH =, "tstzrange"("start_time", "end_time", '[)'::"text") WITH &&) WHERE (("status" = ANY (ARRAY['holding'::"public"."appointment_status", 'confirmed'::"public"."appointment_status"])));



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shop_settings"
    ADD CONSTRAINT "shop_settings_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "appointments_broadcast_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."appointments_broadcast"();



CREATE OR REPLACE TRIGGER "on_profile_role_changed" AFTER UPDATE OF "role" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_barber_role"();



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."barber_schedules"
    ADD CONSTRAINT "barber_schedules_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id");



ALTER TABLE ONLY "public"."barbers"
    ADD CONSTRAINT "barbers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admin full access profiles" ON "public"."profiles" TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"public"."user_role"));



CREATE POLICY "Barbers can read own data" ON "public"."barbers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read profiles by role" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR ("public"."get_my_role"() = 'admin'::"public"."user_role") OR ("public"."get_my_role"() = 'barber'::"public"."user_role")));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "appointments_cancel" ON "public"."appointments" FOR UPDATE TO "authenticated" USING ((("client_id" = "auth"."uid"()) AND ("status" = 'confirmed'::"public"."appointment_status") AND ("start_time" > ("now"() + '02:00:00'::interval)))) WITH CHECK ((("client_id" = "auth"."uid"()) AND ("status" = 'cancelled'::"public"."appointment_status")));



CREATE POLICY "appointments_delete" ON "public"."appointments" FOR DELETE TO "authenticated" USING (((("client_id" = "auth"."uid"()) AND ("status" = 'holding'::"public"."appointment_status")) OR ("public"."get_my_role"() = 'admin'::"public"."user_role") OR ("public"."get_my_role"() = 'barber'::"public"."user_role")));



CREATE POLICY "appointments_insert" ON "public"."appointments" FOR INSERT TO "authenticated" WITH CHECK ((("client_id" = "auth"."uid"()) OR ("public"."get_my_role"() = 'admin'::"public"."user_role") OR ("public"."get_my_role"() = 'barber'::"public"."user_role")));



CREATE POLICY "appointments_select" ON "public"."appointments" FOR SELECT TO "authenticated" USING ((("client_id" = "auth"."uid"()) OR ("public"."get_my_role"() = 'admin'::"public"."user_role") OR ("public"."get_my_role"() = 'barber'::"public"."user_role")));



CREATE POLICY "appointments_update" ON "public"."appointments" FOR UPDATE TO "authenticated" USING ((("public"."get_my_role"() = 'admin'::"public"."user_role") OR ("public"."get_my_role"() = 'barber'::"public"."user_role") OR (("client_id" = "auth"."uid"()) AND ("status" = 'holding'::"public"."appointment_status")))) WITH CHECK ((("public"."get_my_role"() = 'admin'::"public"."user_role") OR ("public"."get_my_role"() = 'barber'::"public"."user_role") OR (("client_id" = "auth"."uid"()) AND ("status" = 'confirmed'::"public"."appointment_status"))));



ALTER TABLE "public"."barber_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."barbers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "barbers_admin" ON "public"."barbers" USING (("public"."get_my_role"() = 'admin'::"public"."user_role"));



CREATE POLICY "barbers_read" ON "public"."barbers" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "schedules_admin" ON "public"."barber_schedules" USING (("public"."get_my_role"() = 'admin'::"public"."user_role"));



CREATE POLICY "schedules_barber_delete" ON "public"."barber_schedules" FOR DELETE TO "authenticated" USING (("barber_id" = ( SELECT "barbers"."id"
   FROM "public"."barbers"
  WHERE ("barbers"."profile_id" = "auth"."uid"()))));



CREATE POLICY "schedules_barber_insert" ON "public"."barber_schedules" FOR INSERT TO "authenticated" WITH CHECK (("barber_id" = ( SELECT "barbers"."id"
   FROM "public"."barbers"
  WHERE ("barbers"."profile_id" = "auth"."uid"()))));



CREATE POLICY "schedules_barber_update" ON "public"."barber_schedules" FOR UPDATE TO "authenticated" USING (("barber_id" = ( SELECT "barbers"."id"
   FROM "public"."barbers"
  WHERE ("barbers"."profile_id" = "auth"."uid"())))) WITH CHECK (("barber_id" = ( SELECT "barbers"."id"
   FROM "public"."barbers"
  WHERE ("barbers"."profile_id" = "auth"."uid"()))));



CREATE POLICY "schedules_read" ON "public"."barber_schedules" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "services_admin" ON "public"."services" USING (("public"."get_my_role"() = 'admin'::"public"."user_role"));



CREATE POLICY "services_read" ON "public"."services" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."shop_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shop_settings_read" ON "public"."shop_settings" FOR SELECT TO "authenticated" USING (true);



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."appointments_broadcast"() TO "anon";
GRANT ALL ON FUNCTION "public"."appointments_broadcast"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."appointments_broadcast"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_booked_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_booked_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_booked_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_busy_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_busy_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_busy_slots"("p_barber_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_barber_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_barber_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_barber_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."barber_schedules" TO "anon";
GRANT ALL ON TABLE "public"."barber_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."barber_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."barbers" TO "anon";
GRANT ALL ON TABLE "public"."barbers" TO "authenticated";
GRANT ALL ON TABLE "public"."barbers" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."shop_settings" TO "anon";
GRANT ALL ON TABLE "public"."shop_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."shop_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







