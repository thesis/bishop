const { compactGithubEmbeds } = require('./utils/compact-github-embeds')

module.exports = {
  trigger: 'messageUpdate',
  execute(client) {
    return async (_, message) => {
      compactGithubEmbeds(message)
    }
  },
}
