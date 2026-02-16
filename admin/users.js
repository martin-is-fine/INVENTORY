// User Management State
document.addEventListener('DOMContentLoaded', () => {
});

let currentUserStep = 1;
const totalUserSteps = 3;
let isEditingUser = false;

function openUserModal(editIcon = null) {
    const modal = document.getElementById('user-modal');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const editRowIndexInput = document.getElementById('edit-row-index');
    const form = document.getElementById('user-form');
    const userIdInput = document.getElementById('user-id');

    modal.style.display = 'block';
    currentUserStep = 1;
    isEditingUser = !!editIcon;
    updateUserStepUI();

    if (editIcon) {
        modalTitle.textContent = 'Edit User';
        submitBtn.textContent = 'Save Changes';
        const row = editIcon.closest('tr');
        const rows = Array.from(document.querySelectorAll('#user-list tr'));
        const rowIndex = rows.indexOf(row);
        editRowIndexInput.value = rowIndex;

        const dataset = row.dataset;
        const fullNameCell = row.querySelector('.user-name-text').textContent.trim();
        let firstName = dataset.firstName || '';
        let lastName = dataset.lastName || '';
        if (!firstName && !lastName) {
            const parts = fullNameCell.split(' ');
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ');
        }
        const email = dataset.email || row.querySelector('.user-email-cell').textContent.trim();
        const phone = dataset.phone || '';
        const role = dataset.role || row.querySelector('.user-role-cell').textContent.trim();
        const department = dataset.department || row.querySelector('.user-dept-cell').textContent.trim();
        const status = dataset.status || row.querySelector('.user-status-cell').textContent.trim();
        const modulesRaw = dataset.modules || '';
        const modules = modulesRaw ? modulesRaw.split(',').map(m => m.trim()).filter(Boolean) : [];

        document.getElementById('user-first-name').value = firstName;
        document.getElementById('user-last-name').value = lastName;
        document.getElementById('user-email').value = email;
        document.getElementById('user-phone').value = phone;

        const roleSelect = document.getElementById('user-role');
        const deptSelect = document.getElementById('user-dept');
        const statusSelect = document.getElementById('user-status');

        setSelectValue(roleSelect, role);
        setSelectValue(deptSelect, department);
        setSelectValue(statusSelect, status);

        const moduleInputs = document.querySelectorAll('input[name="user-modules"]');
        moduleInputs.forEach(input => {
            input.checked = modules.includes(input.value);
        });

        const userId = dataset.userId || '';
        userIdInput.value = userId;
    } else {
        modalTitle.textContent = 'Add New User';
        submitBtn.textContent = 'Save User';
        editRowIndexInput.value = '';
        userIdInput.value = '';
        form.reset();
        const moduleInputs = document.querySelectorAll('input[name="user-modules"]');
        moduleInputs.forEach(input => {
            input.checked = false;
        });
    }
}

function closeUserModal() {
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    modal.style.display = 'none';
    form.reset();
    currentUserStep = 1;
    updateUserStepUI();
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('user-modal');
    if (event.target === modal) {
        closeUserModal();
    }
});

function setSelectValue(select, value) {
    let exists = false;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === value) {
            exists = true;
            break;
        }
    }
    if (!exists && value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.insertBefore(option, select.lastElementChild);
    }
    select.value = value;
}

function checkNewUserOption(select, type) {
    if (select.value === '-add-new-') {
        const newValue = prompt(`Enter new ${type} name:`);
        if (newValue && newValue.trim() !== '') {
            const trimmedValue = newValue.trim();
            const option = document.createElement('option');
            option.value = trimmedValue;
            option.textContent = trimmedValue;
            select.insertBefore(option, select.lastElementChild);
            select.value = trimmedValue;
        } else {
            select.value = '';
        }
    }
}

function nextUserStep() {
    if (!validateUserStep(currentUserStep)) {
        return;
    }
    if (currentUserStep < totalUserSteps) {
        currentUserStep += 1;
        if (currentUserStep === 3) {
            populateUserSummary();
        }
        updateUserStepUI();
    }
}

function prevUserStep() {
    if (currentUserStep > 1) {
        currentUserStep -= 1;
        updateUserStepUI();
    }
}

