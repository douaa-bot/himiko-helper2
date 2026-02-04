const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'find',
    description: 'Finds a user in a voice channel and displays relevant information.',
    async execute(message, args) {
        let user;

        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } else if (args.length > 0) {
            user = await message.client.users.fetch(args[0]).catch(() => null);
        } else {
            user = message.author;
        }

        if (!user) {
            const mentionuser = new EmbedBuilder()
                .setDescription('<:info:1402098933261533285> Please mention a user to find in a voice channel.')
                .setColor('#a18cd1');
            return message.channel.send({ embeds: [mentionuser] });
        }
        if (user.id === message.author.id) {
            const selfFindEmbed = new EmbedBuilder()
                .setDescription("<:info:1402098933261533285> You can't find yourself!")
                .setColor('#a18cd1');
            return message.channel.send({ embeds: [selfFindEmbed] });
        }

        const member = await message.guild.members.fetch(user.id);
        const embed = new EmbedBuilder().setColor('#a18cd1');

        if (member.voice.channel) {
            const voiceChannel = member.voice.channel;

            embed.addFields(
                { name: '<:voice:1402101684204867604>**__Voice Check :__**', value: `<#${voiceChannel.id}>`, inline: true },
                { name: '<:voice:1402101684204867604>**__Voice Name :__**', value: `${voiceChannel.name}`, inline: true },
            )
            .setAuthor({ name: `Voice Find: ${voiceChannel.name}`, iconURL: message.guild.iconURL(), url: "https://discord.gg/rGKDt8C5cX" })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 64 }));
        } else {
            embed.setDescription(`${user.tag} is not connected to any voice channel.`)
                .setColor('#a18cd1');
        }

        await message.channel.send({ embeds: [embed] });
    },
};
