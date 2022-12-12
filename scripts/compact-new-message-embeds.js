const { compactGithubEmbeds } = require('./utils/compact-github-embeds')

module.exports = {
  trigger: 'messageCreate',
  execute(client) {
    return async (message) => {
      compactGithubEmbeds(message)
    }
  },
}
