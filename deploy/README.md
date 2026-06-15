# Ansible Deployment — ລະບົບຈັດການໂຮງແຮມ

Deploy แบบ unified server ด้วย Bun:
- **Frontend**: React 19 + TanStack Router (build → `out/dist/`)
- **Backend**: ElysiaJS + Better Auth (compile → `out/server/main.js`)
- **Entry**: `index.ts` — serve SPA + `/api/*`
- **Database**: PostgreSQL + SQL migrations (รวม seed demo)

## Prerequisites

### เครื่อง local
- Ansible
- Bun (ใน PATH)
- rsync

### เซิร์ฟเวอร์
- Ubuntu/Debian
- Bun (`/root/.bun/bin/bun` หรือแก้ `bun_bin` ใน `group_vars/prod.yml`)
- PostgreSQL
- Nginx + certbot

## Setup ครั้งแรก

### 1. แก้ไขการตั้งค่า

**`deploy/inventory/hosts.ini`**
```ini
[prod]
your-server-ip ansible_user=root ansible_ssh_private_key_file=~/.ssh/id_ed25519
```

**`deploy/group_vars/prod.yml`** — แก้ `local_repo`, `api_domain`, `ssl_email` ตามจริง

### 2. สร้าง database

```bash
sudo -u postgres psql
CREATE DATABASE hotel_db;
CREATE USER hotel_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_user;
\q
```

### 3. ตั้งค่า env (copy อัตโนมัติผ่าน Ansible)

แก้ `deploy/group_vars/prod.yml`:

```yaml
# ไฟล์ env บนเครื่องคุณที่จะ copy ไปเซิร์ฟเวอร์
app_env_source: "deploy/templates/env.production"
app_env_dest: "/etc/hotel.env"
app_env_force: false   # true = overwrite ทุกครั้งที่ deploy
```

สร้างไฟล์ต้นทาง (เช่น copy จาก template):

```bash
cp deploy/templates/env.example deploy/templates/env.production
# แก้ค่าจริงใน env.production — อย่า commit secret ถ้าไม่ต้องการ
```

Ansible จะ copy ไป `app_env_dest` ตอน `setup.yml` และ `deploy.yml`  
(ถ้า `app_env_force: false` จะไม่ทับไฟล์ที่มีอยู่แล้วบนเซิร์ฟเวอร์)

### 4. Setup systemd + nginx + SSL

```bash
ansible-playbook -i deploy/inventory/hosts.ini deploy/playbooks/setup.yml --check
ansible-playbook -i deploy/inventory/hosts.ini deploy/playbooks/setup.yml
```

## Deploy

จาก root โปรเจกต์:

```bash
ansible-playbook -i deploy/inventory/hosts.ini deploy/playbooks/deploy.yml
```

Playbook จะ:
1. ตรวจ requirements (bun, rsync, `/etc/hotel.env`, PostgreSQL)
2. รัน `bun run build:all` บนเครื่อง local
3. อัปโหลด release (index.ts + dist + out/server)
4. สลับ symlink `current`
5. รัน SQL migrations (0000 RBAC/users + 0001 demo data)
6. restart `hotel`
7. ลบ release เก่า (เก็บ 5 ชุด)

## Rollback

```bash
export APP_NAME=hotel
export SERVER_ROOT=/opt/hotel
export API_SERVICE=hotel

./deploy/scripts/rollback.sh
```

## โครงสร้างบนเซิร์ฟเวอร์

```
/opt/hotel/
├── current -> releases/1739.../
├── releases/
│   └── 1739.../
│       ├── index.ts
│       ├── dist/              # frontend
│       └── out/server/main.js
└── shared/
    ├── migrations/            # *.sql
    └── uploads/
        └── avatars/
```

## Environment variables

ดู `deploy/templates/env.example` — ต้องมีอย่างน้อย:

| ตัวแปร | ตัวอย่าง |
|--------|----------|
| `DATABASE_URL` | `postgresql://hotel_user:...@localhost:5432/hotel_db` |
| `BETTER_AUTH_SECRET` | random secret |
| `BETTER_AUTH_BASE_URL` | `https://hotel.example.com` |
| `CORS_ORIGIN` | `https://hotel.example.com` |
| `PORT` | `3000` |

## Troubleshooting

```bash
sudo systemctl status hotel nginx
sudo journalctl -u hotel -f
curl -s https://hotel.example.com/api/health
```

### Migration แยก

```bash
ansible-playbook -i deploy/inventory/hosts.ini deploy/playbooks/migrate.yml
```

## บัญชี demo (หลัง migrate)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@admin.com | 123456 |
| Receptionist | receptionist@admin.com | 123456 |
| Housekeeping | housekeeping@admin.com | 123456 |
