const { getUserFromSessionToken } = require("./authUtils");
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

// Parse.Cloud.define("chatbotGeneralScreen", async (request) => {
//createUpdateChatClient
Parse.Cloud.define("createChatClient", async (request) => {
    const {
      chatbotName,
      chatbotBubbleIcons,
      defaultSettings,
      chatboxBehaviour,
      chatbotProfileImage,
      chatbotReplies,
      chatbotContact,
      chatbotLook,
    } = request.params;
  
    if (
      !chatbotName ||
      !chatbotBubbleIcons ||
      !defaultSettings ||
      !chatboxBehaviour ||
      !chatbotReplies ||
      !chatbotContact ||
      !chatbotLook
    ) {
      throw new Error("Invalid request parameters.");
    }
  
    const { chatbotLanguage, audioNarration, narrator } = defaultSettings;
  
    if (!chatbotLanguage || typeof audioNarration !== "boolean" || !narrator) {
      throw new Error("Invalid defaultSettings object structure.");
    }
  
    const {
      formality,
      opinion,
      emotion,
      length,
      topics,
      tone,
      chatbotBehaviourName,
    } = chatboxBehaviour;
  
    if (
      isNaN(formality) ||
      isNaN(opinion) ||
      isNaN(emotion) ||
      isNaN(length) ||
      isNaN(topics) ||
      isNaN(tone) ||
      !chatbotBehaviourName
    ) {
      throw new Error("Invalid chatboxBehaviour object structure.");
    }
  
    const { randomQuestions, showRandomQuestionsMessage } = chatbotReplies;
  
    if (typeof randomQuestions !== "boolean" || !showRandomQuestionsMessage) {
      throw new Error("Invalid chatbotReplies object structure.");
    }
  
    const { talkToHuman, showTalkToHumanMessage } = chatbotContact;
  
    if (typeof talkToHuman !== "boolean" || !showTalkToHumanMessage) {
      throw new Error("Invalid chatbotContact object structure.");
    }
  
    const {
      chatbotHeader,
      chatbotBackground,
      textBoxUser,
      textBoxChatbotReply,
      UIGroupA,
      UIGroupB,
      chatbotLookName,
    } = chatbotLook;
  
    if (
      !chatbotHeader ||
      !chatbotBackground ||
      !textBoxUser ||
      !textBoxChatbotReply ||
      !UIGroupA ||
      !UIGroupB ||
      !chatbotLookName
    ) {
      throw new Error("Invalid chatbotLook object structure.");
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
    const chatbotId = uuid.v4();
  
    const existingChatbotQuery = new Parse.Query("Chatbot");
    existingChatbotQuery.equalTo("chatbotName", chatbotName);
    const existingChatbot = await existingChatbotQuery.first();
  
    if (existingChatbot) {
      try {
        existingChatbot.set("chatbotBubbleIcons", chatbotBubbleIcons.join(","));
        existingChatbot.set("chatbotProfileImage", chatbotProfileImage.join(","));
        existingChatbot.set("defaultSettings", defaultSettings);
        existingChatbot.set("chatboxBehaviour", {
          formality,
          opinion,
          emotion,
          length,
          topics,
          tone,
          chatbotBehaviourName,
        });
        existingChatbot.set("chatbotReplies", chatbotReplies);
        existingChatbot.set("chatbotContact", chatbotContact);
        existingChatbot.set("chatbotLook", {
          chatbotHeader,
          chatbotBackground,
          textBoxUser,
          textBoxChatbotReply,
          UIGroupA,
          UIGroupB,
          chatbotLookName,
        });
  
        const result = await existingChatbot.save(null, { useMasterKey: true });
        const accessToken = jwt.sign({ chatbotId: existingChatbot.get("chatbotId"), userId: user.id, purpose: 'chatbotIntegration' }, 'what2studyMaster');
        const scriptTag = `<script id='what2studyChatclientScript' src='https://[server_url]/?bot_id=${existingChatbot.get("chatbotId")}&token=${accessToken}&windowtype=min'></script>`;

        return { result, scriptTag };
      } catch (error) {
        console.error("Error updating existing chatbot:", error);
        return {
          error:
            "Failed to update chatbot settings. Please check the provided data and try again.",
        };
      }
    } else {
      // Create a new chatbot record
      const Chatbot = Parse.Object.extend("Chatbot");
      const newChatbot = new Chatbot();
    
      newChatbot.set("userId", user.id);
      newChatbot.set("universityId", universityObjectId);
      newChatbot.set("chatbotId", chatbotId);  // Set the generated chatbot ID
      newChatbot.set("chatbotName", chatbotName);
    
      newChatbot.set("chatbotBubbleIcons", chatbotBubbleIcons.join(","));
      newChatbot.set("chatbotProfileImage", chatbotProfileImage.join(","));
    
      newChatbot.set("defaultSettings", defaultSettings);
      newChatbot.set("chatboxBehaviour", {
        formality,
        opinion,
        emotion,
        length,
        topics,
        tone,
        chatbotBehaviourName,
      });
      newChatbot.set("chatbotReplies", chatbotReplies);
      newChatbot.set("chatbotContact", chatbotContact);
      newChatbot.set("chatbotLook", {
        chatbotHeader,
        chatbotBackground,
        textBoxUser,
        textBoxChatbotReply,
        UIGroupA,
        UIGroupB,
        chatbotLookName,
      });
    
      newChatbot.set("userId", user.id);
      newChatbot.set("universityId", universityObjectId.id);
    
      const accessToken = jwt.sign({ chatbotId, userId: user.id, purpose: 'chatbotIntegration' }, 'what2studyMaster');
  
      try {
        const result = await newChatbot.save(null, { useMasterKey: true });
        const scriptTag = `<script id='what2studyChatclientScript' src='https://[server_url]/?bot_id=${chatbotId}&token=${accessToken}&windowtype=min'></script>`;
        
        return { result, scriptTag };
      } catch (error) {
        console.error("Error creating new chatbot:", error);
        return {
          error:
            "Failed to save chatbot settings. Please check the provided data and try again.",
        };
      }
    }
  });
  
  Parse.Cloud.define("getChatClient", async (request) => {
    const user = await getUserFromSessionToken(request);
  
    if (!user) {
      throw new Error("User not found. Please log in.");
    }
  
    const universityPointer = user.get("university");
  
    if (!universityPointer) {
      throw new Error("University not found.");
    }
  
    const universityObjectId = universityPointer.id;
  
    const Chatbot = Parse.Object.extend("Chatbot");
    const query = new Parse.Query(Chatbot);
    query.limit(1000000)
    query.equalTo("userId", user.id);
    query.equalTo("universityId", universityObjectId);
  
    try {
      const chatbots = await query.find({ useMasterKey: true });
  
      const flattenedChatbots = chatbots.map((chatbot) => ({
        userId: user.id, 
        universityId: universityObjectId,
        objectId: chatbot.id,
        chatbotId: chatbot.get("chatbotId"),
        chatbotName: chatbot.get("chatbotName"),
        chatbotBubbleIcons: chatbot.get("chatbotBubbleIcons").split(","),
        chatbotProfileImage: chatbot.get("chatbotProfileImage").split(","),
        defaultSettings: chatbot.get("defaultSettings"),
        chatboxBehaviour: chatbot.get("chatboxBehaviour"),
        chatbotReplies: chatbot.get("chatbotReplies"),
        chatbotContact: chatbot.get("chatbotContact"),
        chatbotLook: chatbot.get("chatbotLook"),
      }));
  
      return flattenedChatbots;
    } catch (error) {
      console.error("Error in getAllChatbots:", error);
      return {
        error: "Failed to fetch chatbots. Please try again later.",
      };
    }
  });

  Parse.Cloud.define("getChatbotSettings", async (request) => {
    const { chatbotId, accessToken } = request.params;
    if(chatbotId && accessToken)
    {
    try {
     
      const decoded = jwt.verify(accessToken, 'what2studyMaster');
     
      // const userId = decoded.userId;
  
      // console.log("User ID:", userId);
  
      // Fetch the user object based on userId
      // const userQuery = new Parse.Query(Parse.User);
      // const user = await userQuery.get(userId, { useMasterKey: true });
  
      // // Fetch other required information (like universityId) from the user object
      // const universityObjectId = user.get("university").id;
  
  
      const Chatbot = Parse.Object.extend("chatbots");
      const query = new Parse.Query(Chatbot);
      query.equalTo("objectId", chatbotId);
     
      query.equalTo("activeChatbot", true);
      try {
        const chatbot = await query.first({ useMasterKey: true });

        const user = Parse.Object.extend("_User");
        const query2 = new Parse.Query(user);
        query2.equalTo("objectId",  chatbot.get("user"));
       
        const userDetails = await query2.first({ useMasterKey: true });
        var phone =""
        var email =""
        var customPrompt = ""
        var defaultPrompt=""
        var welcomeMsgDE=""
        var welcomeMsgEN=""
        var introScreenInfoDE=""
        var introScreenInfoEN=""

        if(userDetails.get("AllowKontaktEmail") == true){
          phone = userDetails.get("Telefonnummer")
        }

        if(userDetails.get("AllowKontaktTele") == true){
          email = userDetails.get("kontaktEmail")
        }
        if(chatbot.get("welcomeMsgDE") == undefined){
          welcomeMsgDE = 'Hallo, ich bin ein Chatbot der dir bei deinem Studium helfen soll! Bevor wir loslegen, ein paar wichtige Fakten.'
        }
        else{
          welcomeMsgDE = chatbot.get("welcomeMsgDE")
        }

        if(chatbot.get("welcomeMsgEN") == undefined){
          welcomeMsgEN = "Hello. It's nice to meet you! I am a chatbot built to help you with your studies! Before we get started, here are a few important facts."
        }
        else{
          welcomeMsgEN = chatbot.get("welcomeMsgEN")
        }

        if(chatbot.get("introScreenInfoDE") == undefined){
          introScreenInfoDE = "Geben Sie die erste Nachricht ein, die vom Chatbot angezeigt werden soll"
        }
        else{
          introScreenInfoDE = chatbot.get("introScreenInfoDE")
        }

        if(chatbot.get("introScreenInfoEN") == undefined){
          introScreenInfoEN = 'Welcome to the Student Advisory Service! How can I help you today?'
        }
        else{
          introScreenInfoEN = chatbot.get("introScreenInfoEN")
        }

        if(chatbot.get("customPrompt") == undefined){
          
          customPrompt = 'You are a helpful AI assistant with the name: "chatbotname", responsible for answering questions about the "universityname". Use the provided context to answer the questions. Your role is to act as a study advisor, assisting students and those interested in study programs with their inquiries. Please use gender-sensitive language (e.g., Studierende, Dozierende).\n\nImportant Guidelines:\n\nAccuracy: If the exact study program mentioned by the student (e.g., architecture, HCI) is not offered by the university, do not state that it is. Instead, mention similar or related programs, if available, and offer to provide more information.\n\nClarification: If you are unsure about the question or if the provided context does not have enough information, do not make assumptions. Ask the user for more specific details to better understand their needs.\n\nSensitive Topics: Do not engage in answering questions related to sensitive topics such as racism or discrimination. Instead, respond with something like,  I\'m sorry to hear that you are experiencing this type of problem. Unfortunately, I cannot help you directly with this kind of problem. Please check "Guideline/Page"\n\nStudy-Related Focus: Answer only questions that are related to study programs, universities, education, or opening hours / holidays of the university. Redirect conversations back to study-related topics if necessary.\n\nData Processing: If a user asks how their data or chat history is processed, provide a brief summary of the data protection policy and refer them to the full policy. Respond with something like What2Study verarbeitet deine personenbezogenen Daten, um dir bei Fragen rund um das Studium zu helfen und unsere Dienstleistungen zu verbessern. Details zur Datenverarbeitung findest du in unserer Datenschutzerklärung: [https://www.cpstech.de/what2study/datasecurity/] \nResponse Structure: Clearly state if a program is not available and suggest similar options. Always ask a follow-up question to ensure the user\'s needs are met.'
          customPrompt.replace("universityname",   userDetails.get("name"))
          if(chatbot.get("name") !=""){
            customPrompt.replace("chatbotname", chatbot.get("name"))
          }
        }
        else{
        customPrompt = chatbot.get("customPrompt")
        }
        
        if(chatbot.get("defaultPrompt") == undefined){
          defaultPrompt = 'You are a helpful AI assistant with the name: "chatbotname", responsible for answering questions about the "universityname". Use the provided context to answer the questions. Your role is to act as a study advisor, assisting students and those interested in study programs with their inquiries. Please use gender-sensitive language (e.g., Studierende, Dozierende).\n\nImportant Guidelines:\n\nAccuracy: If the exact study program mentioned by the student (e.g., architecture, HCI) is not offered by the university, do not state that it is. Instead, mention similar or related programs, if available, and offer to provide more information.\n\nClarification: If you are unsure about the question or if the provided context does not have enough information, do not make assumptions. Ask the user for more specific details to better understand their needs.\n\nSensitive Topics: Do not engage in answering questions related to sensitive topics such as racism or discrimination. Instead, respond with something like,  I\'m sorry to hear that you are experiencing this type of problem. Unfortunately, I cannot help you directly with this kind of problem. Please check "Guideline/Page"\n\nStudy-Related Focus: Answer only questions that are related to study programs, universities, education, or opening hours / holidays of the university. Redirect conversations back to study-related topics if necessary.\n\nData Processing: If a user asks how their data or chat history is processed, provide a brief summary of the data protection policy and refer them to the full policy. Respond with something like What2Study verarbeitet deine personenbezogenen Daten, um dir bei Fragen rund um das Studium zu helfen und unsere Dienstleistungen zu verbessern. Details zur Datenverarbeitung findest du in unserer Datenschutzerklärung: [https://www.cpstech.de/what2study/datasecurity/] \nResponse Structure: Clearly state if a program is not available and suggest similar options. Always ask a follow-up question to ensure the user\'s needs are met.'
          defaultPrompt.replace("universityname",   userDetails.get("name"))
          if(chatbot.get("name") !=""){
            defaultPrompt.replace("chatbotname", chatbot.get("name"))
          } 
        }
        else{
        defaultPrompt = chatbot.get("defaultPrompt")
        }

        const flattenedChatbot = {
          phone:phone,
          email:email,
          orgImage: userDetails.get("logo"),
          nameOfOrg:userDetails.get("name"),
          userId: chatbot.get("user"),
          universityId: chatbot.get("user"),
          objectId: chatbotId,
          chatbotId: chatbotId,
          chatbotName: chatbot.get("name"),
          chatbotBubbleIcons: chatbot.get("selectedBubbleIcon"),
          chatbotProfileImage: chatbot.get("selectedProfileImage"),
          language:chatbot.get("language"),
          introVideo:chatbot.get("introVideo"),
          randomQuestionEnabled: chatbot.get("randomQuestionEnabled"),
          randomQuestion:chatbot.get("randomQuestion"),
          talkToaHumanEnabled: chatbot.get("talkToaHumanEnabled"),
          talkToaHuman:chatbot.get("talkToaHuman"),
          narrator:chatbot.get("Narrator"),
          AudioNarration:chatbot.get("AudioNarration"),
          langWeiterMain:chatbot.get("langWeiterMain"),
          matriculationNumber:chatbot.get("matriculationNumber"),

          promptSelection:chatbot.get("promptSelection"),
          customPrompt:customPrompt,
          defaultPrompt:defaultPrompt,
          welcomeMsgDE:welcomeMsgDE,
          welcomeMsgEN:welcomeMsgEN,
          introScreenInfoDE:introScreenInfoDE,
          introScreenInfoEN:introScreenInfoEN,
          defaultSettings: {
            chatbotLanguage: chatbot.get("language"),
            audioNarration: chatbot.get("AudioNarration"),
            narrator:chatbot.get("Narrator") ,
        } ,
          chatboxBehaviour: {
            formality: chatbot.get("behavior")[0].pointOnScale,
            opinion: chatbot.get("behavior")[1].pointOnScale,
            emotion: chatbot.get("behavior")[2].pointOnScale,
            length: chatbot.get("behavior")[3].pointOnScale,
            topics: chatbot.get("behavior")[4].pointOnScale,
            tone: chatbot.get("behavior")[5].pointOnScale,
            chatbotBehaviourName: "",
        },
          chatbotReplies: {
            randomQuestions: chatbot.get("randomQuestionEnabled"),
            showRandomQuestionsMessage: chatbot.get("randomQuestion"),
        },
          chatbotContact:{
            talkToHuman: chatbot.get("talkToaHumanEnabled"),
            showTalkToHumanMessage: chatbot.get("talkToaHuman"),
        },
          chatbotLook: {
            chatbotHeader: {
                chatbotHeaderBackgroundColor: chatbot.get("headerColor"),
                chatbotHeaderIconFontColor: chatbot.get("headerIconFontColor"),
            } ,
            chatbotBackground: {
                chatbotBackgroundColor: chatbot.get("chatbotBackgroundColor"),
            },
            textBoxUser: {
                textBoxUserColor: chatbot.get("textBoxColorUser"),
                textBoxUserFontColor: chatbot.get("fontColorUser"),
                textBoxFontStyle: chatbot.get("fontstyleUser"),
            },
            textBoxChatbotReply: {
                textBoxChatbotReplyColor: chatbot.get("textBoxColorChatbotReply"),
                textBoxChatbotReplyFontColor: chatbot.get("fontColorChatbotReply"),
                textBoxChatboxReplyFontStyle: chatbot.get("fontstyleChatbotReply"),
            },
            UIGroupA: {
                UIGroupAUIBackground: chatbot.get("uiBackgroundGroupA"),
                UIGroupAUIHighlight: chatbot.get("uiHighLightGroupA"),
            },
            UIGroupB: {
                UIGroupBUIBackground: chatbot.get("uiBackgroundGroupB"),
                UIGroupBUIHighlight: chatbot.get("uiHighLightGroupB"),
                fontstyle:chatbot.get("fontstyle")
            },
            chatbotLookName: "",
        },
        };
  
        return flattenedChatbot; // Return directly without the extra "result" object
      } catch (error) {
        console.error("Error in getAllChatbots:", error);
        return {
          error: "Failed to fetch chatbots. Please try again later.",
        };
      }
    } catch (error) {
      console.error("JWT verification failed:", error);
      throw new Error("Unauthorized access.");
    }}
    else{
      return {
        error: "Failed to fetch chatbots. Please try again later.",
      };
    }
  });
  
    
// Cloud function to get chatbot details by ID or name
Parse.Cloud.define("getChatbotDetailsByIdOrName", async (request) => {
  const { chatbotId, chatbotName } = request.params;

  if (!chatbotId && !chatbotName) {
    throw new Error("Please provide either chatbotId or chatbotName.");
  }

  try {
    const chatbotQuery = new Parse.Query("Chatbot");

    if (chatbotId) {
      chatbotQuery.equalTo("chatbotId", chatbotId);
    } else if (chatbotName) {
      chatbotQuery.equalTo("chatbotName", chatbotName);
    }

    const chatbot = await chatbotQuery.first({ useMasterKey: true });

    if (chatbot) {
      return chatbot.toJSON();
    } else {
      throw new Error("Chatbot not found.");
    }
  } catch (error) {
    console.error("Error fetching chatbot details:", error);
    return {
      error: "Failed to fetch chatbot details. Please check the provided data and try again.",
    };
  }
});

Parse.Cloud.define("removeChatClientByBotIdOrName", async (request) => {
  const { chatbotId, chatbotName } = request.params;

  if (!(chatbotId || chatbotName)) {
    throw new Error("Please provide chatbotId or chatbotName for removal.");
  }

  let chatbot;
  if (chatbotId) {
    const chatbotQuery = new Parse.Query("Chatbot");
    chatbotQuery.equalTo("chatbotId", chatbotId);
    chatbot = await chatbotQuery.first();
  } else {
    const chatbotQuery = new Parse.Query("Chatbot");
    chatbotQuery.equalTo("chatbotName", chatbotName);
    chatbot = await chatbotQuery.first();
  }

  if (!chatbot) {
    throw new Error("Chatbot not found.");
  }

  try {
    // Remove the chatbot record
    await chatbot.destroy({ useMasterKey: true });
    return { success: true, message: "Chatbot removed successfully." };
  } catch (error) {
    console.error("Error removing chatbot:", error);
    return { success: false, error: "Failed to remove chatbot. Please try again." };
  }
});

Parse.Cloud.define("removeChatClientByObjectId", async (request) => {
  const { objectId } = request.params;

  if (!objectId) {
    throw new Error("Please provide objectId for removal.");
  }

  const chatbotQuery = new Parse.Query("Chatbot");
  chatbotQuery.equalTo("objectId", objectId);

  try {
    const chatbot = await chatbotQuery.first();

    if (!chatbot) {
      throw new Error("Chatbot not found.");
    }

    // Remove the chatbot record
    await chatbot.destroy({ useMasterKey: true });

    return { success: true, message: "Chatbot removed successfully." };
  } catch (error) {
    console.error("Error removing chatbot:", error);
    return { success: false, error: "Failed to remove chatbot. Please try again." };
  }
});

Parse.Cloud.define('formatBase64Image', async (request) => {
  try {
      const { base64Image } = request.params;

      if (!base64Image) {
          throw new Error('Base64 image is required.');
      }

      const decodedImageBuffer = Buffer.from(base64Image, 'base64');
      const decodedBase64 = decodedImageBuffer.toString('base64');

      const formattedBase64 = `data:image/png;base64,${decodedBase64}`;

      return { formattedBase64 };
  } catch (error) {
      console.error('Error in formatBase64Image:', error);
      throw new Error('Failed to format base64 image.');
  }
});
