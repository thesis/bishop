const { SlashCommandBuilder } = require('@discordjs/builders');
const { read, write } = require('../storage')

const TOKEN = process.env.TOKEN
const ROLE = process.env.ROLE
const EMOJI = process.env.EMOJI
const GUILD = process.env.GUILD

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
