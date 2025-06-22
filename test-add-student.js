const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAddStudentAPI() {
  try {
    console.log('Testing Add Student functionality...');
    
    // First, let's check what classes are available
    console.log('\n=== Available Classes ===');
    const classes = await prisma.renamedclass.findMany();
    console.log(classes);
    
    // Test the student creation process
    console.log('\n=== Creating Test Student ===');
    
    // Generate student ID (same logic as in API)
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 900) + 100;
    const studentId = `AB${year}0${random}`;
    
    console.log('Generated Student ID:', studentId);
    
    // Create person record
    const person = await prisma.person.create({
      data: {
        PersonID: studentId,
        FirstName: 'TestAPI',
        LastName: 'Student'
      }
    });
    console.log('Created person:', person);
    
    // Create student record
    const student = await prisma.student.create({
      data: {
        AdmissionNumber: studentId,
        DateOfBirth: new Date('2005-01-01'),
        Gender: 'M',
        StudentClassID: classes[0]?.ClassID || 'AB01',
        ParentContact: '1234567890',
        Address: 'Test Address'
      },
      include: {
        Renamedclass: true
      }
    });
    console.log('Created student:', student);
      // Verify we can fetch the student with names
    const studentWithName = await prisma.$queryRaw`
      SELECT 
        s.*,
        p.FirstName,
        p.LastName,
        c.ClassName
      FROM student s
      LEFT JOIN person p ON s.AdmissionNumber = p.PersonID
      LEFT JOIN class c ON s.StudentClassID = c.ClassID
      WHERE s.AdmissionNumber = ${studentId}
    `;
    
    console.log('\n=== Student with Name ===');
    console.log(studentWithName);
    
    // Clean up - remove test data
    await prisma.student.delete({
      where: { AdmissionNumber: studentId }
    });
    
    await prisma.person.delete({
      where: { PersonID: studentId }
    });
    
    console.log('\n✅ Test completed successfully! Clean up done.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAddStudentAPI();
