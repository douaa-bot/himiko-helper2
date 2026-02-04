const { EmbedBuilder } = require('discord.js');
const { Marriage } = require('../../models/schemas'); 

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
  name: 'marry',
  description: 'Check your marriage stats.',
  async execute(message, args) {
    if (args[0]?.toLowerCase() !== 'stats') return;

    if (cooldowns.has(message.author.id)) {
      await message.react('⏳');
      return;
    }
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    const marriage = await Marriage.findOne({ userId: message.author.id });
    if (!marriage || !marriage.partnerId) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:corazon:1403525741353898014> You are not married yet.')
        ]
      });
    }

    const partner = await message.client.users.fetch(marriage.partnerId).catch(() => null);
    const marriageDate = marriage.marriedAt ? new Date(marriage.marriedAt) : null;
    const timestamp = marriageDate ? Math.floor(marriageDate.getTime() / 1000) : null;
    const embed = new EmbedBuilder()
      .setColor('#a18cd1')
      .setAuthor({name: '💍 Marriage Status', iconURL: message.author.displayAvatarURL({ dynamic: true })})
      .setThumbnail(partner ? partner.displayAvatarURL({ dynamic: true }) : null)
      .setDescription(`${message.author} <:corazon:1403525741353898014> ${partner || 'Unknown Partner'}`)
      .addFields(
        { name: '__Marriage Date__ :', value: timestamp ? `<t:${timestamp}:D>` : 'Unknown', inline: true },
        { name: '__Marriage Age__ :', value: timestamp ? `<t:${timestamp}:R>` : 'Unknown', inline: true }
      );

    return message.channel.send({ embeds: [embed] });
  }
};
