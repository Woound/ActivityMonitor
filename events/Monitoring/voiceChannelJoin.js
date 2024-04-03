const {EmbedBuilder} = require('discord.js')

const trackerMap = new Map();

module.exports = async (oldMember, newMember) => {

    // Checking if the user left a channel.
    if (!newMember.channelId) {
        const leaveTime = new Date();
        const userId = newMember.id;
        const userData = trackerMap.get(userId);
        if (userData) {
            const joinTime = userData.joinedTime;
            const duration = leaveTime - joinTime;
            console.log(`User ${userId} spent ${duration} milliseconds in the voice channel.`);
            // Optionally, convert milliseconds to a human-readable format
            // const durationStr = millisecondsToDurationString(duration);
            // console.log(`User ${userId} spent ${durationStr} in the voice channel.`);
            trackerMap.delete(userId); // Remove user data from the map
        }
        return;
    }

    // // Checking if the user switched channel.
    // if (oldMember.channelId && newMember.channelId) {
    //     console.log("User changed channels.");
    // } 

    // Checking if the user joined a channel.
    if (newMember.channelId) {
        const voiceChannel = oldMember.guild.channels.cache.get(newMember.channelId);

        // console.log(voiceChannel);

        // Constraining the check to one specific category.
        if (voiceChannel.parent && voiceChannel.parent.name.toLowerCase() === 'testing vcs') {
            const userName = newMember.member.displayName;

            trackerMap.set(newMember.id, {'joinedTime': new Date()})
            
            console.log(`${userName} joined a voice channel in the specific category.`);
        }
    }
};
