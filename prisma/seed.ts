import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create classes first
  const jss1 = await prisma.renamedclass.upsert({
    where: { ClassID: 'jss1' },
    update: {},
    create: {
      ClassID: 'jss1',
      ClassName: 'JSS1'
    }
  });

  const jss2 = await prisma.renamedclass.upsert({
    where: { ClassID: 'jss2' },
    update: {},
    create: {
      ClassID: 'jss2',
      ClassName: 'JSS2'
    }
  });

  const sss1 = await prisma.renamedclass.upsert({
    where: { ClassID: 'sss1' },
    update: {},
    create: {
      ClassID: 'sss1',
      ClassName: 'SSS1'
    }
  });

  // Create person records first
  const parentPerson = await prisma.person.upsert({
    where: { PersonID: 'par001' },
    update: {},
    create: {
      PersonID: 'par001',
      FirstName: 'Mary',
      LastName: 'Johnson'
    }
  });

  // Create parent profile
  const parentUser = await prisma.parent.upsert({
    where: { ParentID: 'par001' },
    update: {},
    create: {
      ParentID: 'par001',
      ContactNumber: '08012345678'
    }
  });

  // Create teacher person
  const teacherPerson = await prisma.person.upsert({
    where: { PersonID: 'tch001' },
    update: {},
    create: {
      PersonID: 'tch001',
      FirstName: 'John',
      LastName: 'Smith'
    }
  });

  // Create teacher profile
  const teacherUser = await prisma.teacher.upsert({
    where: { TeacherID: 'tch001' },
    update: {},
    create: {
      TeacherID: 'tch001',
      PhoneNum: '08098765432',
      Email: 'john.smith@school.com',
      Address: '123 Teacher Street'
    }
  });

  // Create student person first
  const studentPerson = await prisma.person.upsert({
    where: { PersonID: 'std001' },
    update: {},
    create: {
      PersonID: 'std001',
      FirstName: 'Alice',
      LastName: 'Johnson'
    }
  });

  // Create student
  const studentUser = await prisma.student.upsert({
    where: { AdmissionNumber: 'std001' },
    update: {},
    create: {
      AdmissionNumber: 'std001',
      DateOfBirth: new Date('2010-05-15'),
      Gender: 'F',
      StudentClassID: 'jss1',
      ParentContact: '08012345678',
      Address: '456 Student Avenue',
      ParentID: 'par001'
    }
  });

  // Create subjects
  const mathSubject = await prisma.subject.upsert({
    where: { SubjectID: 'sub001' },
    update: {},
    create: {
      SubjectID: 'sub001',
      SubjectName: 'Mathematics',
      TeacherID: 'tch001',
      ClassLevel: 'JSS1'
    }
  });

  const englishSubject = await prisma.subject.upsert({
    where: { SubjectID: 'sub002' },
    update: {},
    create: {
      SubjectID: 'sub002',
      SubjectName: 'English Language',
      TeacherID: 'tch001',
      ClassLevel: 'JSS1'
    }
  });

  // Create registration
  await prisma.registration.upsert({
    where: { RegistrationID: 'reg001' },
    update: {},
    create: {
      RegistrationID: 'reg001',
      StudentID: 'std001',
      SubjectID: 'sub001',
      Term: 'First Term'
    }
  });

  // Create grade
  await prisma.grade.upsert({
    where: { GradeID: 'grd001' },
    update: {},
    create: {
      GradeID: 'grd001',
      StudentID: 'std001',
      SubjectID: 'sub001',
      Term: 'First Term',
      CA: 20,
      Exam: 75,
      TotalScore: 95,
      Grade: 'A'
    }
  });

  // Create attendance
  await prisma.attendance.upsert({
    where: { AttendanceID: 'att001' },
    update: {},
    create: {
      AttendanceID: 'att001',
      StudentID: 'std001',
      SubjectID: 'sub001',
      Date: new Date('2024-01-15'),
      Status: 'PRESENT'
    }
  });

  // Create payment
  await prisma.payment.upsert({
    where: { TransactionID: 1 },
    update: {},
    create: {
      TransactionID: 1,
      StudentID: 'std001',
      Amount: 50000.00,
      PaymentDate: new Date('2024-01-10'),
      PaymentMethod: 'Transfer',
      Confirmation: true,
      ReceiptGenerated: true,
      Term: 'First Term'
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
