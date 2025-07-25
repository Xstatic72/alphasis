-- CreateEnum
CREATE TYPE "student_Gender" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "attendance_Status" AS ENUM ('1', '0');

-- CreateEnum
CREATE TYPE "payment_PaymentMethod" AS ENUM ('Cash', 'Transfer');

-- CreateTable
CREATE TABLE "attendance" (
    "AttendanceID" VARCHAR(4) NOT NULL,
    "StudentID" VARCHAR(10) NOT NULL,
    "SubjectID" VARCHAR(10) NOT NULL,
    "Date" DATE NOT NULL,
    "Status" "attendance_Status" NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("AttendanceID")
);

-- CreateTable
CREATE TABLE "class" (
    "ClassID" VARCHAR(10) NOT NULL,
    "ClassName" VARCHAR(20) NOT NULL,

    CONSTRAINT "class_pkey" PRIMARY KEY ("ClassID")
);

-- CreateTable
CREATE TABLE "grade" (
    "GradeID" VARCHAR(4) NOT NULL,
    "StudentID" VARCHAR(10) NOT NULL,
    "SubjectID" VARCHAR(10) NOT NULL,
    "Term" VARCHAR(10) NOT NULL,
    "CA" INTEGER,
    "Exam" INTEGER,
    "TotalScore" INTEGER,
    "Grade" VARCHAR(3),

    CONSTRAINT "grade_pkey" PRIMARY KEY ("GradeID")
);

-- CreateTable
CREATE TABLE "parent" (
    "ParentID" VARCHAR(10) NOT NULL,
    "ContactNumber" VARCHAR(15) NOT NULL,

    CONSTRAINT "parent_pkey" PRIMARY KEY ("ParentID")
);

-- CreateTable
CREATE TABLE "payment" (
    "TransactionID" INTEGER NOT NULL,
    "StudentID" VARCHAR(10) NOT NULL,
    "Amount" DECIMAL(10,2) NOT NULL,
    "PaymentDate" DATE NOT NULL,
    "PaymentMethod" "payment_PaymentMethod" NOT NULL,
    "Confirmation" BOOLEAN NOT NULL,
    "ReceiptGenerated" BOOLEAN NOT NULL,
    "Term" VARCHAR(10) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("TransactionID")
);

-- CreateTable
CREATE TABLE "person" (
    "PersonID" VARCHAR(10) NOT NULL,
    "FirstName" VARCHAR(50) NOT NULL,
    "LastName" VARCHAR(50) NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("PersonID")
);

-- CreateTable
CREATE TABLE "registration" (
    "RegistrationID" VARCHAR(4) NOT NULL,
    "StudentID" VARCHAR(10) NOT NULL,
    "SubjectID" VARCHAR(10) NOT NULL,
    "Term" VARCHAR(10) NOT NULL,

    CONSTRAINT "registration_pkey" PRIMARY KEY ("RegistrationID")
);

-- CreateTable
CREATE TABLE "student" (
    "AdmissionNumber" VARCHAR(10) NOT NULL,
    "DateOfBirth" DATE NOT NULL,
    "Gender" "student_Gender" NOT NULL,
    "StudentClassID" VARCHAR(10) NOT NULL,
    "ParentContact" VARCHAR(15),
    "Address" VARCHAR(100),
    "ParentID" VARCHAR(10),

    CONSTRAINT "student_pkey" PRIMARY KEY ("AdmissionNumber")
);

-- CreateTable
CREATE TABLE "subject" (
    "SubjectID" VARCHAR(10) NOT NULL,
    "SubjectName" VARCHAR(50) NOT NULL,
    "TeacherID" VARCHAR(10),
    "ClassLevel" VARCHAR(10) NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("SubjectID")
);

-- CreateTable
CREATE TABLE "teacher" (
    "TeacherID" VARCHAR(10) NOT NULL,
    "PhoneNum" VARCHAR(15),
    "Email" VARCHAR(50),
    "Address" VARCHAR(100),

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("TeacherID")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_AttendanceID" ON "attendance"("AttendanceID");

-- CreateIndex
CREATE INDEX "attendance_StudentID_idx" ON "attendance"("StudentID");

-- CreateIndex
CREATE INDEX "attendance_SubjectID_idx" ON "attendance"("SubjectID");

-- CreateIndex
CREATE UNIQUE INDEX "class_ClassID" ON "class"("ClassID");

-- CreateIndex
CREATE UNIQUE INDEX "grade_GradeID" ON "grade"("GradeID");

-- CreateIndex
CREATE INDEX "grade_StudentID_idx" ON "grade"("StudentID");

-- CreateIndex
CREATE INDEX "grade_SubjectID_idx" ON "grade"("SubjectID");

-- CreateIndex
CREATE UNIQUE INDEX "parent_ParentID" ON "parent"("ParentID");

-- CreateIndex
CREATE UNIQUE INDEX "payment_TransactionID" ON "payment"("TransactionID");

-- CreateIndex
CREATE INDEX "payment_StudentID_idx" ON "payment"("StudentID");

-- CreateIndex
CREATE UNIQUE INDEX "registration_RegistrationID" ON "registration"("RegistrationID");

-- CreateIndex
CREATE INDEX "registration_StudentID_idx" ON "registration"("StudentID");

-- CreateIndex
CREATE INDEX "registration_SubjectID_idx" ON "registration"("SubjectID");

-- CreateIndex
CREATE UNIQUE INDEX "student_AdmissionNumber" ON "student"("AdmissionNumber");

-- CreateIndex
CREATE INDEX "student_ParentID_idx" ON "student"("ParentID");

-- CreateIndex
CREATE INDEX "student_StudentClassID_idx" ON "student"("StudentClassID");

-- CreateIndex
CREATE UNIQUE INDEX "subject_SubjectID" ON "subject"("SubjectID");

-- CreateIndex
CREATE INDEX "subject_TeacherID_idx" ON "subject"("TeacherID");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_TeacherID" ON "teacher"("TeacherID");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_ibfk_1" FOREIGN KEY ("StudentID") REFERENCES "student"("AdmissionNumber") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_ibfk_2" FOREIGN KEY ("SubjectID") REFERENCES "subject"("SubjectID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_ibfk_1" FOREIGN KEY ("StudentID") REFERENCES "student"("AdmissionNumber") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_ibfk_2" FOREIGN KEY ("SubjectID") REFERENCES "subject"("SubjectID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parent" ADD CONSTRAINT "parent_ibfk_1" FOREIGN KEY ("ParentID") REFERENCES "person"("PersonID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_ibfk_1" FOREIGN KEY ("StudentID") REFERENCES "student"("AdmissionNumber") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_ibfk_1" FOREIGN KEY ("StudentID") REFERENCES "student"("AdmissionNumber") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_ibfk_2" FOREIGN KEY ("SubjectID") REFERENCES "subject"("SubjectID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_ibfk_1" FOREIGN KEY ("ParentID") REFERENCES "parent"("ParentID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_ibfk_2" FOREIGN KEY ("StudentClassID") REFERENCES "class"("ClassID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_ibfk_1" FOREIGN KEY ("TeacherID") REFERENCES "teacher"("TeacherID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_ibfk_1" FOREIGN KEY ("TeacherID") REFERENCES "person"("PersonID") ON DELETE NO ACTION ON UPDATE NO ACTION;
