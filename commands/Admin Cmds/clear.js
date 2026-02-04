const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
  name: 'clear',
  description: 'Clear messages in the channel based on specific filters.',
  execute: async (message, args) => {
    if (!message.member.permissions.has('ManageMessages')) {
      const embed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> You do not have permission to manage messages.');
      return message.reply({ embeds: [embed] });
    }

    if (cooldowns.has(message.author.id)) {
      await message.react('⏳');
      return;
    }

    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setAuthor({ name: 'Command: clear', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .addFields(
          { name: 'Usage:', value: '- &clear `number`', inline: false },
          { name: 'Examples:', value: '- &clear `100`', inline: false }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

      return message.reply({ embeds: [embed] });
    }

    const numberOfMessages = parseInt(args[0]);

    if (isNaN(numberOfMessages)) {
      const embed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> Please provide a valid number of messages to delete.');
      return message.reply({ embeds: [embed] });
    }

    if (numberOfMessages < 1 || numberOfMessages > 100) {
      const embed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> You can only delete between 1 and 100 messages at a time.');
      return message.reply({ embeds: [embed] });
    }

    let filterOption = args[1];

    if (filterOption && !['--bots', '--embeds', '--links', '--images'].includes(filterOption)) {
      const embed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> Invalid filter option. Use `--bots`, `--embeds`, `--links`, or `--images`.');
      return message.reply({ embeds: [embed] });
    }

    try {
      const messages = await message.channel.messages.fetch({ limit: numberOfMessages });

      let filteredMessages = messages;

      if (filterOption === '--bots') {
        filteredMessages = messages.filter(msg => msg.author.bot);
      } else if (filterOption === '--embeds') {
        filteredMessages = messages.filter(msg => msg.embeds.length > 0);
      } else if (filterOption === '--links') {
        filteredMessages = messages.filter(msg => /https?:\/\//i.test(msg.content));
      } else if (filterOption === '--images') {
        filteredMessages = messages.filter(msg => msg.attachments.size > 0);
      }

      await message.channel.bulkDelete(filteredMessages, true);

      const successEmbed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription(`<:yes:1402096123434500096> Successfully cleared **${filteredMessages.size}** message(s)!`);

      const successMessage = await message.channel.send({ embeds: [successEmbed] });
      setTimeout(() => successMessage.delete(), 3000);

    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> An error occurred while trying to delete the messages.');
      message.reply({ embeds: [embed] });
    }
  }
};
