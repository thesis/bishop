const GUILD = process.env.GUILD
const TOKEN = process.env.TOKEN

const { Collection } = require('discord.js')
const fs = require('fs')
const path = require('path')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const rest = new REST({ version: '9' }).setToken(TOKEN)

module.exports = {
  trigger: 'ready',
	execute(client) {
    return async () => {
      client.commands = new Collection()
      const commandsPath = path.join(__dirname, '../commands')
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
      let commands = []

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        client.commands.set(command.data.name, command)
        commands.push(command.data.toJSON())
      }

      rest.put(Routes.applicationGuildCommands(client.user.id, GUILD), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error)
    }
	},
}
