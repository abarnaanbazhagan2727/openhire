/**
 * OpenHire - UI Utilities & Component Managers
 */

const UI = {
  // Initialize Global UI Components
  init() {
    this.initTheme();
    this.initNavbar();
    this.initBackToTop();
  },

  // Theme Management (Light / Dark)
  initTheme() {
    const savedTheme = localStorage.getItem('openhire_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const toggleBtns = document.querySelectorAll('.theme-toggle');
    toggleBtns.forEach((btn) => {
      btn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', savedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.onclick = () => this.toggleTheme();
    });
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('openhire_theme', next);

    const toggleBtns = document.querySelectorAll('.theme-toggle');
    toggleBtns.forEach((btn) => {
      btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', next === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  },

  // Navbar Auth State & Mobile Menu
  initNavbar() {
    const user = API.getUser();
    const navActions = document.querySelector('.nav-actions');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
      hamburger.onclick = () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
      };
    }

    if (navActions) {
      const themeBtnHtml = `
        <button class="theme-toggle" id="themeToggleBtn" aria-label="Toggle theme">🌙</button>
      `;

      if (user) {
        const dashboardUrl = user.role === 'employer' ? 'employer-dashboard.html' : 'seeker-dashboard.html';
        const roleLabel = user.role === 'employer' ? 'Employer' : 'Job Seeker';

        navActions.innerHTML = `
          ${themeBtnHtml}
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <a href="${dashboardUrl}" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success);"></span>
              ${user.name.split(' ')[0]} (${roleLabel})
            </a>
            <button class="btn btn-outline btn-sm" onclick="UI.handleLogout()">Logout</button>
          </div>
        `;
      } else {
        navActions.innerHTML = `
          ${themeBtnHtml}
          <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
          <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>
        `;
      }
      this.initTheme();
    }
  },

  handleLogout() {
    this.showToast('You have been logged out successfully.', 'info', 'Logged Out');
    setTimeout(() => {
      API.logout();
    }, 600);
  },

  // Toast System
  showToast(message, type = 'info', title = '') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const displayTitle = title || (type.charAt(0).toUpperCase() + type.slice(1));

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div class="toast-content">
        <div class="toast-title">${displayTitle}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 250);
    };

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
      }
    }, 4500);
  },

  // Modal Controls
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  // Back To Top Button
  initBackToTop() {
    let btn = document.querySelector('.back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'back-to-top';
      btn.innerHTML = '↑';
      btn.setAttribute('aria-label', 'Back to top');
      document.body.appendChild(btn);
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  },

  // Helpers
  formatSalary(min, max) {
    if (!min && !max) return 'Salary Undisclosed';
    const formatNumber = (num) => {
      if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
      return `₹${num}`;
    };
    if (min && max) return `${formatNumber(min)} – ${formatNumber(max)} / month`;
    if (min) return `From ${formatNumber(min)} / month`;
    return `Up to ${formatNumber(max)} / month`;
  },

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  renderBadge(status) {
    const s = (status || 'OPEN').toUpperCase();
    const mapping = {
      'OPEN': 'badge-open',
      'FILLED': 'badge-filled',
      'APPLIED': 'badge-applied',
      'UNDER REVIEW': 'badge-review',
      'SHORTLISTED': 'badge-shortlisted',
      'INTERVIEW': 'badge-interview',
      'ACCEPTED': 'badge-accepted',
      'REJECTED': 'badge-rejected'
    };
    const cls = mapping[s] || 'badge-applied';
    return `<span class="badge ${cls}">${s}</span>`;
  }
};

document.addEventListener('DOMContentLoaded', () => UI.init());
window.UI = UI;
