const Parse = require('parse/node');

// Assuming you have a constant for the session timeout duration (in milliseconds)
const SESSION_TIMEOUT = 3.6e6 * 24; // 24 hours (3.6e+6 is 1 hour).

async function getUserFromSessionToken(request) {
  const sessionToken = request.headers['x-parse-session-token'];

  if (!sessionToken) {
    return null;
  }

  const sessionQuery = new Parse.Query('_Session');
  sessionQuery.equalTo('sessionToken', sessionToken);

  try {
    const session = await sessionQuery.first({ useMasterKey: true });

    if (!session) {
      return null;
    }

    // Check if the session has expired
    const lastActivity = session.updatedAt || session.createdAt;
    const expirationTime = lastActivity.getTime() + SESSION_TIMEOUT;

    if (Date.now() > expirationTime) {
      // Session has expired, log out the user and destroy the session
      await logoutUser(sessionToken);
      return null;
    }

    const userId = session.get('user').id;
    const user = await getUserById(userId);

    return user;
  } catch (error) {
    console.error('Error fetching user from session token:', error);
    return null;
  }
}

async function getUserById(userId) {
  const User = Parse.User;
  const userQuery = new Parse.Query(User);
  userQuery.equalTo('objectId', userId);

  try {
    // Use master key to bypass ACLs
    Parse.Cloud.useMasterKey();
    const user = await userQuery.first();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

async function logoutUser(sessionToken) {
  try {
    const sessionQuery = new Parse.Query('_Session');
    sessionQuery.equalTo('sessionToken', sessionToken);
    const session = await sessionQuery.first({ useMasterKey: true });

    if (session) {
      await session.destroy({ useMasterKey: true });
    }

    // Log out the user
    await Parse.User.logOut();
  } catch (error) {
    console.error('Error during logout:', error);
    throw new Parse.Error(
      500,
      'An unexpected error occurred during logout. Please try again later.'
    );
  }
}

module.exports = {
  getUserFromSessionToken,
};
