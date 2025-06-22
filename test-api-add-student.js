// Test Add Student functionality through the API
async function testAddStudentAPI() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🚀 Testing Add Student API...');
    
    // Step 1: Login as a teacher
    console.log('\n📝 Step 1: Login as teacher...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'ABS003', // Teacher ID from demo users
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData);
    
    // Extract cookies for authentication
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies:', cookies);
    
    // Step 2: Add a new student
    console.log('\n👨‍🎓 Step 2: Adding new student...');
    const studentData = {
      FirstName: 'John',
      LastName: 'TestStudent',
      DateOfBirth: '2005-06-15',
      Gender: 'Male',
      ParentContact: '08012345678',
      Address: '123 Test Street, Lagos',
      StudentClassID: 'AB01'
    };
    
    const addStudentResponse = await fetch(`${baseUrl}/api/students`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify(studentData)
    });
    
    if (!addStudentResponse.ok) {
      const errorText = await addStudentResponse.text();
      throw new Error(`Add student failed: ${addStudentResponse.status} - ${errorText}`);
    }
    
    const addStudentResult = await addStudentResponse.json();
    console.log('✅ Student added successfully!');
    console.log('📊 Student data:', JSON.stringify(addStudentResult, null, 2));
    
    // Step 3: Verify student was added by fetching students list
    console.log('\n📋 Step 3: Verifying student in list...');
    const studentsResponse = await fetch(`${baseUrl}/api/students`, {
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    if (!studentsResponse.ok) {
      throw new Error(`Fetch students failed: ${studentsResponse.status}`);
    }
    
    const studentsData = await studentsResponse.json();
    const newStudent = studentsData.students.find(s => 
      s.FirstName === 'John' && s.LastName === 'TestStudent'
    );
    
    if (newStudent) {
      console.log('✅ Student found in list!');
      console.log('📄 Student details:', JSON.stringify(newStudent, null, 2));
    } else {
      console.log('❌ Student not found in list');
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testAddStudentAPI();
