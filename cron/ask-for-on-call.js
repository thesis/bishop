const GUILD = process.env.GUILD

const { read } = require('../storage')

module.exports = {
  schedule: '30 1 * * 1',
  timezone: 'America/New_York',
  execute(client) {
    return async () => {
      const guild = await client.guilds.fetch(GUILD)
      const channels = await guild.channels.fetch()
      const channel = channels.find(channel => channel.name === "keep")
      const thread = channel.threads.cache
        .find(thread => thread.name === 'On-call rotation')

      if (!thread) {
        return
      }

      const onCall = await read('on-call-user')
      if (!onCall) {
        return
      }

      thread.send(
        `<@${onCall}>, Please tell me who the next person on-call is by ` +
        "using the `/set-on-call` command"
      )
    }
  }
}
