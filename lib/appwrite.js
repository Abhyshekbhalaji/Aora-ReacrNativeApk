
import { Account,Avatars,Client, Databases, Query } from 'react-native-appwrite';
import { ID } from 'react-native-appwrite';



export const appwriteConfig={
    endpoint:'https://cloud.appwrite.io/v1',
    platform:'com.jsm.aora',
    projectId:'67018a5400081840bda5',
    databaseId:'67018b57002272d8dca7',
    userCollectionId:'67018b7800242b64bd5d',
    videoCollectionId:'67018bb0000e56867376',
    storageId:'67022482003d405b68b7'

}



// Init your React Native SDK
const client = new Client();


client
    .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteConfig.projectId) // Your project ID
     // Your application ID or bundle ID.
;

const account = new Account(client);
const avatars=new Avatars(client);
const databases=new Databases(client)

// Register User
// Register User
export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    
    if (!newAccount) {
      throw new Error('Failed to create user');
    }

    const avatarUrl = avatars.getInitials(username);

    // Store the newly created user data in the database
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;

  } catch (error) {
    console.error('Error in createUser:', error);
    throw new Error(error.message || 'Something went wrong during registration');
  }
};


export async function signIn(email, password) {
  try {
    const currentSession = await account.getSession("current");
    if (currentSession) return currentSession;
    const newSession = await account.createEmailPasswordSession(
      email,
      password
    );
    return newSession;
  } catch (error) {
    throw new Error(error);
  }
}

  export async function deleteAllSessions() {
    try {
      await account.deleteSessions(); // Deletes all sessions
      console.log('All sessions deleted.');
    } catch (error) {
      console.error('Error deleting sessions:', error);
      throw new Error(error.message || 'Failed to delete sessions');
    }
  }
  export async function getActiveSessions() {
    try {
      const sessions = await account.getSession('current');
      return sessions;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error(error.message || 'Failed to fetch active sessions');
    }
  }
  


  export async function getCurrentUser() {
    try {
      // Fetch the current account
      const currentAccount = await account.get();
  
      // Check if currentAccount is null or undefined
      if (!currentAccount) {
        console.error("No account found. User is not logged in.");
       return null; // Return null if no user is logged in
      }
  
      // Fetch the current user document from the database
      const currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", currentAccount.$id)]
      );
  
      // Check if any user document was found
      if (!currentUser || currentUser.documents.length === 0) {
        console.error("No user document found for the current account.");
        return null; // Return null if no user document exists
      }
  
      // Return the first document found
      return currentUser.documents[0];
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null; // Return null in case of an error
    }
  }

  
  export const getAllPosts=async()=>{
    try{
      const posts =await databases.listDocuments(
       appwriteConfig.databaseId,
       appwriteConfig.videoCollectionId

      )
      return posts.documents;
    }
    catch(error){
      throw new Error(error);
    }

  }

  export const getLatestPosts=async()=>{
    try{
      const posts =await databases.listDocuments(
       appwriteConfig.databaseId,
       appwriteConfig.videoCollectionId,
       [
        Query.orderDesc('$createdAt'), // Order by creation date in descending order
        Query.limit(7)                 // Limit the results to 7 documents
      ]

      )
      return posts.documents;
    }
    catch(error){
      throw new Error(error);
    }

  }


  export const searchPosts=async(query)=>{
    try{
      const posts =await databases.listDocuments(
       appwriteConfig.databaseId,
       appwriteConfig.videoCollectionId,
       [
        Query.search('title',query)              // Limit the results to 7 documents
      ]

      )
      return posts.documents;
    }
    catch(error){
      throw new Error(error);
    }

  }