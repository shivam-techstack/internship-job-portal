// server/test-e2e.js
const API_URL = 'http://127.0.0.1:5000/api';

const results = [];

const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const config = {
    method: options.method || 'GET',
    headers
  };
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }
  const response = await fetch(url, config);
  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    // Non-JSON response
  }
  return { status: response.status, data };
};

const test = async (name, fn) => {
  try {
    const passed = await fn();
    if (passed) {
      console.log(`✅ PASS: ${name}`);
      results.push({ name, status: 'PASSED' });
    } else {
      console.log(`❌ FAIL: ${name}`);
      results.push({ name, status: 'FAILED', reason: 'Assertion returned false' });
    }
  } catch (err) {
    console.log(`❌ FAIL: ${name} -> Error: ${err.message}`);
    results.push({ name, status: 'FAILED', reason: err.message });
  }
};

const runSuite = async () => {
  console.log('=== RUNNING END-TO-END AUTOMATED VERIFICATION SUITE ===\n');

  let testUserToken = '';
  let adminToken = '';
  let sampleOppId = '';
  let createdOppId = '';
  let createdAppId = '';

  const timestamp = Date.now();
  const testEmail = `test_candidate_${timestamp}@example.com`;
  const testPassword = 'Password@123';

  // 1. Health check
  await test('1. System Health API', async () => {
    const res = await request('/health');
    return res.status === 200 && res.data.status === 'ok';
  });

  // 2. User Registration
  await test('2. User Registration (Candidate)', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Automated Test Candidate',
        email: testEmail,
        password: testPassword,
        role: 'user'
      }
    });
    if (res.status === 201 && res.data.token && res.data.user.email === testEmail) {
      testUserToken = res.data.token;
      // Security check: verify password hash is NEVER leaked in response
      return !res.data.user.password;
    }
    return false;
  });

  // 3. Duplicate Registration Guard
  await test('3. Prevent Duplicate Registration with Same Email', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Candidate',
        email: testEmail,
        password: testPassword
      }
    });
    return res.status === 400;
  });

  // 4. Candidate Login
  await test('4. Candidate Authentication & JWT Issuance', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword
      }
    });
    return res.status === 200 && res.data.token && res.data.user.role === 'user';
  });

  // 5. Invalid Login Rejection
  await test('5. Rejection of Invalid Login Credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'WrongPassword'
      }
    });
    return res.status === 401;
  });

  // 6. Admin Login
  await test('6. Admin Authentication & Role Authorization', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@careerlaunch.com',
        password: 'Admin@12345'
      }
    });
    if (res.status === 200 && res.data.user.role === 'admin') {
      adminToken = res.data.token;
      return true;
    }
    return false;
  });

  // 7. Browse Opportunities
  await test('7. Retrieve Public Opportunities Catalog', async () => {
    const res = await request('/opportunities');
    if (res.status === 200 && Array.isArray(res.data) && res.data.length >= 1) {
      sampleOppId = res.data[0]._id;
      return true;
    }
    return false;
  });

  // 8. Search & Filter Opportunities
  await test('8. Filter Opportunities by Domain and Search Query', async () => {
    const res = await request('/opportunities?domain=Web+Development&search=React');
    return res.status === 200 && Array.isArray(res.data);
  });

  // 9. View Single Opportunity Details
  await test('9. Retrieve Opportunity Details by ID', async () => {
    const res = await request(`/opportunities/${sampleOppId}`);
    return res.status === 200 && res.data._id === sampleOppId && res.data.title;
  });

  // 10. Security: Non-Admin Forbidden to Create Opportunity
  await test('10. Security: Candidate Forbidden from Creating Job Listing (403)', async () => {
    const res = await request('/opportunities', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: {
        title: 'Unauthorized Role Posting',
        companyName: 'Hacker Inc',
        domain: 'Web Development',
        location: 'Remote',
        experience: '0 Years',
        description: 'Should be rejected',
        applicationLink: 'https://hacker.com'
      }
    });
    return res.status === 403;
  });

  // 11. Admin Creates Opportunity
  await test('11. Admin Opportunity Creation', async () => {
    const res = await request('/opportunities', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Senior QA Automation Engineer',
        companyName: 'Apex Cloud Systems',
        domain: 'Cloud & DevOps',
        type: 'Full-Time',
        location: 'Bangalore (Remote)',
        experience: '2–4 Years',
        stipendOrSalary: '₹14 – ₹18 LPA',
        description: 'Lead automated regression testing, integration test suites, and CI/CD pipelines.',
        applicationLink: 'https://apexcloud.example.com/careers/qa-auto'
      }
    });
    if (res.status === 201 && res.data._id) {
      createdOppId = res.data._id;
      return true;
    }
    return false;
  });

  // 12. Admin Updates Opportunity
  await test('12. Admin Opportunity Update', async () => {
    const res = await request(`/opportunities/${createdOppId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { stipendOrSalary: '₹16 – ₹20 LPA' }
    });
    return res.status === 200 && res.data.stipendOrSalary === '₹16 – ₹20 LPA';
  });

  // 13. Candidate Submits Application
  await test('13. Candidate Submits Opportunity Application', async () => {
    const res = await request('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: {
        opportunityId: sampleOppId,
        applicantName: 'Automated Test Candidate',
        email: testEmail,
        phone: '+91 9988776655',
        resumeLink: 'https://drive.google.com/file/d/test-candidate-resume/view',
        coverLetter: 'Excited about the role and confident in full-stack engineering skills.'
      }
    });
    if (res.status === 201 && res.data.data?._id) {
      createdAppId = res.data.data._id;
      return true;
    }
    return false;
  });

  // 14. Prevent Duplicate Applications
  await test('14. Prevent Duplicate Application by Same Candidate for Same Role', async () => {
    const res = await request('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: {
        opportunityId: sampleOppId,
        applicantName: 'Automated Test Candidate',
        email: testEmail,
        phone: '+91 9988776655',
        resumeLink: 'https://drive.google.com/file/d/test-candidate-resume/view'
      }
    });
    return res.status === 400 && res.data.message.includes('already submitted an application');
  });

  // 15. Candidate Retrieves Own Applications ("My Applications")
  await test('15. Candidate Retrieves Submitted Applications (User Dashboard)', async () => {
    const res = await request('/applications/my-applications', {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    return res.status === 200 && Array.isArray(res.data) && res.data.length >= 1;
  });

  // 16. Security: Candidate Forbidden from Accessing All Candidate Applications (403)
  await test('16. Security: Candidate Forbidden from Viewing All Applications (403)', async () => {
    const res = await request('/applications', {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    return res.status === 403;
  });

  // 17. Admin Views All Applications
  await test('17. Admin Retrieves Full Applications Pipeline', async () => {
    const res = await request('/applications', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return res.status === 200 && Array.isArray(res.data) && res.data.length >= 2;
  });

  // 18. Admin Updates Application Status & Notes
  await test('18. Admin Updates Application Status to "Accepted" with Notes', async () => {
    const res = await request(`/applications/${createdAppId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'Accepted',
        adminNotes: 'Passed all technical rounds. Generating offer letter.'
      }
    });
    return res.status === 200 && res.data.data.status === 'Accepted' && res.data.data.adminNotes.includes('offer letter');
  });

  // 19. Admin Cleans Up Created Opportunity
  await test('19. Admin Deletes Listing', async () => {
    const res = await request(`/opportunities/${createdOppId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return res.status === 200 && res.data.deletedId === createdOppId;
  });

  // 20. Admin Cleans Up Test Application
  await test('20. Admin Deletes Application Record', async () => {
    const res = await request(`/applications/${createdAppId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return res.status === 200 && res.data.deletedId === createdAppId;
  });

  console.log('\n======================================================');
  const passedCount = results.filter((r) => r.status === 'PASSED').length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('======================================================\n');

  if (passedCount === results.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runSuite();
