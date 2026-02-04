const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Marriage } = require('../../models/schemas'); 

module.exports = {
  name: 'marriage',
  description: 'Propose marriage to another user.',
  async execute(message, args) {

    let target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);

    if (!target) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription("<:info:1402098933261533285> Please mention a user or provide a valid user ID.")]
      });
    }

    if (target.id === message.author.id) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription("<:info:1402098933261533285> You can't marry yourself!")]
      });
    }

    if (target.bot) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription("<:info:1402098933261533285> You can't marry bots!")]
      });
    }

    const authorMarriage = await Marriage.findOne({ userId: message.author.id, partnerId: { $ne: null } });
    const targetMarriage = await Marriage.findOne({ userId: target.id, partnerId: { $ne: null } });

    if (authorMarriage || targetMarriage) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription("<:info:1402098933261533285> You or the person you're proposing to is already married!")]
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#a18cd1")
      .setDescription(`💍 Hey ${target}, ${message.author} would like to marry you!\n Do you accept?`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("accept_marry").setLabel("Accept").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("reject_marry").setLabel("Reject").setStyle(ButtonStyle.Danger)
    );

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = (interaction) => interaction.user.id === target.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "accept_marry") {
        const now = new Date();
        await Marriage.findOneAndUpdate(
          { userId: message.author.id },
          { partnerId: target.id, marriedAt: now },
          { upsert: true }
        );
        await Marriage.findOneAndUpdate(
          { userId: target.id },
          { partnerId: message.author.id, marriedAt: now },
          { upsert: true }
        );

        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription(`🎉 Congratulations!\n <:rings1:1404210001651699784> ${message.author} and ${target} are now married! 💕`)
          ],
          components: []
        });
      } else if (interaction.customId === "reject_marry") {
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription(`<:info:1402098933261533285> ${target} has rejected ${message.author}'s marriage proposal.`)
          ],
          components: []
        });
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === 'time' && !msg.deleted) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor("#a18cd1")
          .setDescription("⏳ Time's up! You didn't get a response in time. Better luck next time!");

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("accept_marry").setLabel("Accept").setStyle(ButtonStyle.Success).setDisabled(true),
          new ButtonBuilder().setCustomId("reject_marry").setLabel("Reject").setStyle(ButtonStyle.Danger).setDisabled(true)
        );

        msg.edit({ embeds: [timeoutEmbed], components: [disabledRow] }).catch(() => {});
      }
    });
  }
};
