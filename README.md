# ScholarAssist — Secure Scholarship Assistance Management System

**Secure Software Development (SSD) Course Project — Initial Prototype Submission**

ScholarAssist is a security-oriented web application designed to connect Pakistani university students with merit and need-based scholarship opportunities while enforcing fundamental Secure Software Development (SSD) principles throughout the semester lifecycle.

---

## 🌟 Key Features & Prototype Deliverables

### 1. Connected Multi-Page Navigation Structure
- **Page 1 — Home / Landing Page (`#home-view`)**: Project title, mission statement, stats banner (12.5k+ applications, 100% audited), interactive module showcase, and system architecture.
- **Page 2 — Portal Entry & Authentication (`#login-view`)**: User sign-in & registration form with password show/hide toggle, password strength meter, CNIC formatting (`35202-1234567-1`), and role selector.
- **Page 3 — Core Functional Page (`#portal-view`)**: Scholarship Search & Filtering, **Dynamic Rule-Based Eligibility Calculator**, Document Sandbox Upload, and My Applications Status Tracker.
- **Page 4 — Security Audit & STRIDE Matrix (`#audit-view`)**: Live append-only security log stream and comprehensive STRIDE Threat Safeguard matrix.

### 2. Interactive JavaScript Functions
- **Dynamic Rule-Based Eligibility Engine**: Evaluates CGPA ($\ge 2.75$), Monthly Household Income limits, Domicile Province, and Discipline in real-time with instant `ELIGIBLE` / `NOT ELIGIBLE` status badges.
- **File Upload Security Sandbox**: Accepts `.pdf`, `.png`, `.jpg` files up to 5 MB while detecting and blocking malicious script extensions (`.exe`, `.sh`, `.php`, `.js`) with dynamic security notices.
- **Show/Hide Password & Entropy Meter**: Toggles visibility and measures password complexity against policy rules.
- **Role-Based Context Switcher**: Allows live testing of 4 system roles (*Student*, *Scholarship Officer*, *University Officer*, *Security Administrator*).
- **Append-Only Audit Stream**: Dynamically logs user actions (logins, navigation, rule evaluation, file uploads) with cryptographic checksum simulations.

---

## 🔒 Security Design Principles Implemented (SSD Focus)

| Security Topic | Prototype Implementation |
| :--- | :--- |
| **Authentication & Password Security** | Password strength policy, show/hide masking toggle, prepare for salted Argon2 hashing. |
| **Least Privilege Access Control** | Enforces role-based views across 4 system roles (*Student*, *Officer*, *Univ Officer*, *Admin*). |
| **Data Minimization & Confidentiality** | CNIC automatic formatting & masked display (`35202-*******-1`). |
| **Malware & Upload Security Sandbox** | Client-side extension whitelist (`.pdf`, `.png`, `.jpg`) and hazardous extension blocking (`.exe`, `.php`). |
| **Accountability & Non-Repudiation** | Real-time append-only security audit log recording timestamps, role context, and IP simulation. |
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
