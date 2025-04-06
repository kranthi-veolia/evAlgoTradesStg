import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonCard, IonCardContent, IonText, IonBadge, IonButton  } from '@ionic/react';
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { retrieveData } from "../../utils/preferences";
// import moment from 'moment';
import { useLocation } from 'react-router-dom';

const convertTimestampToDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds? timestamp.toDate() : timestamp;
    return new Date(date);
  };

const TradeHistory = ({ symbol }) => {
    const location = useLocation();
    const passedData = location.state;
    const [stockHistory, setStockHistory] = useState([]);
    const [totalTrades, setTotalTrades] = useState(0);
    const [totalgain, setTotalGain] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Instead of querying Firestore, get data from local storage
                const cachedStockHistory = await retrieveData('stockHistory_all');
                
                // if (!cachedStockHistory) {
                    console.log('No cached stock history found, falling back to Firestore');
                    // Fallback to Firestore if cache is empty
                    const stockHistoryQuery = query(
                        collection(db, "stockHistory"),
                        where("symbol", "==", passedData.key)
                    );
                    const stockHistorySnapshot = await getDocs(stockHistoryQuery);
                    const stockHistory = stockHistorySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        endDate: convertTimestampToDate(doc.data().end),
                        startDate: convertTimestampToDate(doc.data().start),
                        ...doc.data(),
                    }));
                    setStockHistory(stockHistory.sort((a, b) => new Date(b.endDate) - new Date(a.endDate)));
                    console.log('stockHistory', stockHistory);
                    setTotalTrades(stockHistory.length);
                    const todaysGain = (stockHistory.reduce((acc, trade) => acc + Number(trade.gain), 0)/stockHistory.length)*100;
                    setTotalGain(todaysGain);
                // } else {
                //     console.log('Using cached stock history data');
                //     // Filter cached data by symbol
                //     const filteredHistory = cachedStockHistory.filter(
                //         item => item.symbol === passedData.key
                //     );
                //     console.log('Filtered history: ', filteredHistory);
                //     console.log('cash', cachedStockHistory);
                //     // Process dates if needed
                //     const processedHistory = filteredHistory.map(item => ({
                //         ...item,
                //     }));
                    
                //     // Sort by end date
                //     const sortedHistory = processedHistory.sort(
                //         (a, b) => new Date(b.endDate) - new Date(a.endDate)
                //     );
                    
                //     setStockHistory(sortedHistory);
                //     setTotalTrades(sortedHistory.length);
                    
                //     // Calculate total gain
                //     const todaysGain = sortedHistory.length > 0 ?
                //         (sortedHistory.reduce((acc, trade) => acc + Number(trade.gain || 0), 0) / sortedHistory.length) * 100 : 0;
                //     setTotalGain(todaysGain);
                // }
            } catch (error) {
                console.error("Error fetching stock history: ", error.message);
                // Guide to create the required Firestore index
                console.error("The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/evalgotradingproj/firestore/indexes");
            }
        };
        
        if (passedData?.key) {
            fetchData();
        }
    }, [passedData]);

    function calculateDateDifference(startDate, endDate) {
        if (!startDate || !endDate) return 'N/A';
        
        const start = new Date(startDate);
        const end = new Date(endDate);
      
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return 'Invalid date(s)';
        }
      
        const differenceInMs = end.getTime() - start.getTime();
        const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
        const hours = Math.floor(differenceInMinutes / 60);
        const minutes = differenceInMinutes % 60;
      
        const formattedDifference = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        
        // Format end date
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = end.getDate();
        const month = months[end.getMonth()];
        const hours12 = end.getHours() % 12 || 12;
        const ampm = end.getHours() >= 12 ? 'PM' : 'AM';
        const minutesStr = end.getMinutes().toString().padStart(2, '0');
        
        return `${month} ${day} ${hours12}:${minutesStr}${ampm} (${formattedDifference})`;
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>{passedData?.key} Trade History</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonCardContent className="Today-Stock-info">
                    <div color="dark" className="Today-Stock-details">
                        <IonText className="Today-Stock-details-header"># of Trades</IonText>
                        <IonText className="Today-Stock-details-value">{totalTrades}</IonText>
                    </div>
                    <div className="Today-Stock-details">
                        <IonText className="Today-Stock-details-header">Gain</IonText>
                        <IonText className="Today-Stock-details-value">{totalgain.toFixed(2)} %</IonText>
                    </div>
                </IonCardContent>
                {stockHistory.map((trade, i) => {
                    return (
                        <IonCard className="stock-card" key={i}>
                            <IonCardContent>
                                <div className="evaigo-overall">
                                    <IonText color="dark" style={{ fontSize: '10px', fontWeight: '700', color: '#002d62' }}>
                                        {calculateDateDifference(trade.startDate, trade.endDate) || 0}  <IonBadge color={trade.tradeType === 'PAPER' ? 'tertiary' : (trade.tradeType === 'LIVE' ? 'success' : 'warning')} className='livebutton'>{trade?.tradeType?.charAt(0)}</IonBadge> 
                                    </IonText>
                                    <IonText color="dark" style={{ fontSize: '10px', fontWeight: '700', color: '#002d62' }}>
                                    </IonText>
                                    <IonText color="dark" style={{ fontSize: '14px', fontWeight: '700', color: '#002d62' }}>
                                        $ {trade.gain|| 0} ({trade.method === 'buy' ? 'B' : 'S'})
                                    </IonText>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    );
                })}
            </IonContent>
        </IonPage>
    );
};

export default TradeHistory;