const { SlashCommandBuilder } = require('@discordjs/builders');

const TOKEN = process.env.TOKEN
const ROLE = process.env.ROLE
const EMOJI = process.env.EMOJI
const GUILD = process.env.GUILD

module.exports = {
  data: new SlashCommandBuilder()
  .setName('add-user-to-threads')
  .setDescription('Adds user to all active threads')
  .addUserOption(option => 
    option.setName('user')
    .setDescription('the user')
    .setRequired(true)
  ),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user')
    const guild = await client.guilds.fetch(GUILD)
    const channels = await guild.channels.fetch()
    channels
      .filter(channel => channel.isText() && channel.name != "keep-github" && channel.viewable)
      .forEach(async channel => {
        const threads = await channel.threads.fetch()
        threads.threads.forEach(async thread => {
          const placeholder = await thread.send("<placeholder>")
          await placeholder.edit("<@" + user.id + ">")
        })
      })

    await interaction.reply('Done!')
  },
}
