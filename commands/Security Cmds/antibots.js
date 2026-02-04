const { EmbedBuilder } = require("discord.js");

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
  name: "antibot",
  aliases: ["antibots"],
  description: "Enable or disable the AntiBot system",

  async execute(message, args, client) {
    const devs = ["1366203418653229247", "244458952127938561"];

    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    if (!devs.includes(message.author.id) && message.author.id !== message.guild.ownerId) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .setDescription("<:yes:1402096123434500096> You don't have permission to use this command.")
          .setColor("#a18cd1")]
      });
    }

    const option = args[0]?.toLowerCase();
    if (!["on", "off", "status"].includes(option)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor("#a18cd1")
          .setAuthor({ name: 'Command : AntiBot', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .addFields(
            { name: "__Usage__ :", value: "- &antibot `on` `off` `status`", inline: false },
            { name: "__Examples__ :", value: "- &antibot `on`\n- &antibot `off`\n- &antibot `status`", inline: false }
          )
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true })) ]
      });
    }

    const settings = await client.getSettings(message.guild.id);

    if (option === "status") {
      const isEnabled = settings.antiBot === 1;
      const statusEmbed = new EmbedBuilder()
        .setColor("#a18cd1")
        .setAuthor({ name: 'Anti Bot : Status', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .addFields(
          { name: "__Anti Bot Status__ :", value: isEnabled ? "Enabled <:On:1349698525360947241>" : "Disabled <:Off:1349698291259932735>", inline: false }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
      return message.reply({ embeds: [statusEmbed] });
    }

    if (option === "on" || option === "off") {
      const isEnabled = option === "on" ? 1 : 0;
      await client.saveSettings(message.guild.id, "antiBot", isEnabled);

      const embed = new EmbedBuilder()
        .setDescription(`${isEnabled ? " <:On:1349698525360947241> Anti Bot is now **Enabled**." : " <:Off:1349698291259932735> Anti Bot is now **Disabled**."}`)
        .setColor("#a18cd1");

      return message.reply({ embeds: [embed] });
    }
  }
};
