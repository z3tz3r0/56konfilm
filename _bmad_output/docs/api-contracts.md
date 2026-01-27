# API Contracts

This document outlines the API endpoints available in the 56konfilm project.

## Authentication API

All authentication routes are located under `/api/auth/`.

### Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates a user and sets a session cookie.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string",
    "rememberMe": "boolean (optional)"
  }
  ```
- **Responses:**
  - `200 OK`: Login successful.
  - `400 Bad Request`: Missing username or password.
  - `401 Unauthorized`: Invalid credentials.
  - `429 Too Many Requests`: Rate limit exceeded.
  - `500 Internal Server Error`: Generic error.

### Verify Session
- **Endpoint:** `GET /api/auth/verify`
- **Description:** Checks if the current session cookie is valid.
- **Responses:**
  - `200 OK`: Authenticated.
  - `401 Unauthorized`: Not authenticated or invalid token.

### Logout
- **Endpoint:** `POST /api/auth/logout`
- **Description:** Clears the session cookie.
- **Responses:**
  - `200 OK`: Logout successful.

### Change Password
- **Endpoint:** `POST /api/auth/change-password`
- **Description:** Updates the user's password in Sanity. Requires a valid session.
- **Request Body:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string",
    "confirmPassword": "string"
  }
  ```
- **Responses:**
  - `200 OK`: Password changed.
  - `400 Bad Request`: Validation errors (mismatch, weak password, etc.).
  - `401 Unauthorized`: Not authenticated or incorrect current password.
  - `429 Too Many Requests`: Rate limit exceeded.
