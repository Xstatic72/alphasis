"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    };
  }

  try {
    await prisma.student.create({
      data: {
        ...validatedFields.data,
        DateOfBirth: new Date(validatedFields.data.DateOfBirth),
      },
    });

    revalidatePath("/students");

    return {
      success: true,      message: "Student created successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to create student.",
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
    await prisma.student.update({
      where: { AdmissionNumber: admissionNumber },
      data: {
        ...validatedFields.data,
        DateOfBirth: new Date(validatedFields.data.DateOfBirth),
      },
    });

    revalidatePath("/students");

    return {
      success: true,      message: "Student updated successfully.",
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
    await prisma.student.delete({
      where: { AdmissionNumber: admissionNumber },
    });

    revalidatePath("/students");

    return {
      success: true,
      message: "Student deleted successfully.",    };
  } catch {
    return {
      success: false,
      message: "Failed to delete student.",
    };
  }
}
