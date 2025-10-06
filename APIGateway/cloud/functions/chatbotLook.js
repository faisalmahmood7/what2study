const { getUserFromSessionToken } = require("./authUtils");

// Cloud Code function to save chatbot look
Parse.Cloud.define("saveChatbotLook", async (request) => {
  try {
      const { chatbotName, chatbotLook } = request.params;

      if (!chatbotName || !chatbotLook) {
          console.error("Invalid request parameters. Missing chatbotName or chatbotLook");
          throw new Error("Invalid request parameters.");
      }

      const {
          chatbotHeader,
          chatbotBackground,
          textBoxUser,
          textBoxChatbotReply,
          UIGroupA,
          UIGroupB,
      } = chatbotLook;

      if (
          !chatbotHeader ||
          !chatbotBackground ||
          !textBoxUser ||
          !textBoxChatbotReply ||
          !UIGroupA ||
          !UIGroupB
      ) {
          console.error("Invalid chatbotLook object structure.");
          throw new Error("Invalid chatbotLook object structure.");
      }

      // Retrieve the user based on the session token
      const user = await getUserFromSessionToken(request);

      if (!user) {
          console.error("User not found. Please log in.");
          throw new Error("User not found. Please log in.");
      }

      const universityPointer = user.get("university");

      if (!universityPointer) {
          console.error("University not found.");
          throw new Error("University not found.");
      }

      const universityObjectId = universityPointer;

      // Query if a chatbot with the same name already exists for the user
      const ChatbotLook = Parse.Object.extend("ChatbotLook");
      const query = new Parse.Query(ChatbotLook);
      query.equalTo("userId", user.id);
      query.equalTo("chatbotName", chatbotName);

      try {
          const existingChatbot = await query.first({ useMasterKey: true });

          if (existingChatbot) {
              // If the chatbot with the same name exists, update it
              existingChatbot.set("chatbotHeader", chatbotHeader);
              existingChatbot.set("chatbotBackground", chatbotBackground);
              existingChatbot.set("textBoxUser", textBoxUser);
              existingChatbot.set("textBoxChatbotReply", textBoxChatbotReply);
              existingChatbot.set("UIGroupA", UIGroupA);
              existingChatbot.set("UIGroupB", UIGroupB);

              const updatedResult = await existingChatbot.save(null, { useMasterKey: true });
              return updatedResult.toJSON();
          } else {
              // If the chatbot with the same name doesn't exist, create a new one
              const newChatbotLook = new ChatbotLook();
              newChatbotLook.set("userId", user.id);
              newChatbotLook.set("universityId", universityObjectId);
              newChatbotLook.set("chatbotName", chatbotName);
              newChatbotLook.set("chatbotHeader", chatbotHeader);
              newChatbotLook.set("chatbotBackground", chatbotBackground);
              newChatbotLook.set("textBoxUser", textBoxUser);
              newChatbotLook.set("textBoxChatbotReply", textBoxChatbotReply);
              newChatbotLook.set("UIGroupA", UIGroupA);
              newChatbotLook.set("UIGroupB", UIGroupB);

              const result = await newChatbotLook.save(null, { useMasterKey: true });
              return result.toJSON();
          }
      } catch (error) {
          console.error("Error in saveChatbotLook:", error);
          return {
              code: error.code || 141,
              error: error.message,
          };
      }
  } catch (error) {
      console.error("Error in saveChatbotLook:", error);
      return {
          code: error.code || 141,
          error: error.message,
      };
  }
});

  
  // Cloud Code function to get chatbot looks
  Parse.Cloud.define("getChatbotLooks", async (request) => {
    // Retrieve the user based on the session token
    const user = await getUserFromSessionToken(request);
  
    if (!user) {
      throw new Error("User not found. Please log in.");
    }
  
    // Query existing chatbot looks for the user
    const ChatbotLook = Parse.Object.extend("ChatbotLook");
    const query = new Parse.Query(ChatbotLook);
    query.equalTo("userId", user.id);
  
    try {
      const looks = await query.find({ useMasterKey: true });
  
      // Flatten the looks array for easier frontend handling
      const flattenedLooks = looks.map((look) => ({
        objectId: look.id,
        chatbotName: look.get("chatbotName"),
        chatbotHeader: look.get("chatbotHeader"),
        chatbotBackground: look.get("chatbotBackground"),
        textBoxUser: look.get("textBoxUser"),
        textBoxChatbotReply: look.get("textBoxChatbotReply"),
        UIGroupA: look.get("UIGroupA"),
        UIGroupB: look.get("UIGroupB"),
      }));
  
      return flattenedLooks;
    } catch (error) {
      console.error("Error in getChatbotLooks:", error);
      return {
        error: "Failed to fetch chatbot looks. Please try again later.",
      };
    }
  });

  // Cloud Function to fetch a chatbot look by ID
