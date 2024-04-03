const {EmbedBuilder, InteractionType} = require('discord.js')

module.exports = async (client, interaction) => {

    await interaction.deferReply();

    if (interaction.type === InteractionType.ApplicationCommand) {
        const command = client.commands.get(interaction.commandName)

        // If command is not found.
        if (!command) return interaction.editReply({embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('❌ | Error! Command not found.')], ephemeral: true}), client.stash.delete(interaction.commandName)
        
        // If user does not have enough permissions.
        if (command.permissions && !interaction.member.permissions.has(command.permissions)) return interaction.editReply({embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`❌ | You do not have the permissions to execute this command.`)], ephemeral: true})

        command.execute({interaction, client})

    }

    // When a user interacts with a message component like a button, Discord sends an interaction event to the bot.
    // The code below  handles these interaction events specifically for message components.

    if (interaction.type === InteractionType.MessageComponent) {
        const customId = JSON.parse(inter.customId);
        const file_of_button = customId.ffb;

        if (file_of_button) {
            // Delete the cached module of the button file to ensure any changes are reflected
            delete require.cache[require.resolve(`../../src/buttons/${file_of_button}.js`)];
            // Require the button file
            const button = require(`../../src/buttons/${file_of_button}.js`);
            // If the button file exists, execute its logic
            if (button) return button({client, interaction, customId});
        }
        
    }

}