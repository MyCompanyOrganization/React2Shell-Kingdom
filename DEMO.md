# CVE-2025-55182 Demo - Quick Reference

## Setup Complete! ✅

**What changed:**
- `users.json` now stored **inside the container** (not mounted from host)
- Resets automatically on `docker compose down && up`
- Professional UI styled as "Reactland National Intelligence Agency"

## Demo Flow

### 1. Reset Environment
```bash
./reset-demo.sh
```
This restarts the container with fresh users (only admin & user1).

### 2. Show the Reactland Portal
```bash
open http://localhost:3000
```
- Professional government portal UI
- Try logging in with wrong credentials → fails
- Show the classified operations and field agents (but can't access without login)

### 3. Run the Exploit
```bash
./exploit/poc.sh
```
This creates a new admin user: `hacker / pwned123`

Or use the one-liner with custom credentials:
```bash
./exploit/poc-oneline.sh http://localhost:3000 attacker mypassword
```

### 4. Demonstrate Unauthorized Access
```bash
open http://localhost:3000
```
- Login with: `hacker / pwned123`
- You now have access to TOP SECRET classified data!
- Show: Operation Silent Thunder, Project Midnight Sun, etc.
- Show: Field agents in Moscow, Beijing, Tehran, Pyongyang

### 5. Reset for Next Demo
```bash
./reset-demo.sh
```

## Key Files

- **`server.js`** - Vulnerable server with CVE-2025-55182
- **`exploit/poc.sh`** - Main exploit script (verbose)
- **`exploit/poc-oneline.sh`** - One-liner version (customizable)
- **`reset-demo.sh`** - Reset environment to clean state
- **`docker-compose.yml`** - No volumes = resets on restart

## How the Exploit Works

The vulnerability exists in React Server Components' Flight protocol deserialization.

**Vulnerable Code Path:**
```javascript
// server.js receives JSON payload with _response._prefix
{
  "_response": {
    "_prefix": "const fs=require('fs'); /* malicious code */"
  }
}

// Server unsafely evaluates the code:
eval(codeToExecute);  // RCE!
```

**What the exploit does:**
1. Sends crafted JSON to `/rsc` endpoint
2. Server deserializes without validation
3. Executes arbitrary JavaScript on server
4. Creates new admin user in `users.json`
5. Attacker logs in with new credentials

## Default Credentials

- **admin** / securepassword123 (admin role)
- **user1** / password123 (user role)

## Important Notes

- Container must be stopped/started (not just restarted) to reset
- `docker restart` keeps the filesystem changes
- `docker compose down && up` rebuilds from image (resets everything)
- The exploit works because server uses `eval()` on untrusted input

## Reference

- **CVE-2025-55182** - CVSS 10.0 (Critical)
- **Affected:** React Server Components 19.0, 19.1.0, 19.1.1, 19.2.0
- **Article:** https://www.offsec.com/blog/cve-2025-55182/

