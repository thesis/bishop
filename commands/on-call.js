const { SlashCommandBuilder } = require('@discordjs/builders');
const { write } = require('../storage')

module.exports = {
  data: new SlashCommandBuilder()
  .setName('set-on-call')
  .setDescription('Set the On-Call Engineer')
  .addUserOption(option => 
    option.setName('user')
    .setDescription('the user')
    .setRequired(true)
  ),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user')
    await write('on-call-user', user.id)

    interaction.reply('Done!')
  },
}
