const { compactGithubEmbeds } = require('./utils/compact-github-embeds')

module.exports = {
  trigger: 'messageCreate',
  execute(client) {
    return async (message) => {
      if (message.author.bot && message.content.includes('BTC to')) {
        message.suppressEmbeds(true)
      }
    }
  },
}
