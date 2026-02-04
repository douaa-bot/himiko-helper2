const { EmbedBuilder } = require('discord.js');
const { Marriage } = require('../../models/schemas');

module.exports = {
  name: 'divorce',
  description: 'Divorce your partner.',
  async execute(message) {
    const marriage = await Marriage.findOne({ userId: message.author.id, partnerId: { $ne: null } });
    if (!marriage) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor('#a18cd1')
          .setDescription("<:info:1402098933261533285> You are not married to anyone currently.")]
      });
    }

    const partnerId = marriage.partnerId;
    await Marriage.findOneAndUpdate(
      { userId: message.author.id },
      { partnerId: null, marriedAt: null }
    );
    await Marriage.findOneAndUpdate(
      { userId: partnerId },
      { partnerId: null, marriedAt: null }
    );

    message.channel.send({
      embeds: [new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription(`<:corazon:1403525741353898014> You are now divorced from <@${partnerId}>.`)]
    });
  }
};
