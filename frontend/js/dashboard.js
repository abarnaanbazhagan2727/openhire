/**
 * OpenHire - Seeker and Employer Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = API.getUser();

  // Route protection
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (document.getElementById('seekerDashboardView')) {
    if (user.role !== 'seeker') {
      window.location.href = 'employer-dashboard.html';
      return;
    }
    loadSeekerDashboard();
  }

  if (document.getElementById('employerDashboardView')) {
    if (user.role !== 'employer') {
      window.location.href = 'seeker-dashboard.html';
      return;
    }
    loadEmployerDashboard();
  }
});

// ============================================================
// Job Seeker Dashboard
// ============================================================
async function loadSeekerDashboard() {
  const greetingEl = document.getElementById('seekerGreeting');
  const appCountEl = document.getElementById('statTotalApps');
  const shortCountEl = document.getElementById('statShortlisted');
  const intCountEl = document.getElementById('statInterviews');
  const offerCountEl = document.getElementById('statOffers');
  const profilePercentEl = document.getElementById('profilePercentText');
  const profileBarEl = document.getElementById('profileProgressBar');
  const recentAppsContainer = document.getElementById('seekerRecentAppsContainer');
  const recommendedContainer = document.getElementById('seekerRecommendedContainer');
  const savedJobsContainer = document.getElementById('seekerSavedJobsContainer');

  try {
    const res = await API.getSeekerDashboard();
    const data = res.data;

    // Greeting
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    if (greetingEl) {
      greetingEl.innerHTML = `${timeGreeting}, ${data.profile.name.split(' ')[0]} 👋`;
    }

    // Stats
    if (appCountEl) appCountEl.textContent = data.stats.applications;
    if (shortCountEl) shortCountEl.textContent = data.stats.shortlisted;
    if (intCountEl) intCountEl.textContent = data.stats.interviews;
    if (offerCountEl) offerCountEl.textContent = data.stats.offers;

    // Profile Progress
    const completion = data.profile.profileCompletion || 70;
    if (profilePercentEl) profilePercentEl.textContent = `${completion}%`;
    if (profileBarEl) profileBarEl.style.width = `${completion}%`;

    // Recent Applications
    if (recentAppsContainer) {
      if (!data.recentApplications || data.recentApplications.length === 0) {
        recentAppsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📄</div>
            <h3>You haven't applied to any jobs yet</h3>
            <p>Explore opportunities matching your skills and start applying today.</p>
            <a href="jobs.html" class="btn btn-primary btn-sm">Browse Opportunities</a>
          </div>
        `;
      } else {
        recentAppsContainer.innerHTML = `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${data.recentApplications
                  .map(
                    (app) => `
                  <tr>
                    <td data-label="Job Title"><strong>${app.job?.title || 'Position'}</strong></td>
                    <td data-label="Company">${app.job?.company || 'Company'}</td>
                    <td data-label="Applied Date">${UI.formatDate(app.appliedAt)}</td>
                    <td data-label="Status">${UI.renderBadge(app.status)}</td>
                    <td data-label="Action">
                      <a href="applications.html" class="btn btn-secondary btn-sm">Track Progress</a>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    // Recommended Jobs
    if (recommendedContainer) {
      if (!data.recommendedJobs || data.recommendedJobs.length === 0) {
        recommendedContainer.innerHTML = `<p class="text-muted">No recommendations available at this time.</p>`;
      } else {
        recommendedContainer.innerHTML = data.recommendedJobs
          .slice(0, 3)
          .map(
            (job) => `
            <div class="card" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
              <div>
                <span class="badge badge-open" style="margin-bottom: 0.35rem;">Recommended for You</span>
                <h4 style="font-size: 1.05rem; margin-top: 0.2rem;">
                  <a href="job-details.html?id=${job._id}">${job.title}</a>
                </h4>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
                  ${job.company} • 📍 ${job.location} • 💼 ${job.jobType}
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <a href="job-details.html?id=${job._id}" class="btn btn-secondary btn-sm">View Job</a>
              </div>
            </div>
          `
          )
          .join('');
      }
    }

    // Saved Jobs Preview
    if (savedJobsContainer) {
      if (!data.savedJobs || data.savedJobs.length === 0) {
        savedJobsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">♡</div>
            <h3>Your saved jobs will appear here</h3>
            <p>Save job postings while browsing to easily apply later.</p>
          </div>
        `;
      } else {
        savedJobsContainer.innerHTML = data.savedJobs
          .map(
            (job) => `
            <div class="card" style="margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
              <div>
                <h4 style="font-size: 0.95rem;">
                  <a href="job-details.html?id=${job._id}">${job.title}</a>
                </h4>
                <div style="font-size: 0.82rem; color: var(--text-secondary);">
                  ${job.company} • ${UI.formatSalary(job.salaryMin, job.salaryMax)}
                </div>
              </div>
              <a href="job-details.html?id=${job._id}" class="btn btn-secondary btn-sm">Apply</a>
            </div>
          `
          )
          .join('');
      }
    }
  } catch (err) {
    UI.showToast(err.message, 'error', 'Dashboard Load Failed');
  }
}

// ============================================================
// Employer Dashboard
// ============================================================
async function loadEmployerDashboard() {
  const greetingEl = document.getElementById('employerGreeting');
  const activeCountEl = document.getElementById('statActiveJobs');
  const totalAppsEl = document.getElementById('statTotalApplicants');
  const shortCountEl = document.getElementById('statEmployerShortlisted');
  const filledCountEl = document.getElementById('statJobsFilled');
  const chartContainer = document.getElementById('weeklyAnalyticsChart');
  const jobsTableContainer = document.getElementById('employerJobsTableContainer');
  const applicantsContainer = document.getElementById('employerRecentApplicantsContainer');

  try {
    const res = await API.getEmployerDashboard();
    const data = res.data;

    // Greeting
    if (greetingEl) {
      greetingEl.innerHTML = `Welcome back, <strong>${data.companyName}</strong>`;
    }

    // Stats
    if (activeCountEl) activeCountEl.textContent = data.stats.activeJobs;
    if (totalAppsEl) totalAppsEl.textContent = data.stats.totalApplicants;
    if (shortCountEl) shortCountEl.textContent = data.stats.shortlisted;
    if (filledCountEl) filledCountEl.textContent = data.stats.jobsFilled;

    // Weekly Analytics Chart (Mon - Sun)
    if (chartContainer && data.weeklyStats) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const maxCount = Math.max(...days.map((d) => data.weeklyStats[d] || 0), 5);

      chartContainer.innerHTML = days
        .map((day) => {
          const count = data.weeklyStats[day] || 0;
          const heightPercent = Math.max(Math.round((count / maxCount) * 100), 8);
          return `
            <div class="chart-bar-group">
              <span class="chart-count">${count}</span>
              <div class="chart-bar" style="height: ${heightPercent}%;" title="${day}: ${count} applications"></div>
              <span class="chart-label">${day}</span>
            </div>
          `;
        })
        .join('');
    }

    // Employer Jobs Table
    if (jobsTableContainer) {
      if (!data.recentJobs || data.recentJobs.length === 0) {
        jobsTableContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">💼</div>
            <h3>Start hiring by posting your first job</h3>
            <p>Publish an open opportunity to reach qualified candidates.</p>
            <a href="post-job.html" class="btn btn-primary btn-sm">Post a Job</a>
          </div>
        `;
      } else {
        jobsTableContainer.innerHTML = `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.recentJobs
                  .map(
                    (job) => `
                  <tr data-job-id="${job._id}">
                    <td data-label="Job Title"><strong>${job.title}</strong></td>
                    <td data-label="Location">${job.location}</td>
                    <td data-label="Type">${job.jobType}</td>
                    <td data-label="Applicants">
                      <span class="badge badge-applied">${job.applicantCount || 0} applicants</span>
                    </td>
                    <td data-label="Status">${UI.renderBadge(job.status)}</td>
                    <td data-label="Posted">${UI.formatDate(job.createdAt)}</td>
                    <td data-label="Actions">
                      <div class="table-actions">
                        <a href="job-details.html?id=${job._id}" class="btn btn-secondary btn-sm" title="View">👁️</a>
                        <a href="edit-job.html?id=${job._id}" class="btn btn-secondary btn-sm" title="Edit">✏️</a>
                        <button class="btn btn-outline btn-sm toggle-status-btn" data-id="${job._id}" data-status="${job.status}">
                          ${job.status === 'OPEN' ? 'Mark Filled' : 'Reopen'}
                        </button>
                        <button class="btn btn-danger btn-sm delete-job-btn" data-id="${job._id}" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `;

        attachEmployerJobActions(jobsTableContainer);
      }
    }

    // Recent Applicants
    if (applicantsContainer) {
      if (!data.recentApplicants || data.recentApplicants.length === 0) {
        applicantsContainer.innerHTML = `
          <div class="empty-state">
            <p>No recent applicants yet. Post active jobs to receive applications.</p>
          </div>
        `;
      } else {
        applicantsContainer.innerHTML = `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job Applied</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${data.recentApplicants
                  .map(
                    (app) => `
                  <tr>
                    <td data-label="Applicant"><strong>${app.applicant?.name || app.fullName}</strong></td>
                    <td data-label="Job Applied">${app.job?.title || 'Position'}</td>
                    <td data-label="Email">${app.applicant?.email || app.email}</td>
                    <td data-label="Status">${UI.renderBadge(app.status)}</td>
                    <td data-label="Action">
                      <a href="applications.html" class="btn btn-secondary btn-sm">Manage</a>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }
  } catch (err) {
    UI.showToast(err.message, 'error', 'Employer Dashboard Load Failed');
  }
}

// Attach Action buttons in Employer table (Delete & Status Toggle)
function attachEmployerJobActions(container) {
  // Toggle Status
  container.querySelectorAll('.toggle-status-btn').forEach((btn) => {
    btn.onclick = async () => {
      const jobId = btn.getAttribute('data-id');
      const currentStatus = btn.getAttribute('data-status');
      const nextStatus = currentStatus === 'OPEN' ? 'FILLED' : 'OPEN';

      btn.disabled = true;
      try {
        await API.updateJobStatus(jobId, nextStatus);
        UI.showToast(`Job marked as ${nextStatus}!`, 'success');
        loadEmployerDashboard();
      } catch (err) {
        UI.showToast(err.message, 'error');
        btn.disabled = false;
      }
    };
  });

  // Delete Job with Confirmation Modal
  container.querySelectorAll('.delete-job-btn').forEach((btn) => {
    btn.onclick = () => {
      const jobId = btn.getAttribute('data-id');
      const confirmModal = document.getElementById('deleteConfirmModal');

      if (confirmModal) {
        UI.openModal('deleteConfirmModal');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const cancelBtn = document.getElementById('cancelDeleteBtn');

        confirmBtn.onclick = async () => {
          confirmBtn.disabled = true;
          try {
            await API.deleteJob(jobId);
            UI.closeModal('deleteConfirmModal');
            UI.showToast('Job listing deleted successfully.', 'success');
            loadEmployerDashboard();
          } catch (err) {
            UI.showToast(err.message, 'error');
          } finally {
            confirmBtn.disabled = false;
          }
        };

        cancelBtn.onclick = () => UI.closeModal('deleteConfirmModal');
      } else {
        if (confirm('Are you sure you want to delete this job posting? All applicants will be removed.')) {
          API.deleteJob(jobId)
            .then(() => {
              UI.showToast('Job deleted.', 'success');
              loadEmployerDashboard();
            })
            .catch((e) => UI.showToast(e.message, 'error'));
        }
      }
    };
  });
}
