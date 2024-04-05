const { ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const User = require('../db/userSchema.js')

// Function to round a date object to the nearest 10-minute interval
const roundToNearest10Minutes = (date) => {
    const roundedDate = new Date(date);
    const minutes = roundedDate.getMinutes();

    // Check if the minutes are closer to the lower or upper interval
    const remainder = minutes % 10;
    const roundDown = remainder < 5;
    
    if (roundDown) {
        // Round down to the lower 10-minute interval
        roundedDate.setMinutes(minutes - remainder);
    } else {
        // Round up to the upper 10-minute interval
        roundedDate.setMinutes(minutes + (10 - remainder));
    }

    // Reset seconds and milliseconds to zero
    roundedDate.setSeconds(0);
    roundedDate.setMilliseconds(0);
    
    return roundedDate;
};



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

        // Edit this value (in ms) to change the time available for the user to be able to confirm. (Make sure it matches the setTimeout in the scheduler)
        const timeLimit = 1 * 60 * 1000;

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

        // / Signalling that the user confirmed, so their "join time" is reset at the time of them confirming, and not x minutes later when the setTimeout ends.
        userConfirmed.vcJoinTime = roundToNearest10Minutes(new Date()); 
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
