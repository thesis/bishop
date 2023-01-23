const ROLE = process.env.ROLE

const { sevenDaysInMinutes } = require("../constants")

module.exports = {
  trigger: 'threadCreate',
  execute(client) {
    return async (thread) => {
      if (thread.ownerId === client.user.id) {
        return
      }

      if (thread.type === "GUILD_PRIVATE_THREAD") {
        return
      }

      await thread.join()
      const placeholder = await thread.send("<placeholder>")
      await placeholder.edit("<@&" + ROLE + ">")
      if (thread.autoArchiveDuration < sevenDaysInMinutes) {
        thread.setAutoArchiveDuration(sevenDaysInMinutes)
      }
    }
  },
}
