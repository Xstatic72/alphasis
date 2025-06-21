"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStudent } from "./actions";
import { Student } from "./columns";

export function EditStudentDialog({ student }: { student: Student }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit student</DialogTitle>
          <DialogDescription>
            Update the details of the student below.
          </DialogDescription>
        </DialogHeader>        <form
          action={async (formData) => {
            const data = {
              FirstName: formData.get('FirstName') as string,
              LastName: formData.get('LastName') as string,
              DateOfBirth: formData.get('DateOfBirth') as string,
              Gender: formData.get('Gender') as string,
              ParentContact: formData.get('ParentContact') as string,
              Address: formData.get('Address') as string,
              StudentClassID: formData.get('StudentClassID') as string,
            };
            await updateStudent(student.AdmissionNumber, data);
          }}
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="FirstName" className="text-right">
              First Name
            </Label>
            <Input
              id="FirstName"
              name="FirstName"
              defaultValue={student.FirstName}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="LastName" className="text-right">
              Last Name
            </Label>
            <Input
              id="LastName"
              name="LastName"
              defaultValue={student.LastName}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="DateOfBirth" className="text-right">
              Date of Birth
            </Label>
            <Input
              id="DateOfBirth"
              name="DateOfBirth"
              type="date"
              defaultValue={student.DateOfBirth}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Gender" className="text-right">
              Gender
            </Label>
            <Input
              id="Gender"
              name="Gender"
              defaultValue={student.Gender}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ParentContact" className="text-right">
              Parent Contact
            </Label>
            <Input
              id="ParentContact"
              name="ParentContact"
              defaultValue={student.ParentContact}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Address" className="text-right">
              Address
            </Label>
            <Input
              id="Address"
              name="Address"
              defaultValue={student.Address}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="StudentClassID" className="text-right">
              Class ID
            </Label>
            <Input
              id="StudentClassID"
              name="StudentClassID"
              defaultValue={student.StudentClassID}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
