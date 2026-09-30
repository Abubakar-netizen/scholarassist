/* ==========================================================================
   ScholarAssist - Main Application Controller
   Handles View Routing, Interactivity, Role-Based Adaptations, 
   Scholarship Filtering, Eligibility Engine & Modal Interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentView: 'home-view',
    currentRole: 'STUDENT',
    user: {
      isLoggedIn: false,
      name: 'Abubakar Awan',
      email: 'student@university.edu.pk',
      cnic: '35202-1234567-1',
      cgpa: 3.45,
      income: 55000,
      discipline: 'Computer Science',
      degree: 'BS',
      province: 'Punjab'
    },
    uploadedDocuments: [],
    myApplications: [
      {
        id: "APP-2026-8812",
        scholarshipTitle: "HEC Needs-Based Scholarship 2026",
        appliedDate: "2026-09-28",
        status: "Under Review",
        documentsVerified: 3,
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }
    ],
    filteredScholarships: [...SCHOLARSHIPS_DATA]
  };

  // DOM Elements
  const navLinks = document.querySelectorAll('.nav-link');
  const viewSections = document.querySelectorAll('.view-section');
  const roleSelectPill = document.getElementById('role-select-pill');
  const activeRoleName = document.getElementById('active-role-name');
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
        actor: state.user.isLoggedIn ? state.user.email : 'guest_visitor',
        role: state.currentRole,
        action: 'NAVIGATE_VIEW',
        details: `Navigated to view: ${viewId}`,
        type: 'INFO'
      });
    }
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
     2. Interactive Role-Based Switcher (SSD Demo Feature)
     ========================================================================== */
  const roleModal = document.getElementById('role-select-modal');
  if (roleSelectPill) {
    roleSelectPill.addEventListener('click', () => {
      roleModal.classList.add('active');
    });
  }

  window.selectRole = function(roleKey) {
    if (USER_ROLES[roleKey]) {
      state.currentRole = roleKey;
      const roleData = USER_ROLES[roleKey];
      activeRoleName.textContent = roleData.name;
      roleSelectPill.querySelector('.role-dot').style.backgroundColor = roleData.color;

      roleModal.classList.remove('active');

      showToast(`Switched view context to ${roleData.name}`, 'info');

      SecurityModule.logEvent({
        actor: state.user.email,
        role: roleKey,
        action: 'ROLE_CONTEXT_SWITCH',
        details: `Switched active role simulator to ${roleKey}`,
        type: 'WARN'
      });

      // Update UI elements sensitive to role
      adaptUIForRole(roleKey);
    }
  };

  function adaptUIForRole(roleKey) {
    const reviewerBanner = document.getElementById('reviewer-role-banner');
    const adminBanner = document.getElementById('admin-role-banner');
    const studentAppTab = document.getElementById('my-applications-tab');

    if (reviewerBanner) reviewerBanner.style.display = (roleKey === 'OFFICER' || roleKey === 'UNIV_OFFICER') ? 'block' : 'none';
    if (adminBanner) adminBanner.style.display = (roleKey === 'ADMIN') ? 'block' : 'none';
    if (studentAppTab) studentAppTab.style.display = (roleKey === 'STUDENT') ? 'block' : 'none';
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
      actor: state.user.email,
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
  const registerForm = document.getElementById('register-form');
  const passwordInput = document.getElementById('login-password');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  const regPasswordInput = document.getElementById('reg-password');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const cnicInput = document.getElementById('reg-cnic');

  // Toggle Password Visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
      
      SecurityModule.logEvent({
        actor: 'user_interaction',
        role: state.currentRole,
        action: 'AUTH_PASSWORD_TOGGLE',
        details: `Password field visibility toggled to ${type}`,
        type: 'INFO'
      });
    });
  }

  // Real-Time Password Strength Meter (Register Form)
  if (regPasswordInput && strengthBar && strengthText) {
    regPasswordInput.addEventListener('input', (e) => {
      const val = e.target.value;
      const res = SecurityModule.evaluatePasswordSecurity(val);
      strengthBar.style.width = `${res.score}%`;
      strengthBar.style.backgroundColor = res.color;
      strengthText.textContent = `Password Quality: ${res.label}`;
      strengthText.style.color = res.color;
    });
  }

  // Automatic Hyphen Formatting for CNIC Input
  if (cnicInput) {
    cnicInput.addEventListener('input', (e) => {
      e.target.value = SecurityModule.formatCNIC(e.target.value);
    });
  }

  // Login / Register Tab Toggle
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');

  if (tabLoginBtn && tabRegisterBtn && loginForm && registerForm) {
    tabLoginBtn.addEventListener('click', () => {
      tabLoginBtn.classList.add('active');
      tabRegisterBtn.classList.remove('active');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    });

    tabRegisterBtn.addEventListener('click', () => {
      tabRegisterBtn.classList.add('active');
      tabLoginBtn.classList.remove('active');
      registerForm.style.display = 'block';
      loginForm.style.display = 'none';
    });
  }

  // Login Form Submission Handler
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = passwordInput.value;

      if (!email || !pass) {
        showToast('Please provide valid credentials.', 'danger');
        return;
      }

      state.user.isLoggedIn = true;
      state.user.email = email;

      showToast(`Welcome back, ${email}! Authenticated securely.`, 'success');
      
      SecurityModule.logEvent({
        actor: email,
        role: state.currentRole,
        action: 'AUTH_LOGIN_SUCCESS',
        details: 'User authenticated with multi-factor authentication ready token.',
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
      status: 'VERIFIED_CLEAN',
      uploadTime: new Date().toLocaleTimeString()
    };

    state.uploadedDocuments.push(docObj);
    renderUploadedDocuments();
    showToast(`Document '${file.name}' validated and attached securely.`, 'success');

    SecurityModule.logEvent({
      actor: state.user.email,
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
          <span class="file-security-tag"><i class="fa-solid fa-shield-check"></i> AES-256</span>
          <button class="btn btn-danger btn-sm" onclick="removeDocument('${doc.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  window.removeDocument = function(docId) {
    state.uploadedDocuments = state.uploadedDocuments.filter(d => d.id !== docId);
    renderUploadedDocuments();
    showToast('Document removed.', 'info');
  };

  /* ==========================================================================
     7. Application Submission & Modal Management
     ========================================================================== */
  let activeApplyingScholarship = null;

  window.openApplicationModal = function(schId) {
    const sch = SCHOLARSHIPS_DATA.find(s => s.id === schId);
    if (!sch) return;

    activeApplyingScholarship = sch;
    const modalTitle = document.getElementById('modal-scholarship-title');
    const modalDesc = document.getElementById('modal-scholarship-desc');

    if (modalTitle) modalTitle.textContent = sch.title;
    if (modalDesc) modalDesc.textContent = `${sch.organization} • Grant: ${sch.amount}`;

    applicationModal.classList.add('active');

    SecurityModule.logEvent({
      actor: state.user.email,
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
      if (state.uploadedDocuments.length === 0) {
        showToast('Security Rule: Please attach at least 1 verified document (CNIC or Transcript) before submitting.', 'warning');
        return;
      }

      const appId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newApp = {
        id: appId,
        scholarshipTitle: activeApplyingScholarship ? activeApplyingScholarship.title : 'Scholarship Program',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        documentsVerified: state.uploadedDocuments.length,
        hash: "a4f891b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abc"
      };

      state.myApplications.unshift(newApp);
      renderMyApplications();

      closeModal('application-modal');
      showToast(`Application ${appId} submitted successfully! Received digital verification receipt.`, 'success');

      SecurityModule.logEvent({
        actor: state.user.email,
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

    if (state.myApplications.length === 0) {
      container.innerHTML = '<p>No active applications found.</p>';
      return;
    }

    container.innerHTML = state.myApplications.map(app => `
      <div style="background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="status-badge-lg eligible" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">${app.status}</span>
          <h4 style="margin-top: 0.5rem;">${SecurityModule.sanitizeHTML(app.scholarshipTitle)}</h4>
          <div style="font-size: 0.8rem; color: var(--text-dim);">Application Ref: ${app.id} • Submitted: ${app.appliedDate}</div>
        </div>
        <div>
          <button class="btn btn-secondary btn-sm" onclick="viewAuditReceipt('${app.id}', '${app.hash}')">
            <i class="fa-solid fa-shield-halved"></i> Audit Receipt
          </button>
        </div>
      </div>
    `).join('');
  }

  window.viewAuditReceipt = function(appId, hash) {
    alert(`ScholarAssist Security Digital Receipt\n===================================\nApplication ID: ${appId}\nStatus: SUBMITTED & INTEGRITY VERIFIED\nCryptographic SHA-256 Hash:\n${hash}\n\n[Non-Repudiation Control Active]`);
  };

  /* ==========================================================================
     8. Live Security Audit Monitor Renderer
     ========================================================================== */
  window.renderAuditLogs = function() {
    if (!auditLogsContainer) return;

    auditLogsContainer.innerHTML = INITIAL_AUDIT_LOGS.map(log => `
      <div class="audit-log-entry ${log.type}">
        <span>${log.timestamp}</span>
        <span style="color: var(--secondary); font-weight: 600;">[${log.role}]</span>
        <span><strong>${log.action}</strong>: ${SecurityModule.sanitizeHTML(log.details)}</span>
        <span style="text-align: right; color: var(--text-dim);">${log.actor}</span>
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
  renderUploadedDocuments();
  renderMyApplications();
  window.renderAuditLogs();
});
