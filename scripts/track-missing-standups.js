const GUILD = process.env.GUILD
const { missingStandups } = require('../cron/utils')

module.exports = {
  trigger: 'messageCreate',
  execute(client) {
    return async (message) => {
      if (message.author.id === client.user.id) {
        return
      }

      const channel = await client.channels.fetch(message.channelId)
      if (!channel.isThread() || !channel.name.endsWith("Standup")) {
        return
      }

      const messages = await channel.messages.fetch()
      const reminderMessage = messages.find(message => message.author.id === client.user.id && message.content.startsWith("I would appreciate"))
      if (reminderMessage) {
        const membersToRemind = (await missingStandups(client, channel)).map(user => user.username)
        reminderMessage.edit(`I would appreciate standup posts from:\n\n${membersToRemind.join('\n')}`)
      }
    }
  },
}
