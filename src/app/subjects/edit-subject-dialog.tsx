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
import { updateSubject } from './actions'
import { toast } from 'sonner'
import { Subject } from './columns'
import { motion } from 'framer-motion'
import { Edit3, Save, BookOpen } from 'lucide-react'

const subjectSchema = z.object({
  SubjectName: z.string().min(2, { message: "Subject name must be at least 2 characters." }),
  ClassLevel: z.string().min(1, { message: "Class level is required." }),
  TeacherID: z.string().min(1, { message: "Teacher ID is required." }),
})

export function EditSubjectDialog({ subject }: { subject: Subject }) {  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      SubjectName: subject.SubjectName,
      ClassLevel: subject.ClassLevel,
      TeacherID: subject.TeacherID,
    },
  })
  async function onSubmit(values: z.infer<typeof subjectSchema>) {
    const result = await updateSubject(subject.SubjectID, values)
    if (result.success) {
      toast.success("Subject updated successfully!")
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
            className="border-apple-green/20 hover:border-apple-green/40 hover:bg-apple-green/5 transition-all duration-200"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
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
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Edit Subject
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update the details of {subject.SubjectName} below.
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
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="SubjectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Subject Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Mathematics, Physics, etc." 
                            {...field} 
                            className="input-modern"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}                  />
                  
                  <FormField
                    control={form.control}
                    name="ClassLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Class Level</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Grade 1, Grade 2, Form 1, etc." 
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
                    name="TeacherID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Teacher ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter teacher ID number" 
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
                    className="btn-secondary min-w-[140px]"
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
