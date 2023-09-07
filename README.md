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
