'use client'

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
import { createClass } from "./actions"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Plus, GraduationCap } from "lucide-react"
import { useState } from "react"

const classSchema = z.object({
  ClassName: z.string().min(2, { message: "Class name must be at least 2 characters." }),
})

export function AddClassDialog() {
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      ClassName: "",
    },
  })
  async function onSubmit(values: z.infer<typeof classSchema>) {
    const result = await createClass(values)
    if (result.success) {
      toast.success("Class created successfully!")
      form.reset()
      setOpen(false)
    } else {
      toast.error(result.message)
    }
  }  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            className="gradient-border bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white text-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="absolute inset-0 bg-gradient-to-br from-apple-green/5 via-transparent to-amber/5 rounded-lg" />
        <div className="relative">
          <DialogHeader className="space-y-4 pb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 bg-gradient-to-br from-apple-green to-amber rounded-lg shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Add New Class
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Create a new class to organize students by grade level.
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="ClassName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Class Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="JSS 1A, SS 2B, Primary 3C, etc." 
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
                        Add Class
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
