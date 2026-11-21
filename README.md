# SpendWise – Interactive Expense Tracker

A responsive browser-based expense tracker built with HTML5, CSS3 and vanilla JavaScript.

## Features
- Add expenses with a name, amount, category and date.
- Edit and delete existing expenses.
- Filter by category and month.
- Sort by date or amount.
- View total expenses, current-month spending and transaction count.
- View the total for the currently filtered list.
- Save data in browser LocalStorage, so it remains after refreshing.
- Responsive layout for mobile, tablet and desktop.
- Input validation and confirmation before clearing all expenses.

## Technologies
- HTML5
- CSS3
- JavaScript (DOM manipulation, events, arrays and objects)
- Browser LocalStorage
- Git and GitHub

## Run locally
1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. Add an expense using the form.

No npm packages or build tools are required.

## Project files
- `index.html` – page structure and form.
- `style.css` – responsive design and styling.
- `script.js` – expense operations, filters, totals and LocalStorage.

## Data storage
Expenses are stored in the browser under the LocalStorage key `spendwise_expenses_v1`. Data is stored locally in the current browser and is not synchronized between devices.

## Note
Clearing browser site data may remove saved expenses. The application is a learning project and does not connect to a bank account or payment service.
