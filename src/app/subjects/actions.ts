'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const subjectSchema = z.object({
  SubjectName: z.string().min(2, { message: "Subject name must be at least 2 characters." }),
  ClassLevel: z.string().min(1, { message: "Class level is required." }),
  TeacherID: z.string().min(1, { message: "Teacher ID is required." }),
})

export async function createSubject(values: z.infer<typeof subjectSchema>) {
  const validatedFields = subjectSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
    }
  }

  try {
    await prisma.subject.create({
      data: validatedFields.data,
    })

    revalidatePath('/subjects')

    return {      success: true,
      message: "Subject created successfully.",
    }
  } catch {
    return {
      success: false,
      message: "Failed to create subject.",
    }
  }
}

export async function updateSubject(
  id: string,
  values: z.infer<typeof subjectSchema>
) {
  const validatedFields = subjectSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
    }
  }

  try {
    await prisma.subject.update({
      where: { SubjectID: id },
      data: validatedFields.data,
    })

    revalidatePath("/subjects");

    return {
      success: true,
      message: "Subject updated successfully.",
    }
  } catch {
    return {
      success: false,
      message: "Failed to update subject.",
    }
  }
}

export async function deleteSubject(id: string) {
  try {
    await prisma.subject.delete({
      where: { SubjectID: id },
    })

    revalidatePath("/subjects")

    return {
      success: true,      message: "Subject deleted successfully.",
    }
  } catch {
    return {
      success: false,
      message: "Failed to delete subject.",
    }
  }
}
