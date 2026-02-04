const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "vunmute",
    aliases: ["vunmute", "voiceunmute"],
    description: "Unmute a user in the voice channel.",
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:info:1402098933261533285> You need the `Mute Members` permission to use this command.')
                ]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:info:1402098933261533285> I need the `Mute Members` permission to perform this action.')
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
                        .setAuthor({ name: "Command: Voice unmute", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .addFields(
                            { name: "Usage:", value: "- &vunmute \`userid\`", inline: false },
                            { name: "Example:", value: `- &vunmute <@&${message.author.id}>\n- &vunmute \`${message.author.id}\``, inline: false }
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

        if (!target.voice.serverMute) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription(`<:info:1402098933261533285> ${target.user.tag} is not muted.`)
                ]
            });
        }

        try {
            await target.voice.setMute(false);

            const embed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setDescription(`<:yes:1402096123434500096> Successfully unmuted **${target.user.tag}** in the voice channel.`);

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error unmuting user:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setDescription("<:info:1402098933261533285> An error occurred while trying to unmute the user.");

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
