import React, { useState, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, person, settings,  ellipsisHorizontal, ellipsisVertical, personCircle, search  } from 'ionicons/icons';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebaseConfig';
// Add import for Preferences
import { Preferences } from '@capacitor/preferences';
import HomePage from './pages/HomePage.jsx';
import UserHomePage from './components/Home';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TradeHistory from './components/tradeHistory';
import Header from './components/HeaderPage.jsx';
import Layout from './components/Layout.jsx';
import StockPicking from './components/StocksSelection';
import UserTradingHistory from './components/UserTradingHistory';
import EditProfilePage from './components/Profile/EditProfilePage.jsx';
import VerifyProfilePage from './components/Profile/VerifyProfilePage.jsx';
import { db } from "./firebaseConfig";
import { collection, query, getDoc, orderBy, where, doc } from "firebase/firestore";
import { StatusBar } from '@capacitor/status-bar';
import Loader from './pages/Loader';
import { checkAuthState } from './utils/storage';
import { getStoredApprovalStatus, setStoredApprovalStatus, getAndStoreCustomUser, getAndStoreLastUpdatedAt } from './utils/preferences';
import PrivacyPolicy from './pages/privacy_policy';
import TermsAndConditions from './pages/terms&conditions';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();
getAndStoreLastUpdatedAt();
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customUser, setCustomUser] = useState(0);
  useEffect(() => {
    // Initialize the Google Auth plugin
    GoogleAuth.initialize();
  }, []);
  useEffect(() => {
    // Combine status bar setup with auth check
    const initialize = async () => {
      try {
        // await getAndStoreLastUpdatedAt();
        // Run status bar and auth checks in parallel
        const [userInfo] = await Promise.all([
          checkAuthState(),
        ]);
        setUser(userInfo);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchCustomUser = async () => {
      try {
        // Check stored preferences first
        const storedStatus = await getStoredApprovalStatus();
        // console.log('Stored status:', storedStatus);
        
        if (storedStatus !== null) {
          setCustomUser(storedStatus);
          return;
        }

        // Fallback to Firebase if no stored status
        const userData =  await getAndStoreCustomUser();
        if(userData){
          setCustomUser(userData.approvalStatus);
          await setStoredApprovalStatus(userData.approvalStatus);
        } 
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchCustomUser();
  }, [user]);
  if (loading) {
    return <Loader />;
  }

  return (
    <IonApp style={{marginTop: '20px'}}>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home" render={() => <HomePage  customUser={customUser}/>} />
          <Route exact path="/userHomePage" render={() => <UserHomePage />} />
          <Route exact path="/UserTradingHistory" render={() => <UserTradingHistory />} />
          <Route exact path="/profile" render={() => <ProfilePage />} />
          <Route exact path="/login" render={() => <LoginPage />} />
          <Route path="/edit-profile" render={()=> <EditProfilePage />} exact />
          <Route path="/verify-profile" render={()=> <VerifyProfilePage/>} exact />
          <Route path="/StockPicking" render={()=> <StockPicking/>} exact />
          <Route path="/TradeHistory" render={()=> <TradeHistory/>} exact />
          <Route path="/PrivacyPolicy" render={()=> <PrivacyPolicy/>} exact />
          <Route path="/TermsAndConditions" render={()=> <TermsAndConditions/>} exact />
          <Route exact path="/">
            {customUser === 0 && <Redirect to="/home" />}
            {customUser === 1 && <Redirect to="/userHomePage" />}
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
