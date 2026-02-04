const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'vundeafen',
    aliases: ['vundeafen'],
    description: 'Un-deafen a user in the voice channel.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#a18cd1')
                        .setDescription('<:info:1402098933261533285> You need the `Deafen Members` permission to use this command.')
                ]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#a18cd1')
                        .setDescription('<:info:1402098933261533285> I need the `Deafen Members` permission to perform this action.')
                ]
            });
        }

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!user) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#a18cd1')
                        .setAuthor({ name: 'Command: Voice undeafen', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription('Un-deafen a user in a voice channel.')
                        .addFields(
                            { name: 'Usage:', value: '- &vundeafen \`userid\`', inline: false },
                            { name: 'Example:', value: `- &vundeafen <@&${message.author.id}>\n- &vundeafen \`${message.author.id}\``, inline: false }
                        )
                ]
            });
        }

        if (!user.voice.channel) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#a18cd1')
                        .setDescription(`<:info:1402098933261533285> ${user.user.tag} is not connected to a voice channel.`)
                ]
            });
        }

        if (!user.voice.serverDeaf) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#a18cd1')
                        .setDescription(`<:info:1402098933261533285> ${user.user.tag} is not currently deafened.`)
                ]
            });
        }

        try {
            await user.voice.setDeaf(false);

            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription(`<:yes:1402096123434500096> Successfully undeafened **${user.user.tag}** in the voice channel.`);

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error undeafening user:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<:info:1402098933261533285> An error occurred while trying to undeafen the user.');

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
