import React, { useState, useEffect } from "react";
import moment from 'moment';
import {
  IonCard,
  IonCardContent,
  IonIcon,IonBadge,
  IonButton,
  IonText,
  IonChip,
  IonProgressBar,
  IonActionSheet,
  IonContent,useIonAlert,
} from "@ionic/react";
import { logoApple, arrowUp, arrowDown, statsChartOutline, logoGoogle, trendingDown, trendingUp } from "ionicons/icons";
import "./StockCard.css"; // We'll create this CSS file next
import { useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebaseConfig"; // Adjust the import path as needed
import { db } from "../../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithGoogle } from '../login/signInWithGoogle'; // Adjust the import path as needed

import LoginPage from "../login"; 

const StockCard = ({ StockData }) => {
  
  const [user] = useAuthState(auth);
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionType, setActionType] = useState("");
  const currentPrice=StockData?.stockSnapshot?.minuteBar.c || 0;
  const OpenPrice=StockData?.stockSnapshot?.minuteBar.o || 0;
  const DailyBarValue=(((currentPrice - OpenPrice)/currentPrice) * 100).toFixed(2);
  const isPositive = DailyBarValue >= 0;
  const NoOfTrades=StockData?.activeTrade?.length || 0;
  const TodayGain = (StockData?.stockHistory?.reduce((acc, trade) => acc + Number(trade.gain), 0) / NoOfTrades).toFixed(2);
  
  const PreCurrentPrice=StockData?.stockSnapshot?.prevDailyBar.c || 0;
  const PrevOpenPrice=StockData?.stockSnapshot?.prevDailyBar.o || 0;
  const PrevDailyBarValue=(((PreCurrentPrice - PrevOpenPrice)/PreCurrentPrice) * 100).toFixed(2);
  const PrevisPositive = PrevDailyBarValue >= 0;
  const stockDisplayValue = StockData.stockDisplay[0];
  const handleAction = (type) => {
    if (user) {
      // User is logged in, proceed with the action
      const fetchUserData = async () => {
        const docRef = doc(db, "customUser", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          if(docSnap.data().approvalStatus === 0){
            presentAlert({
              header: "Action Confirmation",
              message:
                "You are already logged in. we are verifying your documents before wait for update.",
              buttons: [
                "Cancel",
                // { text: 'Verify', handler: () => history.push('/profile') },
              ],
            });
          }else{
            history.push('/userHomePage');
            // presentAlert({
            //   header: "Action Confirmation",
            //   message:
            //     "You are already logged in. we are verifying your documents before wait for update.",
            //   buttons: [
            //     "Cancel",
            //     // { text: 'Verify', handler: () => history.push('/profile') },
            //   ],
            // });
          };
          
          return;
        } else {
          presentAlert({
            header: "Action Confirmation",
            message:
              "You are already logged in. Please verify your documents before proceeding.",
            buttons: [
              "Cancel",
              { text: "Verify", handler: () => history.push("/verify-profile") },
            ],
          });
        }
      };

      fetchUserData();
      // });
      console.log(
        `Performing ${type} action for ${StockData.activeTrade.symbol}`
      );
      // Add your buy/sell logic here
    } else {
      // User is not logged in, show action sheet
      setActionType(type);
      setShowActionSheet(true);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("Signing in with Google");
    await signInWithGoogle().then((res) => {
      console.log("User signed in with Google", res);
      if(res === 1){
        history.push('/userHomePage');
      }else{
        history.push('/verify-profile');
      }
      setShowActionSheet(false);
    });
  };
  const handleNavigate = (symbol) => {
    const dataToPass = { key: symbol };
    history.push({
      pathname: '/TradeHistory',
      state: dataToPass,
    });
  };
// console.log('StockData', stockDisplayValue, moment(stockDisplayValue.detected_at).format('MMM DD HH:mm'));
  return (
    <IonCard className="stock-card">
      <IonCardContent>
        <div className="evaigo-overall">
          <IonText color="dark" className="stock-title">
              <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{stockDisplayValue.symbol}</h4><IonBadge  color={stockDisplayValue.tradeType==='PAPER'?'tertiary':(stockDisplayValue.tradeType==='LIVE'?'success':'warning')} className='livebutton'>{stockDisplayValue?.tradeType?.charAt(0)}</IonBadge>
              </IonText>
              {/* <IonButton className='Secondary-Default_button' size="small" onClick={handleNavigate(stockDisplayValue.symbol)}> */}
                <IonIcon icon={statsChartOutline} color="success" onClick={() => handleNavigate(stockDisplayValue.symbol)}/>
                {/* </IonButton> */}
          
        </div>
        <div className="stock-details">
          <IonText color="dark" style={{ fontSize: '14px', fontWeight: '700', color: '#002d62' }}>
            $ {StockData?.stockSnapshot?.minuteBar?.c || 0}
          </IonText>
          <IonChip color={isPositive ? "primary" : "danger"} className="stock-details" style={{ fontSize: '12px' }}>
            <IonIcon icon={isPositive ? trendingUp : trendingDown} />
            {isNaN(DailyBarValue)?0:DailyBarValue} %
          </IonChip>
        </div>
        <div className="stock-info">
          <IonProgressBar style={{ 'marginRight': '10px' }} value={stockDisplayValue.strength / 100} color="primary" ></IonProgressBar>
          <div className="stock-info-details">
          <IonText className="stock-details-note">Last <span className="stock-details-note-highlight">{stockDisplayValue.method}</span> Trade Signal detected at <span className="stock-details-note-highlight">{moment(stockDisplayValue?.detected_at)?.format('MMM DD HH:mm')}</span> </IonText> 

            <div color="dark" className="stock-details">
              <IonText className="stock-details-header"># of Trades:</IonText>
              <IonText className="stock-details-value">{NoOfTrades}</IonText>
            </div>
            {/* <div className="stock-details">
              <IonText className="stock-details-header">Gain:</IonText>
              <IonText className="stock-details-value">{TodayGain === 'NaN'?0:TodayGain } %</IonText>
            </div> */}
          </div>
        </div>
        <div className="card-footer">
          <div color="medium" className="last-day">
            <IonText style={{ fontSize: '8px' }}>Last Day</IonText>
            <IonText color={PrevisPositive ? "primary" : "danger"} className="last-day-value">
              <IonIcon icon={PrevisPositive ? trendingUp : trendingDown} />
              {` ${isNaN(PrevDailyBarValue)?0:PrevDailyBarValue} %`}
            </IonText>
          </div>
          <div className="stock-actions">
            <IonButton className='Secondary-Default_button' onClick={() => handleAction("Buy")} size="small" disabled={stockDisplayValue.method === 'sell'}>
              Buy
            </IonButton>
            <IonButton className='Secondary-Default_button' onClick={() => handleAction("Sell")} size="small" disabled={stockDisplayValue.method === 'buy'}>
              Sell
            </IonButton>
          </div>
        </div>
        
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} ${stockDisplayValue.symbol}`}
          buttons={[
            {
              text: 'Sign in with Google',
              icon: logoGoogle,
              handler: handleGoogleSignIn
            },
            {
              text: 'Cancel',
              role: 'cancel',
            }
          ]}
        >
          <IonContent>
            <LoginPage />
          </IonContent>
        </IonActionSheet>
      </IonCardContent>
    </IonCard>
  );
};

export default StockCard;
