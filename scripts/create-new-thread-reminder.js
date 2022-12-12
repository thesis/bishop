const EMOJI = process.env.EMOJI

module.exports = {
  trigger: 'messageCreate',
	execute(client) {
    return async (message) => {
      if (!!message.reference && !!message.reference.messageId) {
        const channel = await client.channels.fetch(message.reference.channelId)
        if (!channel.isThread()) {
          const parentMessage = await channel.messages.fetch(message.reference.messageId)
          if (!!parentMessage.reference && !!parentMessage.reference.messageId) {
            const parentMessageChannel = await client.channels.fetch(parentMessage.channelId)
            const grandParentMessage = await parentMessageChannel.messages.fetch(parentMessage.reference.messageId)
            if (!grandParentMessage.reference) {
              message.react(EMOJI)
            }
          }
        }
      }
    }
	},
}
