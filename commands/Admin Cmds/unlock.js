const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
    name: 'unlock',
    description: 'Unlocks the current channel.',
    execute: async (message) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<:info:1402098933261533285> You do not have permission to manage channels.');
            return message.reply({ embeds: [embed] });
        }

        if (cooldowns.has(message.author.id)) {
            await message.react('⏳');
            return;
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: null,
            });

            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription(`<:yes:1402096123434500096> <#${message.channel.id}> has been unlocked!`);
            await message.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<:info:1402098933261533285> Failed to unlock the channel.');
            message.reply({ embeds: [embed] });
        }
    }
};
