const TOKEN = process.env.TOKEN
const ROLE = process.env.ROLE
const EMOJI = process.env.EMOJI
const GUILD = process.env.GUILD
const KEEP_ROLE = process.env.KEEP_ROLE

const sevenDaysInMinutes = 7 * 24 * 60

const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const CronJob = require('cron').CronJob
const moment = require('moment')
const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')

const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_MEMBERS,
] })

const scriptsPath = path.join(__dirname, 'scripts')
const scriptFiles = fs.readdirSync(scriptsPath).filter(file => file.endsWith('.js'))
for (const file of scriptFiles) {
  const filePath = path.join(scriptsPath, file)
  const script = require(filePath)
  client.on(script.trigger, script.execute(client))
}

function weekdaysBefore(theMoment, days) {
  let newMoment = theMoment.clone()
  while(days > 0) {
    if (newMoment.isoWeekday() < 6) {
      days -= 1
    }
    newMoment = newMoment.subtract(1, 'days')
  }
  return newMoment
}

client.on('threadCreate', async thread => {
  if (thread.ownerId !== client.user.id) {
    await thread.join()
    const placeholder = await thread.send("<placeholder>")
    await placeholder.edit("<@&" + ROLE + ">")
    if (thread.autoArchiveDuration < sevenDaysInMinutes) {
      thread.setAutoArchiveDuration(sevenDaysInMinutes)
    }
  }
})

client.on('messageCreate', async message => {
  if (!!message.reference && !!message.reference.messageId) {
    const channel = await client.channels.fetch(message.reference.channelId)
    if (!channel.isThread()) {
      const parentMessage = await channel.messages.fetch(message.reference.messageId)
      if (!!parentMessage.reference && !!parentMessage.reference.messageId) {
        const parentMessageChannel = await client.channels.fetch(parentMessage.channelId)
        const grandParentMessage = await parentMessageChannel.messages.fetch(parentMessage.reference.messageId)
        if (!grandParentMessage.reference) {
          message.react(EMOJI)
        }
      }
    }
  }
})

client.on('messageCreate', async message => {
  if (message.author.id !== client.user.id) {
    const channel = await client.channels.fetch(message.channelId)
    if (channel.isThread() && channel.name.endsWith("Standup")) {
      const messages = await channel.messages.fetch()
      const reminderMessage = messages.find(message => message.author.id === client.user.id && message.content.startsWith("I would appreciate"))
      if (reminderMessage) {
        const members = await channel.members.fetch()
        const guild = await client.guilds.fetch(GUILD)
        const fetchedMembers = await Promise.all(members.map(member => guild.members.fetch(member.id)))
        const threadMemberMap = fetchedMembers.reduce(
          (members, member) => Object.assign(members, {[member.user.id]: member.user.username}),
          {}
        )

        const messageAuthorMap = messages.reduce((authors, message) => Object.assign(authors, {[message.author.id]: true}), {})
        const membersToRemind = Object.keys(threadMemberMap)
          .filter(memberId => !messageAuthorMap[memberId])
          .map(memberId => threadMemberMap[memberId])
          .sort()

        reminderMessage.edit(`I would appreciate standup posts from:\n\n${membersToRemind.join('\n')}`)
      }
    }
  }
})

async function compactGithubEmbeds(message) {
  if (!message.author.bot) {
    const receivedEmbeds = message.embeds
    if (!!receivedEmbeds && receivedEmbeds.find(embed => embed.url && embed.url.includes('github'))) {
      await message.suppressEmbeds(true)
      const description = receivedEmbeds
        .map((embed, i) => `(${i+1}) [${embed.title}](${embed.url})`)
        .join('\n')
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setDescription(description)

      message.channel.send({embeds: [embed]})
    }
  }
}

client.on('messageCreate', compactGithubEmbeds)
client.on('messageUpdate', async (_, message) => compactGithubEmbeds(message))

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
  await thread.join()
  await thread.send(
    `<@&${ROLE}>, Please post what you plan on accomplishing this week with the following syntax\n\n` +
    `- [ ] A robot may not injure a human being or, through inaction, allow a human being to come to harm.\n` + 
    `- [ ] A robot must obey the orders given it by human beings except where such orders would conflict with the First Law.\n` +
    `- [ ] A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.`
  )

  const members = await thread.members.fetch()
  const fetchedMembers = await Promise.all(members.map(member => guild.members.fetch(member.id)))
  const listOfMemberNames = fetchedMembers.map(member => member.user.username).filter(name => name !== client.user.username).sort()
  thread.send(`I would appreciate standup posts from:\n\n${listOfMemberNames.join('\n')}`)
}, null, true, 'America/New_York')
mondayStandup.start()

