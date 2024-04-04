const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const schedule = require('node-schedule');
const User = require('../src/db/userSchema');
const channelId = '1224989761417121802';

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
        }, 1 * 60 * 1000); // 5 minutes in milliseconds
    } catch (error) {
        console.error('Error sending activity check embed:', error);
    }
}

const disconnectUser = async (user, channel) => {
    try {
        const userId = user.userId;
        const userToConfirm = await User.findOne({ userId });

        if (userToConfirm.lastCheckConfirmed) {
            userToConfirm.vcJoinTime = new Date();
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
    try {
        const usersInVCs = await User.find({ 
            vcJoinTime: { $ne: null },
            lastCheckConfirmed: false 
        });

        for (const user of usersInVCs) {
            await sendActivityCheckEmbed(user);
        }
    } catch (error) {
        console.error('Error conducting regular activity check:', error);
    }
}

const activityCheckScheduler = () => schedule.scheduleJob('*/2 * * * *', activityCheck);

module.exports = { activityCheckScheduler };
