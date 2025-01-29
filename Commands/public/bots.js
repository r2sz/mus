const fs = require('fs');
const { owners, prefix, emco } = require(`${process.cwd()}/config`);
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'bots',
    run: (client, message) => {
        if (!owners.includes(message.author.id)) return;

        let tokens = [];
        try {
            const data = fs.readFileSync('./tokens.json', 'utf8');
            tokens = JSON.parse(data);
        } catch (error) {
            return message.reply('An error occurred while reading the token file.');
        }

        const embed = new MessageEmbed()
            .setTitle("Bots info")
            .setColor(emco)

        const displayedServerIds = new Set();
        const displayedBotClientIds = new Set();

        tokens.forEach(tokenData => {
            const { Server, client: botClientId } = tokenData;
            if (Server && botClientId && !displayedServerIds.has(Server) && !displayedBotClientIds.has(botClientId)) {
                const botCountInServer = tokens.filter(t => t.Server === Server).length;
                embed.addField(`Server ID: \`${Server}\``, `**Client ID: \`${botClientId}\`\nClient Name:  \`(\` <@${botClientId}> \`)\`\nTotal Bots: \`${botCountInServer}\`**`);
                displayedServerIds.add(Server);
                displayedBotClientIds.add(botClientId);
            }
        });

        message.channel.send({ embeds: [embed] });
    }
};
