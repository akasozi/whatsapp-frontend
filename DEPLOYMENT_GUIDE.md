# WhatsApp Platform Deployment Guide

## Server Information
- **Server**: EC2 (Amazon Linux 2023)
- **IP**: 34.238.150.72
- **Domain**: whatsapp01.cloudflow.co.ke
- **SSH**: `ssh -i /Users/akasozi/Downloads/taifa-god-server-key-pair.pem ec2-user@34.238.150.72`

## Directory Structure
```
/home/ec2-user/apps/
├── whatsapp-backend/    # FastAPI backend
└── whatsapp-frontend/   # Next.js frontend
```

## Database Configuration
- **Database**: whatsapp_db
- **User**: postgres
- **Password**: r00t
- **PostgreSQL Version**: 15.14
- **Extensions**: pgvector 0.8.1

## Backend Setup

### Dependencies
Created lightweight `requirements-production.txt` (without PyTorch):
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy[asyncio]==2.0.23
asyncpg==0.29.0
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
google-generativeai>=0.3.0  # For Gemini API
pgvector==0.2.5
gunicorn==21.2.0
APScheduler==3.10.4
```

### Virtual Environment
```bash
cd /home/ec2-user/apps/whatsapp-backend
python3.11 -m venv backend-env
source backend-env/bin/activate
pip install --no-cache-dir -r requirements-production.txt
```

### Systemd Service
**File**: `/etc/systemd/system/whatsapp-backend.service`
```ini
[Unit]
Description=WhatsApp Backend (FastAPI)
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/apps/whatsapp-backend
EnvironmentFile=/home/ec2-user/apps/whatsapp-backend/.env
ExecStart=/home/ec2-user/apps/whatsapp-backend/backend-env/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Frontend Setup

### Build
```bash
cd /home/ec2-user/apps/whatsapp-frontend
npm run build
```

### Systemd Service
**File**: `/etc/systemd/system/whatsapp-frontend.service`
```ini
[Unit]
Description=WhatsApp Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/apps/whatsapp-frontend
Environment="PATH=/home/ec2-user/.nvm/versions/node/v18.20.8/bin:/usr/local/bin:/usr/bin:/bin"
Environment="NODE_ENV=production"
EnvironmentFile=/home/ec2-user/apps/whatsapp-frontend/.env.local
ExecStart=/home/ec2-user/.nvm/versions/node/v18.20.8/bin/node /home/ec2-user/apps/whatsapp-frontend/node_modules/.bin/next start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## pgvector Installation

### Critical Fix
pgvector library must be in PostgreSQL's library path:
```bash
sudo cp /usr/lib64/pgsql/15/lib/vector.so /usr/lib64/pgsql/
```

### Enable Extension
```sql
PGPASSWORD=r00t psql -h localhost -U postgres -d whatsapp_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

## Nginx Configuration

**File**: `/etc/nginx/nginx.conf`

Key sections:
```nginx
# Frontend proxy (Next.js on port 3000)
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
}

# Backend API proxy
location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# WebSocket support
location /api/v1/ws/ {
    proxy_pass http://127.0.0.1:8000/api/v1/ws/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400;
}
```

## Service Management

### Start Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-backend whatsapp-frontend
sudo systemctl start whatsapp-backend whatsapp-frontend
sudo systemctl reload nginx
```

### Check Status
```bash
sudo systemctl status whatsapp-backend
sudo systemctl status whatsapp-frontend
```

### View Logs
```bash
sudo journalctl -u whatsapp-backend -f
sudo journalctl -u whatsapp-frontend -f
```

## Deployment Workflow

### Update Backend
```bash
cd /home/ec2-user/apps/whatsapp-backend
git pull origin main
source backend-env/bin/activate
pip install -r requirements-production.txt
sudo systemctl restart whatsapp-backend
```

### Update Frontend
```bash
cd /home/ec2-user/apps/whatsapp-frontend
git pull origin main
npm run build
sudo systemctl restart whatsapp-frontend
```

## TypeScript Fixes Applied

### Critical Type Corrections
1. **User role**: Changed from `string` to `'USER' | 'ADMIN'`
2. **Message types**: `message_type` and `source` use proper union types
3. **Document interface**: Added optional `metadata` field
4. **React Query v5**: Replaced `onSuccess`/`onError` with `useEffect`, changed `isLoading` to `isPending`

### Files Modified
- `src/lib/api.ts` - Fixed type definitions
- `src/types/index.ts` - Added metadata to Document
- `src/app/dashboard/page.tsx` - Fixed heroicons import
- `src/components/ui/MessageBubble.tsx` - Fixed message.id coercion
- `src/app/dashboard/ai-assistant/page.tsx` - React Query v5 migration
- `src/components/ai-assistant/AIAssistantChat.tsx` - React Query v5 migration

## GitHub Repositories
- **Backend**: https://github.com/akasozi/whatsapp-backend.git
- **Frontend**: https://github.com/akasozi/whatsapp-frontend.git

## Verification

### Health Checks
```bash
# Frontend
curl https://whatsapp01.cloudflow.co.ke/

