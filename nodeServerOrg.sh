#!/bin/bash

# Update package lists
sudo apt update -y

# Install dependencies for NVM and Node.js
sudo apt install -y curl build-essential libssl-dev

# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Load NVM
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js v18 using NVM
nvm install 18
nvm use 18
nvm alias default 18

# Verify Node.js and npm installation
node -v
npm -v

# Install PM2 globally without sudo
npm install pm2 -g

# Install Google Chrome via official repository
# Add Google's public key
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -

# Set up the Google Chrome repository
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list

# Update package lists again
sudo apt update -y

# Install Google Chrome
sudo apt install -y google-chrome-stable

# Install dependencies for Puppeteer or Headless Chrome
sudo apt install -y \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libdrm2 libexpat1 libfontconfig1 \
    libgbm1 libglib2.0-0 libgtk-3-0 libnss3 libpango-1.0-0 \
    libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 \
    libxfixes3 libxrandr2 libxrender1 libxshmfence1

# Navigate to your application directory
cd /path/to/your/application

# Install application dependencies
npm install

# Start your application with PM2
pm2 start your_app.js --name "your_app_name"

# Save PM2 process list and configure PM2 to start on boot
pm2 save
pm2 startup systemd -u $USER --hp $HOME

echo "Setup completed successfully."
