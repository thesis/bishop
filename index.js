const TOKEN = process.env.TOKEN

const { Client, Intents } = require('discord.js')
const CronJob = require('cron').CronJob
const fs = require('fs')
const path = require('path')

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

client.login(TOKEN)
