const ms = require('ms');

module.exports = {
    name: 'ping',
    description: "Get the ping of the bot!",
    async execute({ client, interaction }) {

        const m = await interaction.editReply("Ping?")
        interaction.editReply(`Pong! API Latency is ${Math.round(client.ws.ping)}ms 🛰️, Last heartbeat calculated ${ms(Date.now() - client.ws.shards.first().lastPingTimestamp, { long: true })} ago`)

    },
};