document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('filterInput');
    const exportBtn = document.getElementById('exportBtn');
    const table = document.querySelector('.inventory-table tbody');

    if (filterInput && table) {
        filterInput.addEventListener('input', () => {
            const query = filterInput.value.trim().toLowerCase();
            const rows = Array.from(table.querySelectorAll('tr'));

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length === 0) return;

                const item = cells[0].textContent.toLowerCase();
                const category = cells[1].textContent.toLowerCase();
                const assignedTo = cells[2].textContent.toLowerCase();
                const status = cells[3].textContent.toLowerCase();

                const matches =
                    item.includes(query) ||
                    category.includes(query) ||
                    assignedTo.includes(query) ||
                    status.includes(query);

                row.style.display = matches ? '' : 'none';
            });
        });
    }

    if (exportBtn && table) {
        exportBtn.addEventListener('click', () => {
            const rows = Array.from(document.querySelectorAll('.inventory-table tr'));
            const data = rows.map(row =>
                Array.from(row.querySelectorAll('th, td'))
                    .map(cell => {
                        const text = cell.textContent.trim().replace(/\s+/g, ' ');
                        return `"${text.replace(/"/g, '""')}"`;
                    })
                    .join(',')
            );

            const csvContent = data.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'my-inventory.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }
});
