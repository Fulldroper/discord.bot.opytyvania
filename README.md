The purpose of this project is to create a Discord bot that facilitates easy surveys for server members.

## Project Benefits
This bot provides an efficient way to gather opinions and feedback from Discord server participants.

## Project Description
The bot is developed using Node.js and integrates with Discord's API to manage and conduct surveys within Discord servers. It can be customized to ask various types of questions and collect responses from users.

## Repository Link and Installation
[GitHub Repository](https://github.com/Fulldroper/discord.bot.opytyvania)

To install the bot:
1. Clone the repository:
   ```bash
   git clone https://github.com/Fulldroper/discord.bot.opytyvania.git
   ```
2. Navigate to the project directory:
   ```bash
   cd discord.bot.opytyvania
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the bot:
   ```bash
   node src/index.js
   ```

## Project Workflow and Code Snippets
### Initialization
The bot is initialized with necessary configurations:
```javascript
const Discord = require('discord.js');
const client = new Discord.Client();
client.login('your-bot-token');
```

### Listening for Commands
The bot listens for commands to start a survey:
```javascript
client.on('message', message => {
  if (message.content.startsWith('!survey')) {
    // Code to initiate survey
  }
});
```

### Collecting Responses
The bot collects and stores user responses:
```javascript
client.on('message', message => {
  if (message.content.startsWith('!answer')) {
    // Code to record answer
  }
});
```

## Skills Acquired
- Proficiency in Node.js and JavaScript.
- Understanding of Discord API integration.
- Experience with bot development and user interaction within Discord.
