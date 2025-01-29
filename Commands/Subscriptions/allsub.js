const fs = require('fs');
const { owners, prefix, emco } = require(`${process.cwd()}/config`);
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'allsub',
  run: async (client, message, args) => {
    if (!owners.includes(message.author.id)) return;

    try {
      const logs = fs.readFileSync('./logs.json', 'utf8');
      const logsArray = JSON.parse(logs);

      if (logsArray.length === 0) {
        return message.reply('**There are no subscriptions currently registered.**');
      }

      // ترتيب الاشتراكات بناءً على اسم المستخدم
      logsArray.sort((a, b) => a.user.localeCompare(b.user));

      const embed = new MessageEmbed()
        .setTitle('All Subscriptions')
        .setColor(emco)
        .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1206476329344700426/cost.png?ex=65dc25a4&is=65c9b0a4&hm=93f48bf4703203e82ea94f8d52c11687360abc795209bf0530719814706c9208&")
        .setFooter(`${message.client.user.username} | Timer`, `${message.client.user.displayAvatarURL({ dynamic: true })}`);

      logsArray.forEach((userSubscription, index) => {
        const expirationTime = userSubscription.expirationTime;
        const remainingTime = expirationTime - Date.now();

        // حساب الأيام والساعات والدقائق والثواني المتبقية
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        const formattedTime = `${days ? `${days}d ` : ''}${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : ''}${seconds ? `${seconds}s` : ''}`;
        
        const guildId = userSubscription.server; // قم بتحديد الخاصية المناسبة من كائن الاشتراك

        embed.setDescription(`${embed.description || ''}\n**\`${index + 1}\` | <@${userSubscription.user}> | \`Music x${userSubscription.botsCount}\` | \`${userSubscription.code}\` | ${formattedTime} **`);
      });

      // إرسال رسالة الرد ك Embed
      message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('❌>', error);
      message.reply('An error occurred while reading the log file.');
    }
  }
};
