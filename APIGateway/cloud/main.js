require('./functions/auth.js')
require('./functions/authUtils.js')
require('./functions/bot.js')
require('./functions/chatbotBehaviour.js')
require('./functions/chatbotLook.js')
require('./functions/chatClient.js')
require('./functions/config.js')
require('./functions/generalScreen.js')
require('./functions/getAllChatClientData.js')
require('./functions/saveKnowledgeEntry.js')
require('./functions/uni.js')
require('./functions/user.js')
const { domain, domainFunctions, webdomain } = require("../config.js");
const fs = require('fs');


function base64Encode(file) {
  var body = fs.readFileSync(file);
  return body.toString('base64');
}
var nodemailer = require('nodemailer');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Cloud Function to handle new file upload
Parse.Cloud.define('uploadPythonFile', async (request) => {
  const { url, fileName, user, indexFile, type, transcript } = request.params;
  const NLpEnginUrl = 'http://localhost:5009/saveFile';
  // Create a FormData object
  const FormData = require('form-data');
  const form = new FormData();
  form.append('url', url);
  form.append('fileName', fileName);
  form.append('user', user);
  form.append('fileNameAppend', user + fileName);
  form.append('indexFile', indexFile);
  form.append('transcript', transcript);
  form.append('type', type)

  // Make the HTTP request
  axios.post(NLpEnginUrl, form, {
    headers: {
      ...form.getHeaders(),
    },
  })
    .then(response => {
      console.log('File uploaded successfully:', response.data);
    })
    .catch(error => {
      console.error('Error uploading file:', error.message);
    });

  return {
    success: true,
    message: "",
    error_code: 0
  };
});

// Cloud Function to start embedding process
Parse.Cloud.define('startEmbeddings', async (request) => {
  const { user } = request.params;

  const embeddingStatus = Parse.Object.extend("embeddingStatus");
  const query = new Parse.Query(embeddingStatus);
  query.equalTo("user", user);
  let obj = await query.first()
  if (obj) {
    obj.set("status", 1)
    obj.save()
    const NLpEnginUrl = 'http://localhost:5009/embeddings';
    // Create a FormData object
    const FormData = require('form-data');
    const form = new FormData();
    form.append('user', user);

    // Make the HTTP request
    axios.post(NLpEnginUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    })
      .then(async response => {
        console.log('Embedd uploaded successfully:', response.data);
      })
      .catch(error => {
        console.error('Error uploading embedd:', error.message);
      });

  }
  else {
    const newObj = new embeddingStatus()
    newObj.set("user", user)
    newObj.set("status", 1)
    newObj.save().then(() => {

      const NLpEnginUrl = 'http://localhost:5009/embeddings';
      // Create a FormData object
      const FormData = require('form-data');
      const form = new FormData();
      form.append('user', user);

      // Make the HTTP request
      axios.post(NLpEnginUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
      })
        .then(async response => {
          console.log('Embedd uploaded successfully:', response.data);
        })
        .catch(error => {
          console.error('Error uploading embedd:', error.message);
        });
    })
  }

  return {
    success: true,
    message: "",
    error_code: 0
  };
});

// Cloud Function to upload embedding status
Parse.Cloud.define('embeddingStatusUpdate', async (request) => {
  const { user } = request.params;
  const embeddingStatus = Parse.Object.extend("embeddingStatus");
  const query = new Parse.Query(embeddingStatus);
  query.equalTo("user", user);
  let obj = await query.first()
  if (obj) {
    obj.set("status", 0)
    obj.save()
  }

  const knowledgeBase = Parse.Object.extend("knowledgeBase");
  const query2 = new Parse.Query(knowledgeBase);
  query2.limit(1000000000)
  query2.equalTo("user", user)
  let obj2 = await query2.find()
  if (obj2.length > 0) {
    obj2.forEach(async element => {
      element.set("learnStatus", true)
      await element.save()
    });
  }


});


// return your openAI key here or fetch openAI key from user's database based on following commented logic
Parse.Cloud.define('getkey', async (request) => {
  const {
    userId
  } = request.params;
  console.log(userId)
  return "return your openAI key here or fetch openAI key from user's database based on following logic"
//   if (userId != "") {
//     const user = Parse.Object.extend("_User");
//     const query = new Parse.Query(user);
//     query.equalTo("objectId", userId)
//     let obj = await query.first()
//     if (obj) {
//       if (obj.attributes.localModel == false) {
//         if (obj.attributes.openAIKey != undefined && obj.attributes.openAIKey != "") {
//           return { "key": obj.attributes.openAIKey }
//         }
//         else {
//           return { "key": "local" }
//         }
//       }

//     else { return { "key": "local" } }
//   }
//   else {
//     return { "key": "local" }
//   }

// }
});


