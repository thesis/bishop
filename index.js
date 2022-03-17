const TOKEN = process.env.TOKEN
const ROLE = process.env.ROLE
const EMOJI = process.env.EMOJI

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_MEMBERS,
] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('threadCreate', async thread => {
  thread.join()
  thread.send("<placeholder").then(placeholder => {
    placeholder.edit("<@&" + ROLE + ">")
  })
});

client.on('messageCreate', async message => {
  if (!!message.reference) {
    client.channels.fetch(message.reference.channelId).then(channel => {
      channel.messages.fetch(message.reference.messageId).then(referenceMessage => {
        if (!!referenceMessage.reference) {
          message.react(EMOJI)
        }
      })
    })
  }
});

client.login(TOKEN);
