const fs = require('fs');
const { owners, prefix, emco, useEmbeds, Support} = require(`${process.cwd()}/config`);
const { MessageEmbed, Client } = require('discord.js');

module.exports = {
  name: 'removesub',
  aliases: ["remove"],
  run: async (client, message, args) => {
    if (!owners.includes(message.author.id)) return;

    if (message.author.bot) return;

    const codeToRemove = args[0];
    if (!codeToRemove) return message.reply("**Please select the subscription you want to remove.**");

    let removedTokens = [];
    try {
      const logs = fs.readFileSync('./logs.json', 'utf8');
      const logsArray = JSON.parse(logs);

      const matchingSubscriptions = logsArray.filter(entry => entry.code === codeToRemove);

      if (matchingSubscriptions.length === 0) {
        return message.reply("**There are no subscriptions associated with this ID.**");
      }

      // حذف الاشتراك من ملف logs.json
      matchingSubscriptions.forEach(subscription => {
        logsArray.splice(logsArray.indexOf(subscription), 1);
      });

      // تحديث ملف logs.json بعد الإزالة
      fs.writeFileSync('./logs.json', JSON.stringify(logsArray, null, 2));

      // حذف التوكنات المرتبطة بالكود من ملف tokens.json
      const tokens = fs.readFileSync('./tokens.json', 'utf8');
      let tokensArray = JSON.parse(tokens);
      if (!Array.isArray(tokensArray)) {
        tokensArray = [];
      }

      const tokensToRemove = tokensArray.filter(tokenEntry => matchingSubscriptions.some(subscription => tokenEntry.code === subscription.code));
      tokensArray = tokensArray.filter(tokenEntry => !tokensToRemove.includes(tokenEntry));

      // إضافة التوكنات المحذوفة إلى ملف bots.json
      const bots = fs.readFileSync('./bots.json', 'utf8');
      let botsArray = JSON.parse(bots);
      if (!Array.isArray(botsArray)) {
        botsArray = [];
      }

      tokensToRemove.forEach(tokenEntry => {
        botsArray.push({
          token: tokenEntry.token,
          Server: null,
          channel: null,
          chat: null,
          status: null,
          client: null,
          useEmbeds: false
        });
        removedTokens.push(tokenEntry);
      });

      // تحديث ملف bots.json بعد الإضافة
      fs.writeFileSync('./bots.json', JSON.stringify(botsArray, null, 2));

      // تحديث ملف tokens.json بعد الإزالة
      fs.writeFileSync('./tokens.json', JSON.stringify(tokensArray, null, 2));

      // رد برد التأكيد
      message.react('✅');

    } catch (error) {
      console.error('❌>', error);
      message.reply('**An error occurred while trying to remove the subscription.**');
    }

    // الجزء الجديد
    const numberOfBotsReset = removedTokens.length;

    // دالة setTimeout لتأخير تغيير التوكنات
    setTimeout(async () => {
      removedTokens.forEach(async (token) => {
        try {
          const randomName = `high-${Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000}`;
          const botClient = new Client({
            intents: [
              'GUILDS',
              'GUILD_MEMBERS',
              'GUILD_MESSAGES',
            ],
          });

          await botClient.login(token.token);

          botClient.guilds.cache.forEach(async (guild) => {
            await guild.leave();
          });

          await botClient.user.setAvatar('https://cdn.discordapp.com/attachments/1091536665912299530/1206472058171686942/musica.png?ex=65dc21a9&is=65c9aca9&hm=3e9b05788e5ad4654b98c535e349346fb23768b7a7fae7f37f6758e5c66805cf&');
          await botClient.user.setUsername(randomName);

          await botClient.destroy();
        } catch (error) {
          console.error(`حدث خطأ أثناء تشغيل التوكن: ${error}`);
        }
      });

      // إرسال Embed بعد الانتهاء
      const successEmbed = new MessageEmbed()
        .setTitle("Successful use✅")
        .setColor(emco)
        .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206470919309230190/done.png?ex=65dc209a&is=65c9ab9a&hm=1d4cc74e1e72d6c00aed39046403d3f7e088639b8927674cc3bbcaf6115b6f2e&")
        .setDescription(`**\`\`${numberOfBotsReset}\`\` bot has been reset and saved to the vault successfully!.**`);
      message.reply({ embeds: [successEmbed] });
    }, 0);  // يمكنك ضبط القيمة إلى الوقت الذي تشاء لتأخير التنفيذ
  }
};
