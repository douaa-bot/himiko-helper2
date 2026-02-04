const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
    name: 'dance',
    description: 'Send a dance GIF! 💃🕺',
    execute: async (message, args) => {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        try {
            const response = await fetch('https://api.giphy.com/v1/gifs/search?api_key=iEuG4dzwgPVgbENvfQIb330diPBn3YEm&q=dance&limit=50&rating=g');
            const data = await response.json();

            if (!data.data.length) {
                const embed = new EmbedBuilder()
                    .setColor('#a18cd1')
                    .setDescription('No dance GIFs found! 😢');
                return message.reply({ embeds: [embed] });
            }

            const randomGif = data.data[Math.floor(Math.random() * data.data.length)].images.original.url;

            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setAuthor({ name: `${message.author.username} shared a dance moment 💃🕺`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setImage(randomGif);

            return message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('Could not fetch a dance GIF at the moment 😢');
            return message.reply({ embeds: [embed] });
        }
    }
};
