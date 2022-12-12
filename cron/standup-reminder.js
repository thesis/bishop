const ROLE = process.env.ROLE
const GUILD = process.env.GUILD

const moment = require('moment')

const { threadUrl, missingStandups } = require('./utils')
const { sevenDaysInMinutes } = require('../constants')

module.exports = {
  schedule: '0 9 * * 2', // At 09:00 on Tuesday
  timezone: 'America/New_York',
  execute(client) {
    return async () => {
      const guild = await client.guilds.fetch(GUILD)
      const channels = await guild.channels.fetch()
      const standupChannel = channels.find(channel => channel.name === "standups")
      const threads = await standupChannel.threads.fetch()
      const now = moment()

      let mondayDate = now.subtract(1, 'days')
      const mondayThreadName = `${mondayDate.format('YYYY-MM-DD')} Standup`
      const mondayThread = threads.threads.find(t => t.name === mondayThreadName)
      const mondayThreadLink = mondayThread ? threadUrl(mondayThread) : ""
      const missingFromMonday = await missingStandups(client, mondayThread)

      let fridayDate = now.subtract(4, 'days')
      const fridayThreadName = `${fridayDate.format('YYYY-MM-DD')} EOW Standup`
      const fridayThread = threads.threads.find(t => t.name === fridayThreadName)
      const fridayThreadLink = fridayThread ? threadUrl(fridayThread) : ""
      const missingFromFriday = await missingStandups(client, fridayThread)

      const keepChannel = channels.find(channel => channel.name === "keep")
      if (missingFromMonday.length === 0 && missingFromFriday.length === 0) {
        return
      }

      let message = "We are looking for consistent particpation in standups!"

      if (missingFromMonday.length > 0) {
        message += `\n\nCould the following humans please post a Monday standup? ${mondayThreadLink}\n`
        message += missingFromMonday.map(user => `<@${user.id}>`).join(', ')
      }

      if (missingFromFriday.length > 0) {
        message += `\n\nCould the following humans please post a Friday standup from last week? ${fridayThreadLink}\n`
        message += missingFromFriday.map(user => `<@${user.id}>`).join(', ')
      }
      keepChannel.send(message)
    }
  }
}
