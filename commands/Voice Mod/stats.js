const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'stats',
    description: 'Displays the server status',
    aliases: ['vc'],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<:info:1402098933261533285> You do not have permission to use this command.');

            return message.reply({ embeds: [noPermEmbed] });
        }

        const guild = message.guild;
        const members = guild.members.cache;

        const totalMembers = guild.memberCount; 
        const botsCount = members.filter(member => member.user.bot).size; 
        const realMembers = totalMembers - botsCount;

        const membersInVoice = members.filter(member => member.voice.channelId).size;
        const boostCount = guild.premiumSubscriptionCount || 0;
        const boostLevel = guild.premiumTier || 'None';
        const guildIconURL = guild.iconURL();

        const embedMessage = new EmbedBuilder()
            .setAuthor({ name: `${guild.name} Stats!`, iconURL: guildIconURL })
            .setColor('#a18cd1')
            .setThumbnail(guildIconURL || undefined)
            .addFields(
                { name: '<:team2:1402671611206963296> __Members:__', value: `<:arrow:1370085158010753085>\`${realMembers}\``, inline: true },
                { name: '<:voice:1402101684204867604> __In Voice:__', value: `<:arrow:1370085158010753085>\`${membersInVoice}\``, inline: true },
                { name: '<:socialmedia1:1402672071514783835> __Boosts:__', value: `<:arrow:1370085158010753085>\`${boostCount}\``, inline: true },
            )
            .setFooter({ text: `${guild.name} Stats`, iconURL: guildIconURL })
            .setTimestamp();

        const statsButton = new ButtonBuilder()
            .setCustomId('stats')
            .setLabel(` Voice : ${membersInVoice}`)
            .setEmoji('<:voice:1402101684204867604>')
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(statsButton);

        await message.delete();
        await message.channel.send({ embeds: [embedMessage], components: [row] });
    }
};
