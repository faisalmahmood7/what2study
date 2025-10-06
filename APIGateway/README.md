# what2study
what 2 study an onboarding experience


## Run
1- npm install

2- npm start


## Environment
server running on port 1349

Database uri: 'mongodb://localhost:27017/what2study'

Server public url: 'http://localhost:1339/what2study/parse'

Application ID for connection: 'what2study'

## Reactjs connection

1- npm install parse @parse/react --save

2- Add following lines to your index.js or App.js
```
import Parse from 'parse'
Parse.initialize("what2study")
Parse.serverURL = "http://localhost:1339/what2study/parse"
Parse.masterKey= "what2studyMaster"
```
