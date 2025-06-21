'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const teacherSchema = z.object({
  FirstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  LastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  Email: z.string().email({ message: 'Invalid email address.' }),
  PhoneNum: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
})

export async function createTeacher(values: z.infer<typeof teacherSchema>) {
  const validatedFields = teacherSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid data provided.',
    }
  }

  try {
    await prisma.teacher.create({
      data: validatedFields.data,
    })

    revalidatePath('/teachers')

    return {      success: true,
      message: 'Teacher created successfully.',
    }
  } catch {
    return {
      success: false,
      message: 'Failed to create teacher.',
    }
  }
}

export async function updateTeacher(
  id: string,
  values: z.infer<typeof teacherSchema>
) {
  const validatedFields = teacherSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid data provided.',
    }
  }

  try {
    await prisma.teacher.update({
      where: { TeacherID: id },
      data: validatedFields.data,
    })

    revalidatePath('/teachers')

    return {
      success: true,      message: 'Teacher updated successfully.',
    }
  } catch {
    return {
      success: false,
      message: 'Failed to update teacher.',
    }
  }
}

export async function deleteTeacher(id: string) {
  try {
    await prisma.teacher.delete({
      where: { TeacherID: id },
    })

    revalidatePath('/teachers')

    return {
      success: true,
      message: 'Teacher deleted successfully.',    }
  } catch {
    return {
      success: false,
      message: 'Failed to delete teacher.',
    }
  }
}
