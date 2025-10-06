const { getUserFromSessionToken } = require('./authUtils');

Parse.Cloud.define('saveKnowledgeEntry', async (request) => {
  const { type, priority, expires, tags, content, checkboxChecked, videoName, videoTranscript } = request.params;

  // Retrieve the user based on the session token
  const user = await getUserFromSessionToken(request);

  if (!user) {
      throw new Error('User not found. Please log in.');
  }

  const universityPointer = user.get('university');
  if (!universityPointer) {
      throw new Error('University not found.');
  }

  const universityObjectId = universityPointer;
  console.log('University objectId:', universityObjectId);
  
  const KnowledgeDatabase = Parse.Object.extend('KnowledgeDatabase');
  const knowledgeEntry = new KnowledgeDatabase();

  knowledgeEntry.set('priority', priority);
  knowledgeEntry.set('expires', expires);
  knowledgeEntry.set('tags', tags);

  // Associate the organization with the logged-in user
  knowledgeEntry.set('userId', user.id);
  knowledgeEntry.set('universityId', universityObjectId.id);
  
  switch (type) {
      case 'url':
          knowledgeEntry.set('type', 'url');
          knowledgeEntry.set('url', content);
          knowledgeEntry.set('checkboxChecked', checkboxChecked);
          break;

      case 'text':
          knowledgeEntry.set('type', 'text');
          knowledgeEntry.set('text', content);
          break;

      case 'image':
          knowledgeEntry.set('type', 'image');
          knowledgeEntry.set('image', content);
          break;

      case 'video':
          knowledgeEntry.set('type', 'video');
          knowledgeEntry.set('video', content);
          knowledgeEntry.set('videoName', videoName);
          knowledgeEntry.set('videoTranscript', videoTranscript);
          break;

      default:
          throw new Parse.Error(141, 'Invalid knowledge entry type.');
  }

  try {
      const result = await knowledgeEntry.save(null, { useMasterKey: true });
      return result;
  } catch (error) {
      console.error('Error saving knowledge entry:', error);
      throw new Parse.Error(error.code || 141, error.message);
  }
});

// Cloud Function to fetch all knowledge entries
Parse.Cloud.define('fetchAllKnowledgeEntries', async (request) => {
  const user = await getUserFromSessionToken(request);

  if (!user) {
    throw new Error("User not found. Please log in.");
  }

  const universityPointer = user.get("university");
  if (!universityPointer) {
    throw new Error("University not found.");
  }
  
  const universityObjectId = universityPointer.id;

  // Query all knowledge entries associated with the user and university
  const KnowledgeDatabase = Parse.Object.extend("KnowledgeDatabase");
  const query = new Parse.Query(KnowledgeDatabase);
  query.equalTo('userId', user.id);
  query.equalTo('universityId', universityObjectId);

  try {
    const results = await query.find({ useMasterKey: true });

    const knowledgeEntries = results.map((entry) => entry.toJSON());
    return knowledgeEntries;
  } catch (error) {
    console.error('Error fetching all knowledge entries:', error);
    throw new Parse.Error(error.code || 141, error.message);
  }
});

// Cloud Function to fetch a knowledge entry by ID
Parse.Cloud.define('getKnowledgeEntryById', async (request) => {
  const { knowledgeEntryId } = request.params;

  if (!knowledgeEntryId) {
    throw new Error('knowledgeEntryId is required to fetch a knowledge entry.');
  }

  try {
    // Query the knowledge entry by ID
    const KnowledgeDatabase = Parse.Object.extend('KnowledgeDatabase');
    const query = new Parse.Query(KnowledgeDatabase);
    const knowledgeEntry = await query.get(knowledgeEntryId, { useMasterKey: true });

    // Check if the knowledge entry belongs to the user (optional)
     const user = await getUserFromSessionToken(request);
     if (knowledgeEntry.get('userId') !== user.id) {
       throw new Error('Unauthorized access to the knowledge entry.');
     }

    return knowledgeEntry.toJSON();
  } catch (error) {
    console.error('Error fetching knowledge entry by ID:', error);
    return {
      error: 'Failed to fetch knowledge entry. Please check the provided data and try again.',
    };
  }
});

// Cloud Function to fetch knowledge entries by type
Parse.Cloud.define('getKnowledgeEntriesByType', async (request) => {
  const { type } = request.params;

  if (!type) {
    throw new Error('Type is required to fetch knowledge entries by type.');
  }

  const user = await getUserFromSessionToken(request);

  if (!user) {
    throw new Error("User not found. Please log in.");
  }

  const universityPointer = user.get("university");
  if (!universityPointer) {
    throw new Error("University not found.");
  }
  
  const universityObjectId = universityPointer.id;

  // Query knowledge entries by type, associated with the user and university
  const KnowledgeDatabase = Parse.Object.extend("KnowledgeDatabase");
  const query = new Parse.Query(KnowledgeDatabase);
  query.equalTo('userId', user.id);
  query.equalTo('universityId', universityObjectId);
  query.equalTo('type', type);

  try {
    const results = await query.find({ useMasterKey: true });

    if (results.length === 0) {
      throw new Error(`No knowledge entries found for type: ${type}`);
    }

    const knowledgeEntries = results.map((entry) => entry.toJSON());
    return knowledgeEntries;
  } catch (error) {
    console.error(`Error fetching knowledge entries by type (${type}):`, error);
    throw new Parse.Error(error.code || 141, error.message);
  }
});


// Update knowledge entry
Parse.Cloud.define('updateKnowledgeEntry', async (request) => {
  const { objectId, type, priority, expires, tags, content, checkboxChecked, videoName, videoTranscript } = request.params;

  // Retrieve the user based on the session token
  const user = await getUserFromSessionToken(request);

  if (!user) {
      throw new Error('User not found. Please log in.');
  }

  const universityPointer = user.get('university');
  if (!universityPointer) {
      throw new Error('University not found.');
  }

  try {
    // Check if objectId exists
    const existingQuery = new Parse.Query('KnowledgeDatabase');
    const existingKnowledgeEntry = await existingQuery.get(objectId, { useMasterKey: true });

    // Update the existing knowledge entry
    existingKnowledgeEntry.set('priority', priority);
    existingKnowledgeEntry.set('expires', expires);
    existingKnowledgeEntry.set('tags', tags);

    existingKnowledgeEntry.unset('url');
    existingKnowledgeEntry.unset('text');
    existingKnowledgeEntry.unset('image');
    existingKnowledgeEntry.unset('video');
    existingKnowledgeEntry.unset('videoName');
    existingKnowledgeEntry.unset('videoTranscript');
    existingKnowledgeEntry.unset('checkboxChecked');

    switch (type) {
      case 'url':
          existingKnowledgeEntry.set('type', 'url');
          existingKnowledgeEntry.set('url', content);
          existingKnowledgeEntry.set('checkboxChecked', checkboxChecked);
          break;

      case 'text':
          existingKnowledgeEntry.set('type', 'text');
          existingKnowledgeEntry.set('text', content);
          break;

      case 'image':
          existingKnowledgeEntry.set('type', 'image');
          existingKnowledgeEntry.set('image', content);
          break;

      case 'video':
          existingKnowledgeEntry.set('type', 'video');
          existingKnowledgeEntry.set('video', content);
          existingKnowledgeEntry.set('videoName', videoName);
          existingKnowledgeEntry.set('videoTranscript', videoTranscript);
          break;

      default:
          throw new Parse.Error(141, 'Invalid knowledge entry type.');
    }

    // Save the updated knowledge entry
    const result = await existingKnowledgeEntry.save(null, { useMasterKey: true });

    return result.toJSON();
  } catch (error) {
      console.error('Error updating knowledge entry:', error);
      throw new Parse.Error(error.code || 141, error.message);
  }
});

// Remove knowledge entry
Parse.Cloud.define('removeKnowledgeEntry', async (request) => {
  const { objectId } = request.params;

  if (!objectId) {
    throw new Error('objectId is required for removing knowledge entry.');
  }

  try {
    // Check if objectId exists
    const existingQuery = new Parse.Query('KnowledgeDatabase');
    const existingKnowledgeEntry = await existingQuery.get(objectId, { useMasterKey: true });

    await existingKnowledgeEntry.destroy({ useMasterKey: true });

    return { success: true, message: 'Knowledge entry removed successfully.' };
  } catch (error) {
    console.error('Error in removeKnowledgeEntry:', error);
    return {
      error: 'Failed to remove knowledge entry. Please check the provided data and try again.',
    };
  }
});
