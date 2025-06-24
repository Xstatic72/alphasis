'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const paymentSchema = z.object({
  StudentID: z.string().min(1, { message: "Student ID is required." }),
  Amount: z.number().positive({ message: "Amount must be positive." }),
  Term: z.string().min(1, { message: "Term is required." }),
  PaymentMethod: z.string().min(1, { message: "Payment method is required." }),
})

export async function createPayment(values: z.infer<typeof paymentSchema>) {
  const validatedFields = paymentSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
    }
  }
  try {
    // Get the next TransactionID
    const lastPayment = await prisma.payment.findFirst({
      orderBy: { TransactionID: 'desc' },
      select: { TransactionID: true }
    });
    const nextTransactionID = (lastPayment?.TransactionID || 0) + 1;

    await prisma.payment.create({      data: {
        TransactionID: nextTransactionID,
        StudentID: validatedFields.data.StudentID,
        Amount: validatedFields.data.Amount,
        Term: validatedFields.data.Term,
        PaymentMethod: validatedFields.data.PaymentMethod as 'Cash' | 'Transfer',
        PaymentDate: new Date(),
        Confirmation: false,
        ReceiptGenerated: false,
      },
    })

    revalidatePath('/payments')

    return {
      success: true,
      message: "Payment recorded successfully.",
    }  } catch {
    return {
      success: false,
      message: "Failed to record payment.",
    }
  }
}

export async function updatePayment(
  id: string,
  values: z.infer<typeof paymentSchema>
) {
  const validatedFields = paymentSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
    }
  }

  try {    await prisma.payment.update({
      where: { TransactionID: parseInt(id) },
      data: {
        StudentID: validatedFields.data.StudentID,
        Amount: validatedFields.data.Amount,
        Term: validatedFields.data.Term,
        PaymentMethod: validatedFields.data.PaymentMethod as 'Cash' | 'Transfer',
      },
    })

    revalidatePath("/payments")

    return {
      success: true,
      message: "Payment updated successfully.",
    }  } catch {
    return {
      success: false,
      message: "Failed to update payment.",
    }
  }
}

export async function deletePayment(id: string) {
  try {    await prisma.payment.delete({
      where: { TransactionID: parseInt(id) },
    })

    revalidatePath("/payments")

    return {
      success: true,
      message: "Payment deleted successfully.",
    }  } catch {
    return {
      success: false,
      message: "Failed to delete payment.",
    }
  }
}
