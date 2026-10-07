/**
 * OpenHire - Applications Management & Progress Tracker
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = API.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (user.role === 'seeker') {
    initSeekerApplicationsView();
  } else {
    initEmployerApplicationsView();
  }
});

// ============================================================
// Seeker: My Applications Tracker
// ============================================================
async function initSeekerApplicationsView() {
  const container = document.getElementById('applicationsViewContainer');
  const pageTitle = document.getElementById('applicationsPageTitle');
  const pageSubtitle = document.getElementById('applicationsPageSubtitle');

  if (pageTitle) pageTitle.textContent = 'My Job Applications';
  if (pageSubtitle) pageSubtitle.textContent = 'Track progress and status updates for your submitted applications.';

  try {
    const res = await API.getMyApplications();
    const applications = res.applications || [];

    if (applications.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📄</div>
          <h3>You haven't applied to any jobs yet</h3>
          <p>Browse open positions and apply directly with your profile.</p>
          <a href="jobs.html" class="btn btn-primary">Find Jobs</a>
        </div>
      `;
      return;
    }

    container.innerHTML = applications.map((app) => renderSeekerApplicationCard(app)).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p style="color: var(--danger);">Failed to load applications: ${err.message}</p></div>`;
  }
}

function renderSeekerApplicationCard(app) {
  const stages = ['APPLIED', 'UNDER REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED'];
  const currentStatus = app.status;
  const isRejected = currentStatus === 'REJECTED';
  const currentIndex = stages.indexOf(currentStatus);

  const stepsHtml = stages
    .map((stage, idx) => {
      let cls = '';
      if (!isRejected) {
        if (idx === currentIndex) cls = 'active';
        else if (idx < currentIndex) cls = 'completed';
      }
      return `
        <div class="timeline-step ${cls}">
          <div class="timeline-dot">${idx + 1}</div>
          <span class="timeline-title">${stage}</span>
        </div>
      `;
    })
    .join('');

  return `
    <div class="card" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
        <div>
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">APPLICATION ID: ${app._id.slice(-6).toUpperCase()}</span>
          <h3 style="font-size: 1.3rem; margin: 0.25rem 0;">
            <a href="job-details.html?id=${app.job?._id}">${app.job?.title || 'Position'}</a>
          </h3>
          <p style="font-weight: 600; color: var(--primary); font-size: 0.95rem;">
            ${app.job?.company || 'Company'} • 📍 ${app.job?.location || 'Location'}
          </p>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Applied on ${UI.formatDate(app.appliedAt)}</span>
        </div>
        <div>
          ${UI.renderBadge(app.status)}
        </div>
      </div>

      <!-- Timeline Stepper -->
      ${
        isRejected
          ? `<div style="margin: 1.5rem 0; padding: 1rem; background: var(--status-rejected-bg); color: var(--status-rejected-text); border-radius: var(--radius-md); font-weight: 600;">
              Status: Application Rejected. Keep applying to other exciting opportunities!
             </div>`
          : `<div class="timeline-stepper">${stepsHtml}</div>`
      }

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <span style="font-size: 0.88rem; color: var(--text-secondary);">
          Contact used: <strong>${app.email}</strong> (${app.phone})
        </span>
        <div style="display: flex; gap: 0.75rem;">
          <a href="job-details.html?id=${app.job?._id}" class="btn btn-secondary btn-sm">View Job Posting</a>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// Employer: Candidate Applications Review
// ============================================================
async function initEmployerApplicationsView() {
  const container = document.getElementById('applicationsViewContainer');
  const pageTitle = document.getElementById('applicationsPageTitle');
  const pageSubtitle = document.getElementById('applicationsPageSubtitle');

  if (pageTitle) pageTitle.textContent = 'Applicant Management';
  if (pageSubtitle) pageSubtitle.textContent = 'Review candidate submissions, inspect profiles, and update candidate stages.';

  try {
    const res = await API.getAllEmployerApplications();
    const applications = res.applications || [];

    if (applications.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">👥</div>
          <h3>No applications received yet</h3>
          <p>Candidates who apply for your active job listings will appear here for review.</p>
          <a href="post-job.html" class="btn btn-primary">Post a New Job</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Applied Role</th>
              <th>Applied Date</th>
              <th>Skills</th>
              <th>Current Stage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${applications.map((app) => renderEmployerApplicantRow(app)).join('')}
          </tbody>
        </table>
      </div>
    `;

    attachEmployerApplicantEvents(container, applications);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p style="color: var(--danger);">Failed to load candidates: ${err.message}</p></div>`;
  }
}

function renderEmployerApplicantRow(app) {
  const skills = (app.applicant?.skills || []).slice(0, 3).map((s) => `<span class="tag">${s}</span>`).join(' ');

  const statuses = ['APPLIED', 'UNDER REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];
  const optionsHtml = statuses
    .map((s) => `<option value="${s}" ${s === app.status ? 'selected' : ''}>${s}</option>`)
    .join('');

  return `
    <tr data-app-id="${app._id}">
      <td data-label="Applicant">
        <div>
          <strong>${app.applicant?.name || app.fullName}</strong>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${app.email} • ${app.phone}</div>
        </div>
      </td>
      <td data-label="Applied Role">
        <strong>${app.job?.title || 'Position'}</strong>
      </td>
      <td data-label="Applied Date">${UI.formatDate(app.appliedAt)}</td>
      <td data-label="Skills">${skills || '<span class="text-muted">None</span>'}</td>
      <td data-label="Stage">
        <select class="form-input status-dropdown" data-app-id="${app._id}" style="padding: 0.35rem 0.6rem; font-size: 0.85rem; width: auto; font-weight: 600;">
          ${optionsHtml}
        </select>
      </td>
      <td data-label="Actions">
        <button class="btn btn-secondary btn-sm view-cover-btn" data-app-id="${app._id}">Review Info</button>
      </td>
    </tr>
  `;
}

function attachEmployerApplicantEvents(container, applications) {
  // Status dropdown change event
  container.querySelectorAll('.status-dropdown').forEach((select) => {
    select.onchange = async () => {
      const appId = select.getAttribute('data-app-id');
      const newStatus = select.value;

      try {
        await API.updateApplicationStatus(appId, newStatus);
        UI.showToast(`Candidate stage updated to ${newStatus}!`, 'success', 'Status Updated');
      } catch (err) {
        UI.showToast(err.message, 'error', 'Update Failed');
      }
    };
  });

  // Modal for viewing cover letter and profile details
  container.querySelectorAll('.view-cover-btn').forEach((btn) => {
    btn.onclick = () => {
      const appId = btn.getAttribute('data-app-id');
      const app = applications.find((a) => a._id === appId);
      if (!app) return;

      const modalBody = document.getElementById('applicantModalBody');
      if (modalBody) {
        modalBody.innerHTML = `
          <div style="margin-bottom: 1.25rem;">
            <h3 style="font-size: 1.25rem;">${app.applicant?.name || app.fullName}</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
              Applied for: <strong>${app.job?.title || 'Position'}</strong>
            </p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; font-size: 0.9rem;">
            <div><strong>Email:</strong> ${app.email}</div>
            <div><strong>Phone:</strong> ${app.phone}</div>
            <div><strong>Education:</strong> ${app.applicant?.education || 'Not provided'}</div>
            <div><strong>Experience:</strong> ${app.applicant?.experience || 'Not provided'}</div>
          </div>
          <div style="margin-bottom: 1.25rem;">
            <strong>Cover Letter:</strong>
            <p style="background: var(--bg-primary); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-top: 0.4rem; font-size: 0.92rem; line-height: 1.6; white-space: pre-wrap;">
              ${app.coverLetter || 'No cover letter submitted.'}
            </p>
          </div>
          <div>
            <strong>Resume URL:</strong>
            <div style="margin-top: 0.35rem;">
              ${
                app.resumeUrl
                  ? `<a href="${app.resumeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Open Resume Link ↗</a>`
                  : `<span class="text-muted">No resume link attached.</span>`
              }
            </div>
          </div>
        `;
        UI.openModal('applicantDetailsModal');
      }
    };
  });

  const closeBtn = document.getElementById('closeApplicantModalBtn');
  if (closeBtn) closeBtn.onclick = () => UI.closeModal('applicantDetailsModal');
}
