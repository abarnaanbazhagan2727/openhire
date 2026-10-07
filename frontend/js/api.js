/**
 * OpenHire - API Client
 * Centralized fetch handler with JWT token management and error handling
 */

const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.origin}/api`
  : '/api';

const API = {
  getToken() {
    return localStorage.getItem('openhire_token');
  },

  setToken(token) {
    localStorage.setItem('openhire_token', token);
  },

  getUser() {
    try {
      const user = localStorage.getItem('openhire_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem('openhire_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('openhire_token');
    localStorage.removeItem('openhire_user');
    window.location.href = 'login.html';
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/demo')) {
          // Token expired or invalid
          this.logout();
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Auth Endpoints
  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  demoLogin(role) {
    return this.request('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  // Job Endpoints
  getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/jobs?${query}`);
  },

  getJobById(id) {
    return this.request(`/jobs/${id}`);
  },

  createJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  },

  updateJob(id, jobData) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    });
  },

  deleteJob(id) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE'
    });
  },

  updateJobStatus(id, status) {
    return this.request(`/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  getMyEmployerJobs() {
    return this.request('/jobs/employer/my');
  },

  getSearchSuggestions(query) {
    return this.request(`/jobs/suggestions?q=${encodeURIComponent(query)}`);
  },

  saveJob(id) {
    return this.request(`/jobs/${id}/save`, {
      method: 'POST'
    });
  },

  unsaveJob(id) {
    return this.request(`/jobs/${id}/save`, {
      method: 'DELETE'
    });
  },

  getSavedJobs() {
    return this.request('/jobs/saved');
  },

  // Applications
  applyForJob(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  },

  getMyApplications() {
    return this.request('/applications/my');
  },

  getJobApplications(jobId) {
    return this.request(`/applications/job/${jobId}`);
  },

  getAllEmployerApplications() {
    return this.request('/applications/employer/all');
  },

  updateApplicationStatus(id, status) {
    return this.request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Profile
  getProfile() {
    return this.request('/profile');
  },

  updateProfile(profileData) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Dashboard
  getSeekerDashboard() {
    return this.request('/dashboard/seeker');
  },

  getEmployerDashboard() {
    return this.request('/dashboard/employer');
  }
};

window.API = API;
