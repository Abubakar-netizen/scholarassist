# ScholarAssist — Secure Scholarship Assistance Management System

**Secure Software Development (SSD) Course Project — Initial Prototype Submission**

ScholarAssist is a security-oriented web application designed to connect Pakistani university students with merit and need-based scholarship opportunities while enforcing fundamental Secure Software Development (SSD) principles throughout the semester lifecycle.

---

## 🌟 Key Features & Prototype Deliverables

### 1. Connected Multi-Page Navigation Structure
- **Page 1 — Home / Landing Page (`#home-view`)**: Project title, mission statement, stats banner (12.5k+ applications, 100% audited), interactive module showcase, and system architecture.
- **Page 2 — Portal Entry & Authentication (`#login-view`)**: Sign-in for the two Activity 2 demo users; the credential record determines the role.
- **Page 3 — Role-Based Portal (`#portal-view`)**: Students search scholarships, calculate eligibility, submit applications, and track their own applications. Scholarship Review Officers see a separate review queue and can update application statuses.
- **Page 4 — Security Audit & STRIDE Matrix (`#audit-view`)**: In-memory demo audit events and STRIDE safeguards.

### 2. Interactive JavaScript Functions
- **Dynamic Rule-Based Eligibility Engine**: Evaluates CGPA ($\ge 2.75$), Monthly Household Income limits, Domicile Province, and Discipline in real-time with instant `ELIGIBLE` / `NOT ELIGIBLE` status badges.
- **File Upload Security Sandbox**: Accepts `.pdf`, `.png`, `.jpg` files up to 5 MB while detecting and blocking malicious script extensions (`.exe`, `.sh`, `.php`, `.js`) with dynamic security notices.
- **Show/Hide Password & Entropy Meter**: Toggles visibility and measures password complexity against policy rules.
- **Credential-Based Role Login**: Demo credentials open either the *Student / Applicant* dashboard or the *Scholarship Review Officer* dashboard. There is no role selector that can override the authenticated demo account.
- **Restricted Review Action**: Only the Scholarship Review Officer can change an application's status; unauthorized calls display an Access Denied message and are logged.
- **CNIC Data Minimization**: A student sees their own CNIC in their dashboard. The officer queue displays a masked CNIC.
- **Session Logout**: Logout clears the active user and temporary uploaded documents, hides both protected dashboards, and returns to sign-in.
- **Demo Audit Events**: In-memory log records sign-ins, navigation, eligibility checks, file uploads, and access-denied attempts.

---

## 🔒 Security Design Principles Implemented (SSD Focus)

| Security Topic | Prototype Implementation |
| :--- | :--- |
| **Authentication & Password Security** | Hard-coded demo credentials are matched locally to demonstrate role selection; this is not production authentication. |
| **Least Privilege Access Control** | Separate Student and Scholarship Review Officer dashboards; status updates require the Officer role. |
| **Data Minimization & Confidentiality** | CNIC is displayed in full only in the student's own dashboard and masked in the officer queue. |
| **Malware & Upload Security Sandbox** | Client-side extension whitelist (`.pdf`, `.png`, `.jpg`) and hazardous extension blocking (`.exe`, `.php`). |
| **Accountability & Non-Repudiation** | In-memory demonstration events include timestamps and role context; they are not durable or tamper-proof. |
| **STRIDE Threat Modeling** | Built-in mitigation matrix covering Spoofing, Tampering, Repudiation, Info Disclosure, DoS, and Elevation of Privilege. |

---

## 🚀 How to Run Locally

1. Open your terminal in the project directory `d:\sch`.
2. Start any standard web server:
   ```bash
   # Option A: Python HTTP Server
   python -m http.server 8000

   # Option B: Node serve package
   npx serve .
   ```
3. Open `http://localhost:8000` in your web browser.

## Activity 2 Demo Accounts and Role Tests

Use these accounts on the Portal Entry page:

| Role | Email | Password | Dashboard functions |
| :--- | :--- | :--- | :--- |
| Student / Applicant | `student@university.edu.pk` | `Student#2026` | Search scholarships, evaluate eligibility, submit applications, and track personal application status. |
| Scholarship Review Officer | `officer@scholarassist.edu.pk` | `Officer#2026` | Review the submitted queue, inspect document counts, and mark applications Under Review, Approved, or Rejected. |

The initial sample application is owned by the demo student so the officer can test the review workflow immediately. To verify the role difference:

1. Sign in with the student account and confirm the student dashboard, full own-CNIC display, and personal application tracker.
2. Log out, sign in with the officer account, and confirm the separate review queue with a masked CNIC and status-update controls.
3. While signed in as the student, attempt `window.updateApplicationStatus('APP-2026-8812', 'Approved')` in the browser console. The application must remain unchanged and the UI must show **Access Denied**.
4. As the officer, update the sample application and sign in again as the student to confirm the new status is reflected in the tracker.
5. Log out and confirm both protected dashboards are hidden and the portal redirects to sign-in.

**Prototype limitation:** The demo credentials, role checks, application records, uploads, and audit events are all client-side and inspectable/modifiable in a browser. They demonstrate the Activity 2 workflow only; do not use real credentials or personal data. A production service needs server-side authentication and authorization, protected persistence, and server-validated uploads.

---

## 🌐 Public Deployment & Hosting Instructions

### Option 1: GitHub Pages (Recommended)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial ScholarAssist Prototype"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ScholarAssist.git
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** $\rightarrow$ **Pages**.
3. Under **Source**, choose `GitHub Actions` or select the `main` branch.
4. Your site will be live at `https://YOUR_USERNAME.github.io/ScholarAssist/`.

### Option 2: Vercel (1-Click Hosting)
1. Install Vercel CLI or import repository at [vercel.com](https://vercel.com).
2. Run `npx vercel` in the project root.
3. Your public live URL will be generated instantly (e.g. `https://scholarassist.vercel.app`).

### Option 3: Netlify
1. Drag and drop the `d:\sch` folder directly into [app.netlify.com/drop](https://app.netlify.com/drop) or connect via GitHub repository.
2. Receive your instant public live link.
