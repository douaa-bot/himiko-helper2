const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const cooldowns = new Map(); 
const COOLDOWN_TIME = 5000; 

module.exports = {
    name: 'banner',
    aliases: ['b'],
    description: 'Displays the banner of the mentioned user or user ID, as well as your own banner.',
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); 
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);
        let user;

        if (args.length > 0) {
            user = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
        } else {
            user = message.author;
        }

        if (user) {
            try {

                const userProfile = await message.client.users.fetch(user.id, { force: true });
                const userBanner = userProfile.bannerURL({ dynamic: true, size: 1024 });

                if (userBanner) {
                    const bannerEmbed = new EmbedBuilder()
                        .setColor('#a18cd1') 
                        .setTitle(`Banner of ${user.tag}`)
                        .setURL(userBanner) 
                        .setImage(userBanner)
                        .setTimestamp();

                    const downloadButton = new ButtonBuilder()
                        .setLabel('Download Banner')
                        .setStyle(ButtonStyle.Link) 
                        .setURL(userBanner); 
                    const row = new ActionRowBuilder().addComponents(downloadButton);

                    await message.reply({ embeds: [bannerEmbed], components: [row] });
                } else {
                    const noBannerEmbed = new EmbedBuilder()
                        .setColor('#a18cd1')
                        .setDescription('<:info:1402098933261533285> This user does not have a banner set.');

                    await message.channel.send({ embeds: [noBannerEmbed] });
                }
            } catch (error) {
                await message.reply('Could not fetch the user profile. Please make sure the user ID is valid or mention the user.');
            }
        } else {
            await message.reply('Could not find the user. Please make sure the user ID is valid or mention the user.');
        }
    }
};
