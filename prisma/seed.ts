import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create classes first
  const jss1 = await prisma.class.upsert({
    where: { ClassID: 'jss1' },
    update: {},
    create: {
      ClassID: 'jss1',
      ClassName: 'JSS1'
    }
  });

  const jss2 = await prisma.class.upsert({
    where: { ClassID: 'jss2' },
    update: {},
    create: {
      ClassID: 'jss2',
      ClassName: 'JSS2'
    }
  });

  const sss1 = await prisma.class.upsert({
    where: { ClassID: 'sss1' },
    update: {},
    create: {
      ClassID: 'sss1',
      ClassName: 'SSS1'
    }
  });
  // Create admin user (changed to parent role)
  const parentUser = await prisma.user.upsert({
    where: { username: 'parent1' },
    update: {},
    create: {
      username: 'parent1',
      password: 'parent123',
      role: 'PARENT',
      name: 'Mary Johnson',
      email: 'mary.johnson@parent.alphasis.edu'
    }
  });

  // Create parent profile
  const parent = await prisma.parent.upsert({
    where: { ParentID: 'parent001' },
    update: {},
    create: {
      ParentID: 'parent001',
      FirstName: 'Mary',
      LastName: 'Johnson',
      PhoneNum: '+234-802-345-6789',
      Email: 'mary.johnson@parent.alphasis.edu',
      Address: '123 School Street, Lagos',
      userId: parentUser.id
    }
  });

  // Create teacher and their profile
  const teacherUser = await prisma.user.upsert({
    where: { username: 'teacher1' },
    update: {},
    create: {
      username: 'teacher1',
      password: 'teacher123',
      role: 'TEACHER',
      name: 'John Smith',
      email: 'john.smith@alphasis.edu'
    }
  });

  const teacher = await prisma.teacher.upsert({
    where: { TeacherID: 'teacher001' },
    update: {},
    create: {
      TeacherID: 'teacher001',
      FirstName: 'John',
      LastName: 'Smith',
      PhoneNum: '+234-801-234-5678',
      Email: 'john.smith@alphasis.edu',
      userId: teacherUser.id
    }
  });

  // Create student and their profile
  const studentUser = await prisma.user.upsert({
    where: { username: 'student1' },
    update: {},
    create: {
      username: 'student1',
      password: 'student123',
      role: 'STUDENT',
      name: 'Alice Johnson',
      email: 'alice.johnson@student.alphasis.edu'
    }
  });
  const student = await prisma.student.upsert({
    where: { AdmissionNumber: 'ALF001' },
    update: {},
    create: {
      AdmissionNumber: 'ALF001',
      FirstName: 'Alice',
      LastName: 'Johnson',
      DateOfBirth: new Date('2008-05-15'),
      Gender: 'Female',
      ParentContact: '+234-802-345-6789',
      Address: '123 School Street, Lagos',
      StudentClassID: jss1.ClassID,
      ParentID: 'parent001',
      userId: studentUser.id
    }
  });

  // Create some subjects
  const mathSubject = await prisma.subject.upsert({
    where: { SubjectID: 'math001' },
    update: {},
    create: {
      SubjectID: 'math001',
      SubjectName: 'Mathematics',
      ClassLevel: 'JSS1',
      TeacherID: teacher.TeacherID
    }
  });

  const englishSubject = await prisma.subject.upsert({
    where: { SubjectID: 'eng001' },
    update: {},
    create: {
      SubjectID: 'eng001',
      SubjectName: 'English Language',
      ClassLevel: 'JSS1',
      TeacherID: teacher.TeacherID
    }
  });

  // Create some sample grades
  await prisma.grade.upsert({
    where: { GradeID: 'grade001' },
    update: {},
    create: {
      GradeID: 'grade001',
      Term: '1st Term',
      CA: 35,
      Exam: 55,
      TotalScore: 90,
      Grade: 'A',
      StudentID: student.AdmissionNumber,
      SubjectID: mathSubject.SubjectID
    }
  });

  // Create some attendance records
  await prisma.attendance.upsert({
    where: { AttendanceID: 'att001' },
    update: {},
    create: {
      AttendanceID: 'att001',
      Date: new Date(),
      Status: 'Present',
      StudentID: student.AdmissionNumber,
      SubjectID: mathSubject.SubjectID
    }
  });

  // Create a payment record
  await prisma.payment.upsert({
    where: { TransactionID: 'pay001' },
    update: {},
    create: {
      TransactionID: 'pay001',
      Amount: 120000,
      PaymentDate: new Date(),
      PaymentMethod: 'Transfer',
      Confirmation: true,
      ReceiptGenerated: true,
      Term: '1st Term',
      StudentID: student.AdmissionNumber
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
