# 🚀 SmaStama Feedback Hub: Deployment Guide

This guide explains how to deploy the SmaStama Feedback Hub using Docker. This is the recommended method for the school's device as it ensures everything works out-of-the-box.

---

## 📋 1. Prerequisites
Before you begin, ensure the target device has the following installed:
*   **Docker Desktop** (for Windows/Mac) or **Docker Engine** (for Linux).
    *   [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
*   **Git** (optional, to clone the project).

---

## ⚙️ 2. Configuration (Secrets)

Open the `docker-compose.yml` file in the root directory. You may want to update the following values for production:

### A. JWT Security Key
On line 25, replace the placeholder `SecretKeyMustBeVeryLongToBeSecure123!_Production_Value` with a long, random string. 
> **Note:** It must be at least 32 characters long.

### B. Azure Storage (Optional)
If you are using Azure Blob Storage for image uploads:
1.  Locate line 23: `ConnectionStrings__AzureBlobStorage=${AZURE_STORAGE_CONNECTION_STRING:-}`.
2.  You can either:
    *   Set an environment variable on the Windows machine named `AZURE_STORAGE_CONNECTION_STRING`.
    *   **OR** replace `${AZURE_STORAGE_CONNECTION_STRING:-}` with your actual connection string directly in the file (keep it inside quotes).

### C. Database Password
The current password is set to `smastama_dev_db_pass`. If you change it on line 9, you **must** also change it on line 22.

---

## 🚀 3. How to Launch

1.  Open **PowerShell** or **Command Prompt**.
2.  Navigate to the project folder:
    ```powershell
    cd path/to/SmaStamaFeedbackHub
    ```
3.  Run the following command to build and start the app:
    ```powershell
    docker-compose up -d --build
    ```

---

## 🌍 4. Accessing the Application

Once the command finishes, the app will be available at:

*   **User Interface (HTTPS)**: [https://localhost](https://localhost)
*   **User Interface (HTTP)**: [http://localhost:3000](http://localhost:3000)
*   **API Documentation (Backend)**: [http://localhost:8080/swagger](http://localhost:8080/swagger)

---

## 🔒 5. HTTPS Setup

The project is pre-configured to use HTTPS via a **Caddy** proxy. 
*   It automatically uses the certificates found in `frontend/certificates`.
*   If the school has their own domain name (e.g., `feedback.school.com`), they can simply change the `:443` in the `Caddyfile` to their domain name.

---

## 🛠️ 6. Common Commands

| Task | Command |
| :--- | :--- |
| **Stop the app** | `docker-compose stop` |
| **Start the app** | `docker-compose start` |
| **Shut down & delete containers** | `docker-compose down` |
| **View logs** | `docker-compose logs -f` |
| **Update after code changes** | `docker-compose up -d --build` |

---

## ❓ 7. Troubleshooting

*   **Port 443 already in use**: If another app is using HTTPS (port 443), you will need to stop that app or change the port in `docker-compose.yml`.
*   **Database not connecting**: Ensure the password in line 9 and line 22 match exactly.
*   **Files not uploading**: Ensure the Azure Storage connection string is valid.

