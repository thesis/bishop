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
