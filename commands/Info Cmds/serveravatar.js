const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const cooldowns = new Map(); 
const COOLDOWN_TIME = 5000; 

module.exports = {
    name: 'serveravatar',
    aliases: ['sa'],
    description: 'Displays the server avatar (icon).',
    async execute(message) {
        console.log(`Checking cooldown for ${message.author.id}`);
        if (cooldowns.has(message.author.id)) {
            console.log(`${message.author.id} is on cooldown!`);
            return message.react('⏳'); 
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        const guild = message.guild;
        const serverAvatar = guild.iconURL({ dynamic: true, size: 1024 });

        if (serverAvatar) {
            const avatarEmbed = new EmbedBuilder()
                .setColor('#a18cd1') 
                .setTitle(`${guild.name}'s Avatar`)
                .setURL(serverAvatar) 
                .setImage(serverAvatar) 
                .setTimestamp();

            const downloadButton = new ButtonBuilder()
                .setLabel('Download Avatar')
                .setStyle(ButtonStyle.Link)  
                .setURL(serverAvatar);

            const row = new ActionRowBuilder().addComponents(downloadButton);

            await message.reply({ embeds: [avatarEmbed], components: [row] });
        } else {
            const noAvatarEmbed = new EmbedBuilder()
                .setColor('#a18cd1') 
                .setDescription('<:info:1402098933261533285> This server does not have an avatar set.');

            await message.reply({ embeds: [noAvatarEmbed] });
        }
    }
};
