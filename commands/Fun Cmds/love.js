const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
    name: 'love',
    description: 'Send an anime love message to someone! ❤️',
    execute: async (message, args) => {
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setAuthor({ name: 'Command: love', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .addFields(
                    { name: "Usage:", value: "- &love `userid`", inline: false },
                    { name: "Examples:", value: `- &love <@${message.author.id}>\n- &love ${message.author.id}`, inline: false }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
            return message.reply({ embeds: [embed] });
        }

        let targetMember;

        if (message.mentions.members.size > 0) {
            targetMember = message.mentions.members.first();
        } else {
            const input = args[0];
            try {
                targetMember = await message.guild.members.fetch(input);
            } catch {
                if (input.includes('#')) {
                    targetMember = message.guild.members.cache.find(
                        m => m.user.tag.toLowerCase() === input.toLowerCase()
                    );
                }
            }
        }

        if (!targetMember) {
            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<:info:1402098933261533285> Please provide a valid member mention, ID, or tag.');
            return message.reply({ embeds: [embed] });
        }

        if (targetMember.id === message.author.id) {
            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription("<:info:1402098933261533285> You can't send love to yourself!");
            return message.reply({ embeds: [embed] });
        }

        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        try {
            const response = await fetch('https://api.giphy.com/v1/gifs/search?api_key=iEuG4dzwgPVgbENvfQIb330diPBn3YEm&q=anime+love&limit=50&offset=0&rating=g&lang=en');
            const data = await response.json();

            if (!data.data.length) {
                const embed = new EmbedBuilder()
                    .setColor('#a18cd1')
                    .setDescription('No anime love GIFs found! 😢');
                return message.reply({ embeds: [embed] });
            }
            const animeLoveGifs = data.data.filter(gif =>
                gif.title.toLowerCase().includes('anime') || gif.slug.toLowerCase().includes('anime')
            );

            if (!animeLoveGifs.length) {
                const embed = new EmbedBuilder()
                    .setColor('#a18cd1')
                    .setDescription('No specific anime love GIFs found! 😢');
                return message.reply({ embeds: [embed] });
            }

            const randomGif = animeLoveGifs[Math.floor(Math.random() * animeLoveGifs.length)].images.original.url;

            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setAuthor({ name: `${message.author.username} sends love to ${targetMember.user.username} ❤️`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setImage(randomGif);

            return message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('Could not fetch an anime love GIF at the moment 😢');
            return message.reply({ embeds: [embed] });
        }
    }
};
