/* ==========================================================================
   ScholarAssist - Data Module & Sample Datasets
   Contains Pakistani scholarship opportunities, security audit templates, 
   and role definitions for testing the prototype.
   ========================================================================== */

const SCHOLARSHIPS_DATA = [
  {
    id: "SCH-001",
    title: "HEC Needs-Based Scholarship 2026",
    organization: "Higher Education Commission (HEC) Pakistan",
    category: "Need-Based",
    degreeLevel: "BS / MS",
    fieldOfStudy: "Computer Science & Engineering",
    minCGPA: 2.8,
    maxIncomeLimit: 60000, // PKR per month
    amount: "Full Tuition + PKR 12,000/mo Stipend",
    deadline: "2026-11-15",
    description: "Financial assistance for financially challenged students enrolled in public sector universities across Pakistan.",
    requiredDocuments: ["CNIC/B-Form", "Parent Income Certificate", "Last Semester Transcript", "Domicile Certificate"],
    eligibleProvinces: ["Punjab", "Sindh", "KPK", "Balochistan", "AJK", "Gilgit-Baltistan"]
  },
  {
    id: "SCH-002",
    title: "Ehsaas Undergraduate Scholarship Program",
    organization: "Government of Pakistan / Benazir Income Support Program",
    category: "Need & Merit Based",
    degreeLevel: "BS",
    fieldOfStudy: "All Disciplines",
    minCGPA: 3.0,
    maxIncomeLimit: 45000,
    amount: "100% Tuition Fee + PKR 40,000/year Allowance",
    deadline: "2026-10-30",
    description: "Largest undergraduate scholarship program aiming to provide equal opportunities for low-income families.",
    requiredDocuments: ["CNIC/B-Form", "Salary Slip / Pension Book", "Electricity Bill", "University Enrollment Letter"],
    eligibleProvinces: ["All Pakistan"]
  },
  {
    id: "SCH-003",
    title: "PEEF Master's & Bachelor's Merit Grant",
    organization: "Punjab Educational Endowment Fund (PEEF)",
    category: "Merit-Based",
    degreeLevel: "BS / MS / PhD",
    fieldOfStudy: "STEM & Social Sciences",
    minCGPA: 3.3,
    maxIncomeLimit: 75000,
    amount: "PKR 150,000 per annum",
    deadline: "2026-12-01",
    description: "Merit scholarship for high achievers in Punjab with demonstrated financial need.",
    requiredDocuments: ["Domicile (Punjab)", "CNIC", "Academic Records", "Affidavit of Income"],
    eligibleProvinces: ["Punjab"]
  },
  {
    id: "SCH-004",
    title: "National ICT R&D Tech Talent Fellowship",
    organization: "Ignite National Technology Fund",
    category: "Research & Talent",
    degreeLevel: "MS / PhD",
    fieldOfStudy: "Computer Science & AI",
    minCGPA: 3.5,
    maxIncomeLimit: 120000,
    amount: "Full Tuition + PKR 45,000/mo Research Grant",
    deadline: "2026-10-25",
    description: "Fostering research excellence in Artificial Intelligence, Cybersecurity, and Data Science.",
    requiredDocuments: ["Research Proposal", "CV", "CNIC", "2 Recommendation Letters", "Transcript"],
    eligibleProvinces: ["All Pakistan"]
  },
  {
    id: "SCH-005",
    title: "Sindh Endowment Fund Scholarship",
    organization: "College Education Department, Govt of Sindh",
    category: "Regional Need-Based",
    degreeLevel: "BS / MS",
    fieldOfStudy: "Medicine, Business & IT",
    minCGPA: 2.75,
    maxIncomeLimit: 80000,
    amount: "Full Tuition Coverage",
    deadline: "2026-11-30",
    description: "Dedicated endowment for students domiciled in Sindh studying in recognized institutes.",
    requiredDocuments: ["Sindh Domicile", "PRC Form C", "CNIC", "Parent Income Certificate"],
    eligibleProvinces: ["Sindh"]
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    timestamp: "2026-09-30 18:42:10",
    actor: "system_daemon",
    role: "SYSTEM",
    action: "SYS_INITIALIZE_RBAC",
    details: "Demo role matrix loaded with Student and Scholarship Review Officer roles.",
    type: "SUCCESS"
  },
  {
    timestamp: "2026-09-30 18:45:02",
    actor: "student_042",
    role: "STUDENT",
    action: "AUTH_LOGIN_SUCCESS",
    details: "Illustrative student demo-account login event (no MFA or network identity is used).",
    type: "AUTH"
  },
  {
    timestamp: "2026-09-30 18:47:19",
    actor: "student_042",
    role: "STUDENT",
    action: "ELIGIBILITY_EVALUATE",
    details: "Calculated eligibility for SCH-001 (Result: ELIGIBLE)",
    type: "SUCCESS"
  },
  {
    timestamp: "2026-09-30 18:50:33",
    actor: "unauth_guest",
    role: "GUEST",
    action: "IDOR_PREVENTION_CHECK",
    details: "Blocked direct parameter tampering attempt on GET /api/v1/docs/APP-9982",
    type: "WARN"
  }
];

const USER_ROLES = {
  STUDENT: {
    name: "Student / Applicant",
    description: "Searches scholarships, evaluates eligibility, submits documents, and tracks personal applications.",
    color: "#06b6d4"
  },
  OFFICER: {
    name: "Scholarship Review Officer",
    description: "Reviews submitted applications, checks attached-document counts, and updates application status.",
    color: "#f59e0b"
  }
};
