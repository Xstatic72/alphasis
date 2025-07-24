"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Generate student ID
function generateStudentId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 900) + 100; // 3-digit random number
  return `AB${year}0${random}`;
}

const studentSchema = z.object({
  FirstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  LastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  DateOfBirth: z.string(),
  Gender: z.string(),
  ParentContact: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  Address: z.string(),
  StudentClassID: z.string(),
});

export async function addStudent(values: z.infer<typeof studentSchema>) {
  const validatedFields = studentSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  try {
    // Verify that the class exists
    const classExists = await prisma.renamedclass.findUnique({
      where: { ClassID: validatedFields.data.StudentClassID }
    });

    if (!classExists) {
      return {
        success: false,
        message: "Selected class does not exist. Please choose a valid class.",
      };
    }

    // Generate a unique student ID
    let studentId = generateStudentId();
    
    // Ensure the ID is unique
    let existingStudent = await prisma.student.findUnique({
      where: { AdmissionNumber: studentId }
    });
    
    while (existingStudent) {
      studentId = generateStudentId();
      existingStudent = await prisma.student.findUnique({
        where: { AdmissionNumber: studentId }
      });
    }

    // Create person record first
    await prisma.person.create({
      data: {
        PersonID: studentId,
        FirstName: validatedFields.data.FirstName,
        LastName: validatedFields.data.LastName
      }
    });    const student = await prisma.student.create({
      data: {
        AdmissionNumber: studentId,
        DateOfBirth: new Date(validatedFields.data.DateOfBirth),
        Gender: validatedFields.data.Gender === 'Male' ? 'M' : 'F',
        StudentClassID: validatedFields.data.StudentClassID,
        ParentContact: validatedFields.data.ParentContact,
        Address: validatedFields.data.Address,
      },
      include: { Renamedclass: true }
    });

    revalidatePath("/students");

    return {
      success: true,
      message: "Student created successfully.",
      student: {
        ...student,
        FirstName: validatedFields.data.FirstName,
        LastName: validatedFields.data.LastName,
      },
    };
  } catch (error) {
    console.error("Add student error:", error);
    
    // Check for foreign key constraint error
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return {
        success: false,
        message: "Invalid class selected. Please choose a valid class from the dropdown.",
      };
    }
    
    return {
      success: false,
      message: "Failed to create student. Please try again.",
    };
  }
}

export async function updateStudent(
  admissionNumber: string,
  values: z.infer<typeof studentSchema>
) {
  const validatedFields = studentSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
    };
  }
  try {
    // Update person record first
    await prisma.person.update({
      where: { PersonID: admissionNumber },
      data: {
        FirstName: validatedFields.data.FirstName,
        LastName: validatedFields.data.LastName,
      },
    });

    // Update student record
    await prisma.student.update({
      where: { AdmissionNumber: admissionNumber },
      data: {
        DateOfBirth: new Date(validatedFields.data.DateOfBirth),
        Gender: validatedFields.data.Gender === 'Male' ? 'M' : 'F',
        ParentContact: validatedFields.data.ParentContact,
        Address: validatedFields.data.Address,
        StudentClassID: validatedFields.data.StudentClassID,
      },
    });

    revalidatePath("/students");

    return {
      success: true,
      message: "Student updated successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to update student.",
    };
  }
}

export async function deleteStudent(admissionNumber: string) {
  try {
    // Use a transaction to ensure all deletions succeed or none do
    await prisma.$transaction(async (tx) => {
      // Delete related records first (due to foreign key constraints)
      
      // Delete attendance records
      await tx.attendance.deleteMany({
        where: { StudentID: admissionNumber },
      });

      // Delete grade records
      await tx.grade.deleteMany({
        where: { StudentID: admissionNumber },
      });

      // Delete payment records
      await tx.payment.deleteMany({
        where: { StudentID: admissionNumber },
      });

      // Delete registration records
      await tx.registration.deleteMany({
        where: { StudentID: admissionNumber },
      });      // Now delete the student record
      await tx.student.delete({
        where: { AdmissionNumber: admissionNumber },
      });

      // Finally delete the corresponding person record (if it exists)
      const personExists = await tx.person.findUnique({
        where: { PersonID: admissionNumber }
      });
      
      if (personExists) {
        await tx.person.delete({
          where: { PersonID: admissionNumber },
        });
      }
    });

    revalidatePath("/students");

    return {
      success: true,
      message: "Student deleted successfully.",
    };
  } catch (error) {
    console.error('Delete student error:', error);
    return {
      success: false,
      message: "Failed to delete student. Please try again or contact support if the issue persists.",
    };
  }
}
