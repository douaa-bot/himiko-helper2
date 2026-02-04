const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
} = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const {
  token,
  mongoURI,
  prefix,
  clientId,
} = require('./utils/config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildWebhooks,
  ],
  partials: [Partials.User, Partials.Channel, Partials.Message],
});

client.once('ready', async () => {
    const commands = await client.application.commands.fetch();

    console.log('--- Slash Commands & IDs ---');
    commands.forEach(command => {
        console.log(`</${command.name}:${command.id}>`);
    });
});

module.exports = client;

client.prefixCommands = new Collection();
client.slashCommands = new Collection();
client.cooldowns = new Map();
const prefixFolders = fs.readdirSync('./commands').filter(folder => 
  fs.statSync(`./commands/${folder}`).isDirectory()
);

const prefixFiles = prefixFolders.flatMap(folder => 
  fs.readdirSync(`./commands/${folder}`)
    .filter(f => f.endsWith('.js'))
    .map(file => `./commands/${folder}/${file}`)
);

for (const file of prefixFiles) {
  const command = require(path.resolve(file));
  client.prefixCommands.set(command.name, command);
  if (command.aliases) {
    for (const alias of command.aliases) {
      client.prefixCommands.set(alias, command);
    }
  }
}

const slashFiles = fs.readdirSync('./slashCommands').filter(f => f.endsWith('.js'));
for (const file of slashFiles) {
  const command = require(`./slashCommands/${file}`);
  client.slashCommands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Database connected successfully!');
}).catch(err => {
  console.error('Error connecting to database:', err);
});

const schemas = require('./models/schemas');

client.saveSettings = async (guildId, field, value) => {
  try {
    await schemas.GuildConfig.findOneAndUpdate(
      { guildId },
      { [field]: value },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Error saving settings:', err);
  }
};

client.getSettings = async (guildId) => {
  try {
    const settings = await schemas.GuildConfig.findOne({ guildId });
    return settings || {};
  } catch (err) {
    console.error('Error fetching settings:', err);
    return {};
  }
};

client.on('guildMemberAdd', async (member) => {
  const settings = await client.getSettings(member.guild.id);

  if (settings?.antiBot === 1 && member.user.bot) {
    try {
      await member.kick('Anti-bot system enabled.');
    } catch (err) {
      console.error('Error kicking bot:', err);
    }
  }

  const roleId = settings?.autoRole;
  if (roleId) {
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
      try {
        await member.roles.add(role);
      } catch (err) {
        console.error('Error adding auto role:', err);
      }
    }
  }
});

client.on('webhookCreate', async (webhook) => {
  const settings = await client.getSettings(webhook.guild.id);
  if (
    settings?.antiWebhook === 1 &&
    webhook.guild.members.me.permissions.has("ManageWebhooks")
  ) {
    try {
      await webhook.delete('Anti-Webhook system enabled.');
    } catch (err) {
      console.error('Error deleting webhook:', err);
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const settings = await client.getSettings(message.guild.id);

  if (settings?.antiLink === 1) {
    const whitelistedRoles = settings.whitelistedRoles || [];
    const userRoles = message.member.roles.cache.map(role => role.id);
    const isWhitelisted = userRoles.some(roleId => whitelistedRoles.includes(roleId));
    const linkRegex = /(https?:\/\/[^\s]+)/gi;

    if (!isWhitelisted && linkRegex.test(message.content)) {
      try {
        await message.delete();
        console.log(`Deleted a link from: ${message.author.tag}`);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();
  const command = client.prefixCommands.get(cmdName);
  if (!command) return;

  try {
    if (typeof command.execute === 'function') {
      await command.execute(message, args, client);
    } else if (typeof command.run === 'function') {
      await command.run(client, message, args);
    } else {
      console.error(`Command "${cmdName}" has no 'execute' or 'run' function.`);
    }
  } catch (e) {
    console.error(e);
    message.reply('Error executing that command.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error executing that command.', ephemeral: true });
    }
  }
});

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Registering slash commands...');
    const cmds = slashFiles.map(file => require(`./slashCommands/${file}`).data.toJSON());
    await rest.put(Routes.applicationCommands(clientId), { body: cmds });
    console.log('Slash commands registered!');
  } catch (e) {
    console.error('Error registering slash commands:', e);
  }
})();

client.login(token);
