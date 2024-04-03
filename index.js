const {Client, GatewayIntentBits} = require('discord.js')
const dotenv = require('dotenv')
dotenv.config()

global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    disableMentions: 'everyone'
})

require('./src/loader')

client.login(process.env.BOT_TOKEN)