# Convert KNS Inventory to React.js Application
## Current State
A vanilla HTML/CSS/JS inventory management system with:
* Landing, sign-in, sign-up pages
* Admin portal: Dashboard, Inventory, Condition, Stock Movement, Requests, Reports, Users
* User portal: Dashboard, My Inventory, Submit Request, My Requests
* Client-side auth via localStorage/sessionStorage
* Two CSS files: root `style.css` (auth pages) and `admin/style.css` (dashboard layouts)
## Proposed React Structure
Use Vite + React for fast setup. Use React Router for navigation, React Context for auth state.
```warp-runnable-command
kns-inventory/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── logo.png
└── src/
    ├── main.jsx              # Entry point, renders <App />
    ├── App.jsx               # Routes definition
    ├── App.css               # Global styles (from root style.css)
    ├── context/
    │   └── AuthContext.jsx   # Auth provider (login, signup, logout, checkAuth)
    ├── components/
    │   ├── Sidebar.jsx       # Reusable sidebar (admin & user variants)
    │   └── ProtectedRoute.jsx# Auth guard wrapper
    ├── pages/
    │   ├── Landing.jsx       # index.html → landing page
    │   ├── SignIn.jsx        # signin.html
    │   ├── SignUp.jsx        # signup.html
    │   ├── admin/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── Inventory.jsx
    │   │   ├── Condition.jsx
    │   │   ├── StockMovement.jsx
    │   │   ├── Requests.jsx
    │   │   ├── Reports.jsx
    │   │   └── Users.jsx
    │   └── user/
    │       ├── UserDashboard.jsx
    │       ├── MyInventory.jsx
    │       ├── SubmitRequest.jsx
    │       └── MyRequests.jsx
    └── styles/
        ├── Auth.css           # Auth card styles (from root style.css)
        └── Dashboard.css      # Sidebar + dashboard styles (from admin/style.css)
```
## Key Conversion Decisions
* **Routing:** `react-router-dom` v6 with nested routes for admin/user layouts
* **Auth:** React Context + localStorage/sessionStorage (same logic, React-ified)
* **Sidebar:** Single `<Sidebar>` component that accepts `role` and `navItems` props
* **State:** `useState`/`useReducer` for local component state (inventory items, filters, modals)
* **CSS:** Keep existing CSS largely intact, imported as module-scoped files
* **No backend changes** — still localStorage-based
## Steps
1. Scaffold Vite + React project inside a new `kns-inventory/` folder
2. Copy assets (logo.png) and CSS files, adapt CSS for React imports
3. Create AuthContext with login/signup/logout/checkAuth
4. Create Sidebar and ProtectedRoute components
5. Build auth pages: Landing, SignIn, SignUp
6. Build admin pages: Dashboard, Inventory (with modal), Condition, StockMovement, Requests, Reports, Users (with multi-step modal)
7. Build user pages: Dashboard, MyInventory (with filter/export), SubmitRequest, MyRequests
8. Wire up App.jsx with all routes
9. Verify the app runs without errors
