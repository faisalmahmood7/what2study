const { getUserFromSessionToken } = require('./authUtils');

Parse.Cloud.define('createGeneralScreen', async (request) => {   
  const {
    organizationName,
    websiteUrl,
    email,
    telephoneNumber,
    organizationImage,
    consultationHoursMon,
    consultationHoursTue,
    consultationHoursWed,
    consultationHoursThu,
    consultationHoursFri,
    consultationHoursSat,
    consultationHoursSun,
    contactViaTelephone,
    contactViaEmail
  } = request.params;

  // Add 'https://' to the websiteUrl if it doesn't have a protocol specified
  const normalizedWebsiteUrl = websiteUrl.startsWith('http://') || websiteUrl.startsWith('https://')
      ? websiteUrl
      : `https://${websiteUrl}`;

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
  
  // Check if an organization already exists for the given university and user
  const Organization = Parse.Object.extend('Organization');
  const query = new Parse.Query(Organization);
  query.equalTo('userId', user.id);
  query.equalTo('universityId', universityObjectId.id);
  query.equalTo('organizationName', organizationName); 
  
  const existingOrganization = await query.first({ useMasterKey: true });

  if (existingOrganization) {
      // Organization already exists, update its fields
      existingOrganization.set('websiteUrl', normalizedWebsiteUrl);
      existingOrganization.set('email', email);
      existingOrganization.set('telephoneNumber', telephoneNumber);
    
      // Set the organizationImage field directly with the provided URL
      existingOrganization.set('organizationImage', organizationImage);
    
      existingOrganization.set('consultationHoursMon', consultationHoursMon);
      existingOrganization.set('consultationHoursTue', consultationHoursTue);
      existingOrganization.set('consultationHoursWed', consultationHoursWed);
      existingOrganization.set('consultationHoursThu', consultationHoursThu);
      existingOrganization.set('consultationHoursFri', consultationHoursFri);
      existingOrganization.set('consultationHoursSat', consultationHoursSat);
      existingOrganization.set('consultationHoursSun', consultationHoursSun);
    
      existingOrganization.set('contactViaTelephone', contactViaTelephone);
      existingOrganization.set('contactViaEmail', contactViaEmail);
    
      try {
          const result = await existingOrganization.save(null, { useMasterKey: true });
          return result;
      } catch (error) {
          throw new Error('Error updating organization: ' + error.message);
      }
  } else {
      // Organization does not exist, create a new one
      const newOrganization = new Organization();
      newOrganization.set('organizationName', organizationName);
      newOrganization.set('websiteUrl', normalizedWebsiteUrl);
      newOrganization.set('email', email);
      newOrganization.set('telephoneNumber', telephoneNumber);
    
      // Set the organizationImage field directly with the provided URL
      newOrganization.set('organizationImage', organizationImage);
    
      newOrganization.set('consultationHoursMon', consultationHoursMon);
      newOrganization.set('consultationHoursTue', consultationHoursTue);
      newOrganization.set('consultationHoursWed', consultationHoursWed);
      newOrganization.set('consultationHoursThu', consultationHoursThu);
      newOrganization.set('consultationHoursFri', consultationHoursFri);
      newOrganization.set('consultationHoursSat', consultationHoursSat);
      newOrganization.set('consultationHoursSun', consultationHoursSun);
      
      newOrganization.set('contactViaTelephone', contactViaTelephone);
      newOrganization.set('contactViaEmail', contactViaEmail);
    
      // Associate the organization with the logged-in user
      newOrganization.set('userId', user.id);
      newOrganization.set('universityId', universityObjectId.id);
      
      try {
          const result = await newOrganization.save(null, { useMasterKey: true });
          return result;
      } catch (error) {
          throw new Error('Error creating organization: ' + error.message);
      }
  }
});
// Get organizations Cloud Function
Parse.Cloud.define('getGeneralScreen', async (request) => {
  try {
    // Retrieve the user based on the session token
    const user = await getUserFromSessionToken(request);

    if (!user) {
      throw new Error('User not found. Please log in.');
    }

    const universityPointer = user.get('university');
    if (!universityPointer) {
      throw new Error('University not found.');
    }

    const universityObjectId = universityPointer.id;

    // Query organizations associated with the user and university
    const Organization = Parse.Object.extend('Organization');
    const query = new Parse.Query(Organization);
    query.equalTo('userId', user.id);
    query.equalTo('universityId', universityObjectId);

    const organizations = await query.find({ useMasterKey: true });

    const transformedOrganizations = organizations.map((organization) => ({
      objectId: organization.id,
      organizationName: organization.get('organizationName'),
      websiteUrl: organization.get('websiteUrl'),
      email: organization.get('email'),
      telephoneNumber: organization.get('telephoneNumber'),
      organizationImage: organization.get('organizationImage'),
      consultationHoursMon: organization.get('consultationHoursMon'),
      consultationHoursTue: organization.get('consultationHoursTue'),
      consultationHoursWed: organization.get('consultationHoursWed'),
      consultationHoursThu: organization.get('consultationHoursThu'),
      consultationHoursFri: organization.get('consultationHoursFri'),
      consultationHoursSat: organization.get('consultationHoursSat'),
      consultationHoursSun: organization.get('consultationHoursSun'),
      contactViaTelephone: organization.get('contactViaTelephone'),
      contactViaEmail: organization.get('contactViaEmail'),
    }));

    return transformedOrganizations;
  } catch (error) {
    console.error('Error in getOrganizations:', error);
    return {
      error: 'Failed to fetch organizations. Please try again later.',
    };
  }
});

