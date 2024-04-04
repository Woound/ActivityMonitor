const {Client, GatewayIntentBits} = require('discord.js')
const {connectToDatabase} = require('./src/db/connection.js')
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

client.config = require('./config');

require('./src/loader')

connectToDatabase();


client.login(process.env.BOT_TOKEN)