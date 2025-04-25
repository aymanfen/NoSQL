document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Hide all tabs and remove active class from buttons
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Show selected tab and mark button as active
            document.getElementById(tabId).classList.add('active');
            button.classList.add('active');

            // Refresh data when switching tabs
            if (tabId === 'dashboard') {
                loadDashboardData();
            } else if (tabId === 'transactions') {
                loadTransactions();
                loadCategoriesForDropdown('transaction-category');
            } else if (tabId === 'categories') {
                loadCategories();
            } else if (tabId === 'budgets') {
                loadBudgets();
                loadCategoriesForDropdown('budget-category');
            }
        });
    });

    // Initialize dashboard on first load
    loadDashboardData();
    loadTransactions();
    loadCategories();
    loadBudgets();
    setupFormModals();

    // Load categories for dropdowns
    loadCategoriesForDropdown('transaction-category');
    loadCategoriesForDropdown('budget-category');
});

// Charts
let trendChart = null;
let categoryChart = null;

function setupFormModals() {
    // Transaction form
    const transactionModal = document.getElementById('transaction-form');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const closeTransactionBtn = transactionModal.querySelector('.close-btn');
    const transactionForm = document.getElementById('transaction-form-data');
    const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');
    const addDynamicFieldBtn = document.getElementById('add-dynamic-field-btn');

    addTransactionBtn.addEventListener('click', () => {
        document.getElementById('transaction-form-title').textContent = 'Add Transaction';
        document.getElementById('transaction-id').value = '';
        transactionForm.reset();
        dynamicFieldsContainer.innerHTML = ''; // Clear dynamic fields
        transactionModal.style.display = 'block';
    });

    closeTransactionBtn.addEventListener('click', () => {
        transactionModal.style.display = 'none';
    });

    addDynamicFieldBtn.addEventListener('click', () => {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'form-group dynamic-field';
        fieldContainer.innerHTML = `
            <label>
                Field Name: <input type="text" class="dynamic-field-name" required>
            </label>
            <label>
                Field Value: <input type="text" class="dynamic-field-value" required>
            </label>
            <button type="button" class="remove-dynamic-field-btn">Remove</button>
        `;
        dynamicFieldsContainer.appendChild(fieldContainer);

        // Add event listener to remove button
        fieldContainer.querySelector('.remove-dynamic-field-btn').addEventListener('click', () => {
            fieldContainer.remove();
        });
    });

    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('transaction-id').value;
        const transaction = {
            amount: parseFloat(document.getElementById('transaction-amount').value),
            description: document.getElementById('transaction-description').value,
            category: document.getElementById('transaction-category').value,
            date: document.getElementById('transaction-date').value,
            type: document.getElementById('transaction-type').value
        };

        // Collect dynamic fields
        const dynamicFields = document.querySelectorAll('.dynamic-field');
        dynamicFields.forEach(field => {
            const fieldName = field.querySelector('.dynamic-field-name').value;
            const fieldValue = field.querySelector('.dynamic-field-value').value;
            if (fieldName && fieldValue) {
                transaction[fieldName] = fieldValue;
            }
        });

        if (id) {
            updateTransaction(id, transaction);
        } else {
            createTransaction(transaction);
        }

        transactionModal.style.display = 'none';
    });

    // Category form
    const categoryModal = document.getElementById('category-form');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const closeCategoryBtn = categoryModal.querySelector('.close-btn');
    const categoryForm = document.getElementById('category-form-data');

    addCategoryBtn.addEventListener('click', () => {
        document.getElementById('category-form-title').textContent = 'Add Category';
        document.getElementById('category-id').value = '';
        categoryForm.reset();
        categoryModal.style.display = 'block';
    });

    closeCategoryBtn.addEventListener('click', () => {
        categoryModal.style.display = 'none';
    });

    categoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('category-id').value;
        const category = {
            name: document.getElementById('category-name').value
        };

        if (id) {
            updateCategory(id, category);
        } else {
            createCategory(category);
        }

        categoryModal.style.display = 'none';
    });

    // Budget form
    const budgetModal = document.getElementById('budget-form');
    const addBudgetBtn = document.getElementById('add-budget-btn');
    const closeBudgetBtn = budgetModal.querySelector('.close-btn');
    const budgetForm = document.getElementById('budget-form-data');

    addBudgetBtn.addEventListener('click', () => {
        document.getElementById('budget-form-title').textContent = 'Add Budget';
        document.getElementById('budget-id').value = '';
        budgetForm.reset();
        budgetModal.style.display = 'block';
    });

    closeBudgetBtn.addEventListener('click', () => {
        budgetModal.style.display = 'none';
    });

    budgetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('budget-id').value;
        const budget = {
            category: document.getElementById('budget-category').value,
            amount: parseFloat(document.getElementById('budget-amount').value),
            period: document.getElementById('budget-period').value
        };

        if (id) {
            updateBudget(id, budget);
        } else {
            createBudget(budget);
        }

        budgetModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.className === 'modal') {
            e.target.style.display = 'none';
        }
    });
}