Parse.Cloud.define('updateGeneralScreen', async (request) => {
  try {
     // Retrieve the user based on the session token
     const user = await getUserFromSessionToken(request);

     if (!user) {
       throw new Error('User not found. Please log in.');
     }
 
     const universityPointer = user.get('university');
     if (!universityPointer) {
       throw new Error('University not found.');
     }
 
      const { objectId, ...updatedFields } = request.params;

      // Query the organization to update
      const Organization = Parse.Object.extend('Organization');
      const query = new Parse.Query(Organization);
      query.equalTo('userId', user.id);
      query.equalTo('objectId', objectId);

      const organization = await query.first({ useMasterKey: true });

      if (!organization) {
          throw new Error('Organization not found.');
      }

      // Update organization fields, handling separate fields for each day of the week
      Object.keys(updatedFields).forEach((field) => {
          // If the field is part of consultationHours, update the specific day field
          if (field.startsWith('consultationHours')) {
            organization.set(field, updatedFields[field]);
          } else {
            // Otherwise, update the field directly
            organization.set(field, updatedFields[field]);
          }
      });

      // Save the updated organization
      const result = await organization.save(null, { useMasterKey: true });

      return result;
  } catch (error) {
      console.error('Error in updateOrganization:', error);
      return {
          error: 'Failed to update organization. Please try again later.',
      };
  }
});

Parse.Cloud.define('removeGeneralScreen', async (request) => {
  try {
      // Retrieve the user based on the session token
      const user = await getUserFromSessionToken(request);

      if (!user) {
          throw new Error('User not found. Please log in.');
      }

      const { objectId } = request.params;

      // Query the organization to remove
      const Organization = Parse.Object.extend('Organization');
      const query = new Parse.Query(Organization);
      query.equalTo('userId', user.id);
      query.equalTo('objectId', objectId);

      const organization = await query.first({ useMasterKey: true });

      if (!organization) {
          throw new Error('Organization not found.');
      }

      // Remove the organization
      await organization.destroy({ useMasterKey: true });

      return { success: true, message: 'Organization removed successfully.'  };
  } catch (error) {
      console.error('Error in removeOrganization:', error);
      return {
          error: 'Failed to remove organization. Please try again later.',
      };
  }
});
