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
import { Plus, UserPlus, User, Mail, Phone } from "lucide-react"

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
      </DialogTrigger>      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-xl">
        <div className="relative p-6">
          <DialogHeader className="space-y-3 pb-6 border-b border-gray-100">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#8ea604]">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-800">
                  Add New Teacher
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Fill in the details below to add a new teacher to the system.
                </DialogDescription>
              </div>
            </motion.div>
          </DialogHeader>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-8"
          >            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="FirstName"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <User className="h-4 w-4 text-[#ff4e00]" />
                          First Name
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter first name" 
                            {...field} 
                            className="w-full h-11 px-4 text-sm rounded-lg border-2 border-gray-200 bg-white transition-all duration-200 focus:border-[#ff4e00] focus:ring-3 focus:ring-[#ff4e00]/20 focus:outline-none hover:border-gray-300"
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
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <User className="h-4 w-4 text-[#ff4e00]" />
                          Last Name
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter last name" 
                            {...field} 
                            className="w-full h-11 px-4 text-sm rounded-lg border-2 border-gray-200 bg-white transition-all duration-200 focus:border-[#ff4e00] focus:ring-3 focus:ring-[#ff4e00]/20 focus:outline-none hover:border-gray-300"
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
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-3">
                          <Mail className="h-5 w-5 text-[#ff4e00]" />
                          Email Address
                          <span className="text-red-500 text-sm">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter email address" 
                            {...field} 
                            className="input-modern h-12 px-4 text-base rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm transition-all duration-300 focus:border-[#ff4e00] focus:ring-4 focus:ring-[#ff4e00]/15 focus:bg-white shadow-sm"
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
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-3">
                          <Phone className="h-5 w-5 text-[#ff4e00]" />
                          Phone Number
                          <span className="text-red-500 text-sm">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter phone number" 
                            {...field} 
                            className="input-modern h-12 px-4 text-base rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm transition-all duration-300 focus:border-[#ff4e00] focus:ring-4 focus:ring-[#ff4e00]/15 focus:bg-white shadow-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto sm:ml-auto px-8 py-3 bg-gradient-to-r from-[#ff4e00] to-[#ec9f05] hover:from-[#e63900] hover:to-[#d18b04] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-3" />
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
