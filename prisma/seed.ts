import { PrismaClient, student_Gender, payment_PaymentMethod, attendance_Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create classes first
  const classes = [
    { ClassID: 'AB06', ClassName: 'SS1A' },
    { ClassID: 'AB01', ClassName: 'JSS1A' },
    { ClassID: 'AB03', ClassName: 'JSS2A' },
    { ClassID: 'AB10', ClassName: 'SS2B' },
    { ClassID: 'AB02', ClassName: 'JSS1B' },
    { ClassID: 'AB05', ClassName: 'JSS3' },
    { ClassID: 'AB07', ClassName: 'SS1B' },
    { ClassID: 'AB11', ClassName: 'SS2C' },
    { ClassID: 'AB04', ClassName: 'JSS2B' }
  ];

  for (const classData of classes) {
    await prisma.renamedclass.upsert({
      where: { ClassID: classData.ClassID },
      update: {},
      create: classData
    });
  }

  // Create person records (Students, Parents, Teachers)
  const persons = [
    // Students
    { PersonID: 'AB240021', FirstName: 'Zion', LastName: 'Adebisi' },
    { PersonID: 'AB240005', FirstName: 'David', LastName: 'Umechukwu' },
    { PersonID: 'AB240036', FirstName: 'Chidalu', LastName: 'Odidika' },
    { PersonID: 'AB240047', FirstName: 'Victor', LastName: 'Orji' },
    { PersonID: 'AB240018', FirstName: 'Peculiar', LastName: 'Oto-bong' },
    { PersonID: 'AB240029', FirstName: 'Praise', LastName: 'Okeke' },
    { PersonID: 'AB240010', FirstName: 'Stanley', LastName: 'Maduka' },
    { PersonID: 'AB240033', FirstName: 'Samuel', LastName: 'ThankGod' },
    { PersonID: 'AB240025', FirstName: 'Jessica', LastName: 'Okike' },
    { PersonID: 'AB240014', FirstName: 'Paul', LastName: 'Johnson' },
    // Parents
    { PersonID: 'P0016', FirstName: 'Mrs. Mojisola', LastName: 'Adebisi' },
    { PersonID: 'P0025', FirstName: 'Mr. James', LastName: 'Umechukwu' },
    { PersonID: 'P0019', FirstName: 'Mrs. Esther', LastName: 'Odidika' },
    { PersonID: 'P0026', FirstName: 'Mr. Peter', LastName: 'Orji' },
    { PersonID: 'P0044', FirstName: 'Mrs. Ruth', LastName: 'Oto-bong' },
    { PersonID: 'P0051', FirstName: 'Mr. Daniel', LastName: 'Okeke' },
    { PersonID: 'P0033', FirstName: 'Mrs. Hannah', LastName: 'Maduka' },
    { PersonID: 'P0012', FirstName: 'Mr. Patrick', LastName: 'ThankGod' },
    { PersonID: 'P0003', FirstName: 'Mrs. Stella', LastName: 'Okike' },
    { PersonID: 'P0027', FirstName: 'Mr. Olaitan', LastName: 'Johnson' },
    // Teachers
    { PersonID: 'ABS015', FirstName: 'John', LastName: 'Udeji' },
    { PersonID: 'ABS004', FirstName: 'Dennis', LastName: 'Ozoemena' },
    { PersonID: 'ABS012', FirstName: 'Chidimma', LastName: 'Charles' },
    { PersonID: 'ABS020', FirstName: 'Ogechukwu', LastName: 'Iheanacho' },
    { PersonID: 'ABS003', FirstName: 'Favour', LastName: 'Iwugo' },
    { PersonID: 'ABS022', FirstName: 'Godday', LastName: 'Ukwu' },
    { PersonID: 'ABS007', FirstName: 'Emmie', LastName: 'Biden' }
  ];

  for (const person of persons) {
    await prisma.person.upsert({
      where: { PersonID: person.PersonID },
      update: {},
      create: person
    });
  }

  // Create parent profiles
  const parents = [
    { ParentID: 'P0016', ContactNumber: '08032618345' },
    { ParentID: 'P0025', ContactNumber: '07012345678' },
    { ParentID: 'P0019', ContactNumber: '09087654321' },
    { ParentID: 'P0026', ContactNumber: '08143210987' },
    { ParentID: 'P0044', ContactNumber: '08065432109' },
    { ParentID: 'P0051', ContactNumber: '07065432110' },
    { ParentID: 'P0033', ContactNumber: '09012378946' },
    { ParentID: 'P0012', ContactNumber: '08176543211' },
    { ParentID: 'P0003', ContactNumber: '08080187631' },
    { ParentID: 'P0027', ContactNumber: '09135628143' }
  ];

  for (const parent of parents) {
    await prisma.parent.upsert({
      where: { ParentID: parent.ParentID },
      update: {},
      create: parent
    });
  }

  // Create teacher profiles
  const teachers = [
    { TeacherID: 'ABS015', PhoneNum: '09130023152', Email: 'judeji@alphabeta.edu.ng', Address: '17, Olowu Street, Olodi Apapa' },
    { TeacherID: 'ABS004', PhoneNum: '09167565504', Email: 'dozoemena@alphabeta.edu.ng', Address: '18, Jundulahi Street, Olodi Apapa' },
    { TeacherID: 'ABS012', PhoneNum: '08016729341', Email: 'ccharles@alphabeta.edu.ng', Address: '27, Cardoso Street, Awodiora Apapa' },
    { TeacherID: 'ABS020', PhoneNum: '07113463217', Email: 'oiheanacho@alphabeta.edu.ng', Address: '119, Kirikiri Road, Olodi Apapa' },
    { TeacherID: 'ABS003', PhoneNum: '09029334235', Email: 'fiwugo@alphabeta.edu.ng', Address: '54, Chidi Street, Awodiora Apapa' },
    { TeacherID: 'ABS022', PhoneNum: '07062403142', Email: 'gukwu@alphabeta.edu.ng', Address: '107, Muyibi Street, Olodi Apapa' },
    { TeacherID: 'ABS007', PhoneNum: '08116073123', Email: 'ebiden@alphabeta.edu.ng', Address: 'Plot 231A, Green Estate, Amuwo Odofin' }
  ];

  for (const teacher of teachers) {
    await prisma.teacher.upsert({
      where: { TeacherID: teacher.TeacherID },
      update: {},
      create: teacher
    });
  }

  // Create students
  const students = [
    { AdmissionNumber: 'AB240021', DateOfBirth: new Date('2014-07-15'), Gender: student_Gender.M, StudentClassID: 'AB01', ParentContact: '08032618345', Address: '5, Adebayo Street, Olodi Apapa', ParentID: 'P0016' },
    { AdmissionNumber: 'AB240005', DateOfBirth: new Date('2014-08-11'), Gender: student_Gender.M, StudentClassID: 'AB01', ParentContact: '07012345678', Address: '6, Peter Street, Olodi Apapa', ParentID: 'P0025' },
    { AdmissionNumber: 'AB240036', DateOfBirth: new Date('2012-09-19'), Gender: student_Gender.F, StudentClassID: 'AB03', ParentContact: '09087654321', Address: '19, Redemption Ave, Olodi Apapa', ParentID: 'P0019' },
    { AdmissionNumber: 'AB240047', DateOfBirth: new Date('2010-05-28'), Gender: student_Gender.M, StudentClassID: 'AB10', ParentContact: '08143210987', Address: '136, Osho Drive, Olodi Apapa', ParentID: 'P0026' },
    { AdmissionNumber: 'AB240018', DateOfBirth: new Date('2013-04-19'), Gender: student_Gender.F, StudentClassID: 'AB01', ParentContact: '08065432109', Address: '20, Molade Street, Olodi Apapa', ParentID: 'P0044' },
    { AdmissionNumber: 'AB240029', DateOfBirth: new Date('2014-06-16'), Gender: student_Gender.F, StudentClassID: 'AB02', ParentContact: '07065432110', Address: '11, Fasasi Street, Olodi Apapa', ParentID: 'P0051' },
    { AdmissionNumber: 'AB240010', DateOfBirth: new Date('2012-01-27'), Gender: student_Gender.M, StudentClassID: 'AB05', ParentContact: '09012378946', Address: '8, Sholade Street, Olodi Apapa', ParentID: 'P0033' },
    { AdmissionNumber: 'AB240033', DateOfBirth: new Date('2012-02-07'), Gender: student_Gender.M, StudentClassID: 'AB05', ParentContact: '08176543211', Address: '30, Oluwa Street, Olodi Apapa', ParentID: 'P0012' },
    { AdmissionNumber: 'AB240025', DateOfBirth: new Date('2010-04-16'), Gender: student_Gender.F, StudentClassID: 'AB07', ParentContact: '08080187631', Address: '31, Ibitoye Street, Olodi Apapa', ParentID: 'P0003' },
    { AdmissionNumber: 'AB240014', DateOfBirth: new Date('2013-11-30'), Gender: student_Gender.M, StudentClassID: 'AB02', ParentContact: '09135628143', Address: '80, Muyibi Street, Olodi Apapa', ParentID: 'P0027' }
  ];

  for (const student of students) {
    await prisma.student.upsert({
      where: { AdmissionNumber: student.AdmissionNumber },
      update: {},
      create: student
    });
  }

  // Create subjects
  const subjects = [
    { SubjectID: 'MATH01', SubjectName: 'Mathematics', TeacherID: 'ABS004', ClassLevel: 'JSS1' },
    { SubjectID: 'PHY03', SubjectName: 'Physics', TeacherID: 'ABS015', ClassLevel: 'SSS2' },
    { SubjectID: 'ENG02', SubjectName: 'English', TeacherID: 'ABS020', ClassLevel: 'JSS2' },
    { SubjectID: 'BIO01', SubjectName: 'Biology', TeacherID: 'ABS022', ClassLevel: 'SSS1' },
    { SubjectID: 'CIV03', SubjectName: 'Civic Education', TeacherID: 'ABS012', ClassLevel: 'JSS3' },
    { SubjectID: 'BSC02', SubjectName: 'Basic Science', TeacherID: 'ABS003', ClassLevel: 'JSS2' },
    { SubjectID: 'DP03', SubjectName: 'Data Processing', TeacherID: 'ABS007', ClassLevel: 'SSS3' }
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { SubjectID: subject.SubjectID },
      update: {},
      create: subject
    });
  }

  // Create registrations
  const registrations = [
    { RegistrationID: 'R004', StudentID: 'AB240021', SubjectID: 'BIO01', Term: '3rdTerm' },
    { RegistrationID: 'R012', StudentID: 'AB240005', SubjectID: 'MATH01', Term: '3rdTerm' },
    { RegistrationID: 'R023', StudentID: 'AB240036', SubjectID: 'CIV03', Term: '3rdTerm' },
    { RegistrationID: 'R007', StudentID: 'AB240047', SubjectID: 'PHY03', Term: '3rdTerm' },
    { RegistrationID: 'R019', StudentID: 'AB240018', SubjectID: 'MATH01', Term: '3rdTerm' },
    { RegistrationID: 'R024', StudentID: 'AB240029', SubjectID: 'MATH01', Term: '3rdTerm' },
    { RegistrationID: 'R022', StudentID: 'AB240010', SubjectID: 'CIV03', Term: '3rdTerm' },
    { RegistrationID: 'R013', StudentID: 'AB240033', SubjectID: 'CIV03', Term: '3rdTerm' },
    { RegistrationID: 'R031', StudentID: 'AB240025', SubjectID: 'BIO01', Term: '3rdTerm' },
    { RegistrationID: 'R008', StudentID: 'AB240014', SubjectID: 'MATH01', Term: '3rdTerm' }
  ];

  for (const registration of registrations) {
    await prisma.registration.upsert({
      where: { RegistrationID: registration.RegistrationID },
      update: {},
      create: registration
    });
  }

  // Create grades
  const grades = [
    { GradeID: 'G002', StudentID: 'AB240021', SubjectID: 'BIO01', Term: '1stTerm', CA: 33, Exam: 51, TotalScore: 84, Grade: 'A1' },
    { GradeID: 'G013', StudentID: 'AB240005', SubjectID: 'MATH01', Term: '1stTerm', CA: 36, Exam: 48, TotalScore: 84, Grade: 'A' },
    { GradeID: 'G014', StudentID: 'AB240036', SubjectID: 'CIV03', Term: '1stTerm', CA: 34, Exam: 63, TotalScore: 97, Grade: 'A' },
    { GradeID: 'G035', StudentID: 'AB240047', SubjectID: 'PHY03', Term: '1stTerm', CA: 27, Exam: 42, TotalScore: 69, Grade: 'B2' },
    { GradeID: 'G026', StudentID: 'AB240018', SubjectID: 'MATH01', Term: '1stTerm', CA: 30, Exam: 41, TotalScore: 71, Grade: 'B' },
    { GradeID: 'G012', StudentID: 'AB240029', SubjectID: 'MATH01', Term: '1stTerm', CA: 32, Exam: 53, TotalScore: 85, Grade: 'A' },
    { GradeID: 'G008', StudentID: 'AB240010', SubjectID: 'CIV03', Term: '1stTerm', CA: 24, Exam: 42, TotalScore: 66, Grade: 'B' },
    { GradeID: 'G021', StudentID: 'AB240033', SubjectID: 'CIV03', Term: '1stTerm', CA: 22, Exam: 50, TotalScore: 72, Grade: 'B' },
    { GradeID: 'G010', StudentID: 'AB240025', SubjectID: 'BIO01', Term: '1stTerm', CA: 31, Exam: 46, TotalScore: 77, Grade: 'A1' },
    { GradeID: 'G018', StudentID: 'AB240014', SubjectID: 'MATH01', Term: '1stTerm', CA: 23, Exam: 44, TotalScore: 67, Grade: 'B' }
  ];

  for (const grade of grades) {
    await prisma.grade.upsert({
      where: { GradeID: grade.GradeID },
      update: {},
      create: grade
    });
  }

  // Create attendance records
  const attendances = [
    { AttendanceID: 'C002', StudentID: 'AB240021', SubjectID: 'BIO01', Date: new Date('2025-04-29'), Status: attendance_Status.PRESENT },
    { AttendanceID: 'C031', StudentID: 'AB240005', SubjectID: 'MATH01', Date: new Date('2025-03-30'), Status: attendance_Status.PRESENT },
    { AttendanceID: 'C039', StudentID: 'AB240036', SubjectID: 'CIV03', Date: new Date('2025-05-01'), Status: attendance_Status.ABSENT },
    { AttendanceID: 'C035', StudentID: 'AB240047', SubjectID: 'PHY03', Date: new Date('2025-05-22'), Status: attendance_Status.ABSENT },
    { AttendanceID: 'C026', StudentID: 'AB240018', SubjectID: 'MATH01', Date: new Date('2025-05-31'), Status: attendance_Status.PRESENT },
    { AttendanceID: 'C012', StudentID: 'AB240029', SubjectID: 'MATH01', Date: new Date('2025-06-04'), Status: attendance_Status.PRESENT },
    { AttendanceID: 'C028', StudentID: 'AB240010', SubjectID: 'CIV03', Date: new Date('2025-05-03'), Status: attendance_Status.PRESENT },
    { AttendanceID: 'C014', StudentID: 'AB240033', SubjectID: 'CIV03', Date: new Date('2025-06-11'), Status: attendance_Status.PRESENT },
    { AttendanceID: 'C010', StudentID: 'AB240025', SubjectID: 'BIO01', Date: new Date('2025-05-07'), Status: attendance_Status.ABSENT },
    { AttendanceID: 'C024', StudentID: 'AB240014', SubjectID: 'MATH01', Date: new Date('2025-05-15'), Status: attendance_Status.PRESENT }
  ];

  for (const attendance of attendances) {
    await prisma.attendance.upsert({
      where: { AttendanceID: attendance.AttendanceID },
      update: {},
      create: attendance
    });
  }

  // Create payment records
  const payments = [
    { TransactionID: 6017, StudentID: 'AB240021', Amount: 120000.00, PaymentDate: new Date('2025-04-27'), PaymentMethod: payment_PaymentMethod.Transfer, Confirmation: true, ReceiptGenerated: true, Term: '3rdTerm' },
    { TransactionID: 6132, StudentID: 'AB240005', Amount: 115500.00, PaymentDate: new Date('2025-04-23'), PaymentMethod: payment_PaymentMethod.Transfer, Confirmation: true, ReceiptGenerated: false, Term: '3rdTerm' },
    { TransactionID: 6024, StudentID: 'AB240036', Amount: 120000.00, PaymentDate: new Date('2025-04-17'), PaymentMethod: payment_PaymentMethod.Transfer, Confirmation: false, ReceiptGenerated: false, Term: '3rdTerm' },
    { TransactionID: 6041, StudentID: 'AB240047', Amount: 89050.00, PaymentDate: new Date('2025-04-22'), PaymentMethod: payment_PaymentMethod.Cash, Confirmation: true, ReceiptGenerated: true, Term: '3rdTerm' },
    { TransactionID: 6124, StudentID: 'AB240018', Amount: 100000.00, PaymentDate: new Date('2025-04-30'), PaymentMethod: payment_PaymentMethod.Cash, Confirmation: false, ReceiptGenerated: false, Term: '3rdTerm' },
    { TransactionID: 6011, StudentID: 'AB240029', Amount: 120000.00, PaymentDate: new Date('2025-04-11'), PaymentMethod: payment_PaymentMethod.Transfer, Confirmation: true, ReceiptGenerated: true, Term: '3rdTerm' },
    { TransactionID: 6037, StudentID: 'AB240010', Amount: 97000.00, PaymentDate: new Date('2025-04-30'), PaymentMethod: payment_PaymentMethod.Cash, Confirmation: false, ReceiptGenerated: false, Term: '3rdTerm' },
    { TransactionID: 6015, StudentID: 'AB240033', Amount: 85000.00, PaymentDate: new Date('2025-04-26'), PaymentMethod: payment_PaymentMethod.Transfer, Confirmation: true, ReceiptGenerated: true, Term: '3rdTerm' },
    { TransactionID: 6052, StudentID: 'AB240025', Amount: 70000.00, PaymentDate: new Date('2025-04-30'), PaymentMethod: payment_PaymentMethod.Transfer, Confirmation: true, ReceiptGenerated: true, Term: '3rdTerm' },
    { TransactionID: 6049, StudentID: 'AB240014', Amount: 120000.00, PaymentDate: new Date('2025-04-15'), PaymentMethod: payment_PaymentMethod.Cash, Confirmation: false, ReceiptGenerated: false, Term: '3rdTerm' }
  ];

  for (const payment of payments) {
    await prisma.payment.upsert({
      where: { TransactionID: payment.TransactionID },
      update: {},
      create: payment
    });
  }

  console.log('Database seeded successfully with comprehensive school data!');
  console.log('Seeded:');
  console.log('- 9 Classes');
  console.log('- 27 Persons (10 Students, 10 Parents, 7 Teachers)');
  console.log('- 10 Parents');
  console.log('- 7 Teachers');
  console.log('- 10 Students');
  console.log('- 7 Subjects');
  console.log('- 10 Registrations');
  console.log('- 10 Grades');
  console.log('- 10 Attendance records');
  console.log('- 10 Payment records');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
