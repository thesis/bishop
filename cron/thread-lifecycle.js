const GUILD = process.env.GUILD

const { MessageActionRow, MessageButton } = require('discord.js')
const moment = require('moment')

const { read, write } = require('../storage')

function weekdaysBefore(theMoment, days) {
  let newMoment = theMoment.clone()
  while(days > 0) {
    if (newMoment.isoWeekday() < 6) {
      days -= 1
    }
    newMoment = newMoment.subtract(1, 'days')
  }
  return newMoment
}

function archiveThreadPrompt(client, thread) {
  if (thread.ownerId === client.user.id) {
    thread.setArchived(true)
    return 
  }

  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('archive-thread')
      .setLabel('Archive The Thread')
      .setStyle('DANGER'),
    )
    .addComponents(
      new MessageButton()
      .setCustomId('long-running-thread')
      .setLabel('Long-Running Thread')
      .setStyle('SECONDARY'),
    )

  thread.send({
    content: `<@${thread.ownerId}>, it's been a bit since this thread has seen activity. Ready to archive it?`,
    components: [row]
  })
}

module.exports = {
  schedule: '*/15 * * * *',
  timezone: 'America/New_York',
  execute(client) {
    return async () => {
      const guild = await client.guilds.fetch(GUILD)
      const channels = await guild.channels.fetch()
      const longRunningThreadIds = (await read('long-running-thread-ids')) || {}
      const archiveThreshold = weekdaysBefore(moment(), 4)
      channels
        .filter(channel => channel.isText() && channel.name != "keep-github" && channel.viewable)
        .forEach(async channel => {
          const threads = await channel.threads.fetch()
          threads.threads.forEach(async thread => {
            const messages = await thread.messages.fetch({limit: 1})
            const lastActivity = Math.max(
              messages.first() && messages.first().createdTimestamp || 0,
              thread.archiveTimestamp
            )
            if (moment(lastActivity).isAfter(archiveThreshold)) {
              return
            }

            if (longRunningThreadIds[thread.id]) {
              await thread.setArchived(true)
              thread.setArchived(false)
            } else {
              archiveThreadPrompt(client, thread)
            }
          })
        })
    }
  }
}
