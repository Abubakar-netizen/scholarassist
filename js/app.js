const DEMO_USERS = [
  {
    email: 'student@university.edu.pk',
    password: 'Student#2026',
    name: 'Abubakar Awan',
    role: 'STUDENT',
    cnic: '35202-1234567-1',
    cgpa: 3.45,
    income: 55000,
    discipline: 'Computer Science',
    degree: 'BS',
    province: 'Punjab'
  },
  {
    email: 'officer@scholarassist.edu.pk',
    password: 'Officer#2026',
    name: 'Sara Malik',
    role: 'OFFICER'
  }
];

/* ==========================================================================
   ScholarAssist - Main Application Controller
   Handles View Routing, Interactivity, Role-Based Adaptations, 
   Scholarship Filtering, Eligibility Engine & Modal Interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentView: 'home-view',
    currentRole: 'GUEST',
    user: null,
    uploadedDocuments: [],
    myApplications: [
      {
        id: "APP-2026-8812",
        scholarshipTitle: "HEC Needs-Based Scholarship 2026",
        appliedDate: "2026-09-28",
        status: "Under Review",
        documentsVerified: 3,
        applicantEmail: 'student@university.edu.pk',
        applicantName: 'Abubakar Awan',
        applicantCnic: '35202-1234567-1',
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }
    ],
    filteredScholarships: [...SCHOLARSHIPS_DATA]
  };

  // DOM Elements
  const navLinks = document.querySelectorAll('.nav-link');
  const viewSections = document.querySelectorAll('.view-section');
  const roleSelectPill = document.getElementById('role-indicator');
  const activeRoleName = document.getElementById('active-role-name');
  const roleDot = roleSelectPill ? roleSelectPill.querySelector('.role-dot') : null;
  const logoutButton = document.getElementById('logout-btn');
  const loginNavButton = document.getElementById('login-nav-btn');
  const studentDashboard = document.getElementById('student-dashboard');
  const officerDashboard = document.getElementById('officer-dashboard');
  const studentNameDisplay = document.getElementById('student-name-display');
  const studentEmailDisplay = document.getElementById('student-email-display');
  const studentCnicDisplay = document.getElementById('student-cnic-display');
  const reviewApplicationsList = document.getElementById('review-applications-list');
  const scholarshipContainer = document.getElementById('scholarship-cards-container');
  const searchInput = document.getElementById('scholarship-search-input');
  const fieldFilter = document.getElementById('filter-field');
  const degreeFilter = document.getElementById('filter-degree');
  const incomeFilter = document.getElementById('filter-income');
  const incomeValueDisplay = document.getElementById('filter-income-val');
  
  // Interactive Eligibility Engine Inputs
  const inputEligCgpa = document.getElementById('elig-cgpa');
  const inputEligIncome = document.getElementById('elig-income');
  const inputEligProvince = document.getElementById('elig-province');
  const inputEligDiscipline = document.getElementById('elig-discipline');
  const eligOutputBadge = document.getElementById('elig-output-badge');
  const eligOutputDesc = document.getElementById('elig-output-desc');
  const eligMatchList = document.getElementById('elig-matched-scholarships');

  // Audit Logs Container
  const auditLogsContainer = document.getElementById('audit-logs-list');

  // Modal Elements
  const applicationModal = document.getElementById('application-modal');
  const documentSecurityModal = document.getElementById('doc-security-modal');

  /* ==========================================================================
     1. View Router & Navigation
     ========================================================================== */
  function navigateTo(viewId) {
    if (viewId === 'login-view' && state.user) {
      showToast('Log out before signing in with another demo account.', 'info');
      viewId = 'portal-view';
    }
    if (viewId === 'portal-view' && !state.user) {
      showToast('Sign in with a demo account to access the role-specific portal.', 'warning');
      viewId = 'login-view';
    }

    viewSections.forEach(section => {
      section.classList.remove('active');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('active');
      state.currentView = viewId;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update Nav Link highlighting
      navLinks.forEach(link => {
        if (link.getAttribute('data-view') === viewId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Audit Log Navigation Event
      SecurityModule.logEvent({
        actor: state.user ? state.user.email : 'guest_visitor',
        role: state.currentRole,
        action: 'NAVIGATE_VIEW',
        details: `Navigated to view: ${viewId}`,
        type: 'INFO'
      });
    }
  }

  function authorizeRole(requiredRole, action) {
    if (state.user && state.user.role === requiredRole) return true;

    showToast(`Access Denied: ${action} is restricted to ${requiredRole === 'OFFICER' ? 'Scholarship Review Officers' : 'students'}.`, 'danger');
    SecurityModule.logEvent({
      actor: state.user ? state.user.email : 'guest_visitor',
      role: state.currentRole,
      action: 'ACCESS_DENIED',
      details: `Blocked ${action}; required role: ${requiredRole}`,
      type: 'WARN'
    });
    return false;
  }

  // Bind nav click events
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = link.getAttribute('data-view');
      navigateTo(viewId);
    });
  });

  // Action Buttons Navigation Triggers
  document.querySelectorAll('[data-target-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.getAttribute('data-target-view');
      navigateTo(viewId);
    });
  });

  /* ==========================================================================
     2. Credential-Based Role Login & Session Controls
     ========================================================================== */
  function renderRoleDashboard() {
    const isStudent = Boolean(state.user && state.user.role === 'STUDENT');
    const isOfficer = Boolean(state.user && state.user.role === 'OFFICER');
    const roleData = state.user ? USER_ROLES[state.user.role] : null;

    if (studentDashboard) studentDashboard.hidden = !isStudent;
    if (officerDashboard) officerDashboard.hidden = !isOfficer;
    if (logoutButton) logoutButton.hidden = !state.user;
    if (loginNavButton) loginNavButton.hidden = Boolean(state.user);
    if (activeRoleName) {
      activeRoleName.textContent = roleData ? roleData.name : 'Guest';
    }
    if (roleDot) {
      roleDot.style.backgroundColor = roleData ? roleData.color : '#6b7280';
    }
    if (studentNameDisplay) studentNameDisplay.textContent = isStudent ? state.user.name : '';
    if (studentEmailDisplay) studentEmailDisplay.textContent = isStudent ? state.user.email : '';
    if (studentCnicDisplay) studentCnicDisplay.textContent = isStudent ? state.user.cnic : '';

    renderMyApplications();
    renderReviewApplications();
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      state.user = null;
      state.currentRole = 'GUEST';
      state.uploadedDocuments = [];
      if (applicationModal) applicationModal.classList.remove('active');
      if (loginForm) loginForm.reset();
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.type = 'password';
      }
      if (togglePasswordBtn) togglePasswordBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
      if (fileInput) fileInput.value = '';
      if (inputEligCgpa) inputEligCgpa.value = '';
      if (inputEligIncome) inputEligIncome.value = '';
      if (inputEligProvince) inputEligProvince.value = '';
      if (inputEligDiscipline) inputEligDiscipline.value = '';
      document.getElementById('modal-applicant-name').value = '';
      document.getElementById('modal-applicant-cnic').value = '';
      eligOutputBadge.textContent = 'SIGN IN TO CHECK ELIGIBILITY';
      eligOutputBadge.className = 'status-badge-lg';
      eligOutputDesc.textContent = 'Sign in with the student demo account to evaluate scholarship rules.';
      eligMatchList.replaceChildren();
      activeApplyingScholarship = null;
      renderUploadedDocuments();
      renderRoleDashboard();
      navigateTo('login-view');
      showToast('You have been logged out. The demo session has been cleared.', 'info');
      SecurityModule.logEvent({
        actor: 'guest_visitor',
        role: 'GUEST',
        action: 'AUTH_LOGOUT',
        details: 'Cleared the active demo user and temporary uploaded documents.',
        type: 'AUTH'
      });
    });
  }

  /* ==========================================================================
     3. Scholarship Search & Real-Time Filtering
     ========================================================================== */
  function renderScholarships(items) {
    if (!scholarshipContainer) return;

    if (items.length === 0) {
      scholarshipContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: var(--text-dim); margin-bottom: 1rem;"></i>
          <h3>No Scholarships Match Your Criteria</h3>
          <p>Try resetting filters or changing income & CGPA parameters.</p>
        </div>
      `;
      return;
    }

    scholarshipContainer.innerHTML = items.map(sch => `
      <div class="scholarship-card">
        <div>
          <span class="scholarship-tag">${sch.category}</span>
          <h3 class="scholarship-title">${SecurityModule.sanitizeHTML(sch.title)}</h3>
          <div class="scholarship-org">
            <i class="fa-solid fa-building-columns"></i> ${SecurityModule.sanitizeHTML(sch.organization)}
          </div>
          <p style="font-size: 0.875rem; margin-bottom: 1rem;">${SecurityModule.sanitizeHTML(sch.description)}</p>
          
          <div class="criteria-list">
            <div class="criteria-item">
              <span class="criteria-label">Degree Level:</span>
              <span class="criteria-val">${sch.degreeLevel}</span>
            </div>
            <div class="criteria-item">
              <span class="criteria-label">Min CGPA:</span>
              <span class="criteria-val">${sch.minCGPA}</span>
            </div>
            <div class="criteria-item">
              <span class="criteria-label">Max Household Income:</span>
              <span class="criteria-val">PKR ${sch.maxIncomeLimit.toLocaleString()}/mo</span>
            </div>
            <div class="criteria-item">
              <span class="criteria-label">Grant Amount:</span>
              <span class="criteria-val" style="color: var(--secondary);">${sch.amount}</span>
            </div>
            <div class="criteria-item">
              <span class="criteria-label">Application Deadline:</span>
              <span class="criteria-val" style="color: var(--warning);">${sch.deadline}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
          <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="openApplicationModal('${sch.id}')">
            <i class="fa-solid fa-paper-plane"></i> Apply Now
          </button>
          <button class="btn btn-secondary btn-sm" onclick="evaluateScholarshipEligibility('${sch.id}')" title="Check Rules">
            <i class="fa-solid fa-calculator"></i> Check Rules
          </button>
        </div>
      </div>
    `).join('');
  }

  function filterScholarships() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const fieldVal = fieldFilter ? fieldFilter.value : '';
    const degreeVal = degreeFilter ? degreeFilter.value : '';
    const maxIncVal = incomeFilter ? parseInt(incomeFilter.value, 10) : 200000;

    state.filteredScholarships = SCHOLARSHIPS_DATA.filter(item => {
      const matchesQuery = item.title.toLowerCase().includes(query) || item.organization.toLowerCase().includes(query);
      const matchesField = !fieldVal || item.fieldOfStudy.includes(fieldVal) || item.fieldOfStudy === 'All Disciplines';
      const matchesDegree = !degreeVal || item.degreeLevel.includes(degreeVal);
      const matchesIncome = item.maxIncomeLimit <= maxIncVal || maxIncVal === 200000;

      return matchesQuery && matchesField && matchesDegree && matchesIncome;
    });

    renderScholarships(state.filteredScholarships);
  }

  if (searchInput) searchInput.addEventListener('input', filterScholarships);
  if (fieldFilter) fieldFilter.addEventListener('change', filterScholarships);
  if (degreeFilter) degreeFilter.addEventListener('change', filterScholarships);
  if (incomeFilter) {
    incomeFilter.addEventListener('input', (e) => {
      if (incomeValueDisplay) incomeValueDisplay.textContent = `PKR ${parseInt(e.target.value).toLocaleString()}`;
      filterScholarships();
    });
  }

  /* ==========================================================================
     4. Dynamic Rule-Based Eligibility Engine (Core SSD Requirement)
     ========================================================================== */
  function evaluateEligibilityEngine() {
    if (!inputEligCgpa || !inputEligIncome) return;

    const cgpa = parseFloat(inputEligCgpa.value) || 0;
    const income = parseInt(inputEligIncome.value, 10) || 0;
    const province = inputEligProvince ? inputEligProvince.value : 'Punjab';

    let eligibleList = [];
    let partialList = [];

    SCHOLARSHIPS_DATA.forEach(sch => {
      const passCgpa = cgpa >= sch.minCGPA;
      const passIncome = income <= sch.maxIncomeLimit;
      const passProvince = sch.eligibleProvinces.includes('All Pakistan') || sch.eligibleProvinces.includes(province);

      if (passCgpa && passIncome && passProvince) {
        eligibleList.push(sch);
      } else if (passCgpa && (passIncome || passProvince)) {
        partialList.push(sch);
      }
    });

    if (eligibleList.length > 0) {
      eligOutputBadge.className = 'status-badge-lg eligible';
      eligOutputBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ELIGIBLE FOR ${eligibleList.length} SCHOLARSHIPS`;
      eligOutputDesc.textContent = `Your CGPA (${cgpa}) and Monthly Income (PKR ${income.toLocaleString()}) satisfy all system criteria rules!`;
    } else if (partialList.length > 0) {
      eligOutputBadge.className = 'status-badge-lg partial';
      eligOutputBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> POTENTIALLY ELIGIBLE (${partialList.length})`;
      eligOutputDesc.textContent = `You meet academic standards but exceed income thresholds for primary need grants.`;
    } else {
      eligOutputBadge.className = 'status-badge-lg ineligible';
      eligOutputBadge.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> NOT CURRENTLY ELIGIBLE`;
      eligOutputDesc.textContent = `Minimum required CGPA for active programs is 2.75. Keep up the academic progress!`;
    }

    // Render list of matched scholarships
    if (eligMatchList) {
      eligMatchList.innerHTML = eligibleList.map(item => `
        <div style="padding: 0.6rem 0.85rem; background: rgba(16, 185, 129, 0.1); border-left: 3px solid var(--accent); border-radius: 4px; font-size: 0.85rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>${SecurityModule.sanitizeHTML(item.title)}</strong> (${item.amount})</span>
          <button class="btn btn-accent btn-sm" onclick="openApplicationModal('${item.id}')">Apply</button>
        </div>
      `).join('') || '<p style="font-size:0.85rem; color:var(--text-dim);">No 100% matches found based on current rules.</p>';
    }

    SecurityModule.logEvent({
      actor: state.user ? state.user.email : 'guest_visitor',
      role: state.currentRole,
      action: 'ELIGIBILITY_RULE_EVALUATED',
      details: `CGPA: ${cgpa}, Income: PKR ${income}, Matched: ${eligibleList.length}`,
      type: 'INFO'
    });
  }

  // Bind input change events for instant dynamic calculation
  if (inputEligCgpa) inputEligCgpa.addEventListener('input', evaluateEligibilityEngine);
  if (inputEligIncome) inputEligIncome.addEventListener('input', evaluateEligibilityEngine);
  if (inputEligProvince) inputEligProvince.addEventListener('change', evaluateEligibilityEngine);

  window.evaluateScholarshipEligibility = function(schId) {
    if (!authorizeRole('STUDENT', 'Eligibility evaluation')) return;
    const sch = SCHOLARSHIPS_DATA.find(s => s.id === schId);
    if (sch) {
      navigateTo('portal-view');
      inputEligCgpa.value = state.user.cgpa;
      inputEligIncome.value = state.user.income;
      evaluateEligibilityEngine();
      showToast(`Evaluated rules for ${sch.title}`, 'info');
    }
  };

  /* ==========================================================================
     5. Authentication & Security Form Interactions
     ========================================================================== */
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('login-password');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');

  // Toggle Password Visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
      
      SecurityModule.logEvent({
        actor: state.user ? state.user.email : 'guest_visitor',
        role: state.currentRole,
        action: 'AUTH_PASSWORD_TOGGLE',
        details: `Password field visibility toggled to ${type}`,
        type: 'INFO'
      });
    });
  }

  document.querySelectorAll('[data-demo-account]').forEach(button => {
    button.addEventListener('click', () => {
      const account = DEMO_USERS.find(user => user.role === button.dataset.demoAccount);
      if (!account) return;
      document.getElementById('login-email').value = account.email;
      passwordInput.value = account.password;
    });
  });

  // Login Form Submission Handler
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (state.user) {
        showToast('Log out before signing in with another demo account.', 'warning');
        return;
      }
      const email = document.getElementById('login-email').value.trim().toLowerCase();
      const pass = passwordInput.value;
      const account = DEMO_USERS.find(user => user.email === email && user.password === pass);

      if (!account) {
        showToast('Access Denied: demo email or password is incorrect.', 'danger');
        SecurityModule.logEvent({
          actor: 'unknown_user',
          role: 'GUEST',
          action: 'AUTH_LOGIN_FAILED',
          details: 'Rejected invalid demo credentials.',
          type: 'WARN'
        });
        return;
      }

      state.user = {
        name: account.name,
        email: account.email,
        role: account.role,
        cnic: account.cnic,
        cgpa: account.cgpa,
        income: account.income,
        discipline: account.discipline,
        degree: account.degree,
        province: account.province
      };
      state.currentRole = account.role;
      if (account.role === 'STUDENT') {
        inputEligCgpa.value = account.cgpa;
        inputEligIncome.value = account.income;
        inputEligProvince.value = account.province;
        inputEligDiscipline.value = account.discipline;
        evaluateEligibilityEngine();
      }
      renderRoleDashboard();
      showToast(`Welcome, ${account.name}. Your ${account.role === 'STUDENT' ? 'student' : 'officer'} dashboard is ready.`, 'success');
      SecurityModule.logEvent({
        actor: account.email,
        role: account.role,
        action: 'AUTH_LOGIN_SUCCESS',
        details: `Authenticated demo account for ${account.role}.`,
        type: 'AUTH'
      });
      navigateTo('portal-view');
    });
  }

  /* ==========================================================================
     6. File Upload & Document Security Sandbox
     ========================================================================== */
  const dropZone = document.getElementById('document-drop-zone');
  const fileInput = document.getElementById('file-upload-input');
  const fileListContainer = document.getElementById('uploaded-files-container');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    if (!authorizeRole('STUDENT', 'Document upload')) return;
    const result = SecurityModule.validateFileUpload(file);

    if (!result.valid) {
      if (result.securityAlert) {
        alert(result.message); // High priority alert for malicious file block
      }
      showToast(result.message, 'danger');
      return;
    }

    const docObj = {
      id: `DOC-${Date.now()}`,
      name: file.name,
      size: result.sizeFormatted,
      type: file.type || 'application/pdf',
      status: 'CLIENT_CHECKED',
      uploadTime: new Date().toLocaleTimeString()
    };

    state.uploadedDocuments.push(docObj);
    renderUploadedDocuments();
    showToast(`Document '${file.name}' passed the client-side demo checks.`, 'success');

    SecurityModule.logEvent({
      actor: state.user ? state.user.email : 'guest_visitor',
      role: state.currentRole,
      action: 'DOC_UPLOAD_VALIDATED',
      details: `Passed client sandbox inspection: ${file.name} (${result.sizeFormatted})`,
      type: 'SUCCESS'
    });
  }

  function renderUploadedDocuments() {
    if (!fileListContainer) return;

    if (state.uploadedDocuments.length === 0) {
      fileListContainer.innerHTML = '<p style="font-size:0.85rem; color:var(--text-dim);">No documents uploaded yet. (Allowed: .PDF, .PNG, .JPG)</p>';
      return;
    }

    fileListContainer.innerHTML = state.uploadedDocuments.map(doc => `
      <div class="file-item">
        <div class="file-info">
          <i class="fa-solid fa-file-pdf" style="color: var(--secondary); font-size: 1.2rem;"></i>
          <div>
            <strong>${SecurityModule.sanitizeHTML(doc.name)}</strong>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${doc.size} • Uploaded at ${doc.uploadTime}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="file-security-tag"><i class="fa-solid fa-shield-check"></i> Validated (demo)</span>
          <button class="btn btn-danger btn-sm" onclick="removeDocument('${doc.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  window.removeDocument = function(docId) {
    if (!authorizeRole('STUDENT', 'Document removal')) return;
    state.uploadedDocuments = state.uploadedDocuments.filter(d => d.id !== docId);
    renderUploadedDocuments();
    showToast('Document removed.', 'info');
  };

  /* ==========================================================================
     7. Application Submission & Modal Management
     ========================================================================== */
  let activeApplyingScholarship = null;

  window.openApplicationModal = function(schId) {
    if (!authorizeRole('STUDENT', 'Application submission')) return;
    const sch = SCHOLARSHIPS_DATA.find(s => s.id === schId);
    if (!sch) return;

    activeApplyingScholarship = sch;
    const modalTitle = document.getElementById('modal-scholarship-title');
    const modalDesc = document.getElementById('modal-scholarship-desc');
    const applicantName = document.getElementById('modal-applicant-name');
    const applicantCnic = document.getElementById('modal-applicant-cnic');

    if (modalTitle) modalTitle.textContent = sch.title;
    if (modalDesc) modalDesc.textContent = `${sch.organization} • Grant: ${sch.amount}`;
    if (applicantName) applicantName.value = state.user.name;
    if (applicantCnic) applicantCnic.value = state.user.cnic;

    applicationModal.classList.add('active');

    SecurityModule.logEvent({
      actor: state.user ? state.user.email : 'guest_visitor',
      role: state.currentRole,
      action: 'APPLICATION_DRAFT_OPEN',
      details: `Initiated application draft for ${schId}`,
      type: 'INFO'
    });
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  const submitAppBtn = document.getElementById('submit-application-btn');
  if (submitAppBtn) {
    submitAppBtn.addEventListener('click', () => {
      if (!authorizeRole('STUDENT', 'Application submission')) return;
      if (state.uploadedDocuments.length === 0) {
        showToast('Security Rule: Please attach at least 1 verified document (CNIC or Transcript) before submitting.', 'warning');
        return;
      }

      const appId = `APP-${Date.now()}`;
      const newApp = {
        id: appId,
        scholarshipTitle: activeApplyingScholarship ? activeApplyingScholarship.title : 'Scholarship Program',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        documentsVerified: state.uploadedDocuments.length,
        applicantEmail: state.user.email,
        applicantName: state.user.name,
        applicantCnic: state.user.cnic,
        hash: "a4f891b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abc"
      };

      state.myApplications.unshift(newApp);
      renderMyApplications();

      closeModal('application-modal');
      showToast(`Application ${appId} submitted successfully! Received digital verification receipt.`, 'success');

      SecurityModule.logEvent({
        actor: state.user ? state.user.email : 'guest_visitor',
        role: state.currentRole,
        action: 'APPLICATION_SUBMIT_SUCCESS',
        details: `Submitted application ${appId} with ${state.uploadedDocuments.length} document attachments.`,
        type: 'SUCCESS'
      });
    });
  }

  function renderMyApplications() {
    const container = document.getElementById('my-applications-list');
    if (!container) return;

    if (!state.user || state.user.role !== 'STUDENT') {
      container.replaceChildren();
      return;
    }

    const applications = state.myApplications.filter(app => app.applicantEmail === state.user.email);
    if (applications.length === 0) {
      container.innerHTML = '<p>No active applications found.</p>';
      return;
    }

    container.innerHTML = applications.map(app => `
      <div style="background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="status-badge-lg ${app.status === 'Approved' ? 'eligible' : app.status === 'Rejected' ? 'ineligible' : 'partial'}" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">${SecurityModule.sanitizeHTML(app.status)}</span>
          <h4 style="margin-top: 0.5rem;">${SecurityModule.sanitizeHTML(app.scholarshipTitle)}</h4>
          <div style="font-size: 0.8rem; color: var(--text-dim);">Application Ref: ${SecurityModule.sanitizeHTML(app.id)} • Submitted: ${SecurityModule.sanitizeHTML(app.appliedDate)}</div>
        </div>
        <div>
          <button class="btn btn-secondary btn-sm" data-receipt-id="${SecurityModule.sanitizeHTML(app.id)}">
            <i class="fa-solid fa-shield-halved"></i> Audit Receipt
          </button>
        </div>
      </div>
    `).join('');
  }

  if (document.getElementById('my-applications-list')) {
    document.getElementById('my-applications-list').addEventListener('click', (event) => {
      const receiptButton = event.target.closest('[data-receipt-id]');
      if (receiptButton) window.viewAuditReceipt(receiptButton.dataset.receiptId);
    });
  }

  function renderReviewApplications() {
    if (!reviewApplicationsList) return;
    if (!state.user || state.user.role !== 'OFFICER') {
      reviewApplicationsList.replaceChildren();
      return;
    }
    if (state.myApplications.length === 0) {
      reviewApplicationsList.innerHTML = '<p>No applications are waiting for review.</p>';
      return;
    }

    reviewApplicationsList.innerHTML = state.myApplications.map(app => `
      <article class="review-application-card">
        <div>
          <span class="status-badge-lg ${app.status === 'Approved' ? 'eligible' : app.status === 'Rejected' ? 'ineligible' : 'partial'}">${SecurityModule.sanitizeHTML(app.status)}</span>
          <h3>${SecurityModule.sanitizeHTML(app.scholarshipTitle)}</h3>
          <p>Application: ${SecurityModule.sanitizeHTML(app.id)} · Applicant: ${SecurityModule.sanitizeHTML(app.applicantName)} · CNIC: ${SecurityModule.sanitizeHTML(SecurityModule.maskCNIC(app.applicantCnic))}</p>
          <p>${app.documentsVerified} document(s) · Submitted: ${SecurityModule.sanitizeHTML(app.appliedDate)}</p>
        </div>
        <div class="review-actions" aria-label="Update application status">
          <button class="btn btn-secondary btn-sm" data-application-id="${SecurityModule.sanitizeHTML(app.id)}" data-next-status="Under Review">Under Review</button>
          <button class="btn btn-accent btn-sm" data-application-id="${SecurityModule.sanitizeHTML(app.id)}" data-next-status="Approved">Approve</button>
          <button class="btn btn-danger btn-sm" data-application-id="${SecurityModule.sanitizeHTML(app.id)}" data-next-status="Rejected">Reject</button>
        </div>
      </article>
    `).join('');
  }

  if (reviewApplicationsList) {
    reviewApplicationsList.addEventListener('click', (event) => {
      const statusButton = event.target.closest('[data-application-id][data-next-status]');
      if (statusButton) {
        window.updateApplicationStatus(statusButton.dataset.applicationId, statusButton.dataset.nextStatus);
      }
    });
  }

  window.updateApplicationStatus = function(appId, nextStatus) {
    if (!authorizeRole('OFFICER', 'Application status updates')) return;
    const allowedStatuses = ['Under Review', 'Approved', 'Rejected'];
    const application = state.myApplications.find(app => app.id === appId);
    if (!application || !allowedStatuses.includes(nextStatus)) {
      showToast('Unable to update this application with the requested status.', 'danger');
      return;
    }

    application.status = nextStatus;
    renderRoleDashboard();
    showToast(`Application ${appId} marked ${nextStatus}.`, 'success');
    SecurityModule.logEvent({
      actor: state.user.email,
      role: state.currentRole,
      action: 'APPLICATION_STATUS_UPDATED',
      details: `Updated ${appId} to ${nextStatus}.`,
      type: 'SUCCESS'
    });
  };

  window.viewAuditReceipt = function(appId) {
    if (!state.user) {
      authorizeRole('STUDENT', 'Audit receipt access');
      return;
    }
    const application = state.myApplications.find(app => app.id === appId);
    if (!application || (state.user.role === 'STUDENT' && application.applicantEmail !== state.user.email)) {
      showToast('Access Denied: that application receipt is not available to this account.', 'danger');
      return;
    }
    alert(`ScholarAssist Demo Application Receipt\n=====================================\nApplication ID: ${application.id}\nCurrent status: ${application.status}\nDemo integrity value:\n${application.hash}\n\nThis client-side receipt is illustrative, not a verified cryptographic signature.`);
  };

  /* ==========================================================================
     8. Live Security Audit Monitor Renderer
     ========================================================================== */
  window.renderAuditLogs = function() {
    if (!auditLogsContainer) return;

    auditLogsContainer.innerHTML = INITIAL_AUDIT_LOGS.map(log => `
      <div class="audit-log-entry ${SecurityModule.sanitizeHTML(log.type)}">
        <span>${SecurityModule.sanitizeHTML(log.timestamp)}</span>
        <span style="color: var(--secondary); font-weight: 600;">[${SecurityModule.sanitizeHTML(log.role)}]</span>
        <span><strong>${SecurityModule.sanitizeHTML(log.action)}</strong>: ${SecurityModule.sanitizeHTML(log.details)}</span>
        <span style="text-align: right; color: var(--text-dim);">${SecurityModule.sanitizeHTML(log.actor)}</span>
      </div>
    `).join('');
  };

  /* ==========================================================================
     9. Notification Toast Utility
     ========================================================================== */
  function showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'danger') icon = 'fa-triangle-exclamation';
    if (type === 'warning') icon = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${SecurityModule.sanitizeHTML(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ==========================================================================
     Initial App Boot
     ========================================================================== */
  renderScholarships(state.filteredScholarships);
  evaluateEligibilityEngine();
  renderRoleDashboard();
  renderUploadedDocuments();
  window.renderAuditLogs();
});
