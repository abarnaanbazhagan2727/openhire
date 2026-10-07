/**
 * OpenHire - Profile Management Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = API.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  loadUserProfile();
  initProfileForm();
});

async function loadUserProfile() {
  try {
    const res = await API.getProfile();
    const p = res.profile;

    // Header info
    document.getElementById('profileHeaderName').textContent = p.name;
    document.getElementById('profileHeaderRole').textContent = p.role === 'employer' ? 'Employer Account' : 'Job Seeker Account';
    document.getElementById('profileAvatarLetter').textContent = p.name.charAt(0).toUpperCase();

    const completion = p.profileCompletion || 60;
    document.getElementById('profileCompletionScore').textContent = `${completion}%`;
    document.getElementById('profileCompletionBar').style.width = `${completion}%`;

    // Common inputs
    document.getElementById('profName').value = p.name || '';
    document.getElementById('profEmail').value = p.email || '';
    document.getElementById('profPhone').value = p.phone || '';
    document.getElementById('profLocation').value = p.location || '';

    // Role specific form visibility
    const seekerSection = document.getElementById('seekerProfileSection');
    const employerSection = document.getElementById('employerProfileSection');

    if (p.role === 'seeker') {
      if (seekerSection) seekerSection.style.display = 'block';
      if (employerSection) employerSection.style.display = 'none';

      document.getElementById('profSkills').value = (p.skills || []).join(', ');
      document.getElementById('profEducation').value = p.education || '';
      document.getElementById('profExperience').value = p.experience || '';
      document.getElementById('profResumeUrl').value = p.resumeUrl || '';
      document.getElementById('profPortfolio').value = p.portfolio || '';
      document.getElementById('profLinkedin').value = p.linkedin || '';
    } else {
      if (employerSection) employerSection.style.display = 'block';
      if (seekerSection) seekerSection.style.display = 'none';

      document.getElementById('profCompanyName').value = p.companyName || '';
      document.getElementById('profCompanyWebsite').value = p.companyWebsite || '';
      document.getElementById('profIndustry').value = p.industry || '';
      document.getElementById('profCompanySize').value = p.companySize || '';
      document.getElementById('profCompanyDescription').value = p.companyDescription || '';
    }
  } catch (err) {
    UI.showToast(err.message, 'error', 'Profile Load Failed');
  }
}

function initProfileForm() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const user = API.getUser();

    const name = document.getElementById('profName').value.trim();
    const phone = document.getElementById('profPhone').value.trim();
    const location = document.getElementById('profLocation').value.trim();

    const payload = { name, phone, location };

    if (user.role === 'seeker') {
      const skillsRaw = document.getElementById('profSkills').value;
      payload.skills = skillsRaw.split(',').map((s) => s.trim()).filter(Boolean);
      payload.education = document.getElementById('profEducation').value.trim();
      payload.experience = document.getElementById('profExperience').value.trim();
      payload.resumeUrl = document.getElementById('profResumeUrl').value.trim();
      payload.portfolio = document.getElementById('profPortfolio').value.trim();
      payload.linkedin = document.getElementById('profLinkedin').value.trim();
    } else {
      payload.companyName = document.getElementById('profCompanyName').value.trim();
      payload.companyWebsite = document.getElementById('profCompanyWebsite').value.trim();
      payload.industry = document.getElementById('profIndustry').value.trim();
      payload.companySize = document.getElementById('profCompanySize').value.trim();
      payload.companyDescription = document.getElementById('profCompanyDescription').value.trim();
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Saving Changes...`;

    try {
      const res = await API.updateProfile(payload);
      API.setUser({ ...user, ...res.profile });
      UI.showToast('Profile updated successfully!', 'success', 'Profile Saved');

      loadUserProfile();
    } catch (err) {
      UI.showToast(err.message, 'error', 'Update Failed');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Save Profile Changes';
    }
  };
}
