# Library Management System

An enterprise-grade Library Management System built with .NET 8, Clean Architecture, and Blazor Web App.

## Features

- **Authentication (JWT) & Role-based Authorization:** Secure access for Admins, Librarians, and Members.
- **Branch Management:** Manage library branches.
- **Book Management:** Manage books across branches.
- **Member Management:** Manage library members.
- **Borrow & Return Management:** Track book loans and returns.
- **Reservation Queue:** Allow members to reserve books.
- **Reports:** Generate system reports.

## Architecture

This project follows the **Clean/Onion Architecture** pattern:

- **Domain:** Core business entities and rules.
- **Application:** Use cases, CQRS (MediatR), DTOs, and Validators (FluentValidation).
- **Infrastructure:** EF Core, Repositories, Database context (PostgreSQL).
- **Api:** RESTful backend API.
- **Web:** Responsive Web Application (Blazor).

## Technical Stack

- **Backend:** ASP.NET Core (.NET 8+)
- **ORM:** Entity Framework Core
- **Database:** PostgreSQL
- **Frontend:** Blazor Web App
- **Testing:** xUnit, Moq
- **Design Patterns:** CQRS, Repository, Dependency Injection

## Getting Started

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- PostgreSQL Server

### Setup Instructions

1. Clone the repository.
2. Update the database connection string in `appsettings.json` of the `LibraryManagementSystem.Api` project.
3. Run the database migrations to set up the schema.
4. Run the API and Web projects.

*(Detailed run instructions will be added as the implementation progresses)*
