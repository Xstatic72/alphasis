'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const classSchema = z.object({
  ClassName: z.string().min(2, { message: "Class name must be at least 2 characters." }),
})

export async function createClass(values: z.infer<typeof classSchema>) {
  const validatedFields = classSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
    }
  }  try {
    // Generate a unique ClassID
    const generateClassId = () => {
      const baseName = validatedFields.data.ClassName
        .toLowerCase()
        .replace(/\s+/g, '')
        .substring(0, 6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${baseName}${random}`.substring(0, 10);
    };
    
    let classId = generateClassId();
    
    // Ensure the ID is unique
    let existingClass = await prisma.renamedclass.findUnique({
      where: { ClassID: classId }
    });
    
    while (existingClass) {
      classId = generateClassId();
      existingClass = await prisma.renamedclass.findUnique({
        where: { ClassID: classId }
      });
    }
    
    await prisma.renamedclass.create({
      data: {
        ClassID: classId,
        ClassName: validatedFields.data.ClassName,
      },
    })

    revalidatePath('/classes');

    return {
      success: true,
      message: "Class created successfully.",
    }
  } catch {
    return {
      success: false,
      message: "Failed to create class.",
    }
  }
}

export async function updateClass(
  id: string,
  values: z.infer<typeof classSchema>
) {
  const validatedFields = classSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
    }
  }

  try {
    await prisma.renamedclass.update({
      where: { ClassID: id },
      data: {
        ClassName: validatedFields.data.ClassName,
      },
    })

    revalidatePath("/classes")

    return {
      success: true,
      message: "Class updated successfully.",
    }  } catch {
    return {
      success: false,
      message: "Failed to update class.",
    }
  }
}

export async function deleteClass(id: string) {
  try {
    await prisma.renamedclass.delete({
      where: { ClassID: id },
    })

    revalidatePath("/classes")

    return {
      success: true,
      message: "Class deleted successfully.",
    }  } catch {
    return {
      success: false,
      message: "Failed to delete class.",
    }
  }
}
