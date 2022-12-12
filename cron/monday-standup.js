const ROLE = process.env.ROLE
const GUILD = process.env.GUILD

const { sevenDaysInMinutes } = require('../constants')

const moment = require('moment')

module.exports = {
  schedule: '30 1 * * 1',
  timezone: 'America/New_York',
  execute(client) {
    return async () => {
      const guild = await client.guilds.fetch(GUILD)
      const channels = await guild.channels.fetch()
      const channel = channels.find(channel => channel.name === "standups")
      const threadName = `${moment().format('YYYY-MM-DD')} Standup`
      const thread = await channel.threads.create({
        name: threadName,
        autoArchiveDuration: sevenDaysInMinutes,
        reason: "Monday Standup"
      })
      await thread.join()
      await thread.send(
        `<@&${ROLE}>, Please post what you plan on accomplishing this week with the following syntax\n\n` +
        `- [ ] A robot may not injure a human being or, through inaction, allow a human being to come to harm.\n` + 
        `- [ ] A robot must obey the orders given it by human beings except where such orders would conflict with the First Law.\n` +
        `- [ ] A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.`
      )

      const members = await thread.members.fetch()
      const fetchedMembers = await Promise.all(members.map(member => guild.members.fetch(member.id)))
      const listOfMemberNames = fetchedMembers.map(member => member.user.username).filter(name => name !== client.user.username).sort()
      thread.send(`I would appreciate standup posts from:\n\n${listOfMemberNames.join('\n')}`)
    }
  }
}
