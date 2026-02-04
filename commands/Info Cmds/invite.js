const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const cooldowns = new Map(); 
const COOLDOWN_TIME = 5000; 

module.exports = {
    name: 'myinvites',
    aliases: ['invites'],
    description: 'Displays how many people joined using your invite',
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); 
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        const guild = message.guild;
        const invites = await guild.invites.fetch().catch(() => null);
        if (!invites) return message.reply({ content: 'Could not fetch invites.' });

        const userInvites = invites.filter(invite => invite.inviter && invite.inviter.id === message.author.id);
        const totalUses = userInvites.reduce((sum, invite) => sum + (invite.uses || 0), 0);

        const embedMessage = new EmbedBuilder()
            .setAuthor({ name: `${message.author.username}'s Invite Stats`, iconURL: message.author.displayAvatarURL() })
            .setColor('#a18cd1')
            .setThumbnail(guild.iconURL() || undefined)
            .addFields(
                { name: '**__Your Invites :__**', value: `You have invited \`${totalUses}\` members!` }
            );

        const supportButton = new ButtonBuilder()
            .setLabel('Support')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/rGKDt8C5cX');

        const row = new ActionRowBuilder().addComponents(supportButton);

        await message.channel.send({ embeds: [embedMessage], components: [row] });
    }
};
