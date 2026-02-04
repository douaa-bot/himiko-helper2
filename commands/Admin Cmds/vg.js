const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { GuildConfig } = require('../../models/schemas'); 

module.exports = {
  name: 'verify-girl',
  aliases: ['vg', 'verifygirl'],
  description: 'Verify a user as female',
  category: 'verification',

  async execute(message, args, client) {
    const botMember = message.guild.members.me;

    if (!args[0]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setAuthor({ name: "Command: VerifyGirl", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .addFields(
              { name: "Usage:", value: `- &vg \`@user/id\``, inline: false },
              { name: "Example:", value: `- &vg <@${message.author.id}>`, inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        ]
      });
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:info:1402098933261533285> You do not have permission to use this command.')
        ]
      });
    }

    if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:info:1402098933261533285> I do not have permission to manage roles.')
        ]
      });
    }

    let target = message.mentions.members.first() ||
                 await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:info:1402098933261533285> User not found. Please mention a user or provide a valid ID.')
        ]
      });
    }

    const settings = await GuildConfig.findOne({ guildId: message.guild.id }); // <:yes:1402096123434500096> التغيير هنا
    if (!settings) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:yes:1402096123434500096> Verification system is not configured yet.')
        ]
      });
    }

    if (!settings.verifiedRole || !settings.femaleRole) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:info:1402098933261533285> Verified or female role is not configured.')
        ]
      });
    }

    try {
      const removedRole = settings.removedRole ? message.guild.roles.cache.get(settings.removedRole) : null;
      const femaleRole = message.guild.roles.cache.get(settings.femaleRole);
      const verifiedRole = message.guild.roles.cache.get(settings.verifiedRole);

      if (removedRole && removedRole.position >= botMember.roles.highest.position) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription('<:yes:1402096123434500096> **Bot role must be higher than the role to manage it.**')
          ]
        });
      }

      if (
        femaleRole.position >= botMember.roles.highest.position ||
        verifiedRole.position >= botMember.roles.highest.position
      ) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription('<:yes:1402096123434500096> **Cannot assign role because it is equal or higher than my highest role.**')
          ]
        });
      }

      if (removedRole && target.roles.cache.has(removedRole.id)) {
        await target.roles.remove(removedRole);
      }

      if (!target.roles.cache.has(femaleRole.id)) {
        await target.roles.add(femaleRole);
      }

      if (!target.roles.cache.has(verifiedRole.id)) {
        await target.roles.add(verifiedRole);
      }

      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription(`<:yes:1402096123434500096> <@${target.id}> has been verified as a girl!`)
        ]
      });

      await target.send({
        content: `Hello <@${target.id}>`,
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setAuthor({
              name: `Verified in ${message.guild.name}`,
              iconURL: message.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL()
            })
            .setDescription(`<:yes:1402096123434500096> You've been officially verified in the server **__${message.guild.name}__**.`)
        ]
      }).catch(() => {
        console.warn(`Couldn't DM ${target.user.tag}`);
      });

      if (settings.logsChannel) {
        const logChannel = message.guild.channels.cache.get(settings.logsChannel);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setColor('#a18cd1')
            .setAuthor({
              name: `${target.user.tag} has been verified as Girl`,
              iconURL: target.displayAvatarURL({ dynamic: true })
            })
            .setDescription(
              `- **__User :__** <@${target.id}> \`(${target.id})\`\n` +
              `- **__Verified by__ :** <@${message.member.id}> \`(${message.member.id})\`\n` +
              `- **__Time :__** <t:${Math.floor(Date.now() / 1000)}:F>`
            );

          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (err) {
      console.error(err);
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:yes:1402096123434500096> **Failed to verify. Please contact an admin.**')
        ]
      });
    }
  }
};
