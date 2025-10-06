const { getUserFromSessionToken } = require("./authUtils");

Parse.Cloud.define("updateUserDetails", async (request) => {
    const { username, email, universityName, universityLocation, chatbotName, chatbotColor, chatbotOtherSettings } = request.params;

    try {
        // Retrieve the current user
        const user = await getUserFromSessionToken(request);

        if (!user) {
            throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token');
        }

        // Update user details
        user.set('username', username);
        user.set('email', email);

        // Check if the user has an associated university
        const universityPointer = user.get('university');
        if (universityPointer) {
            const universityQuery = new Parse.Query('University');
            const university = await universityQuery.get(universityPointer.id, { useMasterKey: true });

            // Update university details
            university.set('name', universityName);
            university.set('location', universityLocation);

            // Save the updated university
            await university.save(null, { useMasterKey: true });

            console.log("University details updated successfully");
        }

        // Save the updated user
        await user.save(null, { useMasterKey: true });

        console.log("User details updated successfully");

        return { message: 'User details updated successfully' };
    } catch (error) {
        console.error("Error updating user details:", error);
        throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, 'An unexpected error occurred during user details update');
    }
});
