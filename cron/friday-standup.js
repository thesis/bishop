const ROLE = process.env.ROLE
const GUILD = process.env.GUILD

const { sevenDaysInMinutes } = require('../constants')

const moment = require('moment')

const { threadUrl } = require('./utils')

module.exports = {
  schedule: '30 1 * * 5',
  timezone: 'America/New_York',
	execute(client) {
    return async () => {
      const guild = await client.guilds.fetch(GUILD)
      const channels = await guild.channels.fetch()
      const channel = channels.find(channel => channel.name === "standups")
      const threadName = `${moment().format('YYYY-MM-DD')} EOW Standup`
      const thread = await channel.threads.create({
        name: threadName,
        autoArchiveDuration: sevenDaysInMinutes,
        reason: "Friday Standup"
      })
      const threads = await channel.threads.fetch()
      let mondayDate = moment().subtract(4, 'days')
      const mondayThreadName = `${mondayDate.format('YYYY-MM-DD')} Standup`
      const mondayThread = threads.threads.find(t => t.name === mondayThreadName)
      const mondayTheadLink = mondayThread ? ` ${threadUrl(mondayThread)}` : ""
      await thread.join()
      const message = await thread.send(
        `<@&${ROLE}>, Please paste in what you set out to accomplish from Monday${mondayTheadLink}, as well as what you ended up accomplishing with the following syntax\n\n` +
        `- [X] A robot may not injure a human being or, through inaction, allow a human being to come to harm.\n` + 
        `- [ ] A robot must obey the orders given it by human beings except where such orders would conflict with the First Law.\n` +
        `- [X] A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.\n\n` +
        `Use [ ] to denote work that was planned but unfinished, and [X] to denote work that was accomplished.`
      )
      await message.suppressEmbeds(true)

      const members = await thread.members.fetch()
      const fetchedMembers = await Promise.all(members.map(member => guild.members.fetch(member.id)))
      const listOfMemberNames = fetchedMembers.map(member => member.user.username).filter(name => name !== client.user.username).sort()
      thread.send(`I would appreciate standup posts from:\n\n${listOfMemberNames.join('\n')}`)
    }
  }
}
