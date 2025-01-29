const { owners, prefix, emco } = require(`${process.cwd()}/config`);
const fs = require('fs');
const { MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require('discord.js');
module.exports = {
    name: 'help',
    run: async (client, message) => {

        if (!owners.includes(message.author.id)) return;

        const helpEmbed = new MessageEmbed()
            .setColor(emco)     
            .setTitle('List of control commands')
            .setDescription(`
   \`vip\` - view customer commands
  \`addtoken\` - Add a token to the store
  \`giveuser\` - Adding Music bots to the client
  \`bots\` - Showing bot servers to clients
  \`mysub\` - To view the person's subscription
  \`addsubtime\` - Adding additional time for the client
  \`allsub\` - View all subscriptions
  \`removesub\` - Delete a person's subscription
  \`tokens\` - Display the number of tokens

`)
            .setTimestamp();

        message.reply({ embeds: [helpEmbed] });
    }
}
