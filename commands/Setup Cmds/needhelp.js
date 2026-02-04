const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { NeedHelpVoice } = require('../../models/schemas');

module.exports = {
  name: 'needhelp',
  description: 'Setup a template voice channel and helper role for Need Help channels',
  category: 'setup',

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:info:1402098933261533285> You don\'t have permission to use this command.')
        ]
      });
    }

    if (!args[0] || !args[1]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setAuthor({ name: "Command: Set Need Help", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .addFields(
              { name: "Usage:", value: "- &needhelp `VoiceId` `helperID`", inline: false },
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        ]
      });
    }

    let voiceChannel = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first();
    if (!voiceChannel || voiceChannel.type !== 2) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:info:1402098933261533285> Please provide a valid voice channel ID or mention.')
        ]
      });
    }

    let helperRole = message.guild.roles.cache.get(args[1]) || message.mentions.roles.first();
    if (!helperRole) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription('<:info:1402098933261533285> Please provide a valid helper role ID or mention.')
        ]
      });
    }

    await NeedHelpVoice.findOneAndUpdate(
      { guildId: message.guild.id },
      { templateChannelId: voiceChannel.id, helperRoleId: helperRole.id },
      { upsert: true }
    );

    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#a18cd1")
          .setDescription(`<:yes:1402096123434500096> __Need Help template voice channel set to :__ ${voiceChannel}\n<:yes:1402096123434500096> __Helper role set to :__ ${helperRole}`)
      ]
    });
  }
};
