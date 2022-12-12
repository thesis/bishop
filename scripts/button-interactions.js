const { read, write } = require('../storage')

async function archiveThread(client, interaction) {
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

module.exports = {
  trigger: 'interactionCreate',
  execute(client) {
    return async (interaction) => {
      if (!interaction.isButton()) return
      if (interaction.customId === 'archive-thread') {
        archiveThread(client, interaction)
      }
      if (interaction.customId === 'long-running-thread') {
        markThreadLongRunning(interaction)
      }
    }
  },
}
