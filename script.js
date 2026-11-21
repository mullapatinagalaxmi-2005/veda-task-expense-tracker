const STORAGE_KEY = "spendwise_expenses_v1";

const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expenseList");
const categoryFilter = document.getElementById("categoryFilter");
const dateFilter = document.getElementById("dateFilter");
const sortFilter = document.getElementById("sortFilter");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEdit");

const categoryIcons = {
  Food: "🍔", Transport: "🚕", Shopping: "🛍️", Bills: "💡",
  Health: "💊", Education: "📚", Entertainment: "🎬", Other: "📌"
};

let expenses = loadExpenses();
let editingId = null;

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(isValidExpense) : [];
  } catch {
    return [];
  }
}

function isValidExpense(item) {
  return item && typeof item.id === "string" &&
    typeof item.title === "string" && Number.isFinite(Number(item.amount)) &&
    Number(item.amount) > 0 && typeof item.date === "string";
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2
  }).format(value);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", isError);
}

function resetForm() {
  expenseForm.reset();
  dateInput.value = localDateString();
  editingId = null;
  submitButton.textContent = "＋ Add expense";
  cancelEditButton.classList.add("hidden");
  document.getElementById("formTitle").textContent = "Add an expense";
}

function renderSummary() {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const currentMonth = localDateString().slice(0, 7);
  const monthTotal = expenses
    .filter(expense => expense.date.slice(0, 7) === currentMonth)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  document.getElementById("totalAmount").textContent = money(total);
  document.getElementById("monthAmount").textContent = money(monthTotal);
  document.getElementById("expenseCount").textContent = expenses.length;
  document.getElementById("monthLabel").textContent =
    new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function getVisibleExpenses() {
  let visible = [...expenses];
  if (categoryFilter.value !== "All") {
    visible = visible.filter(item => item.category === categoryFilter.value);
  }
  if (dateFilter.value) {
    visible = visible.filter(item => item.date.startsWith(dateFilter.value));
  }

  switch (sortFilter.value) {
    case "oldest": visible.sort((a, b) => a.date.localeCompare(b.date)); break;
    case "high": visible.sort((a, b) => Number(b.amount) - Number(a.amount)); break;
    case "low": visible.sort((a, b) => Number(a.amount) - Number(b.amount)); break;
    default: visible.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }
  return visible;
}

function renderExpenses() {
  const visible = getVisibleExpenses();
  const visibleTotal = visible.reduce((sum, item) => sum + Number(item.amount), 0);

  document.getElementById("visibleCount").textContent =
    `Showing ${visible.length} expense${visible.length === 1 ? "" : "s"}`;
  document.getElementById("filteredTotal").textContent = money(visibleTotal);

  if (visible.length === 0) {
    expenseList.innerHTML = `<div class="empty-state">
      <div class="empty-icon">₹</div><h3>No expenses found</h3>
      <p>Try changing your filters or add a new expense.</p></div>`;
    return;
  }

  expenseList.innerHTML = visible.map(item => `
    <article class="expense-item">
      <div class="expense-main">
        <div class="category-icon">${categoryIcons[item.category] || "📌"}</div>
        <div style="min-width:0">
          <p class="expense-name" title="${escapeHTML(item.title)}">${escapeHTML(item.title)}</p>
          <p class="expense-meta">${escapeHTML(item.category)} · ${formatDate(item.date)}</p>
        </div>
      </div>
      <div class="expense-amount">${money(Number(item.amount))}</div>
      <div class="item-actions">
        <button class="icon-btn" type="button" data-action="edit" data-id="${item.id}" aria-label="Edit ${escapeHTML(item.title)}" title="Edit">✎</button>
        <button class="icon-btn delete" type="button" data-action="delete" data-id="${item.id}" aria-label="Delete ${escapeHTML(item.title)}" title="Delete">✕</button>
      </div>
    </article>`).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function render() {
  renderSummary();
  renderExpenses();
}

expenseForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title || title.length > 60) return showMessage("Enter an expense name (up to 60 characters).", true);
  if (!Number.isFinite(amount) || amount <= 0) return showMessage("Enter an amount greater than zero.", true);
  if (!date || date > localDateString()) return showMessage("Choose a valid date that is not in the future.", true);

  if (editingId) {
    expenses = expenses.map(item => item.id === editingId
      ? { ...item, title, amount, category, date } : item);
    showMessage("Expense updated successfully.");
  } else {
    expenses.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      title, amount, category, date, createdAt: Date.now()
    });
    showMessage("Expense added successfully.");
  }

  saveExpenses();
  resetForm();
  render();
});

expenseList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const expense = expenses.find(item => item.id === button.dataset.id);
  if (!expense) return;

  if (button.dataset.action === "edit") {
    editingId = expense.id;
    titleInput.value = expense.title;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;
    submitButton.textContent = "Save changes";
    cancelEditButton.classList.remove("hidden");
    document.getElementById("formTitle").textContent = "Edit expense";
    showMessage("Update the details and save your changes.");
    titleInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (button.dataset.action === "delete") {
    if (!window.confirm(`Delete "${expense.title}"?`)) return;
    expenses = expenses.filter(item => item.id !== expense.id);
    if (editingId === expense.id) resetForm();
    saveExpenses();
    render();
    showMessage("Expense deleted.");
  }
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
  showMessage("");
});

[categoryFilter, dateFilter, sortFilter].forEach(control =>
  control.addEventListener("change", renderExpenses)
);

document.getElementById("clearAll").addEventListener("click", () => {
  if (expenses.length === 0) {
    showMessage("There are no expenses to clear.", true);
    return;
  }
  document.getElementById("confirmDialog").showModal();
});

document.getElementById("confirmClear").addEventListener("click", event => {
  event.preventDefault();
  expenses = [];
  saveExpenses();
  resetForm();
  document.getElementById("confirmDialog").close();
  showMessage("All expenses have been cleared.");
  render();
});

document.getElementById("todayLabel").textContent =
  new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

dateInput.max = localDateString();
dateInput.value = localDateString();
render();
