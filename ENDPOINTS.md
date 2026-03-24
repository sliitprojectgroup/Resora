# Resora Endpoints & Routes Directory

This document provides a quick reference to all available frontend UI pages and backend API endpoints for the Resora Academic Resource Borrowing System.

## 🖥️ Frontend Pages (React UI)
*(Assuming the frontend Vite server is running on `http://localhost:5173`)*

### Public Views
*(No layouts, bare entry points)*
- **Landing Page:** [http://localhost:5173/](http://localhost:5173/)

### Student Portal
*(Wraps views using `StudentLayout`)*
- **Student Dashboard:** [http://localhost:5173/student-dashboard](http://localhost:5173/student-dashboard)
- **Browse Resources (Placeholder):** [http://localhost:5173/browse](http://localhost:5173/browse)
- **My Requests (Placeholder):** [http://localhost:5173/my-requests](http://localhost:5173/my-requests)

### Admin Portal
*(Wraps views using `AdminLayout`)*
- **Admin Dashboard:** [http://localhost:5173/dashboard](http://localhost:5173/dashboard)
- **Pending Requests Tracker (Placeholder):** [http://localhost:5173/pending](http://localhost:5173/pending)
- **Overdue Items Tracker (Placeholder):** [http://localhost:5173/overdue](http://localhost:5173/overdue)
- **Resources Library (Placeholder):** [http://localhost:5173/resources](http://localhost:5173/resources)

---

## ⚙️ Backend API Endpoints (Node / Express)
*(Assuming your backend server is running on `http://localhost:3000`)*

### Borrow Requests (Phase 3 Core APIs)
1. **Get All Borrow Requests**
   - **Method:** `GET`
   - **URL:** `http://localhost:3000/api/requests`
   - **Returns:** Populated JSON array of all requests.

2. **Get Pending Requests (Filtered)**
   - **Method:** `GET` 
   - **URL:** `http://localhost:3000/api/requests?status=PENDING`
   - **Returns:** JSON array dynamically filtered by `status`.

3. **Create a Borrow Request**
   - **Method:** `POST`
   - **URL:** `http://localhost:3000/api/requests`
   - **Body (JSON):**
     ```json
     {
       "student": "USER_ID_HERE",
       "resource": "RESOURCE_ID_HERE",
       "dueDate": "2026-10-25"
     }
     ```
   - **Returns:** The created request JSON block with a system-default `PENDING` status.
