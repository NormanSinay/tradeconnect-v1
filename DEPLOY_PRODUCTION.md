# Guía de Despliegue a Producción - TradeConnect v1.0.0

## 📋 Requisitos Previos

- Servidor Ubuntu 22.04 LTS
- Node.js 18+ instalado
- PostgreSQL 13+ instalado
- Redis 6+ instalado
- Nginx instalado
- Certificado SSL (Let's Encrypt recomendado)
- Dominio configurado apuntando al servidor

## 🚀 Pasos de Despliegue

### 1. Preparación del Servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar Redis
sudo apt install redis-server -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2

# Instalar Git
sudo apt install git -y

# Instalar build tools
sudo apt install build-essential -y
```

### 2. Configurar PostgreSQL

```bash
# Crear usuario y base de datos
sudo -u postgres psql

# Dentro de PostgreSQL:
CREATE USER tradeconnect_prod WITH PASSWORD 'tu_password_seguro_aqui';
CREATE DATABASE tradeconnect_prod OWNER tradeconnect_prod;
GRANT ALL PRIVILEGES ON DATABASE tradeconnect_prod TO tradeconnect_prod;
ALTER USER tradeconnect_prod CREATEDB;
\q

# Configurar PostgreSQL para conexiones externas (opcional)
sudo nano /etc/postgresql/13/main/pg_hba.conf
# Agregar línea: host    tradeconnect_prod    tradeconnect_prod    0.0.0.0/0    md5

sudo nano /etc/postgresql/13/main/postgresql.conf
# Cambiar: listen_addresses = '*'

sudo systemctl restart postgresql
```

### 3. Configurar Redis

```bash
# Configurar Redis para producción
sudo nano /etc/redis/redis.conf

# Cambiar configuración:
# bind 127.0.0.1 ::1
# requirepass tu_password_redis_seguro
# maxmemory 256mb
# maxmemory-policy allkeys-lru

sudo systemctl restart redis-server
```

### 4. Clonar y Configurar el Proyecto

```bash
# Crear directorio del proyecto
sudo mkdir -p /var/www/tradeconnect
sudo chown -R $USER:$USER /var/www/tradeconnect
cd /var/www/tradeconnect

# Clonar repositorio
git clone https://github.com/your-org/tradeconnect-v1.git .
git checkout main  # o la rama de producción

# Instalar dependencias del backend
cd backend
npm ci --production=false

# Instalar dependencias del frontend
cd ../frontend
npm ci --production=false
```

### 5. Configurar Variables de Entorno

```bash
# Backend .env
cd /var/www/tradeconnect/backend
cp .env.example .env.production

# Editar .env.production con valores de producción
nano .env.production

# Contenido mínimo requerido:
NODE_ENV=production
PORT=3000
BASE_URL=https://tu-dominio.com
API_BASE_URL=https://tu-dominio.com/api/v1

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tradeconnect_prod
DB_USER=tradeconnect_prod
DB_PASSWORD=tu_password_seguro_aqui

# Redis
REDIS_URL=redis://:tu_password_redis_seguro@localhost:6379

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_32_caracteres_minimo
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro
JWT_EXPIRES_IN=8h

# Pagos (configurar con credenciales reales)
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
STRIPE_SECRET_KEY=tu_stripe_secret_key
NEONET_API_KEY=tu_neonet_api_key
BAM_API_KEY=tu_bam_api_key
PAYMENT_ENCRYPTION_KEY=tu_clave_encriptacion_32_caracteres

# FEL (Facturación Electrónica Guatemala)
FEL_API_URL=https://fel.api.url
FEL_USERNAME=tu_fel_username
FEL_PASSWORD=tu_fel_password

# Email SMTP
SMTP_HOST=tu_smtp_host
SMTP_PORT=587
SMTP_USER=tu_email@dominio.com
SMTP_PASS=tu_password_email

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
TWILIO_PHONE_NUMBER=tu_numero_twilio

# Blockchain (Ethereum testnet para certificados)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/tu_infura_key
ETHEREUM_PRIVATE_KEY=tu_private_key_para_certificados
BLOCKCHAIN_CONTRACT_ADDRESS=tu_contract_address

# Configurar para usar .env.production
export NODE_ENV=production
```

### 6. Construir la Aplicación

```bash
# Construir backend
cd /var/www/tradeconnect/backend
npm run build

# Construir frontend
cd ../frontend
npm run build
```

### 7. Ejecutar Migraciones de Base de Datos

```bash
cd /var/www/tradeconnect/backend

# Ejecutar migraciones
npm run db:migrate

# Ejecutar seeders (opcional, solo datos iniciales)
npm run db:seed
```

### 8. Configurar PM2 para el Backend

```bash
cd /var/www/tradeconnect/backend

# Crear archivo de configuración PM2
nano ecosystem.config.js
```

Contenido de `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'tradeconnect-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/tradeconnect-backend-error.log',
    out_file: '/var/log/pm2/tradeconnect-backend-out.log',
    log_file: '/var/log/pm2/tradeconnect-backend.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    autorestart: true
  }]
};
```

```bash
# Crear directorio de logs
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Iniciar aplicación con PM2
pm2 start ecosystem.config.js --env production

# Configurar PM2 para iniciar automáticamente al reiniciar el servidor
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
pm2 save
```

### 9. Configurar Nginx

```bash
# Crear configuración de sitio
sudo nano /etc/nginx/sites-available/tradeconnect

# Contenido del archivo de configuración:
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # SSL configuration (configurar después con Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend (SPA)
    location / {
        root /var/www/tradeconnect/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # API timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support (para Socket.IO)
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/tradeconnect /etc/nginx/sites-enabled/

# Remover configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 10. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Crear enlace simbólico
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo certbot renew --dry-run
```

### 11. Configurar Firewall

```bash
# Configurar UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Verificar estado
sudo ufw status
```

### 12. Configurar Backups Automáticos

```bash
# Instalar herramientas de backup
sudo apt install postgresql-client -y

# Crear script de backup
sudo nano /usr/local/bin/backup-tradeconnect.sh

# Contenido del script:
#!/bin/bash

# Configuración
BACKUP_DIR="/var/backups/tradeconnect"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="tradeconnect_prod"
DB_USER="tradeconnect_prod"
DB_HOST="localhost"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de base de datos
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -f $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos de la aplicación
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/tradeconnect

# Backup de configuración
cp /var/www/tradeconnect/backend/.env.production $BACKUP_DIR/env_backup_$DATE

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_backup_*" -mtime +7 -delete

echo "Backup completado: $DATE"

# Configurar permisos
sudo chmod +x /usr/local/bin/backup-tradeconnect.sh

# Configurar cron para backup diario a las 2 AM
sudo crontab -e

# Agregar línea:
0 2 * * * /usr/local/bin/backup-tradeconnect.sh
```

### 13. Configurar Monitoreo

```bash
# Instalar htop para monitoreo básico
sudo apt install htop -y

# Configurar logrotate para logs de PM2
sudo nano /etc/logrotate.d/pm2

# Contenido:
/var/log/pm2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 14. Verificación Final

```bash
# Verificar servicios
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx

# Verificar PM2
pm2 status
pm2 logs tradeconnect-backend --lines 50

# Verificar conectividad
curl -I https://tu-dominio.com
curl -I https://tu-dominio.com/api/v1/health

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 15. Configuración de Webhooks de Pago

```bash
# Ejecutar script de configuración de webhooks
cd /var/www/tradeconnect
node scripts/setup-payment-webhooks.js
```

## 🔧 Comandos Útiles para Mantenimiento

```bash
# Reiniciar aplicación
pm2 restart tradeconnect-backend

# Ver logs en tiempo real
pm2 logs tradeconnect-backend --follow

# Verificar uso de recursos
htop

# Verificar base de datos
sudo -u postgres psql -d tradeconnect_prod -c "SELECT version();"

# Backup manual
/usr/local/bin/backup-tradeconnect.sh

# Actualizar aplicación
cd /var/www/tradeconnect
git pull origin main
cd backend && npm ci && npm run build
cd ../frontend && npm ci && npm run build
pm2 restart tradeconnect-backend
```

## 🚨 Solución de Problemas

### Problema: Error de conexión a base de datos
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT 1;"

# Verificar configuración en .env
cat /var/www/tradeconnect/backend/.env.production | grep DB_
```

### Problema: Error 502 Bad Gateway
```bash
# Verificar PM2
pm2 status
pm2 logs tradeconnect-backend --err

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Problema: Aplicación no responde
```bash
# Reiniciar servicios
pm2 restart tradeconnect-backend
sudo systemctl restart nginx

# Verificar puertos
netstat -tlnp | grep :3000
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

## 📊 Monitoreo Post-Despliegue

- **Health Check**: `GET https://tu-dominio.com/api/v1/health`
- **API Docs**: `https://tu-dominio.com/api/docs`
- **PM2 Monitoring**: `pm2 monit`
- **Nginx Logs**: `sudo tail -f /var/log/nginx/access.log`
- **Application Logs**: `pm2 logs tradeconnect-backend`

## 🔒 Consideraciones de Seguridad

1. **Cambiar contraseñas por defecto** en PostgreSQL y Redis
2. **Configurar firewall** para permitir solo puertos necesarios
3. **Mantener sistema actualizado** con `sudo apt update && sudo apt upgrade`
4. **Configurar fail2ban** para protección contra ataques de fuerza bruta
5. **Monitorear logs** regularmente para detectar actividades sospechosas
6. **Configurar backups off-site** para recuperación de desastres

---

**¡Despliegue completado!** Tu aplicación TradeConnect está ahora en producción en Ubuntu 22.04.