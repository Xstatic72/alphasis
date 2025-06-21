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
  }

  try {
    await prisma.class.create({
      data: {
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
    await prisma.class.update({
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
    await prisma.class.delete({
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
