#!/bin/bash

# Homework Helper AI Deployment Script
# This script sets up the production environment on AWS EC2

set -e

echo "🚀 Starting Homework Helper AI deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install nginx
echo "📦 Installing nginx..."
sudo apt install -y nginx

# Install certbot for SSL
echo "📦 Installing certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /home/ubuntu/homework-helper-ai
sudo chown -R ubuntu:ubuntu /home/ubuntu/homework-helper-ai

# Clone repository (if not already present)
if [ ! -d "/home/ubuntu/homework-helper-ai/.git" ]; then
    echo "📥 Cloning repository..."
    cd /home/ubuntu
    git clone https://github.com/your-username/HomeworkHelper-AI.git homework-helper-ai
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd /home/ubuntu/homework-helper-ai
npm run install:all

# Build applications
echo "🔨 Building applications..."
npm run build

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p /home/ubuntu/homework-helper-ai/server/logs

# Setup environment variables
echo "⚙️ Setting up environment variables..."
if [ ! -f "/home/ubuntu/homework-helper-ai/server/.env" ]; then
    echo "⚠️  Please create .env file with production environment variables"
    echo "Copy server/env.example to server/.env and fill in the values"
fi

# Configure nginx
echo "🌐 Configuring nginx..."
sudo tee /etc/nginx/sites-available/homework-helper-ai > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000;
    }

    # Admin dashboard (served from S3/CloudFront)
    location /admin {
        return 301 https://admin.your-domain.com\$request_uri;
    }

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration (will be set up by certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000;
    }

    # Admin dashboard redirect
    location /admin {
        return 301 https://admin.your-domain.com\$request_uri;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/homework-helper-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
sudo nginx -t

# Start nginx
echo "🌐 Starting nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# Setup PM2 startup script
echo "⚙️ Setting up PM2 startup script..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Start the application with PM2
echo "🚀 Starting application with PM2..."
cd /home/ubuntu/homework-helper-ai/server
pm2 start ecosystem.config.js --env production
pm2 save

# Setup log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/homework-helper-ai > /dev/null <<EOF
/home/ubuntu/homework-helper-ai/server/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Setup monitoring
echo "📊 Setting up monitoring..."
sudo apt install -y htop iotop nethogs

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your domain DNS to point to this server's IP"
echo "2. Run: sudo certbot --nginx -d your-domain.com"
echo "3. Configure your .env file with production values"
echo "4. Restart the application: pm2 restart homework-helper-api"
echo ""
echo "🔍 Useful commands:"
echo "- View logs: pm2 logs homework-helper-api"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart homework-helper-api"
echo "- Status: pm2 status"
