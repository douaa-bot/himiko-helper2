const { EmbedBuilder, PermissionsBitField } = require("discord.js");

const COOLDOWN = 5000;
const cooldowns = new Map();

module.exports = {
    name: "kick",
    aliases: ["kickuser", "removeuser"],
    description: "Kick a user from the server.",
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react("⏳");
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN);

        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:yes:1402096123434500096> You do not have permission to use this command.')
                ]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:yes:1402096123434500096> I do not have permission to use this command.')
                ]
            });
        }

        let target;
        if (message.mentions.members.size) {
            target = message.mentions.members.first();
        } else if (args[0] && message.guild.members.cache.has(args[0])) {
            target = message.guild.members.cache.get(args[0]);
        }

        const userId = target?.id || args[0]?.replace(/[<>@!]/g, '');

        if (!userId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setAuthor({ name: "Command: Kick", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .addFields(
                            { name: "Usage:", value: `- &kick \`userId\` or \`@user\``, inline: false },
                            { name: "Example:", value: `- &kick <@${message.author.id}>\n- &kick \`${message.author.id}\``, inline: false }
                        )
                        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                ]
            });
        }

        let userToKick;
        try {
            if (target) {
                userToKick = target;
            } else {
                userToKick = await message.client.users.fetch(userId);
            }

            if (!message.guild.members.cache.has(userToKick.id)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#a18cd1")
                            .setDescription('<:yes:1402096123434500096> User is not in the server.')
                    ]
                });
            }
        } catch (error) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription("<:yes:1402096123434500096> Cannot find this user.")
                ]
            });
        }

        if (userToKick.id === message.author.id) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:yes:1402096123434500096> You cannot kick yourself.')
                ]
            });
        }

        if (userToKick.id === message.guild.ownerId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:yes:1402096123434500096> You cannot kick the server owner.')
                ]
            });
        }

        if (
            target &&
            (target.roles.highest.position >= message.guild.members.me.roles.highest.position ||
                target.roles.highest.position >= message.member.roles.highest.position)
        ) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setDescription('<:yes:1402096123434500096> User has a higher role. Cannot kick.')
                ]
            });
        }

        try {
            await userToKick.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#a18cd1")
                        .setAuthor({ name: `Kicked from ${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) })
                        .setDescription(`You were kicked from **__${message.guild.name}__**\n**__Reason__ :** ${args.slice(1).join(" ") || "`None`"}`)
                        .setThumbnail(message.guild.iconURL({ dynamic: true }))
                ]
            });
        } catch (error) {
            console.error("Could not send DM to kicked user:", error);
        }

        try {
            await message.guild.members.kick(userToKick.id, { reason: args.slice(1).join(" ") || "None" });

            const successEmbed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setDescription(`<:yes:1402096123434500096> Successfully kicked <@${userToKick.id}> from the server.`);

            return message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error("Error kicking user:", error);

            const failEmbed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setDescription('<:yes:1402096123434500096> An error occurred while trying to kick the user.');

            return message.reply({ embeds: [failEmbed] });
        }
    }
};
