Low-dependency discord bot to create an opinionated experience at [Keep](https://keep.network/).

### Architecture
Add scripts or event hooks to the `/scripts/` folder. These should export an
object with two keys:
+ `trigger`, which is the
  [Event](https://discord.js.org/#/docs/discord.js/main/typedef/Events) that
  triggers the script.
+ `execute`, which is a function that takes in a `client` and returns a event
  handler function. For a barebones example of this, check out
  [logged-in.js](https://github.com/thesis/bishop/blob/4757eab67b6751a361a8f09499cc97daf587e41f/scripts/logged-in.js).

Add cron jobs to the `/cron/` folder. These should the following keys:
+ `schedule`, which is a [cron-formatted string](https://crontab.guru/).
+ `timezone`, which is the [english-named
  timezone](https://code2care.org/pages/java-timezone-list-utc-gmt-offset) like
  `America/New_York`.
+ `execute`, which is a function that takes in a `client` and returns a
  function to be run on a cron schedule.

### Local Development
1. Create your own bot using the [the discord developer portal](https://discord.com/developers/applications).
1. Make sure your bot has the proper server authorizations <img width="1351" alt="image" src="https://user-images.githubusercontent.com/1045160/208538427-77f0dfdd-3629-49f3-9366-41b934c6cb05.png">
1. Create a server, invite the bot to it, and give it a good permissions integer: `1089952280129` 
1. Clone this repo, and set the following environment variables below. I
   recommend [direnv](https://direnv.net/) to manage this.
1. Navigate to this directory.
1. `$ npm ci`
1. `$ node index.js`
1. You should be greeted with something that looks like:

```
Logged in as TestBishop#6775!
Successfully registered application commands.
```


### Environment Configuration

+ `TOKEN`: The token for the discord bot from the discord API.
+ `ROLE`: The role-id for @Keep. Use development mode and right-click+copy id from the settings menu.
+ `EMOJI`: The id of the emoji to indicate threading. Upload an emoji and then
  inspect it in a web browser console. You should see something like
  https://cdn.discordapp.com/emojis/{EMOJI_ID}.webp?size=64&quality=lossless
+ `GUILD`: The id of the server. Any link to a discord message has the
  following structure:
  https://discord.com/channels/GUID_ID/CHANNEL_ID/MESSAGE_ID.
