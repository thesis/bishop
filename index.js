const TOKEN = process.env.TOKEN
const ROLE = process.env.ROLE
const EMOJI = process.env.EMOJI
const GUILD = process.env.GUILD
const KEEP_ROLE = process.env.KEEP_ROLE

const sevenDaysInMinutes = 7 * 24 * 60

const { Client, Intents } = require('discord.js');
const CronJob = require('cron').CronJob;
const moment = require('moment')

const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_MEMBERS,
] });

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('threadCreate', async thread => {
  if (thread.ownerId !== client.user.id) {
    await thread.join()
    const placeholder = await thread.send("<placeholder>")
    await placeholder.edit("<@&" + ROLE + ">")
    if (thread.autoArchiveDuration < sevenDaysInMinutes) {
      thread.setAutoArchiveDuration(sevenDaysInMinutes)
    }
  }
});

client.on('messageCreate', async message => {
  if (!!message.reference && !!message.reference.messageId) {
    const channel = await client.channels.fetch(message.reference.channelId)
    const referenceMessage = await channel.messages.fetch(message.reference.messageId)
    if (!!referenceMessage.reference) {
      message.react(EMOJI)
    }
  }
});

const mondayStandup = new CronJob('30 1 * * 1', async function() {
  const guild = await client.guilds.fetch(GUILD)
  const channels = await guild.channels.fetch()
  const channel = channels.find(channel => channel.name === "standups")
  const threadName = `${moment().format('YYYY-MM-DD')} Standup`
  const thread = await channel.threads.create({
    name: threadName,
    autoArchiveDuration: sevenDaysInMinutes,
    reason: "Monday Standup"
  })
  thread.send(
    `<@&${ROLE}>, Please post what you plan on accomplishing this week with the following syntax\n\n` +
    `- [ ] A robot may not injure a human being or, through inaction, allow a human being to come to harm.\n` + 
    `- [ ] A robot must obey the orders given it by human beings except where such orders would conflict with the First Law.\n` +
    `- [ ] A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.`
  )
}, null, true, 'America/New_York');
mondayStandup.start();

const fridayStandup = new CronJob('30 1 * * 5', async function() {
  const guild = await client.guilds.fetch(GUILD)
  const channels = await guild.channels.fetch()
  const channel = channels.find(channel => channel.name === "standups")
  const threadName = `${moment().format('YYYY-MM-DD')} EOW Standup`
  const thread = await channel.threads.create({
    name: threadName,
    autoArchiveDuration: sevenDaysInMinutes,
    reason: "Friday Standup"
  })
  const threads = await channel.threads.fetch()
  let mondayDate = moment().subtract(4, 'days')
  const mondayThreadName = `${mondayDate.format('YYYY-MM-DD')} Standup`
  const mondayThread = threads.threads.find(t => t.name === mondayThreadName)
  const mondayTheadLink = mondayThread ? ` ${mondayThread}` : ""
  thread.send(
    `<@&${ROLE}>, Please paste in what you set out to accomplish from Monday${mondayTheadLink}, as well as what you ended up accomplishing with the following syntax\n\n` +
    `- [X] A robot may not injure a human being or, through inaction, allow a human being to come to harm.\n` + 
    `- [ ] A robot must obey the orders given it by human beings except where such orders would conflict with the First Law.\n` +
    `- [X] A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.\n\n` +
    `Use [ ] to denote work that was planned but unfinished, and [X] to denote work that was accomplished.`
  )
}, null, true, 'America/New_York');
fridayStandup.start();

const dailyHuddle = new CronJob('30 16 * * 1-5', async function() {
  const guild = await client.guilds.fetch(GUILD)
  const channels = await guild.channels.fetch()
  const channel = channels.find(channel => channel.name === "keep-watercooler")
  if (channel) {
    channel.send(`<@&${KEEP_ROLE}> there's a daily huddle in huddle 0 :)`)
  }
}, null, true, 'Europe/Rome');
dailyHuddle.start();

client.login(TOKEN);
