const { ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const User = require('../db/userSchema.js')

// Function to check if the interaction user's ID matches the ID of the intended recipient
const validateRecipient = (interaction) => {
    const description = interaction.message.embeds[0].description;
    const userIdRegex = /<@(\d+)>/;
    const match = description.match(userIdRegex);

    if (!match || match.length < 2) {
        return false; // Unable to determine the intended recipient
    }

    const intendedUserId = match[1];
    return interaction.user.id === intendedUserId;
};

// Function to handle button interaction
const handleButtonInteraction = async ({ client, interaction }) => {
    try {
        const now = Date.now();
        const sentTime = interaction.message.createdTimestamp;
        const timeDifference = now - sentTime;

        // Edit this value (in ms) to change the time available for the user to be able to confirm.
        const timeLimit = 40000;

        // Check if the interaction user is the intended recipient
        if (!validateRecipient(interaction)) {
            return interaction.editReply({ content: '❌ | Only the intended recipient can confirm activity.', ephemeral: true });
        }

        // Create the confirmButton with initial disabled state
        const confirmButton = new ButtonBuilder()
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
            .setCustomId(JSON.stringify({ ffb: 'confirm' }));

        const buttonRow = new ActionRowBuilder().addComponents(confirmButton);

        // If the time limit has exceeded, handle the interaction accordingly
        if (timeDifference > timeLimit) {
            await interaction.message.edit({ components: [buttonRow] });
            return interaction.editReply({ content: '❌ | Time limit exceeded for confirming activity.', ephemeral: true });
        }

        // If the user has confirmed, we go ahead and update the database field to show they have confirmed.
        const userId = interaction.user.id;
        const userConfirmed = await User.findOne({userId})

        userConfirmed.lastCheckConfirmed = true;
        await userConfirmed.save();

        await interaction.message.edit({ components: [buttonRow] });
        return interaction.editReply({ content: '✅ | Thank you for confirming!', ephemeral: true });
    } catch (error) {
        console.error('Error handling button interaction:', error);
        return interaction.editReply({ content: '❌ | An error occurred while processing your confirmation.', ephemeral: true });
    }
};

module.exports = handleButtonInteraction;
