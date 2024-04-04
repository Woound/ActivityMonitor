const schedule = require('node-schedule');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const User = require('../src/db/userSchema');
const channelId = '1224989761417121802';

const sendActivityCheckEmbed = async (user) => {
    const confirmButton = new ButtonBuilder().setLabel('Confirm').setStyle(ButtonStyle.Success).setCustomId(JSON.stringify({ffb: 'confirm'}));
    const buttonRow = new ActionRowBuilder().addComponents(confirmButton);

    // Fetch the user's Discord user object
    const discordUser = await client.users.fetch(user.userId);
    // console.log(discordUser);

    const activityCheckEmbed = new EmbedBuilder()
        .setTitle(`🕵️‍♂️ ${discordUser.globalName}'s Activity Check 🕵️‍♂️`)
        .setColor('#2abf81')
        .setDescription(`<@${discordUser.id}> ! You've been hitting the books for more than **3 hours** now 👀\n\nPlease click the button below within \`5 minutes\` to confirm you are still with us!`)
        .setFooter({ text: 'Keeping study sessions honest and productive.' }).setTimestamp()
        // Set the user's profile picture as thumbnail
        .setThumbnail(discordUser.avatarURL());

    const channel = await client.channels.cache.get(channelId);
    await channel.send({ embeds: [activityCheckEmbed], components: [buttonRow] });

    console.log(user);

}

const activityCheck = async () => {
    try {
        const usersInVCs = await User.find({ vcJoinTime: { $ne: null } });
        // console.log(usersInVCs);

        for (const user of usersInVCs) {
            // Send the activity check embed to the voice channel
            await sendActivityCheckEmbed(user);
        }
    } catch (error) {
        console.error('⚠ | Error occurred while conducting regular activity check:', error);
    }
}

const activityCheckScheduler = () => schedule.scheduleJob('*/2 * * * *', activityCheck);

module.exports = { activityCheckScheduler };
