# WARNING: This Dockerfile contains a known vulnerability (CVE-2025-55182)
# For educational and security research purposes only.
# DO NOT use in production or expose to untrusted networks.

FROM node:19-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create data directory and initialize users.json with proper formatting
RUN mkdir -p data && \
    printf '{\n  "users": [\n    {\n      "username": "admin",\n      "password": "securepassword123",\n      "role": "admin"\n    },\n    {\n      "username": "user1",\n      "password": "password123",\n      "role": "user"\n    }\n  ]\n}\n' > data/users.json

# Expose port
EXPOSE 3000

# Security warning
RUN echo "⚠️  WARNING: This container contains CVE-2025-55182 vulnerability" && \
    echo "⚠️  For educational purposes only - DO NOT use in production"

# Start server with react-server condition
CMD ["node", "--conditions", "react-server", "server.js"]

