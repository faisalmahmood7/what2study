// Cloud Function for user registration
Parse.Cloud.define('registerUser', async (request) => {
    const { username, password, email, universityName, universityLocation, chatbotName, chatbotColor, chatbotOtherSettings } = request.params;

    // Create a new user
    const user = new Parse.User();
    user.set('username', username);
    user.set('password', password);
    user.set('email', email);

    // Create a new university
    const University = Parse.Object.extend('University');
    const university = new University();
    university.set('name', universityName);
    university.set('location', universityLocation);

    try {
        // Sign up the user 
        await user.signUp();

        // Set the university as a pointer to the user
        user.set('university', university);

        // Save the user
        await user.save(null, { useMasterKey: true });

        // Save the university
        await university.save();

        return { message: 'University admin registered successfully' };
    } catch (error) {
        throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, error.message);
    }
});

// Cloud Function for user login
Parse.Cloud.define('loginUser', async (request) => {
    const { email, password } = request.params;

    try {
        const userQuery = new Parse.Query(Parse.User);
        userQuery.equalTo('email', email);
        const user = await userQuery.first();

        if (!user) {
            throw new Parse.Error(Parse.Error.INVALID_LOGIN_CREDENTIALS, 'Invalid email or password');
        }

        const authenticatedUser = await Parse.User.logIn(user.get('username'), password);

        const sessionQuery = new Parse.Query('_Session');
        sessionQuery.equalTo('user', authenticatedUser);
        const session = await sessionQuery.first({ useMasterKey: true });

        if (!session) {
            throw new Parse.Error(500, 'Session not found');
        }

        const sessionToken = session.get('sessionToken');

        return { sessionToken };
    } catch (error) {
        throw new Parse.Error(Parse.Error.INVALID_LOGIN_CREDENTIALS, 'Invalid email or password');
    }
});


// Cloud Function for user logout
Parse.Cloud.define("logoutUser", async (req) => {
    const { headers } = req;

    try {
        const sessionToken = headers["x-parse-session-token"];

        // Destroy the session by removing the corresponding entry in _Session collection
        const sessionQuery = new Parse.Query('_Session');
        sessionQuery.equalTo('sessionToken', sessionToken);
        const session = await sessionQuery.first({ useMasterKey: true });

        if (session) {
            await session.destroy({ useMasterKey: true });
        }

        await Parse.User.logOut();

        return {
            success: true,
            message: "User logged out successfully",
            error_code: 0
        };
    } catch (error) {
        console.error("Error during logout:", error);
        throw new Parse.Error(500, "An unexpected error occurred during logout. Please try again later.");
    }
});
