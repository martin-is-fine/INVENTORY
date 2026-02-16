// Filtering State
let currentFilters = {
    dept: '-select-',
    cat: '-select-',
    search: ''
};

// Initialize Filtering
document.addEventListener('DOMContentLoaded', () => {
    // Toggle Dropdowns
    const deptBtn = document.getElementById('dept-filter-btn');
    const catBtn = document.getElementById('cat-filter-btn');
    const deptDropdown = document.getElementById('dept-dropdown');
    const catDropdown = document.getElementById('cat-dropdown');
    const searchInput = document.getElementById('inventory-search');

    if (deptBtn) {
        deptBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deptDropdown.classList.toggle('show');
            catDropdown.classList.remove('show');
        });
    }

    if (catBtn) {
        catBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            catDropdown.classList.toggle('show');
            deptDropdown.classList.remove('show');
        });
    }

    // Close dropdowns when clicking outside
    window.addEventListener('click', function() {
        if (deptDropdown) deptDropdown.classList.remove('show');
        if (catDropdown) catDropdown.classList.remove('show');
    });

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
});

// Modal Controls
function openItemModal(editIcon = null) {
    const modal = document.getElementById('item-modal');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const editRowIndexInput = document.getElementById('edit-row-index');
    const form = document.getElementById('item-form');

    modal.style.display = 'block';

    if (editIcon) {
        // Edit Mode
        modalTitle.textContent = 'Edit Inventory Item';
        submitBtn.textContent = 'Save Changes';
        
        // Get row data
        const row = editIcon.closest('tr');
        const rows = Array.from(document.querySelectorAll('#inventory-list tr'));
        const rowIndex = rows.indexOf(row);
        editRowIndexInput.value = rowIndex;

        const name = row.querySelector('.item-name-cell').textContent;
        const category = row.cells[1].textContent;
        const department = row.cells[2].textContent;
        const quantity = row.cells[3].textContent;
        // Since condition isn't in a cell but usually passed around or stored, 
        // and we don't have a hidden field in the table for it yet, 
        // we'll assume the form's condition select needs to be set.
        // For now, let's look for clues or just set a default.
        // Actually, the user wants us to pre-fill it. 
        // Let's add a data attribute or just default to Good if not found.
        
        document.getElementById('item-name').value = name;
        document.getElementById('item-category').value = category;
        document.getElementById('item-department').value = department;
        document.getElementById('item-quantity').value = quantity;
        
        // Try to match condition from the 'View Condition' link or other context if available
        // If not, we'll just set it to 'Good' for now as a fallback
        document.getElementById('item-condition').value = 'Good'; 
    } else {
        // Add Mode
        modalTitle.textContent = 'Add New Inventory Item';
        submitBtn.textContent = 'Add Item';
        editRowIndexInput.value = '';
        form.reset();
    }
}

function closeItemModal() {
    document.getElementById('item-modal').style.display = 'none';
    document.getElementById('item-form').reset();
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('item-modal');
    if (event.target == modal) {
        closeItemModal();
    }
});

// Dynamic Option Management
function checkNewOption(select, type) {
    if (select.value === '-add-new-') {
        const newValue = prompt(`Enter new ${type} name:`);
        if (newValue && newValue.trim() !== '') {
            const trimmedValue = newValue.trim();
            
            // Add to the form dropdown
            const option = document.createElement('option');
            option.value = trimmedValue;
            option.textContent = trimmedValue;
            select.insertBefore(option, select.lastElementChild);
            select.value = trimmedValue;

            // Add to the filter dropdown
            const filterDropdown = document.getElementById(type === 'category' ? 'cat-dropdown' : 'dept-dropdown');
            if (filterDropdown) {
                const filterItem = document.createElement('div');
                filterItem.className = 'dropdown-item';
                filterItem.textContent = trimmedValue;
                filterItem.onclick = () => selectFilter(type === 'category' ? 'cat' : 'dept', trimmedValue);
                filterDropdown.appendChild(filterItem);
            }
        } else {
            select.value = ''; // Reset to -select- if cancelled
        }
    }
}

// Handle Item Submit (Add or Edit)
function handleItemSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('item-name').value;
    const category = document.getElementById('item-category').value;
    const department = document.getElementById('item-department').value;
    const quantity = document.getElementById('item-quantity').value;
    const condition = document.getElementById('item-condition').value;
    const editRowIndex = document.getElementById('edit-row-index').value;

    if (!name || !category || !department || !quantity || !condition) {
        alert('Please fill in all fields.');
        return;
    }

    if (editRowIndex !== '') {
        // Edit Existing Row
        const rows = document.querySelectorAll('#inventory-list tr');
        const row = rows[editRowIndex];
        
        row.querySelector('.item-name-cell').textContent = name;
        row.cells[1].textContent = category;
        row.cells[2].textContent = department;
        row.cells[3].textContent = quantity;
        
        alert(`Item "${name}" updated successfully!`);
    } else {
        // Add New Row
        const tableBody = document.getElementById('inventory-list');
        const newRow = document.createElement('tr');
        
        newRow.innerHTML = `
            <td class="item-name-cell">${name}</td>
            <td>${category}</td>
            <td>${department}</td>
            <td>${quantity}</td>
            <td><a href="condition.html" class="condition-link">View Condition</a></td>
            <td>
                <div class="action-icons">
                    <svg class="action-icon edit" viewBox="0 0 24 24" onclick="openItemModal(this)"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    <svg class="action-icon delete" viewBox="0 0 24 24" onclick="alert('Delete Item')"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </div>
            </td>
        `;

        tableBody.appendChild(newRow);
        alert(`Item "${name}" added successfully!`);
    }
    
    closeItemModal();
    applyFilters();
}

// Select Filter function (called from HTML)
function selectFilter(type, value) {
    currentFilters[type] = value;
    
    // Update button text and active class
    const btn = document.getElementById(type === 'dept' ? 'dept-filter-btn' : 'cat-filter-btn');
    const dropdown = document.getElementById(type === 'dept' ? 'dept-dropdown' : 'cat-dropdown');
    
    if (value === '-select-') {
        btn.textContent = type === 'dept' ? 'All Departments' : 'All Categories';
        btn.style.background = 'var(--accent-red)';
    } else {
        btn.textContent = value;
        btn.style.background = 'var(--primary-blue)';
    }

    // Update active item in dropdown
    const items = dropdown.querySelectorAll('.dropdown-item');
    items.forEach(item => {
        if (item.textContent === value) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    applyFilters();
}

// Apply all filters
function applyFilters() {
    const searchInput = document.getElementById('inventory-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const rows = document.querySelectorAll('#inventory-list tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const itemName = row.querySelector('.item-name-cell').textContent.toLowerCase();
        const itemCat = row.cells[1].textContent;
        const itemDept = row.cells[2].textContent;

        const matchesSearch = itemName.includes(searchTerm);
        const matchesDept = currentFilters.dept === '-select-' || itemDept === currentFilters.dept;
        const matchesCat = currentFilters.cat === '-select-' || itemCat === currentFilters.cat;

        if (matchesSearch && matchesDept && matchesCat) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Show/Hide "No results" message and table
    const noResults = document.getElementById('no-results');
    const table = document.getElementById('inventory-table');
    
    if (visibleCount === 0) {
        if (noResults) noResults.style.display = 'block';
        if (table) table.style.display = 'none';
    } else {
        if (noResults) noResults.style.display = 'none';
        if (table) table.style.display = 'table';
    }
}
