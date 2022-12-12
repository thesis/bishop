const EMOJI = process.env.EMOJI

module.exports = {
  trigger: 'messageCreate',
  execute(client) {
    return async (message) => {
      if (!message.reference || !message.reference.messageId) {
        return
      }

      const channel = await client.channels.fetch(message.reference.channelId)
      if (channel.isThread()) {
        return
      }

      const parentMessage = await channel.messages.fetch(message.reference.messageId)
      if (!parentMessage.reference || !parentMessage.reference.messageId) {
        return
      }

      const parentMessageChannel = await client.channels.fetch(parentMessage.channelId)
      const grandParentMessage = await parentMessageChannel.messages.fetch(parentMessage.reference.messageId)
      if (!grandParentMessage.reference) {
        message.react(EMOJI)
      }
    }
  },
}