// Cloud Function for crawl job status handing
Parse.Cloud.define('crawlJobStatus', async (request) => {
  const SERVER_URL_parsefunctions = domainFunctions;
  // const SERVER_URL_parsefunctions_ = "http://localhost:1349/what2study/parse/functions";

  const { indexFileContent,
    allLinks, userID,
    jobId,
    indexConData } = request.params;
  if (indexConData != "") {
    var base64 = Buffer.from(indexConData).toString('base64')

    var fileObjName = "url"
    var className = "URL"
    var propertyName = "url"

    const parseFile = new Parse.File(fileObjName, { base64: base64 });
    parseFile.save().then(async (responseFile) => {
      const Gallery = Parse.Object.extend(className);
      const gallery = new Gallery();
      gallery.set(propertyName, responseFile);

      let r = await gallery.save().then((response) => {
        var urlfinal = response.attributes[propertyName]._url
        if (SERVER_URL_parsefunctions.includes(webdomain)) {
          urlfinal = urlfinal.replace("http:", "https:")

        }
        else if (SERVER_URL_parsefunctions.includes("localhost")) {
          urlfinal = urlfinal.replace("https:", "http:")
        }
        urlfinal = urlfinal.replace("https://localhost:1349", domain)
        const NLpEnginUrl = 'http://localhost:5009/saveFile';
        // Create a FormData object
        const FormData = require('form-data');
        const form = new FormData();
        form.append('url', urlfinal);
        form.append('fileName', response.attributes[propertyName]._name);
        form.append('user', userID);
        form.append('fileNameAppend', userID + response.attributes[propertyName]._name);
        form.append('indexFile', indexFileContent);
        form.append('transcript', "");
        form.append('type', "url")
        // Make the HTTP request
        axios.post(NLpEnginUrl, form, {
          headers: {
            ...form.getHeaders(),
          },
        })
          .then(async response => {
            const knowledgeBase = Parse.Object.extend("knowledgeBase");
            const query = new Parse.Query(knowledgeBase);
            query.equalTo("objectId", jobId)
            let obj = await query.first()
            if (obj) {
              obj.set("fileUrl", urlfinal)
              obj.set("jobStatus", true)
              obj.unset("nestedLinks")
              obj.addAll("nestedLinks", allLinks.split("&&&"))
              obj.save()
            }

          })
          .catch(error => {
            console.error('Error uploading file:', error.message);
          });

        return {
          success: true,
          message: "",
          error_code: 0
        };


      })

    })
    return {
      success: true,
      message: "",
      error_code: 0
    };
  }
  else {
    const knowledgeBase = Parse.Object.extend("knowledgeBase");
    const query = new Parse.Query(knowledgeBase);
    query.equalTo("objectId", jobId)
    let obj = await query.first()
    obj.destroy()
  }
  return {
    success: true,
    message: "",
    error_code: 0
  };

});

// Cloud Function to delete file from python service (what2study)
Parse.Cloud.define('deletePythonFile', async (request) => {
  const { url, fileName, user, nameWOS } = request.params;
  const NLpEnginUrl = 'http://localhost:5009/deleteFile';
  // Create a FormData object
  const FormData = require('form-data');
  const form = new FormData();
  form.append('url', url);
  form.append('fileName', fileName);
  form.append('user', user);
  form.append('fileNameAppend', user + fileName);
  form.append('nameWOS', nameWOS);

  // Make the HTTP request
  axios.post(NLpEnginUrl, form, {
    headers: {
      ...form.getHeaders(),
    },
  })
    .then(response => {
      console.log('File uploaded successfully:', response.data);
    })
    .catch(error => {
      console.error('Error uploading file:', error.message);
    });

  return {
    success: true,
    message: "",
    error_code: 0
  };
});



