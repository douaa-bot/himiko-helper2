const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
    name: 'howgay',
    aliases: ['gayrate', 'gay'],
    description: 'Calculate your gay rate! 🌈',
    execute: async (message, args) => {
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setAuthor({ name: 'Command: howgay', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .addFields(
                    { name: "Usage:", value: "- &howgay `userid` ", inline: false },
                    { name: "Examples:", value: `- &howgay <@${message.author.id}>\n- &howgay \`${message.author.id}\``, inline: false }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
            return message.reply({ embeds: [embed] });
        }

        let targetUser = message.mentions.users.first();
        if (!targetUser) {
            targetUser = message.client.users.cache.get(args[0].replace(/[<>@!]/g, ''));
        }
        if (!targetUser) {
            const embed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<a:warning:1353394773989527755> Please provide a valid user mention or user ID.')
            return message.reply({ embeds: [embed] });
        }
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        const gayRate = Math.floor(Math.random() * 101); 

        const embed = new EmbedBuilder()
            .setColor('#a18cd1')
            .setTitle(`***Let's see how gay ${targetUser.username} is...***`)
            .setDescription(`***__Results:__*** 🌈 \n \`\`\`${gayRate}%\`\`\``) 
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 1024 })) 
        message.channel.send({ embeds: [embed] });
    }
};
