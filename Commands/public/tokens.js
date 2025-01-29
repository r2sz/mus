const { owners, prefix, emco } = require(`${process.cwd()}/config`);
const fs = require('fs');
const { MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require('discord.js');
module.exports = {
  name: 'tokens',
  run: (client, message) => {

    if (!owners.includes(message.author.id)) return;


    if (message.author.bot) return;

    // قراءة محتوى الملف bots.json
    let bots = [];
    try {
      const data = fs.readFileSync('./bots.json', 'utf8');
      bots = JSON.parse(data);
    } catch (error) {
      console.error('An error occurred while reading the file bots.json:', error);
    }

    // استخراج عدد التوكنات من bots.json
    const botTokenCount = bots.length;

    // قراءة محتوى الملف tokens.json
    let tokens = [];
    try {
      const data = fs.readFileSync('./tokens.json', 'utf8');
      tokens = JSON.parse(data);
    } catch (error) {
      console.error('🔴>', error);
    }

    const userTokenCount = tokens.length;

    const embed = new MessageEmbed()
    .setTitle('Token Status')
    .setColor(emco)
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`Total Tokens Stock ( \`${botTokenCount}\` <🔴)\nTotal Tokens Running ( \`${userTokenCount}\` <🟢) `)
   

  message.reply({ embeds: [embed] });

  }
}
