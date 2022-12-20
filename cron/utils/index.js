const GUILD = process.env.GUILD

module.exports = {
  threadUrl(thread) {
    return `https://discord.com/channels/${thread.guildId}/${thread.id}`
  },
  async missingStandups(client, thread) {
    const members = await thread.members.fetch()
    const guild = await client.guilds.fetch(GUILD)
    const fetchedMembers = await Promise.all(members.map(member => guild.members.fetch(member.id)))
    const threadMemberMap = fetchedMembers.reduce(
      (members, member) => Object.assign(members, {[member.user.id]: member.user}),
      {}
    )

    const messages = await thread.messages.fetch()
    const messageAuthorMap = messages.reduce((authors, message) => Object.assign(authors, {[message.author.id]: true}), {})
    return Object.keys(threadMemberMap)
      .filter(memberId => !messageAuthorMap[memberId] && memberId !== client.user.id)
      .map(memberId => threadMemberMap[memberId])
      .sort()
  }
}
