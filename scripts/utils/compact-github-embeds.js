const { MessageEmbed } = require('discord.js')

module.exports = {
  async compactGithubEmbeds(message) {
    if (!message.author.bot) {
      const receivedEmbeds = message.embeds
      if (!!receivedEmbeds && receivedEmbeds.find(embed => embed.url && embed.url.includes('github'))) {
        await message.suppressEmbeds(true)
        const description = receivedEmbeds
          .map((embed, i) => `(${i+1}) [${embed.title}](${embed.url})`)
          .join('\n')
        const embed = new MessageEmbed()
          .setColor('#0099ff')
          .setDescription(description)

        message.channel.send({embeds: [embed]})
      }
    }
  }
}
