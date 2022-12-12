const GUILD = process.env.GUILD

module.exports = {
  trigger: 'messageCreate',
	execute(client) {
    return async (message) => {
      if (message.author.id !== client.user.id) {
        const channel = await client.channels.fetch(message.channelId)
        if (channel.isThread() && channel.name.endsWith("Standup")) {
          const messages = await channel.messages.fetch()
          const reminderMessage = messages.find(message => message.author.id === client.user.id && message.content.startsWith("I would appreciate"))
          if (reminderMessage) {
            const members = await channel.members.fetch()
            const guild = await client.guilds.fetch(GUILD)
            const fetchedMembers = await Promise.all(members.map(member => guild.members.fetch(member.id)))
            const threadMemberMap = fetchedMembers.reduce(
              (members, member) => Object.assign(members, {[member.user.id]: member.user.username}),
              {}
            )

            const messageAuthorMap = messages.reduce((authors, message) => Object.assign(authors, {[message.author.id]: true}), {})
            const membersToRemind = Object.keys(threadMemberMap)
              .filter(memberId => !messageAuthorMap[memberId])
              .map(memberId => threadMemberMap[memberId])
              .sort()

            reminderMessage.edit(`I would appreciate standup posts from:\n\n${membersToRemind.join('\n')}`)
          }
        }
      }
    }
	},
}
