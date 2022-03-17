Extremely minimal discord bot to automate some discord pain points around threading.

+ When the bot detects a reply to a reply, it slams the message with the emoji
  configured in the `EMOJI` environment variable.
+ When the bot detects a new thread, it joins the thread, sends a placeholder
  message, and edits the message into @ROLE (the environment variable). The
  edit trick avoids the ping but still puts everyone in the thread.

Environment Configuration:

+ `TOKEN` from the discord api
+ `ROLE`: the role you want to ping. Should be an ID. Use development mode and right-click+copy id from the settings menu.
+ `EMOJI`: The id of the emoji to indicate threading. Upload an emoji and then
  inspect it in a web browser console. You should see something like
  https://cdn.discordapp.com/emojis/{EMOJI_ID}.webp?size=64&quality=lossless
