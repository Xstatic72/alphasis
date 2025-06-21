"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createTeacher } from "./actions"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Plus, UserPlus } from "lucide-react"

const teacherSchema = z.object({
  FirstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  LastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  Email: z.string().email({ message: "Invalid email address." }),
  PhoneNum: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
})

export function AddTeacherDialog() {  const form = useForm<z.infer<typeof teacherSchema>>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      FirstName: "",
      LastName: "",
      Email: "",
      PhoneNum: "",
    },
  })

  async function onSubmit(values: z.infer<typeof teacherSchema>) {
    const result = await createTeacher(values)
    if (result.success) {
      toast.success("Teacher created successfully!")
      form.reset()
    } else {
      toast.error(result.message)
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            className="gradient-border bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white text-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="absolute inset-0 bg-gradient-to-br from-aerospace-orange/5 via-transparent to-apple-green/5 rounded-lg" />
        <div className="relative">
          <DialogHeader className="space-y-4 pb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 bg-gradient-to-br from-aerospace-orange to-gamboge rounded-lg shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Add New Teacher
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Fill in the details below to add a new teacher to the system.
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
                    name="FirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John" 
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
                    name="LastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Doe" 
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
                    name="Email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="john.doe@example.com" 
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
                    name="PhoneNum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123-456-7890" 
                            {...field} 
                            className="input-modern"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}                  />
                </div>
                
                <motion.div
                  className="flex justify-end pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Button 
                    type="submit" 
                    className="btn-primary min-w-[120px]"
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
                        <Plus className="h-4 w-4 mr-2" />
                        Add Teacher
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
