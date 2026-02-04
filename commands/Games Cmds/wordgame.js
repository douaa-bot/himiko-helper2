const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { Dictionary } = require('../../models/schemas');

const arabicLetters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];
const frenchLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const englishLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

module.exports = {
  name: 'kalimat',
  aliases: [],
  description: 'Start a word game (Kalimat Mota9ati3a)',
  async execute(message, args, client) {
    try {
      const gameState = {
        host: message.author.id,
        players: [message.author.id],
        maxPlayers: 5,
        minPlayers: 2,
        language: null,
        grid: [],
        currentPlayer: 0,
        currentRound: 0,
        maxRounds: 4,
        scores: {},
        selectedLetters: [],
        gameStarted: false,
        gameMsg: null,
        collector: null
      };

      gameState.scores[message.author.id] = 0;

      // LOBBY : inviter les joueurs
      const lobbyEmbed = new EmbedBuilder()
        .setTitle('🎯 Word Game - Kalimat Mota9ati3a')
        .setDescription(`**Host:** <@${message.author.id}>\n**Players:** ${gameState.players.length}/${gameState.maxPlayers}\n**Status:** Waiting for players...`)
        .setColor('#a18cd1')
        .setFooter({ text: 'Click "Join" to participate • 30 seconds to join' });

      const joinButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('join_game')
            .setLabel('Join Game')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➕')
        );

      const lobbyMsg = await message.channel.send({ embeds: [lobbyEmbed], components: [joinButton] });

      const lobbyCollector = lobbyMsg.createMessageComponentCollector({
        time: 30000,
        componentType: ComponentType.Button,
      });

      lobbyCollector.on('collect', async interaction => {
        try {
          if (interaction.customId === 'join_game') {
            if (gameState.players.includes(interaction.user.id)) {
              await interaction.reply({ content: 'You are already in the game!', ephemeral: true });
              return;
            }
            if (gameState.players.length >= gameState.maxPlayers) {
              await interaction.reply({ content: 'Game is full!', ephemeral: true });
              return;
            }

            gameState.players.push(interaction.user.id);
            gameState.scores[interaction.user.id] = 0;

            lobbyEmbed.setDescription(`**Host:** <@${gameState.host}>\n**Players:** ${gameState.players.length}/${gameState.maxPlayers}\n**Status:** Waiting for players...`);
            lobbyEmbed.setFields({ name: 'Players', value: gameState.players.map(id => `<@${id}>`).join('\n') });

            await lobbyMsg.edit({ embeds: [lobbyEmbed] });
            await interaction.reply({ content: 'You joined the game!', ephemeral: true });

            if (gameState.players.length >= gameState.minPlayers) {
              lobbyEmbed.setDescription(`**Host:** <@${gameState.host}>\n**Players:** ${gameState.players.length}/${gameState.maxPlayers}\n**Status:** Ready to start!`);
              await lobbyMsg.edit({ embeds: [lobbyEmbed] });
            }
          }
        } catch (err) {
          console.error('Error in lobby collect:', err);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'An error occurred. Please try again.', ephemeral: true });
          }
        }
      });

      lobbyCollector.on('end', async () => {
        try {
          if (gameState.players.length < gameState.minPlayers) {
            lobbyEmbed.setDescription('❌ Not enough players to start the game!');
            lobbyEmbed.setColor('#ff0000');
            try {
              await lobbyMsg.edit({ embeds: [lobbyEmbed], components: [] });
            } catch {
              await message.channel.send({ embeds: [lobbyEmbed] });
            }
            return;
          }

          await lobbyMsg.delete().catch(() => {});

          await showLanguageSelection(message.channel, gameState);
        } catch (err) {
          console.error('Error ending lobby:', err);
          await message.channel.send('An error occurred while ending the lobby. Please try again.');
        }
      });

    } catch (error) {
      console.error('Error in execute command:', error);
      await message.channel.send('An error occurred while starting the game. Please try again.');
    }
  }
};

async function showLanguageSelection(channel, gameState) {
  try {
    const languageEmbed = new EmbedBuilder()
      .setTitle('🌍 Select Language')
      .setDescription('Choose the language for the game:')
      .setColor('#a18cd1');

    const languageButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('lang_arabic')
          .setLabel('العربية')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🇸🇦'),
        new ButtonBuilder()
          .setCustomId('lang_french')
          .setLabel('Français')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🇫🇷'),
        new ButtonBuilder()
          .setCustomId('lang_english')
          .setLabel('English')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🇺🇸')
      );

    const languageMsg = await channel.send({ embeds: [languageEmbed], components: [languageButtons] });

    const languageCollector = languageMsg.createMessageComponentCollector({
      time: 60000,
      componentType: ComponentType.Button,
    });

    languageCollector.on('collect', async interaction => {
      try {
        if (interaction.user.id !== gameState.host) {
          await interaction.reply({ content: 'Only the host can select the language!', ephemeral: true });
          return;
        }

        const langMap = {
          'lang_arabic': { name: 'Arabic', letters: arabicLetters, language: 'arabic' },
          'lang_french': { name: 'French', letters: frenchLetters, language: 'french' },
          'lang_english': { name: 'English', letters: englishLetters, language: 'english' }
        };

        gameState.language = langMap[interaction.customId];
        await interaction.reply({ content: `Language selected: ${gameState.language.name}`, ephemeral: true });

        languageCollector.stop();
        await languageMsg.delete().catch(() => {});
        await startGame(channel, gameState);
      } catch (err) {
        console.error('Error in language selection:', err);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while selecting language. Please try again.', ephemeral: true });
        }
      }
    });
  } catch (error) {
    console.error('Error in showLanguageSelection:', error);
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#a18cd1')
          .setDescription('An error occurred while selecting language. Please try again.')
      ]
    });
  }
}

async function startGame(channel, gameState) {
  try {
    gameState.gameStarted = true;
    gameState.currentPlayer = 0;
    gameState.currentRound = 0;
    gameState.grid = generateGrid(gameState.language.letters);
    gameState.selectedLetters = [];

    // Envoie un message unique du plateau et initialise le collector
    gameState.gameMsg = await sendOrUpdateGameBoard(channel, gameState, null);

    setupGameCollector(gameState, channel);
  } catch (error) {
    console.error('Error in startGame:', error);
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#a18cd1')
          .setDescription('An error occurred while starting the game. Please try again.')
      ]
    });
  }
}

function generateGrid(letters) {
  const grid = [];
  for (let i = 0; i < 4; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      row.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    grid.push(row);
  }
  return grid;
}

async function sendOrUpdateGameBoard(channel, gameState, interaction) {
  if (gameState.currentRound >= gameState.maxRounds) {
    await endGame(channel, gameState);
    return null;
  }

  const currentPlayerId = gameState.players[gameState.currentPlayer];
  const currentPlayerMember = await channel.guild.members.fetch(currentPlayerId);

  const gameEmbed = new EmbedBuilder()
    .setTitle(`🎯 Word Game - Round ${gameState.currentRound + 1}`)
    .setDescription(`**Current Player:** ${currentPlayerMember.displayName}\n**Language:** ${gameState.language.name}\n**Time:** 40 seconds`)
    .setColor('#a18cd1');

  function buildGridButtons() {
    const gridButtons = [];

    for (let i = 0; i < 4; i++) {
      const row = new ActionRowBuilder();
      for (let j = 0; j < 5; j++) {
        const isSelected = gameState.selectedLetters.some(l => l.row === i && l.col === j);
        const style = isSelected ? ButtonStyle.Primary : ButtonStyle.Secondary;

        const button = new ButtonBuilder()
          .setCustomId(`letter_${i}_${j}`)
          .setLabel(gameState.grid[i][j])
          .setStyle(style);

        row.addComponents(button);
      }
      gridButtons.push(row);
    }

    return gridButtons;
  }

  const gridButtons = buildGridButtons();

  const controlButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('validate_word')
        .setLabel('Validate')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId('clear_selection')
        .setLabel('Clear')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
    );

  const scoresField = Object.entries(gameState.scores)
    .map(([playerId, score]) => `<@${playerId}>: ${score}`)
    .join('\n');

  gameEmbed.addFields({ name: 'Scores', value: scoresField || 'No scores yet' });

  if (gameState.gameMsg) {
    if (interaction) {
      await interaction.update({ embeds: [gameEmbed], components: [...gridButtons, controlButtons] });
    } else {
      await gameState.gameMsg.edit({ embeds: [gameEmbed], components: [...gridButtons, controlButtons] });
    }
    return gameState.gameMsg;
  } else {
    const gameMsg = await channel.send({ embeds: [gameEmbed], components: [...gridButtons, controlButtons] });
    return gameMsg;
  }
}

function setupGameCollector(gameState, channel) {
  if (!gameState.gameMsg) return;

  if (gameState.collector) {
    gameState.collector.stop(); // Si un collector existait, on l'arrête pour éviter doublons
  }

  gameState.collector = gameState.gameMsg.createMessageComponentCollector({
    time: 40000, // 40 secondes par tour
    componentType: ComponentType.Button,
  });

  gameState.collector.on('collect', async interaction => {
    try {
      const currentPlayerId = gameState.players[gameState.currentPlayer];
      if (interaction.user.id !== currentPlayerId) {
        await interaction.reply({ content: 'It\'s not your turn!', ephemeral: true });
        return;
      }

      if (interaction.customId.startsWith('letter_')) {
        const [_, row, col] = interaction.customId.split('_');
        const r = parseInt(row);
        const c = parseInt(col);

        const letterIndex = gameState.selectedLetters.findIndex(l => l.row === r && l.col === c);

        if (letterIndex === -1) {
          gameState.selectedLetters.push({ row: r, col: c, letter: gameState.grid[r][c] });
        } else {
          gameState.selectedLetters.splice(letterIndex, 1);
        }

        const updatedGridButtons = (() => {
          const gridButtons = [];
          for (let i = 0; i < 4; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 5; j++) {
              const isSelected = gameState.selectedLetters.some(l => l.row === i && l.col === j);
              const style = isSelected ? ButtonStyle.Primary : ButtonStyle.Secondary;

              const button = new ButtonBuilder()
                .setCustomId(`letter_${i}_${j}`)
                .setLabel(gameState.grid[i][j])
                .setStyle(style);
              row.addComponents(button);
            }
            gridButtons.push(row);
          }
          return gridButtons;
        })();

        const controlButtons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('validate_word')
              .setLabel('Validate')
              .setStyle(ButtonStyle.Success)
              .setEmoji('✅'),
            new ButtonBuilder()
              .setCustomId('clear_selection')
              .setLabel('Clear')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('❌')
          );

        await interaction.update({ components: [...updatedGridButtons, controlButtons] });
      }
      else if (interaction.customId === 'validate_word') {
        if (gameState.selectedLetters.length < 2) {
          await interaction.reply({ content: 'Select at least 2 letters!', ephemeral: true });
          return;
        }

        const word = gameState.selectedLetters.map(l => l.letter).join('');
        const score = await calculateScore(word, gameState.language.language);

        if (score > 0) {
          gameState.scores[currentPlayerId] += score;
          await replaceLetters(gameState);
          await interaction.reply({ content: `✅ Word "${word}" accepted! +${score} points`, ephemeral: true });
        } else {
          await interaction.reply({ content: `❌ Word "${word}" not accepted!`, ephemeral: true });
        }

        gameState.selectedLetters = [];

        // Relancer le timer + passer au tour suivant
        gameState.collector.resetTimer();

        await nextTurn(channel, gameState);
      }
      else if (interaction.customId === 'clear_selection') {
        gameState.selectedLetters = [];

        const updatedGridButtons = (() => {
          const gridButtons = [];
          for (let i = 0; i < 4; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 5; j++) {
              const isSelected = false;
              const button = new ButtonBuilder()
                .setCustomId(`letter_${i}_${j}`)
                .setLabel(gameState.grid[i][j])
                .setStyle(ButtonStyle.Secondary);
              row.addComponents(button);
            }
            gridButtons.push(row);
          }
          return gridButtons;
        })();

        const controlButtons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('validate_word')
              .setLabel('Validate')
              .setStyle(ButtonStyle.Success)
              .setEmoji('✅'),
            new ButtonBuilder()
              .setCustomId('clear_selection')
              .setLabel('Clear')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('❌')
          );

        await interaction.update({ components: [...updatedGridButtons, controlButtons] });
      }
    } catch (err) {
      console.error('Error in gameCollector collect:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred. Please try again.', ephemeral: true });
      }
    }
  });

  gameState.collector.on('end', async (collected, reason) => {
    if (reason === 'time') {
      // Fin du temps pour le joueur courant : on passe au suivant
      await channel.send(`⏰ Time's up for <@${gameState.players[gameState.currentPlayer]}>! Moving to next player...`);
      await nextTurn(channel, gameState);
    }
  });
}

async function nextTurn(channel, gameState) {
  gameState.currentPlayer++;
  if (gameState.currentPlayer >= gameState.players.length) {
    gameState.currentPlayer = 0;
    gameState.currentRound++;
  }

  if (gameState.currentRound >= gameState.maxRounds) {
    await endGame(channel, gameState);
    return;
  }

  gameState.selectedLetters = [];

  // Met à jour le message du plateau pour le nouveau tour
  await sendOrUpdateGameBoard(channel, gameState, null);

  // Reset le timer du collector
  if (gameState.collector) {
    gameState.collector.resetTimer({ time: 40000 });
  }
}

async function calculateScore(word, language) {
  // Simplicité : score = longueur du mot * 10 si mot valide dans DB
  // Vérifier dans DB si mot existe
  try {
    const wordLower = word.toLowerCase();
    const found = await Dictionary.findOne({ language, word: wordLower });
    if (found) {
      return word.length * 10;
    }
  } catch (err) {
    console.error('Error in calculateScore:', err);
  }
  return 0;
}

async function replaceLetters(gameState) {
  // Remplace les lettres sélectionnées par de nouvelles aléatoires
  for (const sel of gameState.selectedLetters) {
    const r = sel.row;
    const c = sel.col;
    gameState.grid[r][c] = gameState.language.letters[Math.floor(Math.random() * gameState.language.letters.length)];
  }
}

async function endGame(channel, gameState) {
  if (gameState.collector) {
    gameState.collector.stop();
  }

  const sortedScores = Object.entries(gameState.scores).sort((a, b) => b[1] - a[1]);
  const winner = sortedScores[0];

  const endEmbed = new EmbedBuilder()
    .setTitle('🏆 Game Over')
    .setDescription(`Winner: <@${winner[0]}> with ${winner[1]} points!\n\nFinal scores:\n${sortedScores.map(([id, score]) => `<@${id}>: ${score}`).join('\n')}`)
    .setColor('#a18cd1');

  try {
    if (gameState.gameMsg) {
      await gameState.gameMsg.edit({ embeds: [endEmbed], components: [] });
    } else {
      await channel.send({ embeds: [endEmbed] });
    }
  } catch (err) {
    console.error('Error editing game message at end:', err);
    await channel.send({ embeds: [endEmbed] });
  }

  gameState.gameStarted = false;
  gameState.players = [];
  gameState.scores = {};
  gameState.selectedLetters = [];
  gameState.gameMsg = null;
  gameState.collector = null;
}
