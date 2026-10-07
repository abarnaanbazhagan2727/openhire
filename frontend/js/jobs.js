/**
 * OpenHire - Jobs Listing & Job Details Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('jobsListingContainer')) {
    initJobsPage();
  }
  if (document.getElementById('jobDetailsContainer')) {
    initJobDetailsPage();
  }
  if (document.getElementById('homeFeaturedJobsContainer')) {
    initHomeFeaturedJobs();
  }
});

// ============================================================
// Homepage Featured Jobs
// ============================================================
async function initHomeFeaturedJobs() {
  const container = document.getElementById('homeFeaturedJobsContainer');
  if (!container) return;

  try {
    const res = await API.getJobs({ limit: 6 });
    if (!res.jobs || res.jobs.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No featured opportunities right now.</p></div>`;
      return;
    }

    container.innerHTML = res.jobs.map((job) => renderJobCard(job)).join('');
    attachBookmarkHandlers(container);
  } catch (err) {
    container.innerHTML = `<p class="text-muted">Unable to load featured jobs.</p>`;
  }
}

// ============================================================
// Jobs Listing Page (jobs.html)
// ============================================================
let currentFilters = {
  search: '',
  location: '',
  category: 'All',
  jobType: 'All',
  workMode: 'All',
  experienceLevel: 'All',
  datePosted: 'Anytime',
  salaryMin: '',
  salaryMax: '',
  page: 1
};

async function initJobsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('search')) currentFilters.search = urlParams.get('search');
  if (urlParams.get('location')) currentFilters.location = urlParams.get('location');
  if (urlParams.get('category')) currentFilters.category = urlParams.get('category');

  // Sync inputs with URL params
  const searchInput = document.getElementById('filterSearch');
  const locInput = document.getElementById('filterLocation');
  const catSelect = document.getElementById('filterCategory');

  if (searchInput && currentFilters.search) searchInput.value = currentFilters.search;
  if (locInput && currentFilters.location) locInput.value = currentFilters.location;
  if (catSelect && currentFilters.category) catSelect.value = currentFilters.category;

  initSearchSuggestions();
  initFilterControls();
  fetchAndRenderJobs();
}

function initSearchSuggestions() {
  const searchInput = document.getElementById('filterSearch') || document.getElementById('heroSearchInput');
  const suggestionsBox = document.getElementById('searchSuggestionsBox');

  if (!searchInput || !suggestionsBox) return;

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();

    if (query.length < 2) {
      suggestionsBox.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await API.getSearchSuggestions(query);
        if (res.suggestions && res.suggestions.length > 0) {
          suggestionsBox.innerHTML = res.suggestions
            .map(
              (s) =>
                `<div class="suggestion-item" style="padding: 0.6rem 1rem; cursor: pointer; border-bottom: 1px solid var(--border-color);">${s}</div>`
            )
            .join('');
          suggestionsBox.style.display = 'block';

          suggestionsBox.querySelectorAll('.suggestion-item').forEach((item) => {
            item.onclick = () => {
              searchInput.value = item.textContent;
              suggestionsBox.style.display = 'none';
              if (document.getElementById('jobsListingContainer')) {
                currentFilters.search = item.textContent;
                fetchAndRenderJobs();
              } else {
                window.location.href = `jobs.html?search=${encodeURIComponent(item.textContent)}`;
              }
            };
          });
        } else {
          suggestionsBox.style.display = 'none';
        }
      } catch (e) {
        suggestionsBox.style.display = 'none';
      }
    }, 250);
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });
}

function initFilterControls() {
  const filterForm = document.getElementById('jobFiltersForm');
  const clearBtn = document.getElementById('clearFiltersBtn');

  if (filterForm) {
    filterForm.onsubmit = (e) => {
      e.preventDefault();
      applyFormFilters();
    };
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      if (filterForm) filterForm.reset();
      currentFilters = {
        search: '',
        location: '',
        category: 'All',
        jobType: 'All',
        workMode: 'All',
        experienceLevel: 'All',
        datePosted: 'Anytime',
        salaryMin: '',
        salaryMax: '',
        page: 1
      };
      fetchAndRenderJobs();
    };
  }
}

function applyFormFilters() {
  currentFilters.search = (document.getElementById('filterSearch')?.value || '').trim();
  currentFilters.location = (document.getElementById('filterLocation')?.value || '').trim();
  currentFilters.category = document.getElementById('filterCategory')?.value || 'All';
  currentFilters.jobType = document.getElementById('filterJobType')?.value || 'All';
  currentFilters.workMode = document.getElementById('filterWorkMode')?.value || 'All';
  currentFilters.experienceLevel = document.getElementById('filterExperience')?.value || 'All';
  currentFilters.datePosted = document.getElementById('filterDatePosted')?.value || 'Anytime';
  currentFilters.page = 1;

  fetchAndRenderJobs();
}

async function fetchAndRenderJobs() {
  const container = document.getElementById('jobsListingContainer');
  const countBadge = document.getElementById('jobsFoundCount');
  if (!container) return;

  // Show skeleton loaders
  container.innerHTML = `
    <div class="skeleton" style="height: 140px; margin-bottom: 1rem;"></div>
    <div class="skeleton" style="height: 140px; margin-bottom: 1rem;"></div>
    <div class="skeleton" style="height: 140px; margin-bottom: 1rem;"></div>
  `;

  try {
    const res = await API.getJobs(currentFilters);
    if (countBadge) {
      countBadge.textContent = `${res.total} jobs found`;
    }

    if (!res.jobs || res.jobs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No opportunities found</h3>
          <p>We couldn't find any positions matching your search criteria. Try clearing some filters or searching for broader keywords.</p>
          <button class="btn btn-secondary" onclick="document.getElementById('clearFiltersBtn')?.click()">Clear All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = res.jobs.map((job) => renderJobCard(job)).join('');
    attachBookmarkHandlers(container);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <p style="color: var(--danger);">Failed to load jobs. ${err.message}</p>
        <button class="btn btn-secondary btn-sm" onclick="fetchAndRenderJobs()">Retry</button>
      </div>
    `;
  }
}

// Render individual Job Card
function renderJobCard(job) {
  const isSaved = false; // Will be hydrated or checked
  const formattedSalary = UI.formatSalary(job.salaryMin, job.salaryMax);
  const formattedDate = UI.formatDate(job.createdAt);
  const companyInitial = (job.company || 'O').charAt(0).toUpperCase();

  const skillsHtml = (job.skills || [])
    .slice(0, 4)
    .map((s) => `<span class="tag">${s}</span>`)
    .join(' ');

  return `
    <div class="card job-card" style="margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 1rem;" data-id="${job._id}">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: var(--accent-gradient); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; flex-shrink: 0;">
            ${companyInitial}
          </div>
          <div>
            <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;">
              <a href="job-details.html?id=${job._id}" style="color: var(--text-primary); text-decoration: none;">${job.title}</a>
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; font-size: 0.88rem; color: var(--text-secondary);">
              <span style="font-weight: 600; color: var(--text-primary);">${job.company}</span>
              <span>•</span>
              <span>📍 ${job.location}</span>
              <span>•</span>
              <span>💼 ${job.jobType} (${job.workMode || 'On-site'})</span>
              <span>•</span>
              <span>⏱️ ${job.experienceLevel || 'Fresher'}</span>
            </div>
          </div>
        </div>
        <button class="btn-icon bookmark-btn" data-job-id="${job._id}" title="Save Job" aria-label="Save Job">
          ♡
        </button>
      </div>

      <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
        ${job.description}
      </p>

      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
        ${skillsHtml}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.85rem; margin-top: 0.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <span style="font-weight: 700; color: var(--primary); font-size: 1rem;">${formattedSalary}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.75rem;">Posted ${formattedDate}</span>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <a href="job-details.html?id=${job._id}" class="btn btn-secondary btn-sm">View Details</a>
          <a href="job-details.html?id=${job._id}#apply" class="btn btn-primary btn-sm">Apply Now</a>
        </div>
      </div>
    </div>
  `;
}

// Bookmarking event handler
function attachBookmarkHandlers(container) {
  const buttons = container.querySelectorAll('.bookmark-btn');
  buttons.forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const user = API.getUser();
      if (!user) {
        UI.showToast('Please log in as a job seeker to bookmark jobs.', 'warning', 'Authentication Required');
        setTimeout(() => (window.location.href = 'login.html'), 1000);
        return;
      }
      if (user.role !== 'seeker') {
        UI.showToast('Only job seekers can bookmark opportunities.', 'info', 'Notice');
        return;
      }

      const jobId = btn.getAttribute('data-job-id');
      const isCurrentlySaved = btn.classList.contains('active');

      try {
        if (isCurrentlySaved) {
          await API.unsaveJob(jobId);
          btn.classList.remove('active');
          btn.innerHTML = '♡';
          UI.showToast('Job removed from saved bookmarks.', 'info');
        } else {
          await API.saveJob(jobId);
          btn.classList.add('active');
          btn.innerHTML = '♥';
          UI.showToast('Job saved to your bookmarks!', 'success');
        }
      } catch (err) {
        UI.showToast(err.message, 'error', 'Error');
      }
    };
  });
}

// ============================================================
// Job Details Page (job-details.html)
// ============================================================
async function initJobDetailsPage() {
  const container = document.getElementById('jobDetailsContainer');
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  if (!jobId) {
    container.innerHTML = `<div class="empty-state"><h3>Job ID not specified.</h3><a href="jobs.html" class="btn btn-primary">Browse Jobs</a></div>`;
    return;
  }

  try {
    const res = await API.getJobById(jobId);
    const job = res.job;

    document.title = `${job.title} at ${job.company} - OpenHire`;

    const isExpired = job.isExpired || job.status === 'FILLED';
    const formattedSalary = UI.formatSalary(job.salaryMin, job.salaryMax);
    const formattedDate = UI.formatDate(job.createdAt);
    const deadlineDate = new Date(job.applicationDeadline).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const responsibilitiesList = (job.responsibilities || [])
      .map((r) => `<li style="margin-bottom: 0.5rem;">${r}</li>`)
      .join('');

    const requirementsList = (job.requirements || [])
      .map((r) => `<li style="margin-bottom: 0.5rem;">${r}</li>`)
      .join('');

    const skillsTags = (job.skills || [])
      .map((s) => `<span class="tag" style="padding: 0.4rem 0.8rem; font-size: 0.88rem;">${s}</span>`)
      .join(' ');

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 2rem;" class="job-details-grid">
        <!-- Main Content -->
        <div>
          <!-- Header Card -->
          <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap;">
              <div style="display: flex; gap: 1.25rem; align-items: flex-start;">
                <div style="width: 58px; height: 58px; border-radius: 14px; background: var(--accent-gradient); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem;">
                  ${job.company.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">${job.title}</h1>
                  <p style="font-size: 1.05rem; font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">${job.company}</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    <span>📍 ${job.location}</span>
                    <span>💼 ${job.jobType} (${job.workMode})</span>
                    <span>⏱️ ${job.experienceLevel}</span>
                    <span>💰 ${formattedSalary}</span>
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <button class="btn-icon bookmark-btn" data-job-id="${job._id}" title="Save Job" style="width: 44px; height: 44px; font-size: 1.2rem;">♡</button>
                ${
                  isExpired
                    ? `<button class="btn btn-secondary btn-lg" disabled>Applications Closed</button>`
                    : `<button class="btn btn-primary btn-lg" id="openApplyModalBtn">Apply Now</button>`
                }
              </div>
            </div>

            ${
              isExpired
                ? `<div style="margin-top: 1.5rem; padding: 0.75rem 1rem; background: var(--status-rejected-bg); color: var(--status-rejected-text); border-radius: var(--radius-md); font-weight: 600; font-size: 0.9rem;">
                    Notice: This position is ${job.status === 'FILLED' ? 'marked as FILLED' : 'closed because the deadline has passed'}. New applications are not being accepted.
                   </div>`
                : ''
            }
          </div>

          <!-- Description Sections -->
          <div class="card" style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.35rem; margin-bottom: 1rem;">About the Job</h2>
            <p style="color: var(--text-secondary); line-height: 1.7; white-space: pre-line; margin-bottom: 2rem;">
              ${job.description}
            </p>

            ${
              responsibilitiesList
                ? `<h2 style="font-size: 1.35rem; margin-bottom: 1rem;">Key Responsibilities</h2>
                   <ul style="padding-left: 1.25rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 2rem;">
                     ${responsibilitiesList}
                   </ul>`
                : ''
            }

            ${
              requirementsList
                ? `<h2 style="font-size: 1.35rem; margin-bottom: 1rem;">Requirements & Qualifications</h2>
                   <ul style="padding-left: 1.25rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 2rem;">
                     ${requirementsList}
                   </ul>`
                : ''
            }

            <h2 style="font-size: 1.35rem; margin-bottom: 1rem;">Required Skills & Competencies</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 2rem;">
              ${skillsTags}
            </div>

            <h2 style="font-size: 1.35rem; margin-bottom: 1rem;">Benefits & Perks</h2>
            <ul style="padding-left: 1.25rem; color: var(--text-secondary); line-height: 1.7;">
              <li>Comprehensive health coverage and wellness stipends</li>
              <li>Flexible working hours with modern asynchronous culture</li>
              <li>Generous annual learning and development allowance</li>
              <li>Mentorship directly from veteran software leaders</li>
            </ul>
          </div>
        </div>

        <!-- Sidebar Overview -->
        <div>
          <div class="card" style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.15rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
              Job Overview
            </h3>
            <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 0.92rem;">
              <div>
                <span class="text-muted" style="display: block; font-size: 0.8rem; font-weight: 600;">CATEGORY</span>
                <span style="font-weight: 600;">${job.category}</span>
              </div>
              <div>
                <span class="text-muted" style="display: block; font-size: 0.8rem; font-weight: 600;">LOCATION</span>
                <span style="font-weight: 600;">${job.location} (${job.workMode})</span>
              </div>
              <div>
                <span class="text-muted" style="display: block; font-size: 0.8rem; font-weight: 600;">JOB TYPE</span>
                <span style="font-weight: 600;">${job.jobType}</span>
              </div>
              <div>
                <span class="text-muted" style="display: block; font-size: 0.8rem; font-weight: 600;">EXPERIENCE</span>
                <span style="font-weight: 600;">${job.experienceLevel}</span>
              </div>
              <div>
                <span class="text-muted" style="display: block; font-size: 0.8rem; font-weight: 600;">OFFERED SALARY</span>
                <span style="font-weight: 600; color: var(--primary);">${formattedSalary}</span>
              </div>
              <div>
                <span class="text-muted" style="display: block; font-size: 0.8rem; font-weight: 600;">DATE POSTED</span>
                <span>${formattedDate}</span>
              </div>
              <div>
                <span class="text-muted" style="display: block; font-size: 0.8rem; font-weight: 600;">APPLICATION DEADLINE</span>
                <span style="color: ${isExpired ? 'var(--danger)' : 'var(--text-primary)'}; font-weight: 600;">${deadlineDate}</span>
              </div>
            </div>
          </div>

          <!-- Company Overview Card -->
          <div class="card">
            <h3 style="font-size: 1.15rem; margin-bottom: 1rem;">About ${job.company}</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
              ${job.employer?.companyDescription || 'A leading innovator committed to cultivating exceptional talent.'}
            </p>
            ${
              job.employer?.companyWebsite
                ? `<a href="${job.employer.companyWebsite}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="width: 100%;">
                    Visit Company Website ↗
                   </a>`
                : ''
            }
          </div>
        </div>
      </div>
    `;

    attachBookmarkHandlers(container);
    initApplicationModal(job);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p style="color: var(--danger);">Failed to load job details. ${err.message}</p><a href="jobs.html" class="btn btn-secondary">Browse All Jobs</a></div>`;
  }
}

// Application Modal Initialization
function initApplicationModal(job) {
  const openBtn = document.getElementById('openApplyModalBtn');
  const modal = document.getElementById('applicationModal');
  const closeBtn = document.getElementById('closeApplyModalBtn');
  const cancelBtn = document.getElementById('cancelApplyBtn');
  const form = document.getElementById('jobApplicationForm');

  if (!openBtn || !modal || !form) return;

  const user = API.getUser();

  openBtn.onclick = () => {
    if (!user) {
      UI.showToast('Please log in to apply for this job.', 'warning', 'Authentication Required');
      setTimeout(() => (window.location.href = 'login.html'), 800);
      return;
    }
    if (user.role !== 'seeker') {
      UI.showToast('Employers cannot submit job applications. Please use a seeker account.', 'warning', 'Role Restriction');
      return;
    }

    // Autofill user details
    document.getElementById('applyFullName').value = user.name || '';
    document.getElementById('applyEmail').value = user.email || '';
    document.getElementById('applyPhone').value = user.phone || '';
    document.getElementById('applyResumeUrl').value = user.resumeUrl || '';
    document.getElementById('applyModalJobTitle').textContent = job.title;
    document.getElementById('applyModalCompany').textContent = job.company;

    UI.openModal('applicationModal');
  };

  if (closeBtn) closeBtn.onclick = () => UI.closeModal('applicationModal');
  if (cancelBtn) cancelBtn.onclick = () => UI.closeModal('applicationModal');

  form.onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submitApplyBtn');
    const fullName = document.getElementById('applyFullName').value.trim();
    const email = document.getElementById('applyEmail').value.trim();
    const phone = document.getElementById('applyPhone').value.trim();
    const coverLetter = document.getElementById('applyCoverLetter').value.trim();
    const resumeUrl = document.getElementById('applyResumeUrl').value.trim();

    if (!fullName || !email || !phone) {
      UI.showToast('Please fill out all contact details.', 'warning');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Submitting...`;

    try {
      await API.applyForJob({
        jobId: job._id,
        fullName,
        email,
        phone,
        coverLetter,
        resumeUrl
      });

      UI.closeModal('applicationModal');
      UI.showToast('Application submitted successfully! Track your status on your dashboard.', 'success', 'Applied!');

      openBtn.disabled = true;
      openBtn.textContent = 'Application Submitted ✓';
      openBtn.classList.remove('btn-primary');
      openBtn.classList.add('btn-secondary');
    } catch (err) {
      UI.showToast(err.message, 'error', 'Application Failed');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit Application';
    }
  };
}
