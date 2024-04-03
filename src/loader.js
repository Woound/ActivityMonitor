// Import necessary modules
const {readdirSync} = require('fs'); // File system module used to read directories
const {Collection} = require('discord.js'); // Discord.js Collection class used to store commands
const voiceChannelJoin = require('../events/Monitoring/voiceChannelJoin')

// Initialize a Collection to store commands
client.commands = new Collection();
// Initialize an array to store loaded commands
CommandsArray = [];

// Read all files in the './events/Discord/' directory and filter only .js files
const DiscordEvents = readdirSync('./events/Discord/').filter(file => file.endsWith('.js'));
// Read all files in the './events/Monitoring/' directory and filter only .js files
const MonitoringEvents = readdirSync('./events/Monitoring/').filter(file => file.endsWith('.js'));
console.log(DiscordEvents);

// Loop through each Discord event file
for (const file of DiscordEvents) {
    // Require the Discord event file
    const DiscordEvent = require(`../events/Discord/${file}`);
    console.log(DiscordEvent);
    // Log that the Discord event has been loaded
    console.log(`-> [Loaded Discord Event] ${file.split('.')[0]}`);
    // Bind the event to the client
    client.on(file.split('.')[0], DiscordEvent.bind(null, client));
    // Delete the cached module to ensure changes are reflected
    delete require.cache[require.resolve(`../events/Discord/${file}`)];
}

// Loop through each Monitoring event file
for (const file of MonitoringEvents) {
    // Require the Discord event file
    const MonitoringEvent = require(`../events/Monitoring/${file}`);
    console.log(MonitoringEvent);
    // Log that the Discord event has been loaded
    console.log(`-> [Loaded Monitoring Event] ${file.split('.')[0]}`);
    // Bind the event to the client
    client.on(file.split('.')[0], MonitoringEvent.bind(null, client));
    // Delete the cached module to ensure changes are reflected
    delete require.cache[require.resolve(`../events/Monitoring/${file}`)];
}

// Read all directories in the './commands/' directory
readdirSync('./commands/').forEach(dirs => {
    // Read all files in the current directory and filter only .js files
    const commands = readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));

    // Loop through each command file
    for (const file of commands) {
        // Require the command file
        const command = require(`../commands/${dirs}/${file}`);
        // Check if the command has a name and description
        if (command.name && command.description) {
            // Add the command to the CommandsArray
            CommandsArray.push(command);
            // Log that the command has been loaded
            console.log(`-> [Loaded Command] ${command.name.toLowerCase()}`);
            // Set the command in the client.commands Collection
            client.commands.set(command.name.toLowerCase(), command);
            // Delete the cached module to ensure changes are reflected
            delete require.cache[require.resolve(`../commands/${dirs}/${file}`)];
        } else {
            // Log that the command failed to load if it doesn't have a name or description
            console.log(`[Failed Command] ${command.name.toLowerCase()}`);
        }
    }
});

// Event handler for when the client is ready
client.on('ready', (client) => {
    // Set the application commands (slash commands) using CommandsArray
    client.application.commands.set(CommandsArray);
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    voiceChannelJoin(oldMember, newMember)
})