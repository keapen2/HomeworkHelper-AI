# Deployment Guide

This guide covers deploying the Homework Helper AI application to production.

## Prerequisites

- AWS Account with EC2, S3, and CloudFront access
- Domain name (optional but recommended)
- MongoDB Atlas account
- OpenAI API key
- Firebase project setup

## Environment Setup

### 1. AWS EC2 Instance

Launch an EC2 instance with:
- **Instance Type**: t3.medium or larger
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 20GB+ SSD
- **Security Groups**: 
  - SSH (22) from your IP
  - HTTP (80) from anywhere
  - HTTPS (443) from anywhere

### 2. Domain Configuration

1. Point your domain to the EC2 instance IP
2. Create subdomains:
   - `api.yourdomain.com` → Backend API
   - `admin.yourdomain.com` → Admin Dashboard
   - `app.yourdomain.com` → Mobile app API

### 3. Environment Variables

Create `.env` files in each workspace:

#### Server (.env)
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/homework-helper?retryWrites=true&w=majority

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Firebase Admin
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://admin.yourdomain.com,https://app.yourdomain.com

# AWS
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=homework-helper-uploads
```

#### Mobile (.env)
```bash
API_BASE_URL=https://api.yourdomain.com
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-firebase-project-id
```

#### Admin (.env)
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

1. **Setup GitHub Secrets**:
   ```
   EC2_HOST=your-ec2-ip
   EC2_USERNAME=ubuntu
   EC2_SSH_KEY=your-private-ssh-key
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   S3_BUCKET_NAME=your-s3-bucket
   CLOUDFRONT_DISTRIBUTION_ID=your-cloudfront-id
   ```

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **Monitor deployment** in GitHub Actions tab

### Method 2: Manual Deployment

1. **Connect to EC2**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Run deployment script**:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/your-repo/HomeworkHelper-AI/main/deploy.sh | bash
   ```

3. **Configure environment**:
   ```bash
   cd /home/ubuntu/homework-helper-ai
   cp server/env.example server/.env
   # Edit .env with your values
   ```

4. **Start services**:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

### Method 3: Docker Deployment

1. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker ubuntu
   ```

2. **Deploy with Docker Compose**:
   ```bash
   git clone https://github.com/your-repo/HomeworkHelper-AI.git
   cd HomeworkHelper-AI
   cp .env.example .env
   # Edit .env with your values
   docker-compose up -d
   ```

## SSL Certificate Setup

### Using Let's Encrypt (Free)

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

3. **Auto-renewal**:
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Using AWS Certificate Manager

1. Request certificate in AWS Console
2. Validate domain ownership
3. Configure CloudFront distribution
4. Update DNS records

## Database Setup

### MongoDB Atlas

1. **Create cluster** in MongoDB Atlas
2. **Whitelist EC2 IP** in Network Access
3. **Create database user** with read/write permissions
4. **Update connection string** in environment variables

### Local MongoDB (Development)

```bash
# Install MongoDB
sudo apt install mongodb

# Start service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Monitoring & Maintenance

### Health Checks

- **API Health**: `https://api.yourdomain.com/health`
- **Admin Dashboard**: `https://admin.yourdomain.com`
- **PM2 Status**: `pm2 status`

### Logs

```bash
# Application logs
pm2 logs homework-helper-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### Updates

```bash
# Update application
cd /home/ubuntu/homework-helper-ai
git pull origin main
npm run install:all
npm run build
pm2 restart homework-helper-api
```

### Backup

```bash
# Database backup
mongodump --uri="your-mongodb-uri" --out=backup-$(date +%Y%m%d)

# Application backup
tar -czf homework-helper-backup-$(date +%Y%m%d).tar.gz /home/ubuntu/homework-helper-ai
```

## Security Checklist

- [ ] SSL certificates installed and auto-renewing
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Regular security updates

## Troubleshooting

### Common Issues

1. **Port 80/443 not accessible**:
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw reload
   ```

2. **PM2 not starting**:
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js --env production
   ```

3. **Database connection failed**:
   - Check MongoDB Atlas IP whitelist
   - Verify connection string
   - Check network connectivity

4. **SSL certificate issues**:
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

### Performance Optimization

1. **Enable gzip compression** in nginx
2. **Setup Redis caching** for API responses
3. **Configure CDN** for static assets
4. **Monitor resource usage** with `htop`
5. **Setup log rotation** to prevent disk space issues

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use AWS Application Load Balancer
2. **Multiple EC2 instances**: Deploy across multiple zones
3. **Database clustering**: MongoDB Atlas cluster
4. **CDN**: CloudFront for global distribution

### Vertical Scaling

1. **Upgrade EC2 instance**: t3.medium → t3.large → t3.xlarge
2. **Increase storage**: Add EBS volumes as needed
3. **Memory optimization**: Tune Node.js heap size
4. **Database optimization**: Index optimization, query analysis

## Cost Optimization

- Use **t3.medium** for development
- **Reserved instances** for production
- **S3 Intelligent Tiering** for file storage
- **CloudFront** for global CDN
- **MongoDB Atlas M10** for production database

## Support

For deployment issues:
1. Check logs: `pm2 logs homework-helper-api`
2. Verify environment variables
3. Test database connectivity
4. Check SSL certificate status
5. Review security group settings
