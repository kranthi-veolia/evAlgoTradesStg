// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonAvatar,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonList,
} from '@ionic/react';
import {
  heartOutline,
  downloadOutline,
  languageOutline,
  locationOutline,
  contrastOutline,
  phonePortraitOutline,
  cardOutline,
  trashOutline,
  timeOutline,
  analyticsOutline,
  logOutOutline,
  settingsOutline, logoGoogle
} from 'ionicons/icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useHistory } from 'react-router-dom';
import { signInWithGoogle } from '../login/signInWithGoogle'; 
import Loader from '../../pages/Loader';
import { getStoredApprovalStatus, setStoredApprovalStatus } from '../../utils/preferences';
import { clearAuthData, checkAuthState } from '../../utils/storage';

const ProfilePage = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShowVerify, setIsShowVerify] = useState(true);
  const history = useHistory();
  useEffect(() => {
    const fetchUser = async () => {
      const [userInfo] = await Promise.all([
        checkAuthState()
      ]);
      setUser(userInfo);
      setLoading(false);
    };
    fetchUser();
  }, []);
    useEffect(() => {
      if (!user) return;
      const fetchCustomUser = async () => {
        try {
          // Check stored preferences first
          const storedStatus = await getStoredApprovalStatus();
          if (storedStatus !== null) {
            if(storedStatus === 1){
              setIsShowVerify(false);
            }else{
              setIsShowVerify(true);
            }
            return;
          };
        } catch (error) {
          console.error('Error fetching user status:', error);
        }
      };
      fetchCustomUser();
    }, [user]);
  if (loading) {
    return <Loader />;
  }
  const handleLogIn = async () => {
    try {
      await signInWithGoogle();
    }catch (error) {
      console.error('Error signing in:', error);
    } finally {
      history.push('/home');
    }
  };
  const handleLogout = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Sign out from Firebase Authentication on mobile
        await FirebaseAuthentication.signOut();
      } else {
        // Sign out from web Firebase
        await auth.signOut();
      }
      // Clear stored user data
      await clearAuthData();
      history.push('/home');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>My Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/edit-profile">
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="ion-text-center" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}>
          <IonAvatar style={{ width: '80px', height: '80px' }}>
            <img src={user ? user.photoURL : "https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y"} alt="Profile" />
          </IonAvatar>
          <div>
            <h2>{user?.displayName || 'Jhone Doe'}</h2>
            <p>{user?.email || 'jhonedoe@gmail.com'}</p>
          </div>
          {/* <IonButton routerLink="/edit-profile">Edit Profile</IonButton> */}
        </div>
        {user === null ? <IonList>
          <IonItem button onClick={handleLogIn}>
            <IonIcon icon={logoGoogle} slot="start" />
            <IonLabel>Sign with Google</IonLabel>
          </IonItem>
        </IonList> :
          <IonList>
            <IonItem button detail routerLink="/StockPicking">
              <IonIcon icon={analyticsOutline} slot="start" />
              <IonLabel>Stock Preferences</IonLabel>
            </IonItem>
            {isShowVerify && <IonItem button detail routerLink="/verify-profile">
              <IonIcon icon={timeOutline} slot="start" />
              <IonLabel>Verify Profiles</IonLabel>
            </IonItem>}
            <IonItem button detail onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="start" color="danger" />
              <IonLabel color="danger">Log Out</IonLabel>
            </IonItem>
          </IonList>}
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
