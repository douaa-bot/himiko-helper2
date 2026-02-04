const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const guildConfig = require('../models/schemas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-verify')
    .setDescription('Configure the verification system')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption(option =>
      option.setName('verificator')
        .setDescription('Role that can verify members')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('member')
        .setDescription('Role to assign after verification')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('female')
        .setDescription('Optional female role')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('unverified')
        .setDescription('Role to remove after verification')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('logs')
        .setDescription('Channel to log verification events')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      const noPermEmbed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> You don\'t have permission to use this command.');
      return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
    }

    const verificatorRole = interaction.options.getRole('verificator');
    const memberRole = interaction.options.getRole('member');
    const femaleRole = interaction.options.getRole('female');
    const removedRole = interaction.options.getRole('unverified');
    const logsChannel = interaction.options.getChannel('logs');

    try {
      await guildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        {
          verificatorRole: verificatorRole.id,
          verifiedRole: memberRole.id,
          femaleRole: femaleRole?.id || null,
          removedRole: removedRole?.id || null,
          logsChannel: logsChannel?.id || null
        },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription(`<:yes:1402096123434500096> The verification system has been configured.`);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error('Error saving verify config:', err);

      const errorEmbed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> Failed to save settings. Please try again later.');

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
