const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const cooldowns = new Map(); 
const COOLDOWN_TIME = 5000; 

module.exports = {
    name: 'invite',
    aliases: ['support','invitebot'],
    description: 'Get the bot\'s invite link.',
    async execute(message) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); 
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        const inviteLink = 'https://discord.com/oauth2/authorize?client_id=1399398715541688394&permissions=8&integration_type=0&scope=bot';
        const user = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setColor('#a18cd1')
            .setAuthor({ name: 'Bot Invite Link', iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setDescription('**__Click the buttons below to invite the bot to your server or visit the support server!__**');

        const inviteButton = new ButtonBuilder()
            .setLabel('Add Me')
            .setStyle(ButtonStyle.Link)
            .setURL(inviteLink);

        const supportButton = new ButtonBuilder()
            .setLabel('Support')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/rGKDt8C5cX'); 

        const row = new ActionRowBuilder().addComponents(inviteButton, supportButton);
        message.reply({ embeds: [embed], components: [row] });
    }
};
