const { EmbedBuilder } = require("discord.js");

const COOLDOWN_TIME = 5000;
const cooldowns = new Map();

module.exports = {
    name: "addemoji",
    aliases: ['ae', 'addemojis'],
    description: "Add an emoji from another server",
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); 
        }
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);
        if (!message.member.permissions.has("ManageEmojisAndStickers")) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor("#a18cd1")
                    .setDescription("<:info:1402098933261533285> You need the `Manage Emojis` permission to use this command.")],
            });
        }

        if (!args[0] || !args[1]) {
            const embed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setAuthor({ name: 'Command : addemoji', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .addFields(
                    { name: "Usage:", value: "- &addemoji `emoji` `name`", inline: false },
                    { name: "Examples:", value: "- &addemoji <:check:1335402216659488851> `Check`", inline: false }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

            return message.reply({ embeds: [embed] });
        }

        const emoji = args[0];
        const name = args[1];
        const emojiMatch = emoji.match(/<a?:\w+:(\d+)>/);

        if (!emojiMatch) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor("#a18cd1")
                    .setDescription("<a:warning:1353394773989527755> Invalid emoji format. Please provide a valid custom emoji from another server.")],
            });
        }

        const emojiID = emojiMatch[1];
        const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;

        try {
            const newEmoji = await message.guild.emojis.create({ attachment: emojiURL, name: name });

            const embed = new EmbedBuilder()
                .setColor("#a18cd1")
                .setDescription("<:yes:1402096123434500096> Successfully added emoji!")
                .setThumbnail(emojiURL);

            return message.reply({ embeds: [embed] });

        } catch (error) {
            let errorMessage = "<:info:1402098933261533285> Failed to add emoji.";
            if (error.code === 30008) {
                errorMessage += " The server has reached the emoji limit.";
            } else if (error.code === 50013) {
                errorMessage += " The bot needs `Manage Emojis` permission.";
            }

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor("#a18cd1")
                    .setDescription(errorMessage)],
            });
        }
    }
};
