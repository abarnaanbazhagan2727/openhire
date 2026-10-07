/**
 * OpenHire - Authentication Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthForm();
  initPasswordVisibility();
  initPasswordStrength();
  initDemoLogin();
});

// Password visibility toggle
function initPasswordVisibility() {
  const toggleButtons = document.querySelectorAll('.toggle-password-btn');
  toggleButtons.forEach((btn) => {
    btn.onclick = () => {
      const input = btn.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    };
  });
}

// Password strength evaluator
function initPasswordStrength() {
  const passwordInput = document.getElementById('registerPassword');
  const fillBar = document.getElementById('strengthFill');
  const ruleLength = document.getElementById('ruleLength');
  const ruleUpper = document.getElementById('ruleUpper');
  const ruleLower = document.getElementById('ruleLower');
  const ruleNumber = document.getElementById('ruleNumber');

  if (!passwordInput || !fillBar) return;

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    const hasLength = val.length >= 8;
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNumber = /[0-9]/.test(val);

    if (ruleLength) ruleLength.classList.toggle('met', hasLength);
    if (ruleUpper) ruleUpper.classList.toggle('met', hasUpper);
    if (ruleLower) ruleLower.classList.toggle('met', hasLower);
    if (ruleNumber) ruleNumber.classList.toggle('met', hasNumber);

    const score = [hasLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

    fillBar.className = 'strength-meter-fill';
    if (score <= 1) {
      fillBar.classList.add('weak');
    } else if (score <= 3) {
      fillBar.classList.add('medium');
    } else {
      fillBar.classList.add('strong');
    }
  });
}

// Demo Login Handlers
function initDemoLogin() {
  const demoSeekerBtn = document.getElementById('demoSeekerBtn');
  const demoEmployerBtn = document.getElementById('demoEmployerBtn');

  const executeDemoLogin = async (role, buttonEl) => {
    const originalText = buttonEl.innerHTML;
    buttonEl.disabled = true;
    buttonEl.innerHTML = `<span class="spinner"></span> Signing in...`;

    try {
      const res = await API.demoLogin(role);
      API.setToken(res.token);
      API.setUser(res.user);
      UI.showToast(res.message, 'success', 'Demo Access Granted');

      setTimeout(() => {
        if (res.user.role === 'employer') {
          window.location.href = 'employer-dashboard.html';
        } else {
          window.location.href = 'seeker-dashboard.html';
        }
      }, 700);
    } catch (err) {
      UI.showToast(err.message, 'error', 'Demo Login Failed');
      buttonEl.disabled = false;
      buttonEl.innerHTML = originalText;
    }
  };

  if (demoSeekerBtn) {
    demoSeekerBtn.onclick = () => executeDemoLogin('seeker', demoSeekerBtn);
  }
  if (demoEmployerBtn) {
    demoEmployerBtn.onclick = () => executeDemoLogin('employer', demoEmployerBtn);
  }
}

// Form Handlers
function initAuthForm() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Login handler
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        UI.showToast('Please enter both email and password.', 'warning', 'Missing Fields');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> Logging in...`;

      try {
        const res = await API.login({ email, password });
        API.setToken(res.token);
        API.setUser(res.user);
        UI.showToast('Login successful! Redirecting to dashboard...', 'success', 'Welcome Back');

        setTimeout(() => {
          if (res.user.role === 'employer') {
            window.location.href = 'employer-dashboard.html';
          } else {
            window.location.href = 'seeker-dashboard.html';
          }
        }, 800);
      } catch (err) {
        UI.showToast(err.message, 'error', 'Authentication Failed');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login';
      }
    };
  }

  // Register handler
  if (registerForm) {
    // Role Switcher buttons
    const roleSeekerBtn = document.getElementById('roleSeekerBtn');
    const roleEmployerBtn = document.getElementById('roleEmployerBtn');
    const seekerFields = document.getElementById('seekerFields');
    const employerFields = document.getElementById('employerFields');
    let selectedRole = 'seeker';

    const setRole = (role) => {
      selectedRole = role;
      if (role === 'seeker') {
        roleSeekerBtn.classList.add('active');
        roleEmployerBtn.classList.remove('active');
        seekerFields.style.display = 'block';
        employerFields.style.display = 'none';
      } else {
        roleEmployerBtn.classList.add('active');
        roleSeekerBtn.classList.remove('active');
        employerFields.style.display = 'block';
        seekerFields.style.display = 'none';
      }
    };

    if (roleSeekerBtn && roleEmployerBtn) {
      roleSeekerBtn.onclick = () => setRole('seeker');
      roleEmployerBtn.onclick = () => setRole('employer');
    }

    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const phone = document.getElementById('regPhone').value.trim();
      const location = document.getElementById('regLocation').value.trim();
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (!name || !email || !password) {
        UI.showToast('Please fill out all required fields.', 'warning', 'Validation');
        return;
      }

      if (password !== confirmPassword) {
        UI.showToast('Passwords do not match.', 'error', 'Mismatch');
        return;
      }

      const payload = {
        name,
        email,
        password,
        role: selectedRole,
        phone,
        location
      };

      if (selectedRole === 'employer') {
        payload.companyName = document.getElementById('regCompanyName').value.trim() || `${name}'s Company`;
        payload.companyWebsite = document.getElementById('regCompanyWebsite').value.trim();
        payload.companyDescription = document.getElementById('regCompanyDescription').value.trim();
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> Creating Account...`;

      try {
        const res = await API.register(payload);
        API.setToken(res.token);
        API.setUser(res.user);
        UI.showToast('Account registered successfully! Redirecting...', 'success', 'Welcome to OpenHire');

        setTimeout(() => {
          if (res.user.role === 'employer') {
            window.location.href = 'employer-dashboard.html';
          } else {
            window.location.href = 'seeker-dashboard.html';
          }
        }, 800);
      } catch (err) {
        UI.showToast(err.message, 'error', 'Registration Failed');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
      }
    };
  }
}
