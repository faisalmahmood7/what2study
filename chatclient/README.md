### what2study - chat client
<img width="449" alt="Screenshot 2024-11-26 at 11 11 41" src="https://github.com/user-attachments/assets/68f3b2a6-448f-4d96-972b-cfa66e0ef09c">

#### To run the project:

1. Install dependencies:

```bash
npm i
```

2. Start the dev servers:

```bash
npm start
```

3. View in browser:

**Copy the path** of the file `./chat/demo.html` and paste in browser to view the chat client.

---

#### To view the chat client on any website:

1. **Copy the contents** of the file `./chat/what2StudyLoader.js` and paste in browser console of the website you wish to view on.

## To publish NPM Package:

1. Ensure that `npmPackageConfig` is enabled in `rollup.config.js`
1. Run `npm run build`
1. Change the version in `package.json` and run `npm publish`
