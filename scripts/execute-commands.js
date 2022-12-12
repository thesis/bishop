module.exports = {
  trigger: 'interactionCreate',
  execute(client) {
    return async (interaction) => {
      if (!interaction.isCommand()) return

      const command = client.commands.get(interaction.commandName)

      if (!command) return

      try {
        await command.execute(interaction, client)
      } catch (error) {
        console.error(error)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
      }
    }
  },
}
