# React CVE-2025-55182 Vulnerability Demonstration Project

## Overview

This project demonstrates CVE-2025-55182 (React2Shell), a critical RCE vulnerability in React Server Components 19.1.1. The application includes a single-page website with username/password authentication, deployable via Docker, along with a POC exploit payload.

## Project Structure

```
react-cve-demo/
├── package.json              # React 19.1.1 with react-server-dom-webpack
├── server.js                 # Custom React server with RSC support
├── src/
│   ├── App.jsx              # Main React component
│   ├── Login.jsx            # Login page component
│   ├── Dashboard.jsx        # Protected page component
│   └── server-components/   # Server Components
│       └── AuthServer.jsx   # Server-side auth logic
├── data/
│   └── users.json           # User credentials storage
├── Dockerfile               # Docker containerization
├── docker-compose.yml       # Optional: Docker Compose setup
├── .dockerignore
├── exploit/
│   └── poc.sh               # POC exploit curl command (or documented in README)
└── README.md                # Setup and usage instructions
```

## Implementation Details

### 1. Package Configuration ([package.json](package.json))

- React 19.1.1 (vulnerable version)
- react-server-dom-webpack (affected package)
- Express.js for HTTP server
- Node.js runtime dependencies

### 2. Server Setup ([server.js](server.js))

- Express server with RSC Flight protocol endpoint
- Serves React Server Components
- Handles authentication state
- Exposes Server Function endpoints (vulnerable to CVE-2025-55182)

### 3. Authentication System

- **Login Component** ([src/Login.jsx](src/Login.jsx)): Username/password form
- **Auth Server Component** ([src/server-components/AuthServer.jsx](src/server-components/AuthServer.jsx)): Server-side auth logic
- **User Storage** ([data/users.json](data/users.json)): JSON file with user credentials
- **Protected Route**: Dashboard page requires authentication

### 4. Docker Deployment

- **Dockerfile**: Multi-stage build with Node.js
- Exposes port 3000
- Includes vulnerable React 19.1.1 dependencies

### 5. POC Exploit ([exploit/poc.js](exploit/poc.js))

- Exploits unsafe deserialization in RSC Flight protocol
- Sends crafted HTTP request to Server Function endpoint
- Executes server-side code to create new user in `users.json`
- Allows bypassing login page with newly created credentials

## Technical Approach

The vulnerability exists in the RSC Flight protocol's deserialization mechanism. The exploit:

1. Crafts a malicious serialized payload targeting Server Function endpoints
2. Exploits unsafe deserialization to execute arbitrary JavaScript
3. Creates a new user entry in the JSON file
4. Bypasses authentication using the new credentials

## Security Considerations

- **Isolated Environment**: Run only in controlled, isolated environments
- **No Production Use**: Never deploy vulnerable code to production
- **Educational Purpose**: For security research and education only
- **Legal Compliance**: Ensure proper authorization before testing

## Dependencies

- Node.js 18+
- Docker (for containerization)
- React 19.1.1 (vulnerable version)
- react-server-dom-webpack (vulnerable package)
- Express.js

## Usage Flow

1. Build and run Docker container
2. Access application at http://localhost:3000
3. Attempt login (initially fails without valid credentials)
4. Run POC exploit script to create new user
5. Login with newly created credentials to demonstrate bypass