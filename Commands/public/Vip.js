const fs = require('fs');
const { Client, Intents, MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require('discord.js');
const { owners, prefix, emco } = require(`${process.cwd()}/config`);

module.exports = {
  name: 'vip',
  run: async (client, message) => {
    if (message.author.bot) return;
    const userId = message.author.id;

    if (!fs.existsSync('./tokens.json')) {
      return;
    }

    let tokens = [];
    try {
      const tokensData = fs.readFileSync('./tokens.json', 'utf8');
      tokens = JSON.parse(tokensData);
    } catch (error) {
      console.error('an error occurredأثناء قراءة الملف tokens.json:', error);
      return message.reply('An error occurred while reading the file.');
    }

    const userTokens = tokens.filter(token => token.client === userId);

    if (userTokens.length === 0) {
      return;
    }

    const selectMenu = new MessageSelectMenu()
      .setCustomId('musicOptions')
      .setPlaceholder('Please select..')
      .addOptions([
        {
          label: 'Bots links',
          emoji: '🔗',
          description: 'Get links to all the bots you own',
          value: 'allBotsLinks',
        },
        {
          label: 'Server management',
          emoji: '⚙️',
          description: 'Moving and adding servers where bots are located',
          value: 'updateServerId',
        },{
          label: 'Change pictures',
          emoji: '🖼️',
          description: 'Change the image of all bots',
          value: 'changeBotAvatars',
        },{
          label: 'Reboot',
          emoji: '🔁',
          description: 'Restart all bots you own',
          value: 'restartAllBots',
      },{
        label: 'Change of status',
        emoji: '🔁',
        description: 'Change the status of all bots to Streaming',
        value: 'changeBotStatus',
      },{
        label: 'Install bots',
        emoji: '⬇️',
        description: 'Enter all bots that are not hanging in the renewed room.',
        value: 'installBot',
      }
      ]);

    const deleteButton = new MessageButton()
      .setCustomId('Cancel3')
      .setLabel('Cancel')
      .setEmoji("✖️")
      .setStyle('DANGER');

      const totalBots = userTokens.length;

      message.reply({
        content: `The total number of bots is: \`${totalBots}\``,
        components: [
          new MessageActionRow().addComponents(selectMenu),
          new MessageActionRow().addComponents(deleteButton)
        ], 
      });
      
    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 60000 });

    collector.on('collect', async (interaction) => {
      collector.stop(); // إيقاف المجمع بمجرد الاستجابة لأي تفاعل
    
      if (interaction.customId === 'Cancel3') {
        await interaction.message.delete();
        return;
      }

      if (!interaction.values || !interaction.values[0]) {
        console.error('No values provided in the interaction.');
        return;
      }

      const selectedOption = interaction.values[0];

      if (selectedOption === 'allBotsLinks') {
        await interaction.deferReply();
        let botInfoPromises = [];
        let totalBots = userTokens.length; // عدد البوتات الكلي
    
        for (let [index, token] of userTokens.entries()) {
            const botIntents = new Intents([
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS
            ]);
            const bot = new Client({ intents: botIntents });
    
            botInfoPromises.push(new Promise(async (resolve, reject) => {
                try {
                    await bot.login(token.token);
                    const botInfo = `\`${bot.user?.username || "unknown"}\` https://discord.com/api/oauth2/authorize?client_id=${bot.user?.id}&permissions=0&scope=bot`;
                    resolve(botInfo);
                } catch (err) {
                    reject(err);
                }
            }));
        }
    
        Promise.all(botInfoPromises)
            .then(botInfos => {
                // إرسال كل رابط بوت بشكل منفصل
                botInfos.forEach((botInfo, index) => {
                    interaction.user.send(`**  Music bot link No.${index + 1} :**\n${botInfo}`)
                        .catch(() => {
                            console.error("An error occurred while sending the link:", err);
                        });
                });
    
                // إشعار بأن جميع الروابط تم إرسالها


                const sendEmbed = new MessageEmbed()
                .setTitle("Successful use")
                .setDescription("**Please contact technical support**")
                .setDescription(`**Links of all bots have been sent**\n**Affected bots: \`${totalBots}\`**\nDear, if the links have not been sent, be sure to open the private 🔓`)
                .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206470919309230190/done.png?ex=65dc209a&is=65c9ab9a&hm=1d4cc74e1e72d6c00aed39046403d3f7e088639b8927674cc3bbcaf6115b6f2e&")
                .setColor(emco)
    
                interaction.followUp({ embeds: [sendEmbed] });
    

            })
            .catch(err => {
              console.error("An error occurred while collecting bot links:", err);
              const errorEmbed = new MessageEmbed()
                  .setTitle("an error occurred")
                  .setDescription("**Please contact technical support**")
                  .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206471414538833970/NO.png?ex=65dc2110&is=65c9ac10&hm=2ab5642ef60febb9e8938ce0405e94cf4be1cbf0cedd34e3b93ab0da73ec3571&")
                  .setColor(emco)
      
              interaction.followUp({ embeds: [errorEmbed] });
          });
      
    
      } else if (selectedOption === 'updateServerId') {
        await interaction.deferReply();
    
        const replyMessage = await interaction.followUp({ content: '**Please attach the server ID to the chat.**', ephemeral: true });
    
        const serverIdFilter = (response) => {
            return response.author.id === message.author.id && response.content.trim().length > 0;
        };
    
        const serverIdCollector = message.channel.createMessageCollector({ filter: serverIdFilter, time: 10000 });
    
        serverIdCollector.on('collect', async (response) => {
            const newServerId = response.content.trim();
    
            // تحديث جميع البوتات للإشارة إلى السيرفر الجديد
            for (const token of userTokens) {
                token.Server = newServerId;
            }
            fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2));
    
            let botInfoPromises = [];
            for (let [index, token] of userTokens.entries()) {
                const botIntents = new Intents([
                    Intents.FLAGS.GUILDS,
                    Intents.FLAGS.GUILD_MESSAGES,
                    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
                ]);
                const bot = new Client({ intents: botIntents });
    
                botInfoPromises.push(new Promise(async (resolve, reject) => {
                    try {
                        await bot.login(token.token);
    
                        // إخراج البوت من جميع السيرفرات عدا السيرفر الذي تم إرسال ايديه
                        for (const guild of bot.guilds.cache.values()) {
                            if (guild.id === newServerId) continue; // تجنب السيرفر الجديد
                            if (guild.ownerId === bot.user.id) continue; // تجنب السيرفر الذي البوت هو مالكًا له
    
                            try {
                                await guild.leave();
                            } catch (error) {
                                console.error(` > ${guild.id}:`, error.message);
                            }
                        }
    
                        const botInviteLink = `https://discord.com/api/oauth2/authorize?client_id=${bot.user?.id}&permissions=0&scope=bot`;
                        resolve(botInviteLink);
                    } catch (err) {
                        reject(err);
                    }
                }));
            }
    
            Promise.all(botInfoPromises)
            .then(botInviteLinks => {
                botInviteLinks.forEach((botInviteLink, index) => {
                    message.author.send(`** : Music bot link No.${index + 1}:**\n${botInviteLink}`)
                        .catch(() => {
                            console.error("An error occurred while sending the bot link:", err);
                        });
                });
        
                const successEmbed = new MessageEmbed()
                    .setTitle("Successful use ")
                    .setColor(emco)
                    .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206470919309230190/done.png?ex=65dc209a&is=65c9ab9a&hm=1d4cc74e1e72d6c00aed39046403d3f7e088639b8927674cc3bbcaf6115b6f2e&")
                    .setDescription(`**All bots have been successfully migrated, private bot links will now be sent**\n**Affected bots: \`${botInviteLinks.length}\`**`);
            
                interaction.followUp({ embeds: [successEmbed] });
            })
            .catch(err => {
              console.error("An error occurred while logging in:", err);
              const errorEmbed = new MessageEmbed()
                  .setTitle("an error occurred")
                  .setDescription("**Please contact technical support**")
                  .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206471414538833970/NO.png?ex=65dc2110&is=65c9ac10&hm=2ab5642ef60febb9e8938ce0405e94cf4be1cbf0cedd34e3b93ab0da73ec3571&")
                  .setColor(emco)
              
              interaction.followUp({ embeds: [errorEmbed] });
          });
          
            await message.delete(); // حذف الرسالة التي تحتوي على الصورة
            serverIdCollector.stop();
        });
    
        serverIdCollector.on('end', () => {
            if (!replyMessage.deleted) {
                replyMessage.delete().catch(console.error);
            }
        });
    }
    else if (selectedOption === 'changeBotAvatars') {
      await interaction.deferReply();
      
      const promptEmbed = new MessageEmbed()
          .setColor(emco)
          .setDescription(`<@${interaction.user.id}>\nPlease attach the new image. Note: The image must be attached as an image and not a link, and the image size must be less than 10 MB.\nAnd wait a little..`);
  
      const cancelButton = new MessageButton()
          .setCustomId('cancelChangeAvatar')
          .setLabel('cancellation')
          .setStyle('DANGER');
  
      const actionRow = new MessageActionRow().addComponents(cancelButton);
  
      const replyMessage = await interaction.followUp({ embeds: [promptEmbed], components: [actionRow] });
  
      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 70000 });
  
      let changedBotCount = 0; // عدد البوتات التي تم تغيير صورتها
  
      collector.on('collect', async (buttonInteraction) => {
          if (buttonInteraction.customId === 'cancelChangeAvatar') {
              await buttonInteraction.update({ content: 'The operation has been cancelled.', components: [] });
              collector.stop();
              return;
          }
  
          const messageCollectorFilter = (message) => message.author.id === interaction.user.id && message.attachments.size > 0;
          const messageCollector = interaction.channel.createMessageCollector({ filter: messageCollectorFilter, time: 70000 });
  
          // تغيير صور البوتات باستخدام الصورة المُرسلة
          for (const tokenData of userTokens) {
              const botIntents = new Intents([
                  Intents.FLAGS.GUILDS,
                  Intents.FLAGS.GUILD_MESSAGES,
                  Intents.FLAGS.GUILD_MESSAGE_REACTIONS
              ]);
              const bot = new Client({ intents: botIntents });
  
              try {
                  await bot.login(tokenData.token);
                  await bot.user.setAvatar(buttonInteraction.message.attachments.first().url);
                  changedBotCount++; // زيادة عدد البوتات التي تم تغيير صورتها
                  await bot.destroy();
              } catch (err) {
                console.error(`an error occurred while changing the bot image: ${bot.user?.username || "Unknown"} - ${err.message}`);
              }
          }
  
          const successEmbed = new MessageEmbed()
              .setTitle("Successful use ")
              .setColor(emco)
              .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206470919309230190/done.png?ex=65dc209a&is=65c9ab9a&hm=1d4cc74e1e72d6c00aed39046403d3f7e088639b8927674cc3bbcaf6115b6f2e&")
              .setDescription(`**All bot images have been successfully changed, affected bots: \`${changedBotCount}\`**`);
  
          await replyMessage.edit({ embeds: [successEmbed], components: [] });
          collector.stop();
      });
  
      collector.on('end', () => {
          if (!replyMessage.deleted) {
              replyMessage.delete().catch(console.error);
          }
      });
  
      // مُعالج للرسائل الغير متصلة بالزر
      const messageCollectorFilter = (message) => message.author.id === interaction.user.id && message.attachments.size > 0;
      const messageCollector = interaction.channel.createMessageCollector({ filter: messageCollectorFilter, time: 70000 });
  
      messageCollector.on('collect', async (message) => {
          const imageUrl = message.attachments.first().url;
  
          for (const tokenData of userTokens) {
              const botIntents = new Intents([
                  Intents.FLAGS.GUILDS,
                  Intents.FLAGS.GUILD_MESSAGES,
                  Intents.FLAGS.GUILD_MESSAGE_REACTIONS
              ]);
              const bot = new Client({ intents: botIntents });
  
              try {
                  await bot.login(tokenData.token);
                  await bot.user.setAvatar(imageUrl);
                  changedBotCount++; // زيادة عدد البوتات التي تم تغيير صورتها
                  await bot.destroy();
              } catch (err) {
                console.error(`an error occurred while changing the bot image: ${bot.user?.username || "Unknown"} - ${err.message}`);
              }
          } 
  
          const successEmbed = new MessageEmbed()
          .setTitle("Successful use ")
          .setColor(emco)
          .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206470919309230190/done.png?ex=65dc209a&is=65c9ab9a&hm=1d4cc74e1e72d6c00aed39046403d3f7e088639b8927674cc3bbcaf6115b6f2e&")
          .setDescription(`**All bot images have been successfully changed, affected bots: \`${changedBotCount}\`**`);
  
      await replyMessage.edit({ components: [] });
      interaction.followUp({ embeds: [successEmbed] });
  
      await message.delete(); // حذف الرسالة التي تحتوي على الصورة
      messageCollector.stop();
  });

      messageCollector.on('end', () => {
          if (!replyMessage.deleted) {
              replyMessage.delete().catch(console.error);
          }
      });
  }
  else if (selectedOption === 'restartAllBots') {
    await interaction.deferReply();

    let restartedBotCount = 0; // عدد البوتات التي تم إعادة تشغيلها

    // إعادة تشغيل جميع البوتات
    for (const tokenData of userTokens) {
        const botIntents = new Intents([
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ]);
        const bot = new Client({ intents: botIntents });

        try {
            await bot.login(tokenData.token);
            await bot.destroy();
            const newBotInstance = new Client({ intents: botIntents });
            await newBotInstance.login(tokenData.token);
            restartedBotCount++; // زيادة عدد البوتات التي تم إعادة تشغيلها
        } catch (err) {
            console.error(`an error occurred while restarting the bot: ${bot.user?.username || "Unknown"} - ${err.message}`);
        }
    }

    const successEmbed = new MessageEmbed()
        .setTitle("Successful use ")
        .setColor(emco)
        .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206470919309230190/done.png?ex=65dc209a&is=65c9ab9a&hm=1d4cc74e1e72d6c00aed39046403d3f7e088639b8927674cc3bbcaf6115b6f2e&")
        .setDescription(`**All bots have been restarted successfully\nAffected bots: \`${restartedBotCount}\`**`);

    interaction.followUp({ embeds: [successEmbed] });
}
if (selectedOption === 'changeBotStatus') {
  await interaction.deferReply();

  const promptEmbed = new MessageEmbed()
      .setColor(emco)
      .setDescription(`<@${interaction.user.id}>\n**Please enter the status you want to assign to the bots**\nAnd wait a little..`);

  const cancelButton = new MessageButton()
      .setCustomId('cancelChangeStatus')
      .setLabel('Cancellation')
      .setStyle('DANGER');

  const actionRow = new MessageActionRow().addComponents(cancelButton);

  const replyMessage = await interaction.followUp({ embeds: [promptEmbed], components: [actionRow] });

  const filter = (message) => message.author.id === interaction.user.id;
  const messageCollector = interaction.channel.createMessageCollector({ filter, time: 70000 });

  let changedBotCount = 0; // تتبع عدد البوتات التي تم تغيير حالتها

  messageCollector.on('collect', async (message) => {
      const newStatus = message.content.trim().toLowerCase();

      // تحديث ملف التوكنات بالحالة الجديدة
      userTokens.forEach(tokenData => {
          tokenData.status = newStatus;
      });
      fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2));

      // تغيير حالة البوتات
      for (const tokenData of userTokens) {
          const botIntents = new Intents([
              Intents.FLAGS.GUILDS,
              Intents.FLAGS.GUILD_MESSAGES,
              Intents.FLAGS.GUILD_MESSAGE_REACTIONS
          ]);
          const bot = new Client({ intents: botIntents });
          try {
              await bot.login(tokenData.token);

              // تحديث الحالة والأنشطة
              await bot.user.setPresence({
                  activities: [
                      {
                          name: newStatus,
                          type: 'STREAMING',
                          url: "https://twitch.tv/" + newStatus,
                      },
                  ],
                  status: newStatus,
              });

              await bot.destroy();
              changedBotCount++; // زيادة عدد البوتات التي تم تغيير حالتها
          } catch (err) {
            console.error(`an error occurred while changing bot state: ${bot.user?.username || "Unknown"} - ${err.message}`);
          }
      }

      const successEmbed = new MessageEmbed()
          .setTitle("Successful use ")
          .setColor(emco)
          .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206470919309230190/done.png?ex=65dc209a&is=65c9ab9a&hm=1d4cc74e1e72d6c00aed39046403d3f7e088639b8927674cc3bbcaf6115b6f2e&")
          .setDescription(`**The status of all bots has been successfully changed\nAffected bots: \`${changedBotCount}\`**`);
      await replyMessage.reply({ embeds: [successEmbed] });
            messageCollector.stop();
  });

  messageCollector.on('end', () => {
    if (!replyMessage.deleted) {
      replyMessage.delete().catch(console.error);
    }
  });
} else if (selectedOption === 'installBot') {
  await interaction.deferReply();

  //const replyMessage = await interaction.followUp({ content: '**يرجى إرفاق ايدي الفويس.**', ephemeral: true });
  
  const successEmbed = new MessageEmbed()
  .setColor(emco)
  .setDescription(`<@${interaction.user.id}>\n**Please attach the voice ID to which you want to install the bots that are not installed on rooms**\nAnd wait a little..`);
  const replyMessage = await interaction.followUp({ embeds: [successEmbed] });

  const voiceIdFilter = (response) => {
      return response.author.id === interaction.user.id && response.content.trim().length > 0;
  };

  const voiceIdCollector = interaction.channel.createMessageCollector({ filter: voiceIdFilter, time: 10000 });

  let transferredBotCount = 0; // تتبع عدد البوتات التي تم نقلها

  voiceIdCollector.on('collect', async (response) => {
      const voiceId = response.content.trim();

      // تحديث ملف التوكنات بقيمة الفويس المُحدد
      for (const tokenData of userTokens) {
          if (tokenData.channel === null) {
              tokenData.channel = voiceId;
              transferredBotCount++; // زيادة عدد البوتات التي تم نقلها
          }
      }
      fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2));

      // تحديث قنوات البوتات بقيمة الفويس المُحدد
      for (const tokenData of userTokens) {
          if (tokenData.channel === null) continue; // تجاهل البوتات التي لا تحتوي على قناة فويس محددة
          const botIntents = new Intents([
              Intents.FLAGS.GUILDS,
              Intents.FLAGS.GUILD_MESSAGES,
              Intents.FLAGS.GUILD_MESSAGE_REACTIONS
          ]);
          const bot = new Client({ intents: botIntents });
          try {
              await bot.login(tokenData.token);
              // تحديث قناة البوت بقيمة الفويس المُحدد إذا كانت قيمة القناة هي null
              if (bot.channel === null) {
                  bot.channel = voiceId;
                  transferredBotCount++; // زيادة عدد البوتات التي تم نقلها
              }
              await bot.destroy();
          } catch (err) {
            console.error(`an error occurred while updating the bot channel: ${bot.user?.username || "Unknown"} - ${err.message}`);
          }
      }

      const successEmbed = new MessageEmbed()
          .setTitle("Successful use ")
          .setColor(emco)
          .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206470919309230190/done.png?ex=65dc209a&is=65c9ab9a&hm=1d4cc74e1e72d6c00aed39046403d3f7e088639b8927674cc3bbcaf6115b6f2e&")
          .setDescription(`**Bots installed successfully\nAffected bots: \`${transferredBotCount}\`**`);


      await interaction.followUp({ embeds: [successEmbed] });
      voiceIdCollector.stop();
  });


  voiceIdCollector.on('end', () => {
    if (!replyMessage.deleted) {
      replyMessage.delete().catch(console.error);
    }
  });
}




  

    });
  }
}