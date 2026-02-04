const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');

const authorName = "XO game";
const authorIconURL = "https://cdn.discordapp.com/attachments/1397689677389234279/1401954308995551442/download_1.jpeg?ex=68922732&is=6890d5b2&hm=126ffe7ebe5a554bb226e5b7fb64d47d8734ceebc4ca8cd7dc7b79f6ce4371dd&";

module.exports = {
  name: 'xo',
  description: 'Play a game of XO (Tic Tac Toe)',
  usage: '*xo @user',
  async execute(message, args) {
    if (!args.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
            .setColor("#a18cd1")
            .setAuthor({ name: "Command: Ban", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .addFields(
              { name: "Usage:", value: `- &xo \`userId\``, inline: false },
              { name: "Example:", value: `- &xo <@${message.author.id}>\n- &xo \`${message.author.id}\``, inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        ]
      });
    }
    let opponent;
    if (message.mentions.users.size > 0) {
      opponent = message.mentions.users.first();
    } else {
      const input = args[0];
      try {
        opponent = await message.client.users.fetch(input);
      } catch {
        opponent = null;
      }
      if (!opponent && input.includes('#')) {
        opponent = message.client.users.cache.find(u => u.tag.toLowerCase() === input.toLowerCase());
      }
    }

    if (!opponent) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#a18cd1')
          .setDescription('<:info:1402098933261533285> Could not find a valid user by mention, ID, or tag.')
        ]
      });
    }
    const guildMember = message.guild.members.cache.get(opponent.id);
    if (!guildMember) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#a18cd1')
          .setDescription('<:info:1402098933261533285> That user is not in this server.')
        ]
      });
    }

    if (opponent.bot) return message.reply({
      embeds: [new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> You can’t play with bots.')
      ]
    });

    if (opponent.id === message.author.id) return message.reply({
      embeds: [new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> You can’t play against yourself.')
      ]
    });

    const inviteRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_xo')
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('dismiss _xo')
        .setLabel('Dismiss ')
        .setStyle(ButtonStyle.Danger)
    );

    const inviteEmbed = new EmbedBuilder()
      .setColor('#a18cd1')
      .setDescription(`${guildMember}, you have been invited by ${message.author} to play **XO**!\nClick **Accept** to start the game.`);

    const inviteMsg = await message.channel.send({
      embeds: [inviteEmbed],
      components: [inviteRow]
    });

    const inviteCollector = inviteMsg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30_000
    });

    inviteCollector.on('collect', async (i) => {
      if (i.user.id !== guildMember.id) {
        return i.reply({
          embeds: [new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> This invite is not for you.')
          ],
          ephemeral: true
        });
      }

      if (i.customId === 'decline_xo') {
        inviteCollector.stop('declined');
        return i.update({
          embeds: [new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('<:info:1402098933261533285> Game invite declined.')
          ],
          components: []
        });
      }

      if (i.customId === 'accept_xo') {
        inviteCollector.stop('accepted');

        const players = [message.member, guildMember];
        const symbols = ['❌', '⭕'];

        let board = Array(9).fill(null);
        let currentPlayer = 0;

        const renderBoard = () => {
          const row = (i) => new ActionRowBuilder().addComponents(
            [0, 1, 2].map(j => {
              const index = i * 3 + j;
              return new ButtonBuilder()
                .setCustomId(index.toString())
                .setLabel(board[index] ?? '‎')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(board[index] !== null);
            })
          );
          return [0, 1, 2].map(row);
        };

        const checkWinner = () => {
          const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
          ];
          for (const [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) return true;
          }
          return false;
        };

        const isDraw = () => board.every(cell => cell !== null);

        await i.update({
          embeds: [new EmbedBuilder()
            .setColor('#a18cd1')
            .setAuthor({ name: authorName, iconURL: authorIconURL })
            .setDescription(` **${players[0]}** ***vs*** **${players[1]}**\nIt's ${players[currentPlayer]}'s turn (${symbols[currentPlayer]})`)
          ],
          components: renderBoard()
        });

        const collector = inviteMsg.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 60_000
        });

        collector.on('collect', async interaction => {
          if (interaction.user.id !== players[currentPlayer].id) {
            return interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<:info:1402098933261533285> Not your turn!')
              ],
              ephemeral: true
            });
          }

          const index = parseInt(interaction.customId);
          if (board[index] !== null) {
            return interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<:info:1402098933261533285> Already taken.')
              ],
              ephemeral: true
            });
          }

          board[index] = symbols[currentPlayer];

          if (checkWinner()) {
            collector.stop('win');
            return interaction.update({
              embeds: [new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription(`🏆 **${players[currentPlayer]}** wins the game!`)
              ],
              components: renderBoard()
            });
          } else if (isDraw()) {
            collector.stop('draw');
            return interaction.update({
              embeds: [new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription(`🤝 It's a draw!`)
              ],
              components: renderBoard()
            });
          }

          currentPlayer = 1 - currentPlayer;
          await interaction.update({
            embeds: [new EmbedBuilder()
              .setColor('#a18cd1')
              .setAuthor({ name: authorName, iconURL: authorIconURL })
              .setDescription(` **${players[0]}** ***vs*** **${players[1]}**\nIt's ${players[currentPlayer]}'s turn (${symbols[currentPlayer]})`)
            ],
            components: renderBoard()
          });
        });

        collector.on('end', async (_, reason) => {
          if (reason === 'time') {
            await inviteMsg.edit({
              embeds: [new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('⌛ Game ended due to inactivity.')
              ],
              components: renderBoard().map(row => row.setComponents(
                row.components.map(btn => btn.setDisabled(true))
              ))
            });
          }
        });
      }
    });

    inviteCollector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await inviteMsg.edit({
          embeds: [new EmbedBuilder()
            .setColor('#a18cd1')
            .setDescription('⌛ Invite expired.')
          ],
          components: []
        });
      }
    });
  }
};
