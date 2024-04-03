const {ButtonStyle, ButtonBuilder, ActionRowBuilder} = require('discord.js')
// Button handler logic
module.exports = async ({ client, interaction, customId }) => {
    try {
        const now = Date.now();
        const sentTime = interaction.message.createdTimestamp; // Retrieve the time when the embed was sent

        // Calculate the time difference in milliseconds
        const timeDifference = now - sentTime;
        const timeLimit = 40000; 

        const buttonComponent = interaction.message.components[0].components[0];
        console.log(buttonComponent);

        // The reason it wasnt working was that we weredirectly trying to edit the button component.
        // What we actually had to do was create an entirelynew buttonRow and assign that to the components.
        const confirmButton = new ButtonBuilder().setLabel('Confirm').setStyle(ButtonStyle.Danger).setDisabled(true).setCustomId(JSON.stringify({ffb: 'confirm'}));
        const buttonRow = new ActionRowBuilder().addComponents(confirmButton);

        if (timeDifference > timeLimit) {
            // If the time limit has exceeded, handle the interaction accordingly
            return interaction.editReply({ content: '❌ | Time limit exceeded for confirming activity.', ephemeral: true });
        }

        await interaction.message.edit({ components: [buttonRow] }); // Update the message

        // If within the time limit, continue with the confirmation logic
        return interaction.editReply({ content: '✅ | Thank you for confirming!', ephemeral: true });
    } catch (error) {
        console.error('Error handling button interaction:', error);
        return interaction.editReply({ content: '❌ | An error occurred while processing your confirmation.', ephemeral: true });
    }
}
