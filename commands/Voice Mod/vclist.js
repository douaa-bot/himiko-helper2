const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'vclist',
  aliases: ['vL'],
  description: 'Shows a list of users currently in your voice channel.',
  async execute(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> You must be in a voice channel to use this command.')
        ]
      });
    }

    const members = voiceChannel.members;
    const memberMentions = members.map(member => `- <@${member.user.id}>`).join('\n');

    if (!memberMentions) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> No other members are currently in this voice channel.')
        ]
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#a18cd1')
      .setAuthor({ name: 'List Users In Vc', iconURL: message.guild.iconURL() })
      .setDescription(`${memberMentions}`)
      .setThumbnail(message.guild.iconURL());

    message.reply({ embeds: [embed] });
  }
};
