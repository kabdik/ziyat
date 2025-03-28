/*
  Warnings:

  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `University` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('not_started', 'awaiting_info', 'in_progress', 'confirmed', 'rejected');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'ru', 'kk');

-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('undergraduate', 'graduate');

-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('active', 'suspended', 'deleted');

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "University";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserRole";

-- CreateTable
CREATE TABLE "regions" (
    "id" SERIAL NOT NULL,
    "translations" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "majors" (
    "id" SERIAL NOT NULL,
    "translations" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'not_started',
    "preferredLocale" "Locale" NOT NULL DEFAULT 'en',
    "accountStatus" "UserAccountStatus" NOT NULL DEFAULT 'active',
    "lastLogin" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "region_id" INTEGER NOT NULL,
    "translations" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "country_id" INTEGER NOT NULL,
    "translations" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,
    "website" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ranking_info" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "early_application_deadline" TIMESTAMP(3),
    "regular_application_deadline" TIMESTAMP(3),
    "late_application_deadline" TIMESTAMP(3),
    "average_acceptance_rate" DOUBLE PRECISION NOT NULL,
    "required_essay_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "major_id" INTEGER NOT NULL,
    "degree_level" "DegreeLevel" NOT NULL,
    "language_of_instruction" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "tuition_fee" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_requirements" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "required_gpa" DOUBLE PRECISION NOT NULL,
    "required_tests" JSONB NOT NULL,
    "min_test_scores" JSONB NOT NULL,
    "application_deadline" TIMESTAMP(3) NOT NULL,
    "acceptance_rate" DOUBLE PRECISION NOT NULL,
    "additional_requirements" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "admission_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eligibility_criteria" TEXT NOT NULL,
    "coverage" TEXT NOT NULL,
    "application_deadline" TIMESTAMP(3) NOT NULL,
    "official_link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_universities" (
    "id" SERIAL NOT NULL,
    "scholarship_id" INTEGER NOT NULL,
    "university_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "scholarship_universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "university_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "text_review" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "current_educational_status" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "test_scores" JSONB NOT NULL,
    "preferred_locale_to_study" TEXT NOT NULL,
    "preferred_degree_level" "DegreeLevel" NOT NULL,
    "preferred_major_id" INTEGER NOT NULL,
    "preferred_university_id" INTEGER NOT NULL,
    "preferred_country_id" INTEGER NOT NULL,
    "preferred_region_id" INTEGER NOT NULL,
    "preferred_city_id" INTEGER NOT NULL,
    "preferred_locale_in_system" "Locale" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferred_countries" (
    "user_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_preferred_countries_pkey" PRIMARY KEY ("user_id","country_id")
);

-- CreateTable
CREATE TABLE "user_preferred_regions" (
    "user_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_preferred_regions_pkey" PRIMARY KEY ("user_id","region_id")
);

-- CreateTable
CREATE TABLE "user_preferred_majors" (
    "user_id" INTEGER NOT NULL,
    "major_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_preferred_majors_pkey" PRIMARY KEY ("user_id","major_id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "translations" JSONB NOT NULL,
    "website" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "work_experience" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_staff" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organization_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_bookings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "appointment_datetime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "consultation_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_reviews" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "text_review" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organization_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_universities" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "university_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organization_universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "regions_created_at_deletedAt_idx" ON "regions"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "majors_created_at_deletedAt_idx" ON "majors"("created_at", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_deletedAt_idx" ON "users"("email", "deletedAt");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_name_deletedAt_idx" ON "roles"("name", "deletedAt");

-- CreateIndex
CREATE INDEX "countries_region_id_deletedAt_idx" ON "countries"("region_id", "deletedAt");

-- CreateIndex
CREATE INDEX "countries_created_at_deletedAt_idx" ON "countries"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "cities_country_id_deletedAt_idx" ON "cities"("country_id", "deletedAt");

-- CreateIndex
CREATE INDEX "cities_created_at_deletedAt_idx" ON "cities"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "universities_city_id_deletedAt_idx" ON "universities"("city_id", "deletedAt");

-- CreateIndex
CREATE INDEX "universities_created_at_deletedAt_idx" ON "universities"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "programs_university_id_deletedAt_idx" ON "programs"("university_id", "deletedAt");

-- CreateIndex
CREATE INDEX "programs_major_id_deletedAt_idx" ON "programs"("major_id", "deletedAt");

-- CreateIndex
CREATE INDEX "admission_requirements_program_id_deletedAt_idx" ON "admission_requirements"("program_id", "deletedAt");

-- CreateIndex
CREATE INDEX "admission_requirements_created_at_deletedAt_idx" ON "admission_requirements"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "scholarships_application_deadline_deletedAt_idx" ON "scholarships"("application_deadline", "deletedAt");

-- CreateIndex
CREATE INDEX "scholarships_created_at_deletedAt_idx" ON "scholarships"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "scholarship_universities_scholarship_id_deletedAt_idx" ON "scholarship_universities"("scholarship_id", "deletedAt");

-- CreateIndex
CREATE INDEX "scholarship_universities_university_id_deletedAt_idx" ON "scholarship_universities"("university_id", "deletedAt");

-- CreateIndex
CREATE INDEX "reviews_user_id_deletedAt_idx" ON "reviews"("user_id", "deletedAt");

-- CreateIndex
CREATE INDEX "reviews_university_id_deletedAt_idx" ON "reviews"("university_id", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_user_id_deletedAt_idx" ON "user_profiles"("user_id", "deletedAt");

-- CreateIndex
CREATE INDEX "user_profiles_created_at_deletedAt_idx" ON "user_profiles"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "user_preferred_countries_created_at_deletedAt_idx" ON "user_preferred_countries"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "user_preferred_regions_created_at_deletedAt_idx" ON "user_preferred_regions"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "user_preferred_majors_created_at_deletedAt_idx" ON "user_preferred_majors"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "organizations_city_id_deletedAt_idx" ON "organizations"("city_id", "deletedAt");

-- CreateIndex
CREATE INDEX "organizations_created_at_deletedAt_idx" ON "organizations"("created_at", "deletedAt");

-- CreateIndex
CREATE INDEX "organization_staff_organization_id_deletedAt_idx" ON "organization_staff"("organization_id", "deletedAt");

-- CreateIndex
CREATE INDEX "organization_staff_user_id_deletedAt_idx" ON "organization_staff"("user_id", "deletedAt");

-- CreateIndex
CREATE INDEX "consultation_bookings_user_id_deletedAt_idx" ON "consultation_bookings"("user_id", "deletedAt");

-- CreateIndex
CREATE INDEX "consultation_bookings_organization_id_deletedAt_idx" ON "consultation_bookings"("organization_id", "deletedAt");

-- CreateIndex
CREATE INDEX "organization_reviews_user_id_deletedAt_idx" ON "organization_reviews"("user_id", "deletedAt");

-- CreateIndex
CREATE INDEX "organization_reviews_organization_id_deletedAt_idx" ON "organization_reviews"("organization_id", "deletedAt");

-- CreateIndex
CREATE INDEX "organization_universities_organization_id_deletedAt_idx" ON "organization_universities"("organization_id", "deletedAt");

-- CreateIndex
CREATE INDEX "organization_universities_university_id_deletedAt_idx" ON "organization_universities"("university_id", "deletedAt");

-- CreateIndex
CREATE INDEX "user_roles_user_id_deletedAt_idx" ON "user_roles"("user_id", "deletedAt");

-- CreateIndex
CREATE INDEX "user_roles_role_id_deletedAt_idx" ON "user_roles"("role_id", "deletedAt");

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_requirements" ADD CONSTRAINT "admission_requirements_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_universities" ADD CONSTRAINT "scholarship_universities_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_universities" ADD CONSTRAINT "scholarship_universities_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_preferred_major_id_fkey" FOREIGN KEY ("preferred_major_id") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_preferred_university_id_fkey" FOREIGN KEY ("preferred_university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_preferred_country_id_fkey" FOREIGN KEY ("preferred_country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_preferred_region_id_fkey" FOREIGN KEY ("preferred_region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_preferred_city_id_fkey" FOREIGN KEY ("preferred_city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_countries" ADD CONSTRAINT "user_preferred_countries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_countries" ADD CONSTRAINT "user_preferred_countries_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_regions" ADD CONSTRAINT "user_preferred_regions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_regions" ADD CONSTRAINT "user_preferred_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_majors" ADD CONSTRAINT "user_preferred_majors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_majors" ADD CONSTRAINT "user_preferred_majors_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_staff" ADD CONSTRAINT "organization_staff_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_staff" ADD CONSTRAINT "organization_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_bookings" ADD CONSTRAINT "consultation_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_bookings" ADD CONSTRAINT "consultation_bookings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_reviews" ADD CONSTRAINT "organization_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_reviews" ADD CONSTRAINT "organization_reviews_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_universities" ADD CONSTRAINT "organization_universities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_universities" ADD CONSTRAINT "organization_universities_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
