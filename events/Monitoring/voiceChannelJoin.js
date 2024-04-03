const {EmbedBuilder} = require('discord.js')
const User = require('../../src/db/userSchema.js')

module.exports = async (oldMember, newMember) => {

    // Checking if the user left a channel.
    if (!newMember.channelId) {
        const userId = newMember.id;
        // Check if the user already exists in the database
        let userRecord = await User.findOne({userId})
        userRecord.vcJoinTime = null;
        await userRecord.save()
        return;
    }; 

    const categoryToCheck = 'testing vcs'

    // // Checking if the user switched channel.
    // if (oldMember.channelId && newMember.channelId) {
    //     console.log("User changed channels.");
    // } 

    // Checking if the user joined a channel.
    if (newMember.channelId) {
        const voiceChannel = oldMember.guild.channels.cache.get(newMember.channelId);

        // console.log(voiceChannel);

        // Constraining the check to one specific category.
        if (voiceChannel.parent && voiceChannel.parent.name.toLowerCase() === categoryToCheck) {

            const userId = newMember.id;

            // Check if the user already exists in the database
            let userRecord = await User.findOne({userId})

            if (!userRecord) {
                // If the user doesn't have a record, we create a new one.
                userRecord = new User({
                    userId,
                    username: newMember.member.displayName,
                    vcJoinTime: new Date(),
                })
            } else {
                // If the user has an existing record, update that.
                userRecord.vcJoinTime = new Date(); 
            }

            // Save record to database
            await userRecord.save();

            console.log(`${userRecord.username} joined a voice channel in the specific category.`);
        }
    }
};
