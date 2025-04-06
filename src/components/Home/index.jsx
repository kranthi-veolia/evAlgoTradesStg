import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonIcon,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonFooter, IonFab, IonFabButton, IonFabList,
  IonToolbar, IonText,IonRefresherContent,IonRefresher,IonToggle,
  IonButton,  IonSegment, IonSegmentButton, IonSegmentContent, IonSegmentView
} from '@ionic/react';
import { notificationsOutline, chevronForwardOutline, homeOutline, documentTextOutline, swapVerticalOutline,refreshOutline,chevronUpCircle, timeOutline, personOutline, calendarOutline } from 'ionicons/icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from "../../firebaseConfig";
import firebase from 'firebase/compat/app';
import UserStockCard from "../UserTradingCards";
import Header from "../HeaderPage";
import Loader from "../../pages/Loader";
import { getStoredUserActiveTrades, getAndStoreStockSnapshots, getAndStoreUserStats, getAndStoreUserActiveTrades, getAndStoreUserStockHistory, getAllUserCachedData, retrieveData  } from "../../utils/preferences";
import './Home.css';

const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.seconds ? timestamp.toDate() : timestamp;
  return new Date(date);
};

const Home = () => {
  const [activeCombinedData, setActiveCombinedData] = useState([]);
  const [historycombinedData, setHistoryCombinedData] = useState([]);
  const [isLive, setIsLive] = useState(window.location.origin.includes('Prod'));
    const [stockType, setStockType] = useState(null);
    const [userRole, setUserRole] = useState('');
  const [user] = useAuthState(auth);
  const [totalTrades, setTotalTrades] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const todaygain = 0;
  function handleRefresh(event) {
    setTimeout(() => {
      getAllUserCachedData();
      event.detail.complete();

    }, 2000);
  };
  useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const customUser = await retrieveData('customUser');
          setUserRole(customUser.userRole);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, []);
  // Fix toggle change handler
  const handleToggleChange = (e) => {
    const newValue = e.detail.checked;
    setIsLive(newValue);
    setStockType(null)
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activeTradesSnapshot, stockSnapshotSnapshot, userStatus] = await Promise.all([
          getAndStoreUserActiveTrades(),
          getAndStoreStockSnapshots(),
          getAndStoreUserStats(),
        ]);
        let activeTrades=[];
        if(isLive){
          activeTrades = activeTradesSnapshot.filter((trade) => trade.tradeType === 'live');
        }else if(stockType === 'Mock'){
          activeTrades = activeTradesSnapshot.filter((trade) => trade.tradeType === 'mock'); 
        } else if(stockType === 'Paper'){
          activeTrades = activeTradesSnapshot.filter((trade) => trade.tradeType === 'PAPER');
        } else if(stockType === 'Live'){
          activeTrades = activeTradesSnapshot.filter((trade) => trade.tradeType === 'live');
        }else{
          activeTrades = activeTradesSnapshot;
        }
        // console.log('activeTrades', activeTrades);
        setTotalTrades(activeTrades.length);
       
        if(activeTrades.length !== 0){
          const stockSnapshots = stockSnapshotSnapshot;
          const uniqueSymbols = [...new Set([
            ...activeTrades.map((history) => history.symbol)
          ])];
          // console.log(activeTrades);
          setTotalAmount(userStatus[0].actBalance.toFixed(2));

          const combined = uniqueSymbols.map((trade) => {
            const activeTrade = activeTrades
              .filter((activeTrade) => activeTrade.symbol === trade)
              .sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate));

            const stockSnapshot = stockSnapshots.snapshot[trade];
            const stockDisplay = [];
            if (activeTrade.length > 0) {
              stockDisplay.push(activeTrade[0]);
            }
            return {
              activeTrade,
              stockSnapshot,
              stockDisplay: stockDisplay.sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate)),
            };
          }).sort((a, b) => {
            if (!a.stockDisplay[0].detected_atDate) return 1; // If a has no stockHistory, place it after b
            if (!b.stockDisplay[0].detected_atDate) return -1; // If b has no stockHistory, place it after a
            return new Date(b.stockDisplay[0].detected_atDate) - new Date(a.stockDisplay[0].detected_atDate); // Order by the most recent stockHistory end date
          });
          // console.log(combined);
        setActiveCombinedData(combined);
        }else{
          
        setActiveCombinedData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLive, stockType]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activeTradesSnapshot, stockSnapshotSnapshot, userStatus] = await Promise.all([
          getAndStoreUserStockHistory(),
          getAndStoreStockSnapshots(),
          getAndStoreUserStats(),
        ]);
        let activeTrades=[];
        
        if(isLive){
          activeTrades = activeTradesSnapshot.filter((trade) => trade.tradeType === 'live');
        }else if(stockType === 'Mock'){
          activeTrades = activeTradesSnapshot.filter((trade) => trade.tradeType === 'mock'); 
        } else if(stockType === 'Paper'){
          activeTrades = activeTradesSnapshot.filter((trade) => trade.tradeType === 'PAPER');
        } else if(stockType === 'Live'){
          activeTrades = activeTradesSnapshot.filter((trade) => trade.tradeType === 'live');
        }else{
          activeTrades = activeTradesSnapshot;
        }
        // console.log('activeTrades', activeTrades);
        activeTrades = activeTrades.map(trade => ({
          ...trade,
          detected_at: convertTimestampToDate(trade.end),
        }));
        if(activeTrades.length !== 0){
          const stockSnapshots = stockSnapshotSnapshot;
          const uniqueSymbols = [...new Set([
            ...activeTrades.map((history) => history.symbol)
          ])];
          setTotalAmount(userStatus[0].actBalance.toFixed(2));
          // setTotalTrades(activeTrades.length);

          const combined = uniqueSymbols.map((trade) => {
            const activeTrade = activeTrades
              .filter((activeTrade) => activeTrade.symbol === trade)
              .sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate));

            const stockSnapshot = stockSnapshots.snapshot[trade];
            const stockDisplay = [];
            if (activeTrade.length > 0) {
              stockDisplay.push(activeTrade[0]);
            }
            return {
              activeTrade,
              stockSnapshot,
              stockDisplay: stockDisplay.sort((a, b) => new Date(b.detected_atDate) - new Date(a.detected_atDate)),
            };
          }).sort((a, b) => {
            if (!a.stockDisplay[0].detected_atDate) return 1; // If a has no stockHistory, place it after b
            if (!b.stockDisplay[0].detected_atDate) return -1; // If b has no stockHistory, place it after a
            return new Date(b.stockDisplay[0].detected_atDate) - new Date(a.stockDisplay[0].detected_atDate); // Order by the most recent stockHistory end date
          });
          setHistoryCombinedData(combined);
        }
        else{
          setHistoryCombinedData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLive, stockType]);
  return (
    <IonPage>
      <Header />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonCard className="balance-card">
          <IonCardContent className="Today-Stock-info">
            {/* Fix toggle to use state value instead of hardcoded true */}
            {(userRole === 'admin'|| userRole === 'support') && <IonToggle checked={isLive} onIonChange={handleToggleChange}>Live</IonToggle>}
            <div className="stock-gains-header">
              <div className="greeting">Hi {user?.displayName || ''},</div>
              <div className="this-week">
                <IonIcon icon={calendarOutline} className="chevron-down" />
                <IonIcon icon={chevronForwardOutline} className="chevron-down" />
              </div>
            </div>
            <div color="dark" className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Total Amount</IonText>
              <IonText className="Today-Stock-details-value">${totalAmount || 100}</IonText>
            </div>
            <div color="dark" className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">Live Trades</IonText>
              <IonText className="Today-Stock-details-value">{totalTrades || 0}</IonText>
            </div>
          </IonCardContent>
        </IonCard>
        {(userRole === 'admin'|| userRole === 'support')&& !isLive &&<IonFab slot="fixed" vertical="bottom" horizontal="end" edge={false} size="small">
                    <IonFabButton>
                      <IonIcon icon={chevronUpCircle}></IonIcon>
                    </IonFabButton>
                    <IonFabList side="top">
                      <IonFabButton color='warning' onClick={() => setStockType('Mock')}>
                        M
                      </IonFabButton>
                      <IonFabButton color='tertiary' onClick={() => setStockType('Paper')}>
                        P
                      </IonFabButton>
                      <IonFabButton color='success' onClick={() => setStockType('Live')}>
                        L
                      </IonFabButton>
                      <IonFabButton color='primary' onClick={() => setStockType(null)}>
                        <IonIcon icon={refreshOutline}></IonIcon> 
                      </IonFabButton>
                    </IonFabList>
                  </IonFab>}
        <IonSegment value="User_Live_Trades">
          <IonSegmentButton value="User_Live_Trades" contentId="User_Live_Trades">
            <IonLabel>Live Trades</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="User_Trades" contentId="User_Trades">
            <IonLabel>Trades</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <IonSegmentView style={{ height: "calc(100% - 20px - 139px - 48px)" }}>
          <IonSegmentContent id="User_Live_Trades">
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
          {loading ? (
            <Loader />
          ) : activeCombinedData && activeCombinedData.length > 0 ? (
            activeCombinedData.map((doc, i) => (
              <div key={i} style={{ maxWidth: '350px', width: '-webkit-fill-available', minWidth: 'min-content' }}>
                {/* Access document data here */}
                <UserStockCard StockData={doc} />
              </div>
            ))
          ) : (
            <p>No active trades found.</p>
          )}
        </div>
          </IonSegmentContent>
          <IonSegmentContent id="User_Trades">
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {loading ? (
              <Loader />
            ) : historycombinedData && historycombinedData.length > 0 ? (
              historycombinedData.map((doc, i) => (
                <div key={i} style={{ maxWidth: '350px', width: '-webkit-fill-available', minWidth: 'min-content' }}>
                  <UserStockCard StockData={doc} />
                </div>
              ))
            ) : (
              <p>No active trades found.</p>
            )}
          </div>
          </IonSegmentContent>
        </IonSegmentView>
        
      </IonContent>
    </IonPage>
  );
};

export default Home;
