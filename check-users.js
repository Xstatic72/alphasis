const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database contents...\n');
    
    // Check persons (these will be our login users)
    const persons = await prisma.person.findMany({
      take: 10
    });
    console.log('Sample persons (potential users):');
    persons.forEach(person => {
      console.log(`- ${person.PersonID}: ${person.FirstName} ${person.LastName}`);
    });
    
    // Check teachers (subset of persons)
    const teachers = await prisma.teacher.findMany({
      take: 5,
      include: {
        person: true
      }
    });
    console.log('\nSample teachers:');
    teachers.forEach(teacher => {
      console.log(`- ${teacher.TeacherID}: ${teacher.person.FirstName} ${teacher.person.LastName}`);
    });
    
    // Check parents (subset of persons)
    const parents = await prisma.parent.findMany({
      take: 5,
      include: {
        person: true
      }
    });
    console.log('\nSample parents:');
    parents.forEach(parent => {
      console.log(`- ${parent.ParentID}: ${parent.person.FirstName} ${parent.person.LastName}`);
    });
    
    // Check students
    const students = await prisma.student.findMany({
      take: 5
    });
    console.log('\nSample students:');
    students.forEach(student => {
      console.log(`- ${student.AdmissionNumber}: Class ${student.StudentClassID}`);
    });
    
    const subjects = await prisma.subject.findMany({
      take: 5
    });
    console.log('\nSample subjects:');
    subjects.forEach(subject => {
      console.log(`- ${subject.SubjectID}: ${subject.SubjectName} (Level: ${subject.ClassLevel})`);
    });
    
    const classes = await prisma.renamedclass.findMany();
    console.log('\nAvailable classes:');
    classes.forEach(cls => {
      console.log(`- ${cls.ClassID}: ${cls.ClassName}`);
    });
    
    console.log('\n=== LOGIN USERS SUMMARY ===');
    console.log(`Total persons available for login: ${persons.length}`);
    console.log(`Teachers: ${teachers.length}`);
    console.log(`Parents: ${parents.length}`);
    console.log('Note: Students would need to be linked to persons for login access');
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