function threadUrl(thread) {
  return `https://discord.com/channels/${thread.guildId}/${thread.id}`
}

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
  const mondayTheadLink = mondayThread ? ` ${threadUrl(mondayThread)}` : ""
  await thread.join()
  const message = await thread.send(
    `<@&${ROLE}>, Please paste in what you set out to accomplish from Monday${mondayTheadLink}, as well as what you ended up accomplishing with the following syntax\n\n` +
    `- [X] A robot may not injure a human being or, through inaction, allow a human being to come to harm.\n` + 
    `- [ ] A robot must obey the orders given it by human beings except where such orders would conflict with the First Law.\n` +
    `- [X] A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.\n\n` +
    `Use [ ] to denote work that was planned but unfinished, and [X] to denote work that was accomplished.`
  )
  await message.suppressEmbeds(true)

  const members = await thread.members.fetch()
  const fetchedMembers = await Promise.all(members.map(member => guild.members.fetch(member.id)))
  const listOfMemberNames = fetchedMembers.map(member => member.user.username).filter(name => name !== client.user.username).sort()
  thread.send(`I would appreciate standup posts from:\n\n${listOfMemberNames.join('\n')}`)
}, null, true, 'America/New_York')
fridayStandup.start()

const dailyHuddle = new CronJob('30 16 * * 1-5', async function() {
  const guild = await client.guilds.fetch(GUILD)
  const channels = await guild.channels.fetch()
  const channel = channels.find(channel => channel.name === "keep-watercooler")
  if (channel) {
    channel.send(`<@&${KEEP_ROLE}> there's a daily huddle in huddle 0 :)`)
  }
}, null, true, 'Europe/Rome')
dailyHuddle.start()

const cleanKeepGithub = new CronJob('30 1 * * 1', async function() {
  const guild = await client.guilds.fetch(GUILD)
  const channels = await guild.channels.fetch()
  const channel = channels.find(channel => channel.name === "keep-github")
  let messagesDeleted = -1
  let totalMessagesDeleted = 0
  while (messagesDeleted != 0) {
    messagesDeleted = (await channel.bulkDelete(100)).size 
    totalMessagesDeleted += messagesDeleted
  }
  channel.send(`Deleted ${totalMessagesDeleted} messages as part of weekly maintenance`)
})
cleanKeepGithub.start()

const archiveThreads = new CronJob('*/15 * * * *', async function() {
  const guild = await client.guilds.fetch(GUILD)
  const channels = await guild.channels.fetch()
  const longRunningThreadIds = (await read('long-running-thread-ids')) || {}
  const archiveThreshold = weekdaysBefore(moment(), 4)
  channels
    .filter(channel => channel.isText() && channel.name != "keep-github" && channel.viewable)
    .forEach(async channel => {
      const threads = await channel.threads.fetch()
      threads.threads.forEach(async thread => {
        const messages = await thread.messages.fetch({limit: 1})
        const lastActivity = Math.max(
          messages.first() && messages.first().createdTimestamp || 0,
          thread.archiveTimestamp
        )
        if (moment(lastActivity).isBefore(archiveThreshold)) {
          if (longRunningThreadIds[thread.id]) {
            await thread.setArchived(true)
            thread.setArchived(false)
          } else {
            if (thread.ownerId === client.user.id) {
              thread.setArchived(true)
            } else {
              const row = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('archive-thread')
                    .setLabel('Archive The Thread')
                    .setStyle('DANGER'),
                )
                .addComponents(
                  new MessageButton()
                    .setCustomId('long-running-thread')
                    .setLabel('Long-Running Thread')
                    .setStyle('SECONDARY'),
                )

              thread.send({
                content: `<@${thread.ownerId}>, it's been a bit since this thread has seen activity. Ready to archive it?`,
                components: [row]
              })
            }
          }
        }
      })
    })
})
archiveThreads.start()

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return
  if (interaction.customId === 'archive-thread') {
    archiveThread(interaction)
  }
  if (interaction.customId === 'long-running-thread') {
    markThreadLongRunning(interaction)
  }
})

async function archiveThread(interaction) {
  const guild = await client.guilds.fetch(interaction.guildId)
  const channel = await guild.channels.fetch(interaction.channelId)
  await interaction.reply("Done!")
  channel.setArchived(true)
}

async function markThreadLongRunning(interaction) {
  let longRunningThreadIds = await read('long-running-thread-ids') || {}
  longRunningThreadIds[interaction.channelId] = true
  await write('long-running-thread-ids', longRunningThreadIds)
  await interaction.reply("Alright. I'll keep the thread alive.")
}

let brainLock = false
const emitter = new EventEmitter()
async function read(key) {
  if (brainLock) {
    await new Promise(resolve => emitter.once('unlocked', resolve))
  }
  brainLock = true

  const data = await fs.promises.readFile("brain.json")
  const value = JSON.parse(data.toString())[key]

  brainLock = false
  emitter.emit('unlocked')
  return value
}

async function write(key, val) {
  if (brainLock) {
    await new Promise(resolve => emitter.once('unlocked', resolve))
  }
  brainLock = true

  const data = await fs.promises.readFile("brain.json")
  let brain = JSON.parse(data.toString())
  brain[key] = val
  await fs.promises.writeFile("brain.json", JSON.stringify(brain, null, 2))

  brainLock = false
  emitter.emit('unlocked')
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return

	const command = client.commands.get(interaction.commandName)

	if (!command) return

	try {
		await command.execute(interaction, client)
	} catch (error) {
		console.error(error)
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
	}
})

client.login(TOKEN)
