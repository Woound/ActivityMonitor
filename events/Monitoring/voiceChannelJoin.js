const {EmbedBuilder} = require('discord.js')
const User = require('../../src/db/userSchema.js')

// Function to round up a date object to the nearest 5-minute interval
const roundUpToNearest5Minutes = (date) => {
    const roundedDate = new Date(date);
    const minutes = roundedDate.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 5) * 5;
    roundedDate.setMinutes(roundedMinutes);
    roundedDate.setSeconds(0);
    roundedDate.setMilliseconds(0);
    return roundedDate;
};



module.exports = async (oldMember, newMember) => {

    // Checking if the user left a channel.
    if (!newMember.channelId) {
        const userId = newMember.id;
        // Check if the user already exists in the database
        let userRecord = await User.findOne({userId})
        userRecord.vcJoinTime = null;
        userRecord.lastCheckConfirmed = false;
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

                        // Round down the current time to the nearest minute
                        const vcJoinTime = roundUpToNearest5Minutes(new Date());

            if (!userRecord) {
                // If the user doesn't have a record, we create a new one.
                userRecord = new User({
                    userId,
                    username: newMember.member.displayName,
                    vcJoinTime: new Date(),
                    lastCheckConfirmed: false,
                })
            } else {
                // If the user has an existing record, update that.
                userRecord.vcJoinTime = roundUpToNearest5Minutes(new Date()); 
            }

            // Save record to database
            await userRecord.save();

            console.log(`${userRecord.username} joined a voice channel in the specific category.`);
        }
    }
};
