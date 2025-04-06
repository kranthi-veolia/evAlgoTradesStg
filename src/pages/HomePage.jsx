import React, { useEffect, useState } from "react";
import {
  IonContent, IonText,
  IonPage,
  IonIcon,
  IonButton,
  IonButtons,
  IonTitle,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonHeader,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonItemSliding,
  IonLabel,
  IonList,IonToggle,IonFab, IonFabButton, IonFabList,
  IonSpinner,IonRefresherContent,IonRefresher,
  IonToolbar, IonSegment, IonSegmentButton, IonSegmentContent, IonSegmentView
} from "@ionic/react";
// Import preference functions
import { getAndStoreActiveTrades, getAndStoreStockSnapshots, getAndStoreStockHistory, getAllUserCachedData, retrieveData } from "../utils/preferences";
import { db } from "../firebaseConfig";
// import moment from 'moment';
import { pin, share, trash,
  chevronDownCircle,
  chevronForwardCircle,
  chevronUpCircle,
  colorPalette,refreshOutline,
  globe, } from "ionicons/icons";
import "./Home.css";
import Header from "../components/HeaderPage";
import StockCard from "../components/TradingCards";
import NewHome from "../components/Home";
import Loader from "./Loader";

const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.seconds ? timestamp.toDate() : timestamp;
  return new Date(date);
};

const Home = (props) => {
  const [activeCombinedData, setActiveCombinedData] = useState([]);
  const [historycombinedData, setHistoryCombinedData] = useState([]);
  const [stockType, setStockType] = useState(null);
  const [userRole, setUserRole] = useState('');
    const [isLive, setIsLive] = useState(window.location.origin.includes('Prod'));
  const [totalTrades, setTotalTrades] = useState(0);
  const [todaygain, setTodayGain] = useState(0);
  const [loading, setLoading] = useState(true);
  function handleRefresh(event) {
    setTimeout(() => {
      getAllUserCachedData();
      event.detail.complete();

    }, 2000);
  };
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
        const customUser = await retrieveData('customUser');
        setUserRole(customUser?.userRole || 'genral');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if cache is stale
        // const isActiveTradesStale = await isCacheStale('activeTrades', 5); // 5 minutes
        // const isStockSnapshotsStale = await isCacheStale('stockSnapshots', 5);


        // Fetch data (will use cache if available and not stale)
        const [activeTradesSnapshot, stockSnapshots] = await Promise.all([
          getAndStoreActiveTrades(),
          getAndStoreStockSnapshots()
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
        setTotalTrades(activeTrades.length);
        if(activeTrades.length !== 0){
        // Process the data
          // if (!activeTrades || !stockSnapshots) {
          //   console.error('Failed to fetch required data');
          //   setLoading(false);
          //   return;
          // }

          const processedActiveTrades = activeTrades.map(trade => ({
            ...trade,
          }));

          // Rest of processing logic
          const uniqueSymbols = [...new Set(processedActiveTrades.map((trade) => trade.symbol))];
          

          const combined = uniqueSymbols.map((symbol) => {
            const activeTrade = processedActiveTrades
              .filter((trade) => trade.symbol === symbol)
              .sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at));
            const stockSnapshot = stockSnapshots.snapshot[symbol];

            const stockDisplay = [];
            if (activeTrade.length > 0) {
              stockDisplay.push(activeTrade[0]);
            }

            return {
              activeTrade,
              stockSnapshot,
              stockDisplay: stockDisplay.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at)),
            };
          }).sort((a, b) => {
            if (!a.stockDisplay[0]?.detected_at) return 1;
            if (!b.stockDisplay[0]?.detected_at) return -1;
            return new Date(b.stockDisplay[0].detected_at) - new Date(a.stockDisplay[0].detected_at);
          });
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

        // Check if cache is stale
        // const isActiveTradesStale = await isCacheStale('activeTrades', 5); // 5 minutes
        // const isStockSnapshotsStale = await isCacheStale('stockSnapshots', 5);


        // Fetch data (will use cache if available and not stale)
        const [activeTradesSnapshot, stockSnapshots] = await Promise.all([
          getAndStoreStockHistory(),
          getAndStoreStockSnapshots()
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
        };
        console.log(activeTrades);
        if(activeTrades.length !== 0){
        // Process the data
          if (!activeTrades || !stockSnapshots) {
            console.error('Failed to fetch required data');
            setLoading(false);
            return;
          }

          const processedActiveTrades = activeTrades.map(trade => ({
            ...trade,
            detected_at: trade.end,
          }));

          // Rest of processing logic
          const uniqueSymbols = [...new Set(processedActiveTrades.map((trade) => trade.symbol))];
          setTotalTrades(processedActiveTrades.length);

          const combined = uniqueSymbols.map((symbol) => {
            const activeTrade = processedActiveTrades
              .filter((trade) => trade.symbol === symbol)
              .sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at));
            const stockSnapshot = stockSnapshots.snapshot[symbol];

            const stockDisplay = [];
            if (activeTrade.length > 0) {
              stockDisplay.push(activeTrade[0]);
            }

            return {
              activeTrade,
              stockSnapshot,
              stockDisplay: stockDisplay.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at)),
            };
          }).sort((a, b) => {
            if (!a.stockDisplay[0]?.detected_at) return 1;
            if (!b.stockDisplay[0]?.detected_at) return -1;
            return new Date(b.stockDisplay[0].detected_at) - new Date(a.stockDisplay[0].detected_at);
          });
          console.log(combined);
          setHistoryCombinedData(combined);
        }else{
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
    <IonPage >
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <Header {...props} />
        <IonCard className="balance-card">
          <IonCardContent className="Today-Stock-info">
            {(userRole === 'admin'|| userRole === 'support') && <IonToggle checked={isLive} onIonChange={handleToggleChange}>Live</IonToggle>}
            <div color="dark" className="Today-Stock-details">
              <IonText className="Today-Stock-details-header">{`${stockType===null? 'All': stockType}`} Trades</IonText>
              <IonText className="Today-Stock-details-value">{totalTrades}</IonText>
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
        <IonSegment value="first">
          <IonSegmentButton value="first" contentId="first">
            <IonLabel>Live Trades</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="second" contentId="second">
            <IonLabel>Trades</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <IonSegmentView style={{ height: "calc(100% - 56px - 82px - 48px - 20px)" }}>
          <IonSegmentContent id="first">
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
              {loading ? (
                <Loader />
              ) : activeCombinedData && activeCombinedData.length > 0 ? (
                activeCombinedData.map((doc, i) => (
                  <div key={i} style={{ maxWidth: '350px', width: '-webkit-fill-available', minWidth: 'min-content' }}>
                    <StockCard StockData={doc} />
                  </div>
                ))
              ) : (
                <p>No active trades found.</p>
              )}
            </div>
          </IonSegmentContent>
          <IonSegmentContent id="second"><div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {loading ? (
              <Loader />
            ) : historycombinedData && historycombinedData.length > 0 ? (
              historycombinedData.map((doc, i) => (
                <div key={i} style={{ maxWidth: '350px', width: '-webkit-fill-available', minWidth: 'min-content' }}>
                  <StockCard StockData={doc} />
                </div>
              ))
            ) : (
              <p>No active trades found.</p>
            )}
          </div></IonSegmentContent>
        </IonSegmentView>
      </IonContent>
    </IonPage>
  );
};

export default Home;
