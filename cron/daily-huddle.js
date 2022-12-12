const KEEP_ROLE = process.env.KEEP_ROLE

module.exports = {
  schedule: '30 16 * * 1-5',
  timezone: 'Europe/Rome',
  execute(client) {
    return async () => {
      const guild = await client.guilds.fetch(GUILD)
      const channels = await guild.channels.fetch()
      const channel = channels.find(channel => channel.name === "keep-watercooler")
      if (channel) {
        channel.send(`<@&${KEEP_ROLE}> there's a daily huddle in huddle 0 :)`)
      }
    }
  }
}
