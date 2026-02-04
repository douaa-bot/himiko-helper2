const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { GuildConfig } = require('../../models/schemas'); 

module.exports = {
  name: 'verify-boy',
  aliases: ['vb', 'verifyboy'],
  description: 'Verify yourself as a male',
  category: 'verification',

  async execute(message, args, client) {
    const member = message.member;
    const botMember = message.guild.members.me;

    if (!args[0]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setAuthor({ name: "Command: VerifyBoy", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .addFields(
              { name: "Usage:", value: `- &vb \`@user/id\``, inline: false },
              { name: "Example:", value: `- &vb <@${message.author.id}>`, inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        ]
      });
    }

    if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
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

    const settings = await GuildConfig.findOne({ guildId: message.guild.id }); 
    if (!settings) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:info:1402098933261533285> Verification system is not configured yet.')
        ]
      });
    }

    if (!settings.verifiedRole) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:info:1402098933261533285> Verified role is not configured.')
        ]
      });
    }

    try {
      const removedRole = settings.removedRole ? message.guild.roles.cache.get(settings.removedRole) : null;
      const verifiedRole = message.guild.roles.cache.get(settings.verifiedRole);

      if (removedRole && removedRole.position >= botMember.roles.highest.position) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription('<:info:1402098933261533285> Bot role must be higher than the role to manage it.')
          ]
        });
      }

      if (verifiedRole.position >= botMember.roles.highest.position) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription('<:info:1402098933261533285> Cannot assign role because it is equal or higher than my highest role.')
          ]
        });
      }

      const target = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
      if (!target) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription('<:info:1402098933261533285> Target user not found.')
          ]
        });
      }

      if (removedRole && target.roles.cache.has(removedRole.id)) {
        await target.roles.remove(removedRole);
      }

      if (!target.roles.cache.has(verifiedRole.id)) {
        await target.roles.add(verifiedRole);
      }

      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription(`<:yes:1402096123434500096> <@${target.id}> has been verified as a boy!`)
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
              name: `${target.user.tag} has been verified as Boy`,
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
            .setDescription('<:info:1402098933261533285> Failed to verify. Please contact an admin.')
        ]
      });
    }
  }
};
