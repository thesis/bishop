module.exports = {
  trigger: 'ready',
	execute(client) {
    return async () => {
      console.log(`Logged in as ${client.user.tag}!`)
    }
	},
}
