const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const guildConfig = require('../models/schemas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-jail')
    .setDescription('Configure the jail system')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption(option =>
      option.setName('jailed')
        .setDescription('Role to assign when a user is jailed')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('hammer')
        .setDescription('Role allowed to use the jail command (hammer role)')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('logs')
        .setDescription('Channel to log jail events')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      const noPermEmbed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> You don\'t have permission to use this command.');
      return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
    }

    const jailedRole = interaction.options.getRole('jailed');
    const hammerRole = interaction.options.getRole('hammer');
    const logsChannel = interaction.options.getChannel('logs');

    try {
      await guildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        {
          jailedRole: jailedRole.id,
          hammerRole: hammerRole.id,
          jailLogsChannel: logsChannel.id
        },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:yes:1402096123434500096> The jail system has been configured.');

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error('Error saving jail config:', err);

      const errorEmbed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> Failed to save settings. Please try again later.');

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
