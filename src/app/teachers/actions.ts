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
    // Generate a unique teacher ID
    const generateTeacherId = () => {
      return `TCH${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
    };
    
    let teacherId = generateTeacherId();
    
    // Ensure the ID is unique
    let existingTeacher = await prisma.teacher.findUnique({
      where: { TeacherID: teacherId }
    });
    
    while (existingTeacher) {
      teacherId = generateTeacherId();
      existingTeacher = await prisma.teacher.findUnique({
        where: { TeacherID: teacherId }
      });
    }

    // Create person record first
    await prisma.person.create({
      data: {
        PersonID: teacherId,
        FirstName: validatedFields.data.FirstName,
        LastName: validatedFields.data.LastName
      }
    });

    // Create teacher record
    await prisma.teacher.create({
      data: {
        TeacherID: teacherId,
        Email: validatedFields.data.Email,
        PhoneNum: validatedFields.data.PhoneNum,
      },
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
    // Update person record
    await prisma.person.update({
      where: { PersonID: id },
      data: {
        FirstName: validatedFields.data.FirstName,
        LastName: validatedFields.data.LastName
      }
    });

    // Update teacher record
    await prisma.teacher.update({
      where: { TeacherID: id },
      data: {
        Email: validatedFields.data.Email,
        PhoneNum: validatedFields.data.PhoneNum,
      },
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
