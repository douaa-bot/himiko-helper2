🤖 Discord Helper Bot – Private Edition

A full-featured Discord helper bot with moderation tools, mini-games, and server utilities.

⚠️ This bot is private – unauthorized use or redistribution is strictly prohibited.

⚡ Features
✅ Moderation

Kick, Ban, Mute, Unmute, Warn

Temporary Jail/Timeout system

Role management (add/remove roles)

Auto-moderation (anti-spam, anti-link)

🎮 Mini-Games

Tic-Tac-Toe

Trivia quizzes

Dice roll & gambling commands

Fun interactions: hug, slap, poke

🛠 Utilities

Verification system (on join)

Custom commands

Welcome & Goodbye messages

Logging actions (moderation logs)

🛠 Installation

Requirements:

Node.js v18+

Discord Bot Token

FFmpeg (for audio commands if any)

Steps:

# Clone the repository
git clone <your-repo-link>
cd <your-repo-folder>

# Install dependencies
npm install

# Rename .env.example to .env and add your bot token
mv .env.example .env

# Start the bot
node .

⚙ Configuration

Edit .env and config.js to customize your bot:

DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_guild_id_here
PREFIX=!


config.js example:

module.exports = {
    botName: "HelperBot",
    defaultPrefix: "!",
    modRole: "Moderator",
    jailRole: "Jailed",
    gamesEnabled: true,
    loggingChannel: "logs",
};

📌 Usage

Moderation commands:

!kick @user – Kick a member

!ban @user – Ban a member

!mute @user [time] – Mute a member

!jail @user [time] – Temporarily restrict a member

Games & fun commands:

!tictactoe @user – Start a Tic-Tac-Toe game

!trivia – Answer trivia questions

!roll – Roll a dice

Utilities:

Automatic verification for new members

Welcome/Goodbye messages in specified channels

Logs all moderation actions to a dedicated channel

🔒 Private Notice

This bot is for personal use only

No one is allowed to use or share this bot without permission

Redistribution is strictly prohibited

🔧 Roadmap

Add more mini-games

Add leveling & XP system

Improve auto-moderation rules

Add dashboard for easier configuration

❤️ Credits

Developed by Himiko . All rights reserved.
