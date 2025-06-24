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
import { createSubject } from "./actions"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Plus, BookOpen } from "lucide-react"
import { useState } from "react"

const subjectSchema = z.object({
  SubjectName: z.string().min(2, { message: "Subject name must be at least 2 characters." }),
  ClassLevel: z.string().min(1, { message: "Class level is required." }),
  TeacherID: z.string().min(1, { message: "Teacher ID is required." }),
})

export function AddSubjectDialog() {
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      SubjectName: "",
      ClassLevel: "",
      TeacherID: "",
    },
  })
  async function onSubmit(values: z.infer<typeof subjectSchema>) {
    const result = await createSubject(values)
    if (result.success) {
      toast.success("Subject created successfully!", {
        description: "The new subject has been added to the system.",
      })
      form.reset()
      setOpen(false)
    } else {
      toast.error(result.message)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button className="group relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-2">
              <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus className="h-3 w-3" />
              </div>
              <span>Add Subject</span>
              <BookOpen className="h-4 w-4 opacity-80" />
            </div>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DialogHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Add New Subject
                </DialogTitle>
                <DialogDescription className="text-gray-600 font-medium">
                  Create a new subject for your academic curriculum.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="SubjectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-orange-500" />
                        Subject Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Mathematics, English, Physics, etc." 
                          {...field} 
                          className="bg-white/80 border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ClassLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-md"></div>
                        Class Level
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Grade 1, Grade 2, Form 1, etc." 
                          {...field} 
                          className="bg-white/80 border border-gray-200 rounded-xl px-4 py-3 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="TeacherID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-md"></div>
                        Teacher ID
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter the teacher's unique ID" 
                          {...field} 
                          className="bg-white/80 border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[120px]"
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
                      Add Subject
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
