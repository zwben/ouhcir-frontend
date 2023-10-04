# Deployment 

1. Clone the repository to their local machine:

   ```bash
   git clone https://github.com/your-username/your-project.git
   ```

2. Change their working directory to the project folder:

   ```bash
   cd your-project
   ```

3. Install project dependencies:

   ```bash
   npm install
   ```

4. Make sure you have the `.env` file with all the API keys 

5. Build the React project:

   ```bash
   npm run build
   ```

6. Install the Firebase CLI (if not already installed):

   ```bash
   npm install -g firebase-tools
   ```

7. Log in to their Firebase account (they will be prompted to open a browser and sign in):

   ```bash
   firebase login
   ```

8. Deploy the project to Firebase:

   ```bash
   firebase deploy
   ```
In case something doesn't work as expect, here is an article that describes the steps. You may need to do `firebase init` and choose an existing project, but I don't think that would be neccecary. 
https://www.knowledgehut.com/blog/web-development/deploying-react-app-to-firebase#steps-to-deploy-react-app-by-using-firebase-hosting-%C2%A0


## Things to know about the codebase
### React and state management
One thing that is the most interesting about React is that it follows a “component” type of developing. You can think of everything as a component. For example, in our project the place where you enter a prompt MsgEntry is a component and it’s inside a parent component called ChatBox. The Chatbox also has other components called Promp.js which is a component for each prompt or output. Now, one of the other important things to know about the project is what they call “state management”. We use `useState` to define states in our code, or what is called `React hooks` which is an important topic to know. You can definitely learn more through google or youtube. 

Also, state management gets a little bit tricky when you have to share data between different components. For example, the text for each prompt is stored in prompt.js, but when we highlight it it should appear in Navbar.js. Navbar is way far away in the component tree from prompt and that's why you need to use a *state management library*. In this project we use `Context API` which comes with React itself. People also use `Redux`. All the contexts are stored in context folder. For example `auth-context.js` is the one you can use to get access to the user that is logged in to store the `userID` let's say in the database. 

### TailwindCSS
Tailwing is CSS framework, a great tool that works well with the **component** type thinking in React. An example of the tailwind code is here 
```react            
<div className='flex-shrink-0 inline-flex space-x-4 pr-1 h-fit'>
```

To get access to OpenAI's api we use the open-ai node.js library. You can find more info about using chat-completion from the open-ai documentation. 

Note: This is a high level overview, just talking briefly about the broader picture. You can definitely look for more specific info about each topic. But I'm available for any questions. 

### Firebase
1. The database is stored in `Firestore Database`. It is a No SQL database.
2. Authentication is where user sign ups and logins are stored
3. Hosting is of course for hosting the website
4. Storage you can use in the future to store mp3 files, for think aloud protocol or images, pdf. Anything that can not be stored in a database. 

What you need to know: 
- State management
- React hooks
- ContextAPI
- TailwindCSS
- Open AI node.js library
- Firebase services 

### Platform interface

![interface](public\interface.png)
