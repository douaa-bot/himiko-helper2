const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'vdeafen',
    aliases: ['vdeafen'],
    description: 'Deafen a user in the voice channel.',
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
                        .setAuthor({ name: 'Command: Voice deafen', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription('Deafen a user in a voice channel.')
                        .addFields(
                            { name: 'Usage:', value: '- &vdeafen \`userid\`', inline: false },
                            { name: 'Example:', value: `- &vdeafen <@&${message.author.id}>\n- &vdeafen \`${message.author.id}\``, inline: false }
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

        if (user.voice.serverDeaf) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#a18cd1')
                        .setDescription(`<:info:1402098933261533285> ${user.user.tag} is already deafened.`)
                ]
            });
        }

        try {
            await user.voice.setDeaf(true);

            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription(`<:yes:1402096123434500096> Successfully deafened **${user.user.tag}** in the voice channel.`);

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error deafening user:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription("<:info:1402098933261533285> An error occurred while trying to deafen the user.");

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
