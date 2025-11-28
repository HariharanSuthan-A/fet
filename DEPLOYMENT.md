# Deployment Guide

Deploy the Multi-User Google Services Platform to production.

## Table of Contents

1. [Vercel](#vercel)
2. [AWS Lambda](#aws-lambda)
3. [Docker](#docker)
4. [Self-Hosted](#self-hosted)
5. [Environment Setup](#environment-setup)
6. [Database Setup](#database-setup)
7. [Security Checklist](#security-checklist)

---

## Vercel

### Prerequisites

- GitHub account with code pushed
- Vercel account (free tier available)

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Click "Import"

### Step 2: Configure Environment Variables

In Vercel project settings, add:

```
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
TOKEN_STORAGE=mongodb
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/google-services
```

### Step 3: Deploy

Click "Deploy" - Vercel will automatically build and deploy.

### Step 4: Update Google OAuth

In Google Cloud Console:
1. Go to OAuth 2.0 credentials
2. Add redirect URI: `https://your-vercel-project.vercel.app/callback`
3. Update frontend with new domain

### Vercel-Specific Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## AWS Lambda

### Prerequisites

- AWS account
- AWS CLI installed
- Serverless Framework installed

```bash
npm install -g serverless
```

### Step 1: Create Serverless Configuration

Create `serverless.yml`:

```yaml
service: google-services-platform

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    MONGODB_URI: ${ssm:/google-services/mongodb-uri}
    CORS_ORIGIN: https://yourdomain.com

functions:
  api:
    handler: server.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-offline
  - serverless-plugin-tracing
```

### Step 2: Wrap Express App for Lambda

Create `lambda-handler.js`:

```javascript
import serverless from 'serverless-http';
import app from './server.js';

export const handler = serverless(app);
```

### Step 3: Deploy

```bash
serverless deploy
```

### Step 4: Get API Endpoint

After deployment, Vercel will show your API endpoint:

```
endpoints:
  ANY - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
```

Update Google OAuth redirect URI with this endpoint.

---

## Docker

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["npm", "start"]
```

### Step 2: Create Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URI: mongodb://mongo:27017/google-services
      CORS_ORIGIN: http://localhost:3000
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

### Step 3: Build and Run

```bash
# Build image
docker build -t google-services-platform .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://localhost:27017/google-services \
  google-services-platform

# Or use Docker Compose
docker-compose up -d
```

### Step 4: Push to Registry

```bash
# Tag image
docker tag google-services-platform:latest myregistry/google-services-platform:latest

# Push to Docker Hub
docker push myregistry/google-services-platform:latest
```

---

## Self-Hosted

### Prerequisites

- Linux server (Ubuntu 20.04+)
- Node.js 16+ installed
- MongoDB or PostgreSQL
- Nginx (optional, for reverse proxy)

### Step 1: SSH into Server

```bash
ssh user@your-server.com
```

### Step 2: Clone Repository

```bash
git clone https://github.com/yourusername/google-services-platform.git
cd google-services-platform
```

### Step 3: Install Dependencies

```bash
npm install --production
```

### Step 4: Configure Environment

```bash
cp .env.example .env
nano .env
```

Set production values:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/google-services
CORS_ORIGIN=https://yourdomain.com
```

### Step 5: Set Up PM2 (Process Manager)

```bash
npm install -g pm2

# Start application
pm2 start server.js --name "google-services"

# Configure auto-restart
pm2 startup
pm2 save
```

### Step 6: Set Up Nginx Reverse Proxy

Create `/etc/nginx/sites-available/google-services`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/google-services /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Set Up SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Environment Setup

### Production Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000

# Database
TOKEN_STORAGE=mongodb
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/google-services
# OR for PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/google_services

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Using AWS Secrets Manager

```bash
# Store secret
aws secretsmanager create-secret \
  --name google-services/mongodb-uri \
  --secret-string "mongodb+srv://user:password@cluster.mongodb.net/google-services"

# Reference in Lambda
${ssm:/google-services/mongodb-uri}
```

---

## Database Setup

### MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and cluster
3. Create database user
4. Get connection string
5. Add to `.env`:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/google-services
```

### PostgreSQL Setup

1. Create database:

```bash
createdb google_services
```

2. Create table:

```sql
CREATE TABLE user_tokens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  credentials JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_id ON user_tokens(user_id);
```

3. Update `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/google_services
```

---

## Security Checklist

### Before Deployment

- [ ] Remove all hardcoded credentials
- [ ] Set strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable logging and monitoring
- [ ] Review all environment variables
- [ ] Test error handling
- [ ] Implement input validation
- [ ] Set up backup strategy

### Runtime Security

- [ ] Use environment variables for all secrets
- [ ] Implement API authentication
- [ ] Add request logging
- [ ] Monitor error rates
- [ ] Set up alerts
- [ ] Regular security updates
- [ ] Implement token rotation
- [ ] Use HTTPS only
- [ ] Set security headers

### Example Security Headers

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Monitoring & Logging

### Application Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Health Monitoring

```bash
# Check server health
curl https://yourdomain.com/health

# Monitor logs
tail -f /var/log/google-services/combined.log
```

---

## Troubleshooting

### Server won't start

```bash
# Check logs
pm2 logs google-services

# Check port
lsof -i :3000

# Check environment
env | grep NODE_ENV
```

### Database connection failed

```bash
# Test MongoDB connection
mongosh "mongodb+srv://user:password@cluster.mongodb.net/google-services"

# Test PostgreSQL connection
psql postgresql://user:password@localhost:5432/google_services
```

### CORS errors

- Check `CORS_ORIGIN` environment variable
- Verify frontend domain is in the list
- Test with `curl -H "Origin: https://yourdomain.com"`

---

## Rollback

If deployment fails:

```bash
# Vercel
vercel rollback

# PM2
pm2 restart google-services

# Docker
docker rollback <previous-image>
```

---

## Next Steps

1. ✅ Deploy application
2. ✅ Set up database
3. ✅ Configure Google OAuth
4. ✅ Set up monitoring
5. Build frontend application
6. Set up CI/CD pipeline
7. Configure backups
8. Plan scaling strategy
