const { EmbedBuilder, PermissionsBitField } = require("discord.js");

const COOLDOWN = 5000;
const cooldowns = new Map();

module.exports = {
  name: "ban",
  aliases: ["banuser", "removeuser"],
  description: "Ban a user from the server.",
  async execute(message, args) {
    if (cooldowns.has(message.author.id)) {
      return message.react("⏳");
    }

    cooldowns.set(message.author.id, Date.now() + COOLDOWN);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN);

    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:yes:1402096123434500096> You do not have permission to use this command.')
        ]
      });
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
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
            .setAuthor({ name: "Command: Ban", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .addFields(
              { name: "Usage:", value: `- &ban \`userId\` or \`@user\``, inline: false },
              { name: "Example:", value: `- &ban <@${message.author.id}>\n- &ban \`${message.author.id}\``, inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        ]
      });
    }

    let userToBan;
    try {
      if (target) {
        userToBan = target;
      } else {
        userToBan = await message.client.users.fetch(userId);
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

    if (userToBan.id === message.author.id) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:yes:1402096123434500096> You cannot ban yourself.')
        ]
      });
    }

    if (userToBan.id === message.guild.ownerId) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:yes:1402096123434500096> You cannot ban the server owner.')
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
            .setDescription('<:yes:1402096123434500096> User has a higher role. Cannot ban.')
        ]
      });
    }

    const reason = args.slice(1).join(" ");

    try {
      const bans = await message.guild.bans.fetch();
      if (bans.has(userToBan.id)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription('<:yes:1402096123434500096> This user is already banned.')
          ]
        });
      }

      if (userToBan) {
        try {
          await userToBan.send({
            embeds: [
              new EmbedBuilder()
                .setColor("#a18cd1")
                .setAuthor({
                  name: `Banned in ${message.guild.name}`,
                  iconURL: message.guild.iconURL({ dynamic: true })
                })
                .setDescription(`You were banned from **__${message.guild.name}__**\n**__Reason__ :** ${reason || "None"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
            ]
          });
        } catch (error) {
          console.error("Could not send DM to banned user:", error);
        }
      }

      await message.guild.members.ban(userToBan.id, { reason: reason || "None" });

      const successEmbed = new EmbedBuilder()
        .setColor("#a18cd1")
        .setDescription(`<:yes:1402096123434500096> Successfully banned <@${userToBan.id}> from the server.`);

      return message.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error("Error banning user:", error);

      const failEmbed = new EmbedBuilder()
        .setColor("#a18cd1")
        .setDescription('<:yes:1402096123434500096> An error occurred while trying to ban the user.');

      return message.reply({ embeds: [failEmbed] });
    }
  }
};