function validateUserStep(step) {
    if (step === 1) {
        const firstName = document.getElementById('user-first-name').value.trim();
        const lastName = document.getElementById('user-last-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const phone = document.getElementById('user-phone').value.trim();
        if (!firstName || !lastName || !email || !phone) {
            alert('Please fill in first name, last name, email, and phone.');
            return false;
        }
        return true;
    }
    if (step === 2) {
        const role = document.getElementById('user-role').value;
        const department = document.getElementById('user-dept').value;
        const status = document.getElementById('user-status').value;
        if (!role || !department || !status) {
            alert('Please select role, department, and status.');
            return false;
        }
        return true;
    }
    return true;
}

function updateUserStepUI() {
    const steps = document.querySelectorAll('.user-step');
    steps.forEach(step => {
        const stepNumber = Number(step.getAttribute('data-step'));
        if (stepNumber === currentUserStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    const indicators = document.querySelectorAll('.step-indicator-step');
    indicators.forEach(indicator => {
        const stepNumber = Number(indicator.getAttribute('data-step'));
        if (stepNumber < currentUserStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (stepNumber === currentUserStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
        } else {
            indicator.classList.remove('active');
            indicator.classList.remove('completed');
        }
    });

    const backBtn = document.getElementById('user-back-btn');
    const nextBtn = document.getElementById('user-next-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (currentUserStep === 1) {
        backBtn.style.display = 'none';
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    } else if (currentUserStep === totalUserSteps) {
        backBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
        submitBtn.textContent = isEditingUser ? 'Save Changes' : 'Save User';
    } else {
        backBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }
}

function populateUserSummary() {
    const firstName = document.getElementById('user-first-name').value.trim();
    const lastName = document.getElementById('user-last-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const role = document.getElementById('user-role').value;
    const department = document.getElementById('user-dept').value;
    const status = document.getElementById('user-status').value;
    const moduleInputs = document.querySelectorAll('input[name="user-modules"]:checked');
    const modules = Array.from(moduleInputs).map(input => input.value);

    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    document.getElementById('summary-name').textContent = fullName;
    document.getElementById('summary-email').textContent = email;
    document.getElementById('summary-phone').textContent = phone || '-';
    document.getElementById('summary-role').textContent = role;
    document.getElementById('summary-department').textContent = department;
    document.getElementById('summary-status').textContent = status;
    document.getElementById('summary-modules').textContent = modules.length ? modules.join(', ') : '-';
}

async function handleUserSubmit(event) {
    event.preventDefault();
    if (!validateUserStep(1) || !validateUserStep(2)) {
        currentUserStep = 1;
        updateUserStepUI();
        return;
    }

    const firstName = document.getElementById('user-first-name').value.trim();
    const lastName = document.getElementById('user-last-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const role = document.getElementById('user-role').value;
    const department = document.getElementById('user-dept').value;
    const status = document.getElementById('user-status').value;
    const editRowIndex = document.getElementById('edit-row-index').value;
    const userIdInput = document.getElementById('user-id');
    const moduleInputs = document.querySelectorAll('input[name="user-modules"]:checked');
    const modules = Array.from(moduleInputs).map(input => input.value);

    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    if (!fullName || !email || !phone || !role || !department || !status) {
        alert('Please fill in all required fields, including phone.');
        return;
    }

    const userData = {
        id: userIdInput.value || undefined,
        firstName,
        lastName,
        fullName,
        email,
        phone,
        role,
        department,
        status,
        modules
    };

    try {
        if (editRowIndex !== '') {
            const rows = document.querySelectorAll('#user-list tr');
            const row = rows[editRowIndex];
            const existingId = row.dataset.userId || userData.id || '';
            if (existingId) {
                userData.id = existingId;
                await updateUserOnServer(existingId, userData);
            }
            updateUserRow(row, userData);
            alert(`User "${fullName}" updated successfully.`);
        } else {
            const createdUser = await createUserOnServer(userData);
            const newId = createdUser && (createdUser.id || createdUser.userId) ? String(createdUser.id || createdUser.userId) : `local-${Date.now()}`;
            userData.id = newId;
            addUserRow(userData);
            alert(`User "${fullName}" added successfully.`);
        }
        closeUserModal();
    } catch (error) {
        console.error(error);
        alert('Failed to save user. Please try again.');
    }
}

function updateUserRow(row, userData) {
    row.dataset.userId = userData.id || '';
    row.dataset.firstName = userData.firstName;
    row.dataset.lastName = userData.lastName;
    row.dataset.email = userData.email;
    row.dataset.phone = userData.phone || '';
    row.dataset.role = userData.role;
    row.dataset.department = userData.department;
    row.dataset.status = userData.status;
    row.dataset.modules = userData.modules.join(',');

    const roleBadgeClass = `badge-${userData.role.toLowerCase()}`;
    const statusBadgeClass = `badge-${userData.status.toLowerCase()}`;
    let iconClass = '';
    if (userData.status.toLowerCase() === 'pending') {
        iconClass = 'pending';
    } else if (userData.role.toLowerCase() === 'staff') {
        iconClass = 'staff';
    }

    const icon = row.querySelector('.user-icon');
    icon.classList.remove('staff', 'pending');
    if (iconClass) {
        icon.classList.add(iconClass);
    }

    row.querySelector('.user-name-text').textContent = userData.fullName;
    row.querySelector('.user-email-cell').textContent = userData.email;
    row.querySelector('.user-dept-cell').textContent = userData.department;

    const roleCell = row.querySelector('.user-role-cell');
    roleCell.innerHTML = `<span class="badge ${roleBadgeClass}">${userData.role}</span>`;

    const statusCell = row.querySelector('.user-status-cell');
    statusCell.innerHTML = `<span class="badge ${statusBadgeClass}">${userData.status}</span>`;
}

function addUserRow(userData) {
    const tableBody = document.getElementById('user-list');
    const newRow = document.createElement('tr');

    const roleBadgeClass = `badge-${userData.role.toLowerCase()}`;
    const statusBadgeClass = `badge-${userData.status.toLowerCase()}`;
    let iconClass = '';
    if (userData.status.toLowerCase() === 'pending') {
        iconClass = 'pending';
    } else if (userData.role.toLowerCase() === 'staff') {
        iconClass = 'staff';
    }

    newRow.dataset.userId = userData.id || '';
    newRow.dataset.firstName = userData.firstName;
    newRow.dataset.lastName = userData.lastName;
    newRow.dataset.email = userData.email;
    newRow.dataset.phone = userData.phone || '';
    newRow.dataset.role = userData.role;
    newRow.dataset.department = userData.department;
    newRow.dataset.status = userData.status;
    newRow.dataset.modules = userData.modules.join(',');

    newRow.innerHTML = `
        <td>
            <div class="user-cell">
                <svg class="user-icon ${iconClass}" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                <span class="user-name-text">${userData.fullName}</span>
            </div>
        </td>
        <td class="user-email-cell">${userData.email}</td>
        <td class="user-role-cell"><span class="badge ${roleBadgeClass}">${userData.role}</span></td>
        <td class="user-dept-cell">${userData.department}</td>
        <td class="user-status-cell"><span class="badge ${statusBadgeClass}">${userData.status}</span></td>
        <td>
            <div class="action-icons">
                <svg class="action-icon edit" onclick="openUserModal(this)" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                <svg class="action-icon delete" onclick="handleDeleteUser(this)" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </div>
        </td>
    `;
    tableBody.appendChild(newRow);
}

async function createUserOnServer(userData) {
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        throw new Error('Failed to create user');
    }
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}

async function updateUserOnServer(id, userData) {
    const response = await fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        throw new Error('Failed to update user');
    }
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}

async function deleteUserOnServer(id) {
    const response = await fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
}

async function handleDeleteUser(deleteIcon) {
    const row = deleteIcon.closest('tr');
    const name = row.querySelector('.user-name-text').textContent;
    const userId = row.dataset.userId;
    const confirmed = confirm('Are you sure you want to delete this user?');
    if (!confirmed) {
        return;
    }
    try {
        if (userId) {
            await deleteUserOnServer(userId);
        }
        row.remove();
        alert(`User "${name}" has been deleted.`);
    } catch (error) {
        console.error(error);
        alert('Failed to delete user. Please try again.');
    }
}
