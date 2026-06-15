# Quick Start — Deploy Hotel Management

## 1. แก้ไข config

### `deploy/inventory/hosts.ini`
```ini
[prod]
192.168.1.100 ansible_user=root ansible_ssh_private_key_file=~/.ssh/id_ed25519
```

### `deploy/group_vars/prod.yml`
```yaml
app_name: "hotel"
app_root: "/opt/hotel"
local_repo: "/home/bird/Desktop/Hotel_Management"   # path โปรเจกต์บนเครื่องคุณ
api_domain: "hotel.example.com"
ssl_email: "you@example.com"
api_port: 3000
```

## 2. เตรียมเซิร์ฟเวอร์

```bash
# Bun
curl -fsSL https://bun.sh/install | bash

# PostgreSQL, Nginx, certbot, rsync
sudo apt update
sudo apt install postgresql postgresql-contrib nginx certbot python3-certbot-nginx rsync

# Database
sudo -u postgres psql -c "CREATE DATABASE hotel_db;"
sudo -u postgres psql -c "CREATE USER hotel_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_user;"

# Directories
sudo mkdir -p /opt/hotel
```

## 3. Environment file

แก้ `deploy/group_vars/prod.yml`:

```yaml
app_env_source: "deploy/templates/env.production"
app_env_force: false
```

สร้างไฟล์ env บนเครื่อง local:

```bash
cp deploy/templates/env.example deploy/templates/env.production
nano deploy/templates/env.production
```

Ansible จะ copy ไป `/etc/hotel.env` ให้ตอน setup/deploy (ไม่ทับถ้า `app_env_force: false`)

## 4. Setup + Deploy

```bash
# ครั้งแรก — systemd + nginx + SSL
ansible-playbook -i deploy/inventory/hosts.ini deploy/playbooks/setup.yml

# Deploy แอป (build + upload + migrate + restart)
ansible-playbook -i deploy/inventory/hosts.ini deploy/playbooks/deploy.yml
```

## 5. ตรวจสอบ

```bash
sudo systemctl status hotel nginx
curl -s https://hotel.example.com/api/health
curl -sI https://hotel.example.com/
```

## 6. Rollback

```bash
./deploy/scripts/rollback.sh
```

## สรุป

1. แก้ `hosts.ini` + `group_vars/prod.yml`
2. สร้าง DB + `/etc/hotel.env`
3. `setup.yml` → `deploy.yml`
4. Login ด้วยบัญชี demo ได้ทันที (admin@admin.com / 123456)