// Cloud Function for creating scriptTag for bot
Parse.Cloud.define('scriptTag', async (request) => {
  const { user, chatbotId } = request.params;
  const accessToken = jwt.sign({ chatbotId, userId: user.id, purpose: 'chatbotIntegration' }, 'what2studyMaster');

  //replace cpstech with your domain name
  const scriptTag = `<script id="initLoader" src=' `+domain+`/what2StudyLoader/?bot_id=${chatbotId}&token=${accessToken}&windowtype=min'></script>`;
  const Chatbot = Parse.Object.extend("chatbots");
  const query = new Parse.Query(Chatbot);
  query.equalTo("user", user);
  query.equalTo("objectId", chatbotId)
  let obj = await query.first()
  if (obj) {
    obj.set("scriptTag", scriptTag)
    obj.save()
  }
  return { "scriptTag": scriptTag }
});

// Cloud Function for saving user msg with sessions
Parse.Cloud.define('saveUserMessage', async (request) => {
  const { chatbotId, user, bot, sessionID, timestamp } = request.params;
  const feedback = Parse.Object.extend("userChat");
  const query = new Parse.Query(feedback)
  query.equalTo("sessionID", sessionID)
  const obj = await query.first()
  if (obj) {
    var arr = obj.attributes.messages
    arr.push({ "user": user, "bot": bot, "timestamp": timestamp })
    obj.unset("messages")
    obj.set("messages", arr)
    obj.save()
  }
  else {
    const newFeedback = new feedback();
    newFeedback.set("chatbotId", chatbotId);
    newFeedback.add("messages", { "user": user, "bot": bot, "timestamp": timestamp });
    newFeedback.set("sessionID", sessionID);
    newFeedback.save()
  }


//copy of chathistory for research
  const feedbackCopy = Parse.Object.extend("userChatCopy");
  const queryCopy = new Parse.Query(feedbackCopy)
  queryCopy.equalTo("sessionID", sessionID)
  const objCopy = await queryCopy.first()
  if (objCopy) {
    var arr = objCopy.attributes.messages
    arr.push({ "user": user, "bot": bot, "timestamp": timestamp })
    objCopy.unset("messages")
    objCopy.set("messages", arr)
    objCopy.save()
  }
  else {
    const newFeedbackCopy = new feedbackCopy();
    newFeedbackCopy.set("chatbotId", chatbotId);
    newFeedbackCopy.add("messages", { "user": user, "bot": bot, "timestamp": timestamp });
    newFeedbackCopy.set("sessionID", sessionID);
    newFeedbackCopy.save()
  }


});

// Cloud Function for user feedback saving
Parse.Cloud.define('saveFeedback', async (request) => {
  const { chatbotId, messages, sessionID, timestamp, type } = request.params;
  const feedback = Parse.Object.extend("feedback");
  const newFeedback = new feedback();
  newFeedback.set("chatbotId", chatbotId);
  newFeedback.set("messages", messages);
  newFeedback.set("sessionID", sessionID);
  newFeedback.set("type", type);
  newFeedback.set("timestamp", timestamp);
  newFeedback.save()

});


// Cloud Function for saving overall feedback
Parse.Cloud.define('saveOverallFeedback', async (request) => {
  const { chatbotId, sessionID, timestamp, value } = request.params;
  const feedback = Parse.Object.extend("ovFeedback");
  const newFeedback = new feedback();
  newFeedback.set("chatbotId", chatbotId);
  newFeedback.set("sessionID", sessionID);
  newFeedback.set("value", value);
  newFeedback.set("timestamp", timestamp);
  newFeedback.save()

});


// Delete User Chat to delete user session including all chat
Parse.Cloud.define('deleteUserChat', async (request) => {
  const { chatbotId, sessionID } = request.params;
  const chatHistory = Parse.Object.extend("userChat");
  const query = new Parse.Query(chatHistory)
  query.equalTo("sessionID", sessionID)
  const obj = await query.first()
  if (obj) {
   
    obj.destroy()
  }

});

// Cloud Code entry point to reset user password, update master key  in index.js for security
Parse.Cloud.define('resetPassUser', async (request) => {
  var error = 200
  //    var body = request.params.object

  //  var  object = JSON.parse(body)

  var object = request.params
  var query = new Parse.Query("_User")
  query.equalTo("username", object.userName)
  var obj = await query.first({ useMasterKey: true })
  if (obj) {
    error = 200

    obj.setPassword(object.newPassword)
    obj.save(null, { useMasterKey: true })
  }
  else {
    error = 401
  }
  return error
});

// Cloud code to delete user chat
Parse.Cloud.define('delChat', async (request) => {


  var query = new Parse.Query("userChat")
  query.equalTo("sessionID", request.params.session)
  var res = await query.first()
  if (res) {
    res.destroy()
  }


})

// Cloud Code entry point to get all chat for user
Parse.Cloud.define('getChat', async (request) => {
  var error = 200
  var date = request.params
  var query = new Parse.Query("userChat")
  query.limit(100000000)
  var obj = await query.find()
  var objArr = []
  var fn = async function jsonCreator(element) { // sample async action
    var OtherUsers = []
    var objArrLocal = {}
    var query1 = new Parse.Query("chatbots")
    query1.equalTo("objectId", element.attributes.chatbotId)

    var res = await query1.first()
    if (res) {
      var query2 = new Parse.Query("_User")

      query2.equalTo("objectId", res.attributes.user)
      const el = await query2.first()
      var userID = ""
      if (el) {
        userID = el.attributes.username
      }
      if (date.date.length > 0) {
        if (element.attributes.messages[0].timestamp.includes(date.date)) {
          objArrLocal = {
            "sessionID": element.attributes.sessionID,
            "chatbotID": element.attributes.chatbotId,
            "user": userID,
            "messages": element.attributes.messages
          }
        }
      }
      else {
        objArrLocal = {
          "sessionID": element.attributes.sessionID,
          "chatbotID": element.attributes.chatbotId,
          "user": userID,
          "messages": element.attributes.messages
        }
      }
    }
    return objArrLocal

  };
  var actions = obj.map(fn);
  var rs = await Promise.all(actions);
  return rs;
});

// Cloud Code entry point for reset password 
// Parse.Cloud.define('sendEmailT', async (request) => {
//   const bodyObj = request.params
//   var chatbotId = bodyObj.chatbotId
//   var chat = bodyObj.chat
//   var sessionID = bodyObj.sessionID
//   var timestamp = bodyObj.timestamp
//   var description = bodyObj.description
//   var userEmail = bodyObj.userEmail
//   var userPhone = bodyObj.userPhone
//   var uniEmail = bodyObj.uniEmail
//   var userMat = bodyObj.userMat
//   var chatbotName = bodyObj.chatbotName

//   var body = request.body
//   var chatHTML = ""
//   var chatJSON = JSON.parse(chat)
//   chatJSON.forEach(el => {
//     chatHTML = chatHTML + "<p> " + JSON.stringify(el) + "</p>"
//   });

//   let res = { "status": 200, "msg": "Process complete", "obj": {} }
//   var html = "<div><p>Es gibt eine neue Anfrage über ["+chatbotName+"]</p><p> Folgende Anfrage wurde von einem Benutzer gesendet:</p></b> <br/> <ul><li>Chatbot ID: " + chatbotId + "</li>Benutzer-Chat-Verlauf: " + chatHTML + "<li>Benutzerabfrage: " + description + "</li> <li>Vom Benutzer bereitgestellte E-Mail: " + userEmail + "</li><li>Vom Benutzer angegebene Telefonnummer: " + userPhone + "</li><li>Matrikelnummer des Studierenden: " + userMat + " </li></ul> <br/>Mit freundlichen Grüßen,<br/>What2Study Team,<br/> University of Hagen<br/><br/> Web: https://cpstech.de/What2Study/home</div>"
//   if (uniEmail != "" && uniEmail != undefined){sendEventEmail("Kontaktanfrage ["+ chatbotName +"] #[" + timestamp + "]", uniEmail, html)}
//   return res
// });

// function sendEventEmail(title, to, html) {
//   var mailOptions = {
//     from: 'cps.server@yahoo.com',
//     to: to,
//     subject: title,
//     html: html
//   };
// add your own user and pass for your email provider
//   var transporter = nodemailer.createTransport({
//     // host: 'smtp.mail.yahoo.com',
//     port: 465,
//     service: 'yahoo',
//     secure: false,
//     debug: false,
//     logger: true,
//     auth: {
//       user: 'cps.server@yahoo.com',
//       pass: ''
//     }
//   });

//   transporter.sendMail(mailOptions)

// }

// Cloud Code entry point
Parse.Cloud.define('eStatus', async (request) => {
  var error = 200

  var object = request.params
  var query = new Parse.Query("embeddingStatus")
  query.equalTo("user", object.user)
  var obj = await query.first({ useMasterKey: true })
  if (obj) {
    error = 200

    obj.set("status", 0)
    obj.save(null, { useMasterKey: true })
  }
  else {
    error = 401
  }
  return error
});