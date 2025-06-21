'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updatePayment } from './actions'
import { toast } from 'sonner'
import { Payment } from './columns'
import { motion } from 'framer-motion'
import { Edit3, Save, CreditCard } from 'lucide-react'

const paymentSchema = z.object({
  StudentID: z.string().min(1, { message: "Student ID is required." }),
  Amount: z.string().min(1, { message: "Amount is required." }),
  Term: z.string().min(1, { message: "Term is required." }),
  PaymentMethod: z.string().min(1, { message: "Payment method is required." }),
})

export function EditPaymentDialog({ payment }: { payment: Payment }) {  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      StudentID: payment.StudentID,
      Amount: payment.Amount.toString(),
      Term: payment.Term,
      PaymentMethod: payment.PaymentMethod,
    },
  })
  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    const result = await updatePayment(payment.TransactionID, {
      ...values,
      Amount: parseFloat(values.Amount),
    })
    if (result.success) {
      toast.success("Payment updated successfully!")
    } else {
      toast.error(result.message)
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="outline" 
            size="sm"
            className="border-gamboge/20 hover:border-gamboge/40 hover:bg-gamboge/5 transition-all duration-200"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gamboge/5 via-transparent to-aerospace-orange/5 rounded-lg" />
        <div className="relative">
          <DialogHeader className="space-y-4 pb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 bg-gradient-to-br from-gamboge to-aerospace-orange rounded-lg shadow-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Edit Payment
                </DialogTitle>                <DialogDescription className="text-gray-600 mt-1">
                  Update the payment details for ${payment.Amount}.
                </DialogDescription>
              </div>
            </motion.div>
          </DialogHeader>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                  <FormField
                    control={form.control}
                    name="StudentID"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-semibold">Student ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter student admission number" 
                            {...field} 
                            className="input-modern"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                    control={form.control}
                    name="Amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="1000.00" 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            className="input-modern"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                    control={form.control}
                    name="Term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Term</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="First Term, Second Term, etc." 
                            {...field} 
                            className="input-modern"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                    control={form.control}
                    name="PaymentMethod"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-semibold">Payment Method</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Cash, Bank Transfer, Card, etc." 
                            {...field} 
                            className="input-modern"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <motion.div
                  className="flex justify-end pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Button 
                    type="submit" 
                    className="btn-primary min-w-[140px]"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
