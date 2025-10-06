Parse.Cloud.define('createChatbot', async (request) => {
    const { universityId, name, color, otherSettings } = request.params;

    // Ensure the university exists
    const University = Parse.Object.extend('University');
    const universityQuery = new Parse.Query(University);
    universityQuery.equalTo('objectId', universityId);

    try {
        const university = await universityQuery.first();

        if (!university) {
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'University not found');
        }

        const Chatbot = Parse.Object.extend('Chatbot');
        const chatbot = new Chatbot();
        chatbot.set('university', university);
        chatbot.set('name', name);
        chatbot.set('color', color);
        chatbot.set('otherSettings', otherSettings);
        chatbot.set('isActive', true);

        await chatbot.save();

        return { message: 'Chatbot created successfully', objectId: chatbot.id };
    } catch (error) {
        throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, error.message);
    }
});

Parse.Cloud.define('listChatbotsForUniversity', async (request) => {
    const { universityId } = request.params;

    const University = Parse.Object.extend('University');
    const universityQuery = new Parse.Query(University);
    universityQuery.equalTo('objectId', universityId);

    try {
        const university = await universityQuery.first();

        if (!university) {
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'University not found');
        }

        const Chatbot = Parse.Object.extend('Chatbot');
        const chatbotQuery = new Parse.Query(Chatbot);
        chatbotQuery.equalTo('university', university);

        const chatbots = await chatbotQuery.find();

        return chatbots.map(chatbot => ({
            id: chatbot.id,
            name: chatbot.get('name'),
            color: chatbot.get('color'),
            otherSettings: chatbot.get('otherSettings'),
            isActive: chatbot.get('isActive'),
        }));
    } catch (error) {
        throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, error.message);
    }
});

Parse.Cloud.define('updateChatbotForUniversity', async (request) => {
    const { chatbotId, color, otherSettings, isActive } = request.params;

    const Chatbot = Parse.Object.extend('Chatbot');
    const chatbotQuery = new Parse.Query(Chatbot);
    chatbotQuery.equalTo('objectId', chatbotId);

    try {
        const chatbot = await chatbotQuery.first();

        if (!chatbot) {
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Chatbot not found');
        }

        if (color) {
            chatbot.set('color', color);
        }

        if (otherSettings) {
            chatbot.set('otherSettings', otherSettings);
        }

        if (isActive !== undefined) {
            chatbot.set('isActive', isActive);
        }

        await chatbot.save();

        return { message: 'Chatbot updated successfully' };
    } catch (error) {
        throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, error.message);
    }
});
Parse.Cloud.define('generateEmbedCode', async (request) => {
    const { universityId } = request.params;

    const University = Parse.Object.extend('University');
    const universityQuery = new Parse.Query(University);
    universityQuery.equalTo('objectId', universityId);

    try {
        const university = await universityQuery.first();

        if (!university) {
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'University not found');
        }

        const chatbotScriptUrl = 'https://your-chatbot-cdn.com/chatbot.js'; 

        return { chatbotScriptUrl };
    } catch (error) {
        throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, error.message);
    }
});




