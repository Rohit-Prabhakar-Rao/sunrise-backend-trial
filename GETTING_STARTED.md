# Getting Started - Inventory Management System

This guide will help you start the Inventory Management System application from scratch.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Java 21** - [Download](https://adoptium.net/)
- **Node.js 18 or higher** - [Download](https://nodejs.org/)
- **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)

### Verify Installation

Open a terminal and run:

```bash
java -version
node -v
npm -v
mvn -v
docker --version
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Keycloak (Authentication Server)

```bash
cd backend
docker-compose up -d
```

**Wait 30-60 seconds** for Keycloak to fully start.

**Verify Keycloak is running:**
- Open browser: https://localhost:8443 or http://localhost:8090
- You should see the Keycloak login page

---

### Step 2: Start Backend API

In a **new terminal**:

```bash
cd backend
mvn spring-boot:run
```

**Wait for the message:** `Started application`

**Verify Backend is running:**
check through postman

---

### Step 3: Start Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

**Verify Frontend is running:**
- Open browser: http://localhost:8081
- You should see the login page

---

## 🔐 Login

1. Click **"Sign In with Corporate ID"**
2. You'll be redirected to Keycloak and from keycloak to ADFS login page
3. login with your corporate id and password
4. it will authenticate and redirect to inventory page
---

## 📂 Project Structure

```
inventory-management-system/
├── backend/              # Spring Boot API
│   ├── src/             # Java source code
│   ├── pom.xml          # Maven dependencies
│   └── docker-compose.yml  # Keycloak setup and mssql setup
│
└── frontend/            # React + Vite
    ├── src/             # React components
    ├── package.json     # NPM dependencies
    └── index.html       # Entry point
```

---

## 🛠️ Detailed Setup

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Start Keycloak (Docker):**
   ```bash
   docker-compose up -d
   ```

3. **Check Keycloak logs (optional):**
   ```bash
   docker-compose logs -f sunrise-auth
   ```

4. **Start Spring Boot API:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   **Alternative (if Maven is slow):**
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   - Open: http://localhost:8081

---

## 🔧 Configuration

### Backend Configuration

Located in: `backend/src/main/resources/application.yaml`

Key settings:
- **Database**: Connection details
- **Keycloak**: Authentication server URL
- **Server Port**: 8080

### Frontend Configuration

Located in: `frontend/src/lib/authConfig.ts`

Key settings:
- **Keycloak URL**: Points to authentication server
- **Client ID**: Application identifier
- **Redirect URI**: Where to return after login

---

## 🐛 Troubleshooting

### Keycloak won't start

**Problem:** Port 8443 or 8090 already in use

**Solution:**
```bash
# Stop existing containers
docker-compose down

# Check what's using the port
netstat -ano | findstr :8443

# Kill the process or change port in docker-compose.yml
```

### Backend fails to start

**Problem:** Database connection error

**Solution:**
1. Ensure database is running
2. Check `application.yaml` for correct database credentials

### Frontend shows blank page

**Problem:** API not reachable

**Solution:**
1. Verify backend is running on port 3000
2. Check browser console for errors (F12)
3. Ensure CORS is configured in backend

### "Access Denied" after login

**Problem:** User doesn't have required role

**Solution:**
1. Login to Keycloak Admin: https://localhost:8443
2. Go to Users → Find your user
3. Assign role: `inventory_viewer`

### Certificate warnings

**Problem:** Browser shows "Not Secure" warning

**Solution:**
- This is expected with self-signed certificates
- Click "Advanced" → "Proceed to localhost"
- For production, use proper SSL certificates

---

## 🔄 Stopping the Application

### Stop Frontend
Press `Ctrl + C` in the frontend terminal

### Stop Backend
Press `Ctrl + C` in the backend terminal

### Stop Keycloak
```bash
cd backend
docker-compose down
```

---

## 📦 Building for Production

### Backend
```bash
cd backend
mvn clean package
java -jar target/inventory-management-system-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

---

## 🌐 Accessing from Other Devices

See the **sharing_guide.md** for options like:
- ngrok (public URL)
- Local network sharing
- localtunnel

---

## 📞 Need Help?

Common issues:
- **Port conflicts**: Change ports in configuration files
- **Dependencies**: Run `npm install` or `mvn clean install`
- **Docker issues**: Restart Docker Desktop

---

## ✅ Checklist

Before asking for help, verify:

- [ ] Java 21 installed
- [ ] Node.js 18+ installed
- [ ] Docker Desktop running
- [ ] Keycloak accessible at https://localhost:8443
- [ ] Backend accessible at http://localhost:8080
- [ ] Frontend accessible at http://localhost:5173
- [ ] No port conflicts (8443, 8090, 8080, 5173)
- [ ] All dependencies installed (`npm install`, `mvn install`)

---
