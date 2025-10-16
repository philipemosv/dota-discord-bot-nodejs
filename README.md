# Dota Discord Bot

A Discord bot built in Node.js + TypeScript that retrieves Dota 2 statistics, including win/loss records and detailed hero stats.  

The bot uses MongoDB (Docker or Atlas) to store user links and supports ephemeral responses with nicely formatted embeds.

---

## Features

- /link {steamId} – Link your Discord account to your Steam ID  
- /wl [period] – View your win/loss stats for a selected period  
- /stats [period] – View detailed hero win/loss stats  
- Ephemeral messages for privacy  
- Properly formatted Discord embeds  
- Secure JWT authentication for API requests  

---

## Tech Stack

- Node.js + TypeScript  
- Discord.js v14  
- MongoDB (Docker or Atlas)  
- Axios for API requests

---

## Setup

### 1. Clone the repository

git clone https://github.com/<your-username>/dota-discord-bot-nodejs.git
cd dota-discord-bot-nodejs

### 2. Install dependencies

npm install

### 3. Create .env file

Create a .env file in the project root:

MONGO_URI=mongodb://localhost:27017/dotabot
API_URL=http://localhost:3000
DISCORD_TOKEN=your_discord_bot_token
JWT_SECRET=your_jwt_secret
INTERNAL_API_TOKEN=your_internal_api_token

> Never commit .env to GitHub — it contains sensitive credentials.  

---

### 4. Run locally (for testing)

Make sure MongoDB is running (Docker or Atlas):

# Using Docker
docker run -d --name dota-mongo -p 27017:27017 -v mongo_data:/data/db mongo:latest

# Start the bot
npx ts-node src/index.ts

---

## Commands

| Command | Description |
|---------|-------------|
| /link {steamId} | Link Discord account to Steam ID |
| /wl [period] | Win/Loss stats for 0, 7, 15, or 30 days |
| /stats [period] | Detailed hero stats for selected period |

---

## Development Notes

- Uses TypeScript — compile with tsc or run via ts-node  
- Discord commands are deployed globally or to a specific guild using scripts/deploy-commands.ts  
- Ephemeral responses ensure privacy when showing stats  

---

## Contributing

1. Fork the repository  
2. Create a branch: git checkout -b feature/my-feature  
3. Commit changes: git commit -m "Add feature"  
4. Push to branch: git push origin feature/my-feature  
5. Open a Pull Request  

---
