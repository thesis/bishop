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

const cronPath = path.join(__dirname, 'cron')
const cronFiles = fs.readdirSync(cronPath).filter(file => file.endsWith('.js'))
for (const file of cronFiles) {
  const filePath = path.join(cronPath, file)
  const cron = require(filePath)
  const job = new CronJob(cron.schedule, cron.execute(client), null, true, cron.timezone)
  job.start()
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
