const moment = require('moment')

const { read } = require('../storage')

module.exports = {
  trigger: 'messageCreate',
  execute(client) {
    return async (message) => {
      if (!message.author.bot) {
        return
      }

      if (message.author.id === client.user.id) {
        return
      }

      const channel = await client.channels.fetch(message.channelId)
      if (channel.name !== "mainnet-alerts") {
        return
      }

      const onCall = await read('on-call-user')
      if (!onCall) {
        return
      }

      const threadName = `${moment().utc().format('YYYY-MM-DD HH:mm')} Alert`
      const thread = await message.startThread({
        name: threadName,
        reason: "Alert"
      })

      thread.send(`🔔🔔 <@${onCall}> 🔔🔔, There is a mainnet alert!`)
    }
  },
}
