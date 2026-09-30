/* ==========================================================================
   ScholarAssist - Security Module & Client-Side Defensive Controls
   Demonstrates Security-Aware Design Principles for SSD Course:
   1. Input Sanitization & XSS Prevention
   2. Strict File Upload Extension Security Sandbox
   3. Password Strength & Entropy Policy Evaluator
   4. Sensitive Data Masking (CNIC & Financial Data)
   5. Client-Side Security Event Logger (Audit Simulation)
   ========================================================================== */

const SecurityModule = {
  // Allowed safe document extensions for student upload
  ALLOWED_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg'],
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB

  // Blocked dangerous script/executable extensions (SSD demonstration)
  BLOCKED_EXTENSIONS: ['.exe', '.sh', '.bat', '.php', '.js', '.vbs', '.py', '.html', '.cmd'],

  /**
   * Prevents XSS by escaping HTML entities in raw input
   */
  sanitizeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Format CNIC with automatic hyphens (12345-1234567-1)
   */
  formatCNIC(input) {
    const raw = input.replace(/\D/g, '').slice(0, 13);
    if (raw.length <= 5) return raw;
    if (raw.length <= 12) return `${raw.slice(0, 5)}-${raw.slice(5)}`;
    return `${raw.slice(0, 5)}-${raw.slice(5, 12)}-${raw.slice(12)}`;
  },

  /**
   * Mask CNIC for sensitive display (e.g. 35202-*******-1)
   */
  maskCNIC(cnic) {
    if (!cnic || cnic.length < 15) return cnic;
    return `${cnic.slice(0, 6)}*******${cnic.slice(13)}`;
  },

  /**
   * Evaluates password policy & entropy
   */
  evaluatePasswordSecurity(password) {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password)
    };

    if (checks.length) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.digit) score += 20;
    if (checks.symbol) score += 20;

    let label = 'Very Weak';
    let color = '#ef4444'; // red

    if (score >= 80) {
      label = 'Strong (SSD Compliant)';
      color = '#10b981'; // green
    } else if (score >= 60) {
      label = 'Moderate';
      color = '#f59e0b'; // yellow
    } else if (score >= 40) {
      label = 'Weak';
      color = '#f97316'; // orange
    }

    return { score, label, color, checks };
  },

  /**
   * Validates document upload security
   */
  validateFileUpload(file) {
    if (!file) {
      return { valid: false, message: 'No file selected.' };
    }

    const name = file.name.toLowerCase();
    const extension = name.substring(name.lastIndexOf('.'));

    // Check for explicit malicious extensions
    if (this.BLOCKED_EXTENSIONS.includes(extension)) {
      this.logEvent({
        actor: 'security_sandbox',
        role: 'CLIENT_DEFENSE',
        action: 'MALICIOUS_FILE_BLOCKED',
        details: `Blocked upload attempt of hazardous file type '${extension}' (${file.name})`,
        type: 'DANGER'
      });
      return {
        valid: false,
        securityAlert: true,
        message: `Security Violation: File extension '${extension}' is strictly prohibited. Executables and script files are blocked for system security.`
      };
    }

    // Check whitelist
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        message: `Invalid format. Only official PDF documents and images (${this.ALLOWED_EXTENSIONS.join(', ')}) are accepted.`
      };
    }

    // Check size limit
    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        message: `File size exceeds maximum threshold of 5 MB. (Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`
      };
    }

    return {
      valid: true,
      extension: extension,
      sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`
    };
  },

  /**
   * Add entry to dynamic audit log
   */
  logEvent(event) {
    const entry = {
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: event.actor || 'current_user',
      role: event.role || 'GUEST',
      action: event.action || 'GENERIC_ACTION',
      details: event.details || 'No details provided.',
      type: event.type || 'INFO'
    };

    INITIAL_AUDIT_LOGS.unshift(entry);

    // Trigger dynamic UI update if function exists
    if (window.renderAuditLogs) {
      window.renderAuditLogs();
    }
  }
};
