const { owners, prefix } = require(`${process.cwd()}/config`);
const { Client, Intents } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'addtoken',
  run: async (client, message) => {
    if (!owners.includes(message.author.id)) return;

    const botIntents = [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
    ];

    const clientCheck = new Client({ intents: botIntents });

    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();
    const tokenValues = args;

    if (tokenValues.length === 0) return message.reply('**Please attach the token after ordering.**');

    const validTokens = [];

    for (const tokenValue of tokenValues) {
      try {
        await clientCheck.login(tokenValue);
        validTokens.push(tokenValue);
      } catch (error) {
        if (error.message === 'TOKEN_INVALID') {
          console.error(` Not work! > ${tokenValue}`);
          message.reply(`\` Not work! > ${tokenValue}\``);
        } else {
          console.error(`> ${tokenValue}`, error.message);
          message.reply(`\`** Not work!** ${tokenValue}\``);
        }
      }
    }

    if (validTokens.length > 0) {
      message.react("✅");

      let bots = [];
      try {
        const data = fs.readFileSync('./bots.json', 'utf8');
        bots = JSON.parse(data);
        if (!Array.isArray(bots)) {
          bots = [];
        }
      } catch (error) {
        console.error('>', error);
      }

      for (const tokenValue of validTokens) {
        const tokenExists = bots.some(bot => bot.token === tokenValue);
        if (!tokenExists) {
          bots.push({
            token: tokenValue,
            Server: null,
            channel: null,
            chat: null,
            status: null,
            client: null,
            useEmbeds: false
          });
        }
      }
      fs.writeFileSync('./bots.json', JSON.stringify(bots, null, 2));

      // دالة لتوليد رقم عشوائي مكون من أربعة أرقام
      function generateRandomNumber() {
        return Math.floor(1000 + Math.random() * 9000); // يولد رقمًا بين 1000 و 9999
      }

      // تأخير تغيير صورة البوت وتعيين الاسم
      setTimeout(async () => {
        for (const tokenValue of validTokens) {
          try {
            const botClient = new Client({ intents: botIntents });
            await botClient.login(tokenValue);

            // تحقق مما إذا كان البوت متصلاً بأي سيرفر
            if (botClient.guilds.cache.size > 0) {
              // إذا كان متصلاً بأي سيرفر، قم بخروجه من جميع السيرفرات
              botClient.guilds.cache.forEach(async guild => {
                try {
                  await guild.leave();
                } catch (leaveError) {
                  console.error(` Error leaving guild ${guild.name}:`, leaveError.message);
                }
              });
            }

            const randomNumber = generateRandomNumber();
            await botClient.user.setUsername(`high-${randomNumber}`);
            await botClient.user.setAvatar('https://media.discordapp.net/attachments/1034522368523120720/1223390063681867857/Bot_3.png?ex=6619adc8&is=660738c8&hm=6ff5eadf2355a995294f4eb9552f03fdddd164c01ee53cad762523a2c74e8745&=&format=webp&quality=lossless');


            // تسجيل خروج البوت بعد تغيير البيانات الشخصية
            await botClient.destroy();
          } catch (avatarError) {
            console.error(`>`, avatarError.message);
          }
        }
      }, 5000);
    }
  }
}
