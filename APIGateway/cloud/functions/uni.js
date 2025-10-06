Parse.Cloud.define('createUniversity', async (request) => {
    const { name, location } = request.params;

    const University = Parse.Object.extend('University');
    const university = new University();
    university.set('name', name);
    university.set('location', location);

    try {
        await university.save();
        return { message: 'University created successfully', objectId: university.id };
    } catch (error) {
        throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, error.message);
    }
});

Parse.Cloud.define('listUniversities', async () => {
    const University = Parse.Object.extend('University');
    const query = new Parse.Query(University);

    try {
        const universities = await query.find();
        return universities;
    } catch (error) {
        throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, 'Failed to retrieve universities');
    }
});