Parse.Cloud.define('getChatbotLookById', async (request) => {
  const { chatbotLookId } = request.params;

  if (!chatbotLookId) {
    throw new Error('chatbotLookId is required to fetch a chatbot look.');
  }

  try {
    // Query the chatbot look by ID
    const ChatbotLook = Parse.Object.extend('ChatbotLook');
    const query = new Parse.Query(ChatbotLook);
    const chatbotLook = await query.get(chatbotLookId, { useMasterKey: true });

    return chatbotLook.toJSON();
  } catch (error) {
    console.error('Error fetching chatbot look by ID:', error);
    return {
      error: 'Failed to fetch chatbot look. Please check the provided data and try again.',
    };
  }
});

// Cloud Function to fetch a chatbot look by name
Parse.Cloud.define('getChatbotLookByName', async (request) => {
  const { chatbotName } = request.params;

  if (!chatbotName) {
    throw new Error('chatbotName is required to fetch a chatbot look by name.');
  }

  const user = await getUserFromSessionToken(request);

  if (!user) {
    throw new Error('User not found. Please log in.');
  }

  // Query chatbot looks by name, associated with the user
  const ChatbotLook = Parse.Object.extend('ChatbotLook');
  const query = new Parse.Query(ChatbotLook);
  query.equalTo('userId', user.id);
  query.equalTo('chatbotName', chatbotName);

  try {
    const results = await query.find({ useMasterKey: true });

    if (results.length === 0) {
      throw new Error(`No chatbot looks found for chatbotName: ${chatbotName}`);
    }

    const chatbotLooks = results.map((look) => look.toJSON());
    return chatbotLooks;
  } catch (error) {
    console.error(`Error fetching chatbot looks by name (${chatbotName}):`, error);
    throw new Parse.Error(error.code || 141, error.message);
  }
});

  // Update chatbot look
Parse.Cloud.define("updateChatbotLook", async (request) => {
  try {
    // Extract chatbotLookId and chatbotLook from the request parameters
    const { chatbotLookId, chatbotLook } = request.params;

    // Validate the presence of chatbotLookId and chatbotLook
    if (!chatbotLookId || !chatbotLook) {
      console.error("Invalid request parameters. Missing chatbotLookId or chatbotLook");
      throw new Error("Invalid request parameters.");
    }

    // Validate the structure of chatbotLook
    const {
      chatbotHeader,
      chatbotBackground,
      textBoxUser,
      textBoxChatbotReply,
      UIGroupA,
      UIGroupB,
    } = chatbotLook;

    if (
      !chatbotHeader ||
      !chatbotBackground ||
      !textBoxUser ||
      !textBoxChatbotReply ||
      !UIGroupA ||
      !UIGroupB
    ) {
      console.error("Invalid chatbotLook object structure.");
      throw new Error("Invalid chatbotLook object structure.");
    }

    // Retrieve the user based on the session token
    const user = await getUserFromSessionToken(request);

    if (!user) {
      console.error("User not found. Please log in.");
      throw new Error("User not found. Please log in.");
    }

    const universityPointer = user.get("university");

    if (!universityPointer) {
      console.error("University not found.");
      throw new Error("University not found.");
    }

    const universityObjectId = universityPointer;

    // Retrieve the existing ChatbotLook object
    const existingChatbotLook = await new Parse.Query("ChatbotLook")
      .equalTo("objectId", chatbotLookId)
      .first({ useMasterKey: true });

    if (!existingChatbotLook) {
      console.error("ChatbotLook not found.");
      throw new Error("ChatbotLook not found.");
    }

    // Update the existing ChatbotLook object
    existingChatbotLook.set("chatbotHeader", chatbotHeader);
    existingChatbotLook.set("chatbotBackground", chatbotBackground);
    existingChatbotLook.set("textBoxUser", textBoxUser);
    existingChatbotLook.set("textBoxChatbotReply", textBoxChatbotReply);
    existingChatbotLook.set("UIGroupA", UIGroupA);
    existingChatbotLook.set("UIGroupB", UIGroupB);

    // Save the updated ChatbotLook object
    const result = await existingChatbotLook.save(null, { useMasterKey: true });

    console.log("ChatbotLook updated successfully:", result);

    // Return the updated object details
    return result.toJSON();
  } catch (error) {
    console.error("Error in updateChatbotLook:", error);
    return {
      code: error.code || 141,
      error: error.message,
    };
  }
});

// Remove chatbot look
Parse.Cloud.define("removeChatbotLook", async (request) => {
  const { chatbotLookId } = request.params;

  if (!chatbotLookId) {
    throw new Error("chatbotLookId is required for removing chatbotLook.");
  }

  try {
    // Check if chatbotLookId exists
    const existingQuery = new Parse.Query("ChatbotLook");
    const existingChatbotLook = await existingQuery.get(chatbotLookId, { useMasterKey: true });

    // Remove the chatbot look entry
    await existingChatbotLook.destroy({ useMasterKey: true });

    return { success: true, message: "ChatbotLook removed successfully." };
  } catch (error) {
    console.error("Error in removeChatbotLook:", error);
    return {
      error: "Failed to remove ChatbotLook. Please check the provided data and try again.",
    };
  }
});
