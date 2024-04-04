const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const schedule = require('node-schedule');
const User = require('../src/db/userSchema');

const channelId = '1224989761417121802'; // Id of the channel to send the reminder embed in.
const confirmationTimeInterval = 5 * 60 * 1000; // The amount of time of staying in VC after which the reminder embed should be sent.
const schedulerInterval = '*/5 * * * *'; // After how long the scheduler should be run.
const disconnectingUserTime = 1 * 60 * 1000; // Time limit after which the confirmation is checked (ms) -> if not confirmed after this time, then disconnect.

const sendActivityCheckEmbed = async (user) => {
    try {
        const confirmButton = new ButtonBuilder().setLabel('Confirm').setStyle(ButtonStyle.Success).setCustomId(JSON.stringify({ffb: 'confirm'}));
        const buttonRow = new ActionRowBuilder().addComponents(confirmButton);

        // Fetch the user's Discord user object
        const discordUser = await client.users.fetch(user.userId);

        const activityCheckEmbed = new EmbedBuilder()
            .setTitle(`🕵️‍♂️ ${discordUser.globalName}'s Activity Check 🕵️‍♂️`)
            .setColor('#2abf81')
            .setDescription(`<@${discordUser.id}>! You've been hitting the books for more than **3 hours** now 👀\n\nPlease click the button below within \`5 minutes\` to confirm you are still with us!`)
            .setFooter({ text: 'Keeping study sessions honest and productive.' }).setTimestamp()
            .setThumbnail(discordUser.avatarURL());

        const channel = await client.channels.cache.get(channelId);
        await channel.send({ embeds: [activityCheckEmbed], components: [buttonRow] });

        // Set timeout to disconnect user if not confirmed
        setTimeout(async () => {
            await disconnectUser(user, channel);
        }, disconnectingUserTime); // 5 minutes in milliseconds
    } catch (error) {
        console.error('Error sending activity check embed:', error);
    }
}

const disconnectUser = async (user, channel) => {
    try {
        const userId = user.userId;
        const userToConfirm = await User.findOne({ userId });

        if (userToConfirm.lastCheckConfirmed) {
            userToConfirm.lastCheckConfirmed = false;
            await userToConfirm.save();
            console.log('User has confirmed.');
        } else {
            const guildMember = channel.guild.members.cache.get(userId);
            if (guildMember && guildMember.voice && guildMember.voice.channel) {
                await guildMember.voice.disconnect();
                console.log('Disconnected user from vc.');
            }
        }
    } catch (error) {
        console.error('Error disconnecting user:', error);
    }
}

const activityCheck = async () => {
    console.log('Checked time');
    try {
        const currentTime = new Date();
        console.log(currentTime);
        const comparisonDate = new Date(currentTime.getTime() - confirmationTimeInterval);
        console.log(comparisonDate);

        // Find users who need to confirm their activity and where 3 hours have passed since they joined the voice channel
        const usersInVCs = await User.find({ 
            lastCheckConfirmed: false,
            vcJoinTime: { $lte: comparisonDate } // Check if 3 minutes have passed
        });

        for (const user of usersInVCs) {
            await sendActivityCheckEmbed(user);
        }
    } catch (error) {
        console.error('Error conducting regular activity check:', error);
    }
}

const activityCheckScheduler = () => schedule.scheduleJob(schedulerInterval, activityCheck);

module.exports = { activityCheckScheduler };
