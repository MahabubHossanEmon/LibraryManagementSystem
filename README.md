# 📚 Enterprise Library Management System

A production-ready, enterprise-grade Library Management System built with **.NET Core (C#)** following **Clean Architecture (Onion Architecture)**, **CQRS with MediatR**, **EF Core**, **FluentValidation**, and a modern **Next.js / React** responsive web frontend.

---

## 🚀 System Architecture & Technology Stack

### Backend Technologies
* **Framework:** ASP.NET Core Web API (.NET 10 / .NET 8+)
* **Architecture:** Clean Architecture (Onion Architecture), SOLID Principles
* **Patterns:** CQRS (MediatR), Repository Pattern (`IRepository<T>`), Factory, Strategy
* **Database & ORM:** Entity Framework Core with PostgreSQL / SQL Server / In-Memory Support
* **Validation:** FluentValidation pipeline behaviors
* **Security & Auth:** JWT Bearer Authentication, BCrypt Password Hashing, Claims & Role-based Authorization (`Admin`, `Librarian`, `Member`)
* **Error Handling:** Centralized `GlobalExceptionMiddleware` mapping custom domain/validation exceptions to RFC-7807 problem details JSON
* **Testing:** xUnit Unit Testing Framework

### Frontend Technologies
* **Framework:** Next.js (App Router), React, TypeScript
* **Styling:** Tailwind CSS, Lucide Icons, Custom Glassmorphism Theme, Dark Mode
* **State & Auth:** React Context (`AuthContext`), persistent JWT token management
* **UI Components:** Dynamic Navigation Sidebar, Interactive Notification Popover with toggleable expanded messages, Custom Glassmorphism Delete Confirmation Dialogs

---

## 📁 Repository Project Structure

```
LibraryManagementSystem/
├── LibraryManagementSystem.Api/             # REST API Controllers, Middleware, Swagger
├── LibraryManagementSystem.Application/     # CQRS Commands/Queries, MediatR Handlers, DTOs, FluentValidation
├── LibraryManagementSystem.Domain/          # Core Domain Entities, Enums, Interfaces
├── LibraryManagementSystem.Infrastructure/  # EF Core ApplicationDbContext, Entity Configurations, Repositories
├── LibraryManagementSystem.Tests/           # xUnit Automated Unit Test Suite
├── frontend/                                # Next.js React Web Application
│   ├── src/app/                             # App Router Pages (Books, Branches, Borrows, Reservations, Members, Reports)
│   ├── src/components/                      # UI Components (AppShell, Navbar, Sidebar, ConfirmModal, NotificationDropdown)
│   └── src/lib/                             # API Client, Auth Context, Types
├── LibraryManagementSystem.slnx             # .NET Solution File
└── README.md                                # Comprehensive Project Documentation
```

---

## ⚙️ Environment Configuration

### Backend Setup (`LibraryManagementSystem.Api/appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=LibraryDb;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Secret": "SUPER_SECRET_KEY_LIBRARY_MANAGEMENT_SYSTEM_ENTERPRISE_JWT_TOKEN_KEY_2026!",
    "Issuer": "LibraryManagementSystem",
    "Audience": "LibraryManagementSystemUsers",
    "ExpiryMinutes": 1440
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Frontend Setup (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5072/api
```

---

## 💡 Assumptions & Design Decisions

1. **Role Access Control (RBAC)**:
   * **Admin & Librarian**: Full administrative privileges across all modules including Branch Creation/Deletion, Book Inventory Management, Member Role Modification, and System Circulation Reports.
   * **Member**: Read-only access to Book Catalog and Branches, with self-service capabilities to Borrow books, manage personal hold queues, and view active borrowing records.

2. **Cascade Delete & Data Integrity**:
   * Entities are configured with `DeleteBehavior.Cascade` in EF Core mappings to ensure clean deletion of books or branches without throwing foreign key constraint violations (`DbUpdateException`).
   * Command handlers explicitly execute dependent record cleanup (borrow records, reservation hold queues) prior to entity removal.

3. **Resilient Fallback Mode**:
   * The frontend web portal includes fallback mock data initialization when running in offline/demo modes, guaranteeing smooth UI rendering even before initial database migrations.

4. **CQRS & MediatR Decoupling**:
   * All API controllers are thin delegation wrappers over MediatR `IMediator`. Business logic, entity mutations, and validation rules reside exclusively in the Application layer.

---

## 🛠️ Setup & Execution Instructions

### Prerequisites
* [.NET 8.0 SDK](https://dotnet.microsoft.com/download) or higher
* [Node.js](https://nodejs.org/) (v18.0+) & npm
* PostgreSQL (Optional, or EF Core In-Memory for local testing)

---

### Step 1: Clone & Restore Dependencies

```bash
# Clone the repository
git clone https://github.com/MahabubHossanEmon/LibraryManagementSystem.git
cd LibraryManagementSystem

# Restore .NET packages
dotnet restore

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 2: Running the Backend API

```bash
# Run backend REST API from root directory
dotnet run --project LibraryManagementSystem.Api
```
The API server will launch at:
* **Swagger API UI:** `http://localhost:5072/swagger`
* **Base Endpoint:** `http://localhost:5072/api`

---

### Step 3: Running the Frontend Web Application

```bash
cd frontend
npm run dev
```
The web application will launch at:
* **Web App Portal:** `http://localhost:3000`

---

### Step 4: Running Unit Tests

```bash
# Execute xUnit test suite from root directory
dotnet test
```

Expected Output:
```
Passed!  - Failed: 0, Passed: 10, Skipped: 0, Total: 10, Duration: 440 ms
```

---

## 🧪 Included Unit Test Coverage

The test suite in `LibraryManagementSystem.Tests` verifies core domain business rules:
* **Authentication Tests**: Valid user registration, duplicate email prevention, password hashing & verification.
* **Book & Stock Tests**: Book creation, copy availability tracking, stock updates.
* **Borrowing Tests**: Validating loan eligibility, copy decrement upon borrowing, due date calculation, return processing.

---

## 📝 License
This project is licensed under the MIT License.
