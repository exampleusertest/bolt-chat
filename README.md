# Bolt Chat Application

A modern, real-time chat application built with React, WebSocket, and SQLite. This guide will help you set up the entire application on a Raspberry Pi.

## Features

- 🚀 Real-time messaging using WebSocket
- 🔐 Secure user authentication with JWT
- 💬 Direct messaging and channel-based communication
- 💾 Message history persistence using SQLite
- 📱 Responsive design for mobile and desktop
- 🌓 Dark/light theme support
- 🔄 Automatic reconnection handling
- 📨 Message delivery status
- 🎨 Modern, clean UI

## Prerequisites

Before starting, ensure you have:

- Raspberry Pi (3 or newer recommended)
- Raspbian OS installed and updated
- Internet connection
- Basic terminal knowledge

## Initial Raspberry Pi Setup

1. Update your Raspberry Pi:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Install required system dependencies:
   ```bash
   sudo apt install -y git curl sqlite3 build-essential
   ```

3. Install Node.js LTS:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. Verify installations:
   ```bash
   node --version
   npm --version
   sqlite3 --version
   ```

## Application Setup

1. Create application directory:
   ```bash
   mkdir -p ~/apps
   cd ~/apps
   ```

2. Clone the repository:
   ```bash
   git clone <your-repository-url> bolt-chat
   cd bolt-chat
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment configuration:
   ```bash
   cat > .env << EOL
   PORT=3000
   JWT_SECRET=$(openssl rand -base64 32)
   NODE_ENV=production
   EOL
   ```

5. Build the frontend:
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   npm run dev:server
   ```

2. In a separate terminal, start the frontend:
   ```bash
   npm run dev
   ```

### Production Mode

1. Install PM2 for process management:
   ```bash
   sudo npm install -g pm2
   ```

2. Create PM2 ecosystem file:
   ```bash
   cat > ecosystem.config.js << EOL
   module.exports = {
     apps: [{
       name: 'bolt-chat',
       script: 'server/index.js',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G'
     }]
   }
   EOL
   ```

3. Start the application:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. Enable startup on boot:
   ```bash
   pm2 startup
   pm2 save
   ```

## Accessing the Application

- Local network: \`http://<raspberry-pi-ip>:3000\`
- Internet access: Set up port forwarding on your router or use a reverse proxy

## Security Setup

1. Set up UFW firewall:
   ```bash
   sudo apt install ufw
   sudo ufw allow ssh
   sudo ufw allow 3000
   sudo ufw enable
   ```

2. Enable HTTPS (recommended for production):
   ```bash
   # Install Certbot
   sudo apt install certbot
   
   # Get SSL certificate (replace with your domain)
   sudo certbot certonly --standalone -d your-domain.com
   ```

3. Regular maintenance:
   ```bash
   # Update dependencies
   npm audit fix
   
   # Backup database (run daily via cron)
   sqlite3 chat.db ".backup '/backup/chat-$(date +%Y%m%d).db'"
   ```

## Database Management

1. Backup database:
   ```bash
   # Create backup directory
   mkdir -p ~/backups
   
   # Backup database
   sqlite3 chat.db ".backup '~/backups/chat-$(date +%Y%m%d).db'"
   ```

2. Restore from backup:
   ```bash
   sqlite3 chat.db ".restore '~/backups/chat-20240301.db'"
   ```

## Monitoring

1. View application logs:
   ```bash
   pm2 logs bolt-chat
   ```

2. Monitor system resources:
   ```bash
   pm2 monit
   ```

3. View application status:
   ```bash
   pm2 status
   ```

## Troubleshooting

1. If the application won't start:
   - Check logs: \`pm2 logs\`
   - Verify port availability: \`sudo lsof -i :3000\`
   - Check disk space: \`df -h\`

2. If WebSocket connections fail:
   - Check firewall settings
   - Verify correct IP/domain in frontend configuration
   - Check network connectivity

3. Database issues:
   - Check file permissions
   - Verify SQLite installation
   - Check disk space for database

## Updating the Application

1. Pull latest changes:
   ```bash
   cd ~/apps/bolt-chat
   git pull
   ```

2. Update dependencies:
   ```bash
   npm install
   ```

3. Rebuild frontend:
   ```bash
   npm run build
   ```

4. Restart application:
   ```bash
   pm2 restart bolt-chat
   ```

## Best Practices

1. Security:
   - Regularly update system and dependencies
   - Use strong JWT secrets
   - Enable HTTPS in production
   - Implement rate limiting
   - Regular database backups

2. Performance:
   - Monitor memory usage
   - Implement message pagination
   - Regular database maintenance
   - Cache frequently accessed data

3. Maintenance:
   - Schedule regular backups
   - Monitor disk space
   - Keep logs rotated
   - Regular security updates

## License

MIT

## Support

For issues and feature requests, please create an issue in the repository.