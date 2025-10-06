const { getUserFromSessionToken } = require("./authUtils");

// Cloud Function to save or update a chatbox behaviour
Parse.Cloud.define("saveChatboxBehaviour", async (request) => {
  const { chatboxBehaviour, behaviourName } = request.params;

  const { formality, opinion, emotion, length, topics, tone } = chatboxBehaviour;

  if (
      isNaN(formality) ||
      isNaN(opinion) ||
      isNaN(emotion) ||
      isNaN(length) ||
      isNaN(topics) ||
      isNaN(tone)
  ) {
      throw new Error("Invalid chatboxBehaviour object structure.");
  }

  const user = await getUserFromSessionToken(request);

  if (!user) {
      throw new Error("User not found. Please log in.");
  }

  const universityPointer = user.get("university");
  if (!universityPointer) {
      throw new Error("University not found.");
  }

  const universityObjectId = universityPointer;
  console.log("University objectId:", universityObjectId);

  const ChatboxBehaviour = Parse.Object.extend("ChatboxBehaviour");
  const query = new Parse.Query(ChatboxBehaviour);
  query.equalTo("userId", user.id);
  query.equalTo("name", behaviourName);

  try {
      const existingBehaviour = await query.first({ useMasterKey: true });

      if (existingBehaviour) {
          existingBehaviour.set("chatboxBehaviour", chatboxBehaviour);
          const updatedResult = await existingBehaviour.save(null, { useMasterKey: true });
          return updatedResult.toJSON();
      } else {
          const newChatboxBehaviour = new ChatboxBehaviour();
          newChatboxBehaviour.set("userId", user.id);
          newChatboxBehaviour.set("universityId", universityObjectId);
          newChatboxBehaviour.set("name", behaviourName);
          newChatboxBehaviour.set("chatboxBehaviour", chatboxBehaviour);

          const result = await newChatboxBehaviour.save(null, { useMasterKey: true });
          return result.toJSON();
      }
  } catch (error) {
      console.error("Error in saveChatboxBehaviour:", error);
      return {
          error:
              "Failed to save or update chatboxBehaviour. Please check the provided data and try again.",
      };
  }
});

  
  Parse.Cloud.define("getChatbotBehaviours", async (request) => {
    
    const user = await getUserFromSessionToken(request);
  
    if (!user) {
      throw new Error("User not found. Please log in.");
    }
  
    const ChatboxBehaviour = Parse.Object.extend("ChatboxBehaviour");
    const query = new Parse.Query(ChatboxBehaviour);
    query.equalTo("userId", user.id);
  
    try {
      const behaviours = await query.find({ useMasterKey: true });
  
      const flattenedBehaviours = behaviours.map((behaviour) => ({
        objectId: behaviour.id,
        name: behaviour.get("name"),
        chatboxBehaviour: behaviour.get("chatboxBehaviour"),
      }));
  
      return flattenedBehaviours;
    } catch (error) {
      console.error("Error in getChatbotBehaviours:", error);
      return {
        error: "Failed to fetch chatbot behaviours. Please try again later.",
      };
    }
  });
  
// Cloud Function to fetch a chatbox behaviour by ID
Parse.Cloud.define('getChatboxBehaviourById', async (request) => {
  const { chatboxBehaviourId } = request.params;

  if (!chatboxBehaviourId) {
    throw new Error('chatboxBehaviourId is required to fetch a chatbox behaviour.');
  }

  try {
    // Query the chatbox behaviour by ID
    const ChatboxBehaviour = Parse.Object.extend('ChatboxBehaviour');
    const query = new Parse.Query(ChatboxBehaviour);
    const chatboxBehaviour = await query.get(chatboxBehaviourId, { useMasterKey: true });

    return chatboxBehaviour.toJSON();
  } catch (error) {
    console.error('Error fetching chatbox behaviour by ID:', error);
    return {
      error: 'Failed to fetch chatbox behaviour. Please check the provided data and try again.',
    };
  }
});

// Cloud Function to fetch a chatbox behaviour by name
Parse.Cloud.define('getChatboxBehaviourByName', async (request) => {
  const { chatboxBehaviourName } = request.params;

  if (!chatboxBehaviourName) {
    throw new Error('chatboxBehaviourName is required to fetch a chatbox behaviour by name.');
  }

  const user = await getUserFromSessionToken(request);

  if (!user) {
    throw new Error('User not found. Please log in.');
  }

  // Query chatbox behaviours by name, associated with the user
  const ChatboxBehaviour = Parse.Object.extend('ChatboxBehaviour');
  const query = new Parse.Query(ChatboxBehaviour);
  query.equalTo('userId', user.id);
  query.equalTo('name', chatboxBehaviourName);

  try {
    const results = await query.find({ useMasterKey: true });

    if (results.length === 0) {
      throw new Error(`No chatbox behaviours found for chatboxBehaviourName: ${chatboxBehaviourName}`);
    }

    const chatboxBehaviours = results.map((behaviour) => behaviour.toJSON());
    return chatboxBehaviours;
  } catch (error) {
    console.error(`Error fetching chatbox behaviours by name (${chatboxBehaviourName}):`, error);
    throw new Parse.Error(error.code || 141, error.message);
  }
});

  // Update existing chatbox behaviour
Parse.Cloud.define("updateChatboxBehaviour", async (request) => {
  const { chatboxBehaviour, behaviourName, objectId } = request.params;

  // Input validation for chatboxBehaviour object
  const { formality, opinion, emotion, length, topics, tone } = chatboxBehaviour;

  if (
    isNaN(formality) ||
    isNaN(opinion) ||
    isNaN(emotion) ||
    isNaN(length) ||
    isNaN(topics) ||
    isNaN(tone)
  ) {
    throw new Error("Invalid chatboxBehaviour object structure.");
  }

  // Retrieve the user based on the session token
  const user = await getUserFromSessionToken(request);

  if (!user) {
    throw new Error("User not found. Please log in.");
  }

  const universityPointer = user.get("university");
  if (!universityPointer) {
    throw new Error("University not found.");
  }

  const universityObjectId = universityPointer;
  console.log("University objectId:", universityObjectId);

  try {
    // Check if objectId is provided for updating existing entry
    const existingQuery = new Parse.Query("ChatboxBehaviour");
    const existingChatboxBehaviour = await existingQuery.get(objectId, { useMasterKey: true });
    existingChatboxBehaviour.set("name", behaviourName); 
    existingChatboxBehaviour.set("chatboxBehaviour", chatboxBehaviour);

    const result = await existingChatboxBehaviour.save(null, { useMasterKey: true });
    return result;
  } catch (error) {
    console.error("Error in updateChatboxBehaviour:", error);
    return {
      error:
        "Failed to update chatboxBehaviour. Please check the provided data and try again.",
    };
  }
});

// Remove chatbox behaviour
Parse.Cloud.define("removeChatboxBehaviour", async (request) => {
  const { objectId } = request.params;

  if (!objectId) {
    throw new Error("objectId is required for removing chatboxBehaviour.");
  }

  try {
    // Check if objectId exists
    const existingQuery = new Parse.Query("ChatboxBehaviour");
    const existingChatboxBehaviour = await existingQuery.get(objectId, { useMasterKey: true });
    
    // Remove the chatbox behaviour entry
    await existingChatboxBehaviour.destroy({ useMasterKey: true });

    return { success: true, message: "ChatboxBehaviour removed successfully." };
  } catch (error) {
    console.error("Error in removeChatboxBehaviour:", error);
    return {
      error: "Failed to remove chatboxBehaviour. Please check the provided data and try again.",
    };
  }
});
