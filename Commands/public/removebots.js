const fs = require('fs');
const { owners, prefix } = require(`${process.cwd()}/config`);
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: 'removebots',
  run: async (client, message, args) => {
    if (!owners.includes(message.author.id)) return;

    if (message.author.bot) return;

    const targetId = args[0];
    if (!targetId) return message.reply("**Please attach the ID of the person or server.**");

    // تحميل التوكنات من ملف tokens.json
    let tokens = [];
    try {
      const tokensData = fs.readFileSync('./tokens.json', 'utf8');
      tokens = JSON.parse(tokensData);
      if (!Array.isArray(tokens)) {
        tokens = [];
      }
    } catch (error) {
      console.error('An error occurred while reading the file tokens.json:', error);
    }

    // حذف التوكنات من المصفوفة
    const removedTokens = tokens.filter(token => token.Server === targetId || token.client === targetId);
    tokens = tokens.filter(token => !(token.Server === targetId || token.client === targetId));

    removedTokens.forEach(token => {
      token.Server = null;
      token.channel = null;
      token.chat = null;
      token.status = null;
      token.client = null;
      token.useEmbeds = false;
    });

    // تحميل البوتات من ملف bots.json
    let bots = [];
    try {
      const botsData = fs.readFileSync('./bots.json', 'utf8');
      bots = JSON.parse(botsData);
      if (!Array.isArray(bots)) {
        bots = [];
      }
    } catch (error) {
      console.error('❌>', error);
    }

    // إضافة التوكنات المحذوفة إلى ملف bots.json
    bots = bots.concat(removedTokens);

    // حفظ التغييرات في ملفات JSON
    fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2));
    fs.writeFileSync('./bots.json', JSON.stringify(bots, null, 2));

    // عدد البوتات التي تم إعادة تعيينها
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
          console.error(`An error occurred while running the token: ${error}`);
        }
      });

      // إرسال Embed بعد الانتهاء
      const successEmbed = new MessageEmbed()
      .setTitle("Successful use ✅")
        .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206470919309230190/done.png?ex=65dc209a&is=65c9ab9a&hm=1d4cc74e1e72d6c00aed39046403d3f7e088639b8927674cc3bbcaf6115b6f2e&")
        .setDescription(`**\`\`${numberOfBotsReset}\`\` bot has been reset and saved to the vault successfully!.**`)
      message.reply({ embeds: [successEmbed] });
    }, 0);  // يمكنك ضبط القيمة إلى الوقت الذي تشاء لتأخير التنفيذ
  }
};