function loadDashboardData() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(transactions => {
            const expenses = transactions.filter(t => t.type === 'expense');
            const income = transactions.filter(t => t.type === 'income');

            fetch('/api/budgets')
                .then(response => response.json())
                .then(budgets => {
                    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
                    const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);

                    // Update remaining budget
                    document.getElementById('remaining-budget').textContent =
                        `$${(totalBudget - totalExpenses).toFixed(2)}`;

                    // Update progress bar
                    const progress = totalBudget > 0 ?
                        Math.min((totalExpenses / totalBudget) * 100, 100) : 0;
                    document.querySelector('.progress-bar').style.width = `${progress}%`;

                    // Create charts
                    createTrendChart(transactions);
                    createCategoryChart(expenses);
                });
        });
}

function createTrendChart(transactions) {
    const ctx = document.getElementById('trendChart').getContext('2d');

    // Sort transactions by date
    const sortedTransactions = transactions.sort((a, b) =>
        new Date(a.date) - new Date(b.date));

    // Calculate cumulative sums
    let cumulativeExpense = 0;
    let cumulativeIncome = 0;

    const dates = [];
    const expenseData = [];
    const incomeData = [];

    sortedTransactions.forEach(transaction => {
        dates.push(transaction.date);

        if(transaction.type === 'expense') {
            cumulativeExpense += parseFloat(transaction.amount);
        } else {
            cumulativeIncome += parseFloat(transaction.amount);
        }

        expenseData.push(cumulativeExpense);
        incomeData.push(cumulativeIncome);
    });

    // Get total budget
    fetch('/api/budgets')
        .then(response => response.json())
        .then(budgets => {
            const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

            if(trendChart) trendChart.destroy();

            trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Cumulative Expenses',
                            data: expenseData,
                            borderColor: '#e74c3c',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            tension: 0.2
                        },
                        {
                            label: 'Cumulative Income',
                            data: incomeData,
                            borderColor: '#2ecc71',
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            tension: 0.2
                        },
                        {
                            label: 'Total Budget',
                            data: Array(dates.length).fill(totalBudget),
                            borderColor: '#0078d4',
                            borderDash: [5, 5],
                            backgroundColor: 'transparent',
                            tension: 0,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: (context) =>
                                    `${context.dataset.label}: $${context.raw.toFixed(2)}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: { maxRotation: 45 }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: {
                                callback: (value) => `$${value}`
                            }
                        }
                    }
                }
            });
        });
}

function createCategoryChart(expenses) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    // Get categories and sum expenses by category
    fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            const categoryMap = {};
            categories.forEach(cat => {
                categoryMap[cat._id] = cat.name;
            });

            const categoryTotals = {};
            expenses.forEach(expense => {
                if (categoryMap[expense.category]) {
                    const catName = categoryMap[expense.category];
                    categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(expense.amount);
                }
            });

            const labels = Object.keys(categoryTotals);
            const data = Object.values(categoryTotals);

            // Generate colors
            const backgroundColors = labels.map((_, i) => {
                const hue = (i * 137.508) % 360; // Golden angle approximation
                return `hsl(${hue}, 70%, 60%)`;
            });

            if (categoryChart) {
                categoryChart.destroy();
            }

            categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    cutout:'60%',
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        });
}

// Transaction functions
function loadTransactions() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(transactions => {
            const tbody = document.querySelector('#transactions-table tbody');
            tbody.innerHTML = '';

            transactions.forEach(transaction => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${transaction.date}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.category}</td>
                    <td class="${transaction.type === 'expense' ? 'text-danger' : 'text-success'}">
                        $${parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                    <td>
                        ${Object.keys(transaction)
                            .filter(key => !['_id', 'amount', 'description', 'category', 'date', 'type'].includes(key))
                            .map(key => `<strong>${key}:</strong> ${transaction[key]}<br>`)
                            .join('')}
                    </td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${transaction._id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${transaction._id}">Delete</button>
                    </td>
                `;

                tbody.appendChild(row);
            });

            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editTransaction(btn.getAttribute('data-id')));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteTransaction(btn.getAttribute('data-id')));
            });
        });
}

function createTransaction(transaction) {
    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
    })
    .then(response => response.json())
    .then(() => {
        loadTransactions();
        loadDashboardData();
    });
}

function editTransaction(id) {
    fetch(`/api/transactions/${id}`)
        .then(response => response.json())
        .then(transaction => {
            document.getElementById('transaction-form-title').textContent = 'Edit Transaction';
            document.getElementById('transaction-id').value = transaction._id;
            document.getElementById('transaction-amount').value = transaction.amount;
            document.getElementById('transaction-description').value = transaction.description;
            document.getElementById('transaction-category').value = transaction.category;
            document.getElementById('transaction-date').value = transaction.date;
            document.getElementById('transaction-type').value = transaction.type;

            // Populate dynamic fields
            const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');
            dynamicFieldsContainer.innerHTML = '';
            for (const key in transaction) {
                if (key !== '_id' && key !== 'amount' && key !== 'description' && key !== 'category' && key !== 'date' && key !== 'type') {
                    const fieldContainer = document.createElement('div');
                    fieldContainer.className = 'form-group dynamic-field';
                    fieldContainer.innerHTML = `
                        <label>
                            Field Name: <input type="text" class="dynamic-field-name" value="${key}" required>
                        </label>
                        <label>
                            Field Value: <input type="text" class="dynamic-field-value" value="${transaction[key]}" required>
                        </label>
                        <button type="button" class="remove-dynamic-field-btn">Remove</button>
                    `;
                    dynamicFieldsContainer.appendChild(fieldContainer);

                    // Add event listener to remove button
                    fieldContainer.querySelector('.remove-dynamic-field-btn').addEventListener('click', () => {
                        fieldContainer.remove();
                    });
                }
            }

            document.getElementById('transaction-form').style.display = 'block';
        });
}

function updateTransaction(id, transaction) {
    fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
    })
    .then(response => response.json())
    .then(() => {
        loadTransactions();
        loadDashboardData();
    });
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        fetch(`/api/transactions/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(() => {
            loadTransactions();
            loadDashboardData();
        });
    }
}

// Category functions
function loadCategories() {
    fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            const tbody = document.querySelector('#categories-table tbody');
            tbody.innerHTML = '';

            categories.forEach(category => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${category.name}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${category._id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${category._id}">Delete</button>
                    </td>
                `;

                tbody.appendChild(row);
            });

            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editCategory(btn.getAttribute('data-id')));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteCategory(btn.getAttribute('data-id')));
            });
        });
}

function loadCategoriesForDropdown(dropdownId) {
    fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            const dropdown = document.getElementById(dropdownId);
            dropdown.innerHTML = '';

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category._id;
                option.textContent = category.name;
                dropdown.appendChild(option);
            });
        });
}

function createCategory(category) {
    fetch('/api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(category)
    })
    .then(response => response.json())
    .then(() => {
        loadCategories();
        loadCategoriesForDropdown('transaction-category');
        loadCategoriesForDropdown('budget-category');
        loadDashboardData();
    });
}

function editCategory(id) {
    fetch(`/api/categories/${id}`)
        .then(response => response.json())
        .then(category => {
            document.getElementById('category-form-title').textContent = 'Edit Category';
            document.getElementById('category-id').value = category._id;
            document.getElementById('category-name').value = category.name;

            document.getElementById('category-form').style.display = 'block';
        });
}

function updateCategory(id, category) {
    fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(category)
    })
    .then(response => response.json())
    .then(() => {
        loadCategories();
        loadCategoriesForDropdown('transaction-category');
        loadCategoriesForDropdown('budget-category');
        loadDashboardData();
    });
}

function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        fetch(`/api/categories/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(() => {
            loadCategories();
            loadCategoriesForDropdown('transaction-category');
            loadCategoriesForDropdown('budget-category');
            loadDashboardData();
        });
    }
}

// Budget functions
function loadBudgets() {
    fetch('/api/budgets')
        .then(response => response.json())
        .then(budgets => {
            fetch('/api/categories')
                .then(response => response.json())
                .then(categories => {
                    const categoryMap = {};
                    categories.forEach(cat => {
                        categoryMap[cat._id] = cat.name;
                    });

                    const tbody = document.querySelector('#budgets-table tbody');
                    tbody.innerHTML = '';

                    budgets.forEach(budget => {
                        const row = document.createElement('tr');

                        row.innerHTML = `
                            <td>${categoryMap[budget.category] || budget.category}</td>
                            <td>$${parseFloat(budget.amount).toFixed(2)}</td>
                            <td>${budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}</td>
                            <td>
                                <button class="action-btn edit-btn" data-id="${budget._id}">Edit</button>
                                <button class="action-btn delete-btn" data-id="${budget._id}">Delete</button>
                            </td>
                        `;

                        tbody.appendChild(row);
                    });

                    // Add event listeners to edit and delete buttons
                    document.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.addEventListener('click', () => editBudget(btn.getAttribute('data-id')));
                    });

                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', () => deleteBudget(btn.getAttribute('data-id')));
                    });
                });
        });
}

function createBudget(budget) {
    fetch('/api/budgets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget)
    })
    .then(response => response.json())
    .then(() => {
        loadBudgets();
        loadDashboardData();
    });
}

function editBudget(id) {
    fetch(`/api/budgets/${id}`)
        .then(response => response.json())
        .then(budget => {
            document.getElementById('budget-form-title').textContent = 'Edit Budget';
            document.getElementById('budget-id').value = budget._id;
            document.getElementById('budget-category').value = budget.category;
            document.getElementById('budget-amount').value = budget.amount;
            document.getElementById('budget-period').value = budget.period;

            document.getElementById('budget-form').style.display = 'block';
        });
}

function updateBudget(id, budget) {
    fetch(`/api/budgets/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget)
    })
    .then(response => response.json())
    .then(() => {
        loadBudgets();
        loadDashboardData();
    });
}

function deleteBudget(id) {
    if (confirm('Are you sure you want to delete this budget?')) {
        fetch(`/api/budgets/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(() => {
            loadBudgets();
            loadDashboardData();
        });
    }
}
