const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "vkick",
    aliases: ["voicekick","vcreject"],
    description: "Kick a user from the voice channel.",
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:info:1402098933261533285> You need the `Kick Members` permission to use this command.')
                ]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:info:1402098933261533285> I need the `Kick Members` permission to perform this action.')
                ]
            });
        }

        let target;
        if (message.mentions.members.size) {
            target = message.mentions.members.first();
        } else if (args[0]) {
            target = message.guild.members.cache.get(args[0]);
        }

        if (!target) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setAuthor({ name: "Command: Voice kick", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription("Kick a user from a voice channel.")
                        .addFields(
                            { name: "Usage:", value: "- &vkick \`userid\`", inline: false },
                            { name: "Example:", value: `- &vkick <@&${message.author.id}>\n- &vkick \`${message.author.id}\``, inline: false }
                        )
                ]
            });
        }

        if (!target.voice.channel) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription(`<:info:1402098933261533285> ${target.user.tag} is not connected to a voice channel.`)
                ]
            });
        }

        if (target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription("<:info:1402098933261533285> I cannot kick this user as their role is higher or equal to mine.")
                ]
            });
        }

        try {
            await target.voice.disconnect();

            const embed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setDescription(`<:yes:1402096123434500096> Successfully kicked **${target.user.tag}** from the voice channel.`);

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error kicking user from voice channel:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setDescription("<:info:1402098933261533285> An error occurred while trying to kick the user from the voice channel.");

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
