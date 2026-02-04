const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { GuildConfig } = require('../../models/schemas');

module.exports = {
  name: 'unjail',
  description: 'Unjail a member by removing the jailed role',
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
        ]
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
            .setAuthor({ name: "Command: Unjail", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .addFields(
              { name: "Usage:", value: `- unjail \`userid\``, inline: false },
              { name: "Example:", value: `- unjail \`${message.author.id}\``, inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        ],
      });
    }

    if (target.id === member.id || target.id === botMember.id) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> You cannot unjail yourself or me.')
        ],
      });
    }

    if (target.roles.highest.position >= botMember.roles.highest.position) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> I cannot unjail a member with a higher or equal role.')
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

    if (!target.roles.cache.has(jailedRole.id)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> This user is not jailed.')
        ],
      });
    }

    try {
      await target.roles.remove(jailedRole);

      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription(`<:yes:1402096123434500096> Successfully unjailed <@${target.id}>.`)
        ],
      });

      try {
        await target.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#a18cd1')
              .setAuthor({
                name: `You have been unjailed in ${message.guild.name}`,
                iconURL: message.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL()
              })
              .setDescription('The jailed role has been removed from you.')
          ],
        });
      } catch {
      }
      if (settings.jailLogsChannel) {
        const logChannel = message.guild.channels.cache.get(settings.jailLogsChannel);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setColor('#a18cd1')
            .setAuthor({ name: 'User Unjailed', iconURL: target.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(
              `- **__User :__** ${target} (\`${target.id}\`)\n` +
              `- **__Unjailed by :__** ${member} (\`${member.id}\`)\n` +
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
            .setDescription('<:info:1402098933261533285> Failed to unjail the member. Please check my permissions and role hierarchy.')
        ],
      });
    }
  }
};
