const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { GuildConfig } = require('../../models/schemas');

module.exports = {
  name: 'jail',
  description: 'Jail a member by removing all roles and adding the jailed role',
  category: 'moderation',

  async execute(message, args, client) {
    const member = message.member;
    const botMember = message.guild.members.me;

    const settings = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!settings) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> Server configuration not found.')
        ],
      });
    }

    if (
      !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
      (!settings.hammerRole || !member.roles.cache.has(settings.hammerRole))
    ) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> You do not have permission to use this command.')
        ],
      });
    }

    if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> I do not have permission to manage roles.')
        ],
      });
    }

    let target = message.mentions.members.first();

    if (!target && args[0]) {
      try {
        target = await message.guild.members.fetch(args[0]);
      } catch {
        target = null;
      }
    }

    if (!target) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setAuthor({ name: 'Command: Jail', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .addFields(
              { name: '__Usage :__', value: '- &jail `userid` `reason` ', inline: false },
              { name: '__Example :__', value: `- &jail \`${message.author.id}\` Breaking rules`, inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true })),
        ],
      });
    }

    if (!target.roles) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> Could not retrieve roles of the target user.')
        ],
      });
    }

    if (target.id === member.id) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> You cannot jail yourself.')
        ],
      });
    }

    if (target.id === botMember.id) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> You cannot jail me.')
        ],
      });
    }

    if (target.roles.highest.position >= botMember.roles.highest.position) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> I cannot jail a member with a higher or equal role.')
        ],
      });
    }

    if (!settings.jailedRole) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> Jail system is not configured yet.')
        ],
      });
    }

    const jailedRole = message.guild.roles.cache.get(settings.jailedRole);
    if (!jailedRole) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> The jailed role is not found on this server.')
        ],
      });
    }

    const reason = args.slice(1).join(' ') || '`No reason provided`';

    try {
      const rolesToRemove = target.roles.cache.filter(r => r.id !== message.guild.id && r.id !== jailedRole.id);
      await target.roles.remove(rolesToRemove);
      if (!target.roles.cache.has(jailedRole.id)) {
        await target.roles.add(jailedRole);
      }

      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription(`<:yes:1402096123434500096> Successfully jailed <@${target.user.id}>.`)
        ],
      });

      try {
        await target.send({
          content: `Hello ${target.user.username},`,
          embeds: [
            new EmbedBuilder()
              .setColor('#a18cd1')
              .setAuthor({
                name: `You have been jailed in ${message.guild.name}`,
                iconURL: message.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL()
              })
              .addFields({ name: '__Reason__', value: reason, inline: false }),
          ],
        });
      } catch {
      }
      if (settings.jailLogsChannel) {
        const logChannel = message.guild.channels.cache.get(settings.jailLogsChannel);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setColor('#a18cd1')
            .setAuthor({ name: 'User Jailed', iconURL: target.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(
              `- **__User :__** ${target} (\`${target.id}\`)\n` +
              `- **__Jailed by :__** ${member} (\`${member.id}\`)\n` +
              `- **__Reason :__** ${reason}\n` +
              `- **__Time :__** <t:${Math.floor(Date.now() / 1000)}:F>`
            );
          await logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error(error);
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> Failed to jail the member. Please check my permissions and role hierarchy.')
        ],
      });
    }
  }
};
