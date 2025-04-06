import { auth, db } from '../../firebaseConfig';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { signInWithPopup, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, addDoc, collection } from "firebase/firestore";
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { saveUserInfo, saveAuthToken } from '../../utils/storage';
import { getAndStoreCustomUser, getStoredApprovalStatus} from '../../utils/preferences';

export async function signInWithGoogle() {
  const useErrorLogs = collection(db, 'AndroidErrorLogs');
        
  if (Capacitor.isNativePlatform()) {
    console.log('Capacitor is native');
    // await addDoc(useErrorLogs, {'error' : 'Capacitor is native'});
    try {
      // await addDoc(debugLogs, { 
      //   step: 'Starting auth',
      //   region: 'Determining location...',
      //   timestamp: new Date().toString(),
      //   deviceInfo: JSON.stringify({
      //     platform: Capacitor.getPlatform(),
      //     version: navigator.userAgent
      //   })
      // });
      // Initialize Google Auth
      // await GoogleAuth.initialize();
    //   // Try the native Google auth first
    const googleUser = await GoogleAuth.signIn();
    console.log('Google user',  googleUser);
    // // Create credential with the token
    // const credential = {
    //   providerId: 'google.com',
    //   idToken: googleUser.authentication.idToken,
    //   accessToken: googleUser.authentication.accessToken
    // };
    // console.log('Credential', credential);
      // This uses the @capacitor-firebase/authentication plugin
    //   const result = await FirebaseAuthentication.signInWithGoogle();
    //   // const result = await signInWithCredential(auth, credential);
    // console.log('Capacitor is native', result);
    //   // await addDoc(useErrorLogs, {'error' : JSON.stringify(result)});
    //   // await addDoc(useErrorLogs, {'Results' : result});
    //   console.log('Mobile sign-in successful', result);
    //   // Save user info to preferences
    //   if (result.user) {
    //     // Extract necessary user info
    //     const userToSave = {
    //       uid: result.user.uid,
    //       email: result.user.email,
    //       displayName: result.user.displayName,
    //       photoURL: result.user.photoURL
    //     };
    //     // Save user info
    //     await saveUserInfo(userToSave);
    //     await getAndStoreCustomUser();
    //   }

      return result.user;
    } catch (error) {
      // await addDoc(debugLogs, { 
      //   step: 'Auth error',
      //   error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      //   message: error.message,
      //   code: error.code,
      //   timestamp: new Date().toString()
      // });
      console.error('Mobile sign-in error', error);
      throw error;
    } finally {
      const userStatus = await getStoredApprovalStatus();
      console.log('Finally block executed, mobile sign-in');
      return userStatus;
    }
  } else {
    console.log('Capacitor is not native');
    // Web sign-in (unchanged)
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Web sign-in successful', result.user);
      // const userStatus='';
      // Save user info to preferences
      if (result.user) {
        // Extract necessary user info
        const userToSave = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        };
        // Save user info
        await saveUserInfo(userToSave);
        await getAndStoreCustomUser();
      }
    } catch (error) {
      console.error('Web sign-in error', error);
      
      // await addDoc(useErrorLogs, {'error' : JSON.stringify(error)});
      throw error;
    } finally {
      
      const userStatus = await getStoredApprovalStatus();
      console.log('Finally block executed, web sign-in');
      return userStatus;
    }
  }
}