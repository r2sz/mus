const fs = require('fs');
const { owners, emco, logChannelId } = require(`${process.cwd()}/config`);
const { exec } = require('child_process');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const crypto = require('crypto');

module.exports = {
  name: 'giveuser',
  run: async (client, message, args) => {
    if (!owners.includes(message.author.id)) return;

    if (message.author.bot) return;

    const mention = message.mentions.members.first();
    if (!mention) return message.reply("**Please attach the person's name.**");

    const userId = mention.id;
    const serverId = args[1];
    if (!serverId) return message.reply("**Please attach the server Please attach the server ID.**");

    let bots = [];
    try {
      const data = fs.readFileSync('./bots.json', 'utf8');
      bots = JSON.parse(data);
    } catch (error) {
      console.error('❌>', error);
    }

    const count = parseInt(args[2]);
    if (!count || count <= 0 || count > bots.length) {
      return message.reply('**Please include the number of bots.**');
    }

    const subscriptionTime = args[3];
    const subscriptionDuration = ms(subscriptionTime);
    if (!subscriptionDuration) return message.reply("**Please include a valid time to subscribe.**");

    const remainingTime = ms(subscriptionDuration, { long: true });
    const expirationTime = Date.now() + subscriptionDuration;

    const randomCode = generateRandomCode(5);

    const logsData = {
      user: userId,
      server: serverId,
      botsCount: count,
      subscriptionTime: subscriptionTime,
      expirationTime: expirationTime,
      code: `#${randomCode}`
    };

    try {
      const logs = fs.readFileSync('./logs.json', 'utf8');
      const logsArray = JSON.parse(logs);
      logsArray.push(logsData);
      fs.writeFileSync('./logs.json', JSON.stringify(logsArray, null, 2));
    } catch (error) {
      console.error('❌>', error);
    }

    const givenTokens = bots.splice(0, count);
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

    givenTokens.forEach(token => {
      tokens.push({
        token: token.token,
        Server: serverId,
        channel: null,
        chat: null,
        status: null,
        client: userId,
        useEmbeds: false,
        code: `#${randomCode}`
      });
    });

    fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2));
    fs.writeFileSync('./bots.json', JSON.stringify(bots, null, 2));

    exec('pm2 restart index.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌> ${error}`);
        return;
      }
      console.log(`❌> ${stdout}`);
      console.log(`❌> ${stderr}`);
    });


    message.react(`✅`);


    const logChannel = client.channels.cache.find(channel => channel.id === logChannelId);
    const remainingTimeString = ms(remainingTime, { long: true });

/*

    mention.send({
      files: ['https://cdn.discordapp.com/attachments/1091536665912299530/1198707453932601374/2_days.png?ex=65bfe24f&is=65ad6d4f&hm=89fee58b451ab5803d024d071e3700e3c9e2e92db5d2fc12dc6cefa45ad2356d&'],
    });


    const embedd = new MessageEmbed()
    .setDescription(`dsadsa`)
   .setColor(emco);

   mention.send({ embeds: [embedd] });

*/


    const embed = new MessageEmbed()
      .setTitle('Add Subscription Details')
      .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1198775903480717322/add.png?ex=65c0220f&is=65adad0f&hm=c57ea6a3c47c20f9275cea134dd935c6015cdcb1781e597d094f23563249e37a&")
      .setDescription(`**Admin Name:** \`${message.author.username}\` / <@${message.author.id}>\n**User ID:** \`${userId}\` / <@${userId}>\n**ServerId:** \`${serverId}\`\n**Number of Bots:** \`${count}\`\n**Subscription Time:** \`${subscriptionTime}\`\n**Expiration Time:** \`${new Date(expirationTime).toLocaleString()}\`\n**Code:** \`${randomCode}\``)
     .setColor(emco);

    logChannel.send({ embeds: [embed] });
  }
};

function generateRandomCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}
