const fs = require('fs');
const { owners, emco, logChannelId } = require(`${process.cwd()}/config`);
const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
  name: 'addsubtime',
  run: async (client, message, args) => {
    if (!owners.includes(message.author.id)) return;

    const codeToAddTime = args[0];
    if (!codeToAddTime) return message.reply("**Please attach subscription details**");

    const timeToAdd = args[1];
    if (!timeToAdd || !ms(timeToAdd)) return message.reply("**Please include a valid time.**");

    try {
      const logs = fs.readFileSync('./logs.json', 'utf8');
      const logsArray = JSON.parse(logs);

      const matchingSubscription = logsArray.find(entry => entry.code === codeToAddTime);

      if (!matchingSubscription) {
        return message.reply("**There is no subscription associated with this ID.**");
      }

      // زيادة الوقت لصاحب الاشتراك المرتبط بالكود
      const newExpirationTime = matchingSubscription.expirationTime + ms(timeToAdd);
      matchingSubscription.expirationTime = newExpirationTime;

      const logChannel = client.channels.cache.find(channel => channel.id === logChannelId);
      fs.writeFileSync('./logs.json', JSON.stringify(logsArray, null, 2));

      // رد برد التأكيد
      message.react('✅');

      // إرسال معلومات الإضافة إلى روم الوج
      const adminName = message.author.username;
      const userId = matchingSubscription.user;
      const serverId = matchingSubscription.server;
      const botsCount = matchingSubscription.botsCount;
      const subscriptionTime = matchingSubscription.subscriptionTime;
      const expirationTime = matchingSubscription.expirationTime;
      const code = matchingSubscription.code;

      const embed = new MessageEmbed()
        .setTitle('Add timeing')
        .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1198782756021342289/stopwatch.png?ex=65c02871&is=65adb371&hm=ab25a2d5b3ab4a61f62b44cf2101a05bda819d01103af9bd8d778bb057eb9f3c&")
        .setDescription(`**Admin Name:** ( <@${message.author.id}> )\n**Client Name:** ( <@${userId}> )\n**Code:** \`${code}\`\n**Added:** \`${timeToAdd}\``)
        .setColor(emco);

      logChannel.send({ embeds: [embed] });

      // إرسال Embed لتأكيد زيادة الوقت
      const successEmbed = new MessageEmbed()
        .setTitle("Time added successfully ✅")
        .setColor(emco)
        .setDescription(`**\`\`${timeToAdd}\`\` has been added to the subscription associated with code \`\`${codeToAddTime}\`\`.**`);
      message.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('❌>', error);
      message.reply('**An error occurred while trying to add time to the subscription.**');
    }
  }
};
