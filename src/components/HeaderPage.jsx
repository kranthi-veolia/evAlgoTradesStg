// Header.jsx
import React, { useState, useEffect } from 'react';
import {
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,IonAvatar,
  IonHeader
} from '@ionic/react';
import { personCircle, home } from 'ionicons/icons';
import { getData } from '../utils/storage';

const Header = () => {
  const [customUser, setCustomUser] = useState(null);
  const [userInformation, setUserInformation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData('approvalStatus');
      const userInfo = await getData('user_info');
      setUserInformation(userInfo);
      setCustomUser(Number(data));
    };
    fetchData();
  }, []);
  return (
    <IonHeader translucent>
      <IonToolbar>
        <IonButtons slot="secondary">
          <IonButton href='/profile'>
            {userInformation ? <IonAvatar style={{ width: '20px', height: '20px' }}>
                        <img src={userInformation.photoURL} alt="Profile" />
                      </IonAvatar>: <IonIcon slot="icon-only" icon={personCircle}></IonIcon>}
          </IonButton>
          {customUser === 1 && window.location.pathname !== '/userHomePage' && 
          <IonButton href='/userHomePage'>
            <IonIcon slot="icon-only" icon={home}></IonIcon>
          </IonButton>}
        </IonButtons>
        <IonButton fill='clear' routerLink="/home" >EvALGO Trades</IonButton>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
