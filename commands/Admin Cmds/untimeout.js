const { EmbedBuilder, PermissionsBitField } = require("discord.js");

const COOLDOWN = 5000;
const cooldowns = new Map();

module.exports = {
    name: "untimeout",
    description: "Remove the timeout from a user.",
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react("⏳");
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN);

        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:yes:1402096123434500096> You do not have permission to use this command.')
                ]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:yes:1402096123434500096> I do not have permission to use this command.')
                ]
            });
        }

        let target;
        const userId = args[0]?.replace(/[<>@!]/g, '');

        if (!userId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setAuthor({ name: "Command: Untimeout", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .addFields(
                            { name: "Usage:", value: `- &untimeout \`@user\``, inline: false },
                            { name: "Example:", value: `- &untimeout <@${message.author.id}>`, inline: false }
                        )
                        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                ]
            });
        }

        target = message.guild.members.cache.get(userId);

        if (!target) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription(`<:yes:1402096123434500096> User with ID <@${userId}> is not in the server.`)
                ]
            });
        }

        try {
            await target.timeout(null, `Timeout removed by ${message.author.username}`);

            const successEmbed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setDescription(`<:yes:1402096123434500096> Successfully removed timeout for <@${target.id}>.`);

            return message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error("Error removing timeout:", error);

            const failEmbed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setDescription('<:yes:1402096123434500096> An error occurred while trying to remove the timeout.');

            return message.reply({ embeds: [failEmbed] });
        }
    }
};