# Backend
curl http://localhost:8000/

# PostgreSQL
PGPASSWORD=r00t psql -h localhost -U postgres -d whatsapp_db -c "SELECT version();"
```

## Common Issues

### pgvector Error
**Error**: `could not access file "$libdir/vector"`
**Fix**: Copy vector.so to `/usr/lib64/pgsql/`

### Frontend 503 Error
**Cause**: Node/npm not in PATH for systemd
**Fix**: Use absolute paths in ExecStart and set PATH environment variable

### Disk Space Issues
**Solution**: Removed PyTorch dependencies, use `--no-cache-dir` with pip, clean old backups

## Ports
- **Frontend**: 3000 (internal)
- **Backend**: 8000 (internal)
- **PostgreSQL**: 5432
- **Nginx**: 80 (redirect to 443), 443 (HTTPS)

## Environment Configuration

### Frontend (.env.local on EC2)
```bash
# IMPORTANT: Do NOT include /api suffix - the API client adds it automatically
NEXT_PUBLIC_API_URL=https://whatsapp01.cloudflow.co.ke
NEXT_PUBLIC_WS_URL=wss://whatsapp01.cloudflow.co.ke/api/v1/ws
NEXT_PUBLIC_APP_NAME=WhatsApp Chatbot Admin
```

**Important**: After changing environment variables, rebuild and restart:
```bash
cd /home/ec2-user/apps/whatsapp-frontend
npm run build
sudo systemctl restart whatsapp-frontend
```

## Admin Credentials
- **Email**: admin@admin.com
- **Password**: admin123
- **Login URL**: https://whatsapp01.cloudflow.co.ke/login

## Database Sync Commands

### Backup Local Database
```bash
PGPASSWORD=r00t pg_dump -h localhost -U postgres -d whatsapp_db -f /tmp/whatsapp_db_dump.sql
```

### Upload and Restore to EC2
```bash
# Upload dump
scp -i /Users/akasozi/Downloads/taifa-god-server-key-pair.pem /tmp/whatsapp_db_dump.sql ec2-user@34.238.150.72:/tmp/

# Stop backend, restore, restart
ssh -i /Users/akasozi/Downloads/taifa-god-server-key-pair.pem ec2-user@34.238.150.72 "
  sudo systemctl stop whatsapp-backend
  PGPASSWORD=r00t psql -h localhost -U postgres -d whatsapp_db -f /tmp/whatsapp_db_dump.sql
  sudo systemctl start whatsapp-backend
"
```

### Sync Uploads Directory
```bash
rsync -avz -e "ssh -i /Users/akasozi/Downloads/taifa-god-server-key-pair.pem" \
  /Users/akasozi/Code/whatsapp-platform/whatsapp-backend/uploads/ \
  ec2-user@34.238.150.72:/home/ec2-user/apps/whatsapp-backend/uploads/
```

## Attachment Feature

### Configuration
The backend needs `BACKEND_BASE_URL` configured to generate publicly accessible attachment URLs for Infobip:

```bash
# In /home/ec2-user/apps/whatsapp-backend/.env
BACKEND_BASE_URL=https://whatsapp01.cloudflow.co.ke
```

### How It Works
1. Admin uploads file via dashboard → stored in `uploads/attachments/`
2. Frontend gets attachment ID and metadata
3. Admin sends message with attachment
4. Backend constructs URL: `{BACKEND_BASE_URL}/api/v1/attachments/{id}/download`
5. Infobip fetches file from backend and delivers to WhatsApp user

### Supported File Types
- **Images**: jpeg, png, gif, webp
- **Documents**: pdf, doc, docx, txt, rtf
- **Audio**: mp3, wav, ogg, m4a
- **Video**: mp4, avi, mov

### File Size Limits
- Max upload size: 20MB
- Configured in `ATTACHMENT_MAX_SIZE_MB` setting
