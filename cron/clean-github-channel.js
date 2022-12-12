const GUILD = process.env.GUILD

module.exports = {
  schedule: '30 1 * * 1',
  timezone: 'Europe/Rome',
  execute(client) {
    return async () => {
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
    }
  }
}
