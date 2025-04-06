import { Preferences } from '@capacitor/preferences';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc, collection, query, getDocs, where, Timestamp, orderBy } from "firebase/firestore";

// Enhanced helper functions for better performance
const handleError = (functionName, error) => {
  console.error(`Error in ${functionName}:`, error);
  return null;
};

// Optimized timestamp handling
const processTimestamps = (item, forStorage = true) => {
  if (!item) return item;
  const result = { ...item };
  
  // Define timestamp fields to process
  const timestampFields = ['start', 'end', 'detected_at', 'lastUpdated'];
  
  if (forStorage) {
    // Convert timestamps to ISO strings for storage
    timestampFields.forEach(field => {
      if (result[field] && typeof result[field] !== 'string') {
        const dateField = field === 'detected_at' ? 'detected_atDate' : 
                          field === 'lastUpdated' ? 'lastUpdatedDate' : 
                          `${field}Date`;
        
        result[dateField] = result[field].seconds ? 
          new Date(result[field].seconds * 1000).toISOString() : 
          new Date(result[field]).toISOString();
          
        if (field !== 'detected_at' && field !== 'lastUpdated') {
          delete result[field]; // Remove original field if it's not needed
        }
      }
    });
  } else {
    // Convert stored strings back to Date objects
    timestampFields.forEach(field => {
      const dateField = field === 'detected_at' ? 'detected_atDate' : 
                        field === 'lastUpdated' ? 'lastUpdatedDate' : 
                        `${field}Date`;
      
      if (result[dateField]) {
        result[field] = new Date(result[dateField]);
        delete result[dateField]; // Clean up date fields
      }
    });
    
    // Handle special case
    if (result.start && typeof result.start === 'string') {
      result.start = new Date(result.start);
    }
  }
  
  return result;
};

// Batch process multiple items
const batchProcessTimestamps = (data, forStorage = true) => {
  if (!data || !Array.isArray(data)) return data;
  return data.map(item => processTimestamps(item, forStorage));
};

// Enhanced cache validation
const isCollectionUpdated = (prevData, newData, collectionName) => {
  if (!prevData || !newData) return true;
  
  const prevItem = prevData.find(p => p.colName === collectionName);
  const newItem = newData.find(n => n.colName === collectionName);
  
  if (!prevItem || !newItem || !prevItem.lastUpdatedDate || !newItem.lastUpdatedDate) return true;
  
  return new Date(prevItem.lastUpdatedDate).getTime() !== new Date(newItem.lastUpdatedDate).getTime();
};

// Universal data storage function
export const storeData = async (key, data) => {
  try {
    await Preferences.set({
      key,
      value: JSON.stringify(data)
    });
    return true;
  } catch (error) {
    handleError(`storeData:${key}`, error);
    return false;
  }
};

// Universal data retrieval function
export const retrieveData = async (key) => {
  try {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return handleError(`retrieveData:${key}`, error);
  }
};

// Optimized update tracker for all collections
export const getAndStoreLastUpdatedAt = async () => {
  try {
    // Always fetch latest updates from Firestore to ensure accuracy
    console.log('Fetching lastUpdatedAt from Firestore');
    const lastUpdatedSnapshot = await getDocs(query(collection(db, "lastUpdatedAt")));
    
    if (lastUpdatedSnapshot.empty) return null;
    
    const lastUpdatedData = lastUpdatedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    const currentData = await retrieveData('lastUpdatedAt');
    
    // Process timestamps for new data
    const processedData = lastUpdatedData.map(item => {
      const processed = { ...item };
      if (processed.lastUpdated && typeof processed.lastUpdated !== 'string') {
        processed.lastUpdatedDate = processed.lastUpdated.seconds ? 
          new Date(processed.lastUpdated.seconds * 1000).toISOString() : 
          new Date(processed.lastUpdated).toISOString();
      }
      return processed;
    });
    
    // Store current data as previous for comparison next time
    if (currentData) await storeData('prevLastUpdatedAt', currentData);
    
    // Store new data as current
    await storeData('lastUpdatedAt', processedData);
    
    return processedData;
  } catch (error) {
    return handleError('getAndStoreLastUpdatedAt', error);
  }
};

export const getStoredPreviousLastUpdatedAt = async () => retrieveData('prevLastUpdatedAt');
export const getStoredLastUpdatedAt = async () => retrieveData('lastUpdatedAt');

// Optimized collection update detector
export const detectCollectionUpdates = (prevData, newData) => {
  if (!prevData || !newData) return {};
  
  const collections = [...new Set([
    ...prevData.map(item => item.colName),
    ...newData.map(item => item.colName)
  ])];
  
  return collections.reduce((updates, colName) => {
    updates[colName] = isCollectionUpdated(prevData, newData, colName);
    return updates;
  }, {});
};

// Optimized generic collection updater
export const updateCollectionIfNeeded = async (collectionName, fetchFreshDataFn, options = {}) => {
  try {
    const lastUpdatedAtData = await getStoredLastUpdatedAt();
    const previousUpdatedAtData = await getStoredPreviousLastUpdatedAt();
    
    // If this is the first run or updates are detected, fetch fresh data
    if (isCollectionUpdated(previousUpdatedAtData, lastUpdatedAtData, collectionName)) {
      console.log(`${collectionName} needs updating, fetching fresh data`);
      return await fetchFreshDataFn(options);
    }
    
    console.log(`${collectionName} is up to date`);
    return null; // No update needed
  } catch (error) {
    return handleError(`updateCollectionIfNeeded:${collectionName}`, error);
  }
};

// Get and store custom user data from Firestore
export const getAndStoreCustomUser = async () => {
  try {
    // Quick check for cached data
    const customUserPref = await retrieveData('customUser');
    if (customUserPref) return customUserPref;
    
    // Fetch user ID
    const userPref = await retrieveData('user_info');
    if (!userPref?.uid) return null;
    
    // Fetch from Firestore
    const userDoc = await getDoc(doc(db, 'customUser', userPref.uid));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    
    // Store approval status and user data
    if (userData.approvalStatus) {
      await storeData('approvalStatus', userData.approvalStatus.toString());
    }
    
    await storeData('customUser', userData);
    return userData;
  } catch (error) {
    return handleError('getAndStoreCustomUser', error);
  }
};

// Approval status helpers
export const getStoredApprovalStatus = async () => {
  const value = await retrieveData('approvalStatus');
  return value ? parseInt(value) : null;
};

export const setStoredApprovalStatus = async (status) => {
  return storeData('approvalStatus', status.toString());
};

// Enhanced stock history management with incremental updates
export const getAndStoreStockHistory = async (days = 5) => {
  try {
    const lastUpdatedAtData = await getStoredLastUpdatedAt();
    const previousUpdatedAtData = await getStoredPreviousLastUpdatedAt();
    
    
    // Get existing data 
    const existingHistory = await retrieveData('stockHistory_all');
    console.log('Existing stock history:', existingHistory);
    
    // If no updates and we have cached data, return it
    if (!isCollectionUpdated(previousUpdatedAtData, lastUpdatedAtData, 'stockHistory') && existingHistory?.length > 0) {
      return existingHistory.map(item => processTimestamps(item, false));
    }
    
    // Determine what to fetch
    let newestTimestamp = null;
    let stockQuery = null;
    
    if (existingHistory?.length > 0) {
      // Find newest timestamp in cached data to fetch only newer data
      const sorted = [...existingHistory].sort((a, b) => {
        return new Date(b.endDate || 0) - new Date(a.endDate || 0);
      });
      
      if (sorted[0]?.endDate) {
        newestTimestamp = new Date(sorted[0].endDate);
        console.log('Fetching stock history since:', newestTimestamp);
        
        // Query for only newer data
        stockQuery = query(
          collection(db, "stockHistory"),
          where("end", ">", Timestamp.fromDate(newestTimestamp)),
          orderBy("end", "desc")
        );
      }
    }
    
    // If no valid timestamp, fetch based on days
    if (!stockQuery) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      stockQuery = query(
        collection(db, "stockHistory"),
        where("end", ">=", Timestamp.fromDate(cutoffDate)),
        orderBy("end", "desc")
      );
    }
    
    // Execute query
    const stockHistorySnapshot = await getDocs(stockQuery);
    
    if (stockHistorySnapshot.empty && existingHistory) {
      return existingHistory.map(item => processTimestamps(item, false));
    }
    
    // Process new data
    const newData = stockHistorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process for storage
    const processedNewData = batchProcessTimestamps(newData, true);
    
    // Combine with existing data, removing duplicates
    const combinedData = existingHistory ? 
      [...processedNewData, ...existingHistory.filter(existing => 
        !processedNewData.some(newItem => newItem.id === existing.id)
      )] : 
      processedNewData;
    
    // Sort by end date
    const sortedData = combinedData.sort((a, b) => {
      const dateA = a.endDate ? new Date(a.endDate) : new Date(0);
      const dateB = b.endDate ? new Date(b.endDate) : new Date(0);
      return dateB - dateA;
    });
    
    // Store combined data
    await storeData('stockHistory_all', sortedData);
    
    // Return in application format
    return sortedData.map(item => processTimestamps(item, false));
  } catch (error) {
    const fallback = await retrieveData('stockHistory_all');
    return fallback ? 
      fallback.map(item => processTimestamps(item, false)) : 
      handleError('getAndStoreStockHistory', error) || [];
  }
};

// Enhanced user-specific stock history management with incremental updates
export const getAndStoreUserStockHistory = async (days = 7) => {
  try {
    // Get user info first
    const userInfo = await retrieveData('user_info');
    if (!userInfo?.uid) {
      console.log('No user ID found');
      return [];
    }

    // Check for updates
    const lastUpdatedAtData = await getStoredLastUpdatedAt();
    const previousUpdatedAtData = await getStoredPreviousLastUpdatedAt();
    
    // Get existing user-specific data
    const existingHistory = await retrieveData(`stockHistory_user_${userInfo.uid}`);
    // console.log('Existing user stock history:', existingHistory, lastUpdatedAtData);
    console.log('Existing user stock history:', existingHistory);
    // If no updates and we have cached data, return it
    if (!isCollectionUpdated(previousUpdatedAtData, lastUpdatedAtData, 'stockHistory') && existingHistory?.length > 0) {
      return existingHistory.map(item => processTimestamps(item, false));
    }
    // Determine what to fetch
    let newestTimestamp = null;
    let baseQuery = collection(db, "stockHistory");
    console.log('Collection needs updating, fetching fresh data', existingHistory?.length, 0>0);
    
    if (existingHistory?.length > 0) {
      // Find newest timestamp in cached data
      const sorted = [...existingHistory].sort((a, b) => {
        return new Date(b.endDate || 0) - new Date(a.endDate || 0);
      });
      console.log('Sorted existing history:', sorted);
      if (sorted[0]?.endDate) {
        newestTimestamp = new Date(sorted[0].endDate);
        console.log('Fetching user stock history since:', newestTimestamp);
        
        // Query for only newer data with user filter
        baseQuery = query(
          baseQuery,
          where("usersList", "array-contains", userInfo.uid),
          where("end", ">", Timestamp.fromDate(newestTimestamp)),
          orderBy("end", "desc")
        );
      }
    } else {
      // If no existing data, fetch based on days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      console.log('Fetching user stock history since:', cutoffDate, Timestamp.fromDate(cutoffDate));
      baseQuery = query(
        baseQuery,
        where("usersList", "array-contains", userInfo.uid),
        where("end", ">=", Timestamp.fromDate(cutoffDate)),
        orderBy("end", "desc")
      );
    }
    
    // Execute query
    const stockHistorySnapshot = await getDocs(baseQuery);
    console.log('Stock history snapshot:', stockHistorySnapshot.empty, existingHistory);
    
    if (stockHistorySnapshot.empty && existingHistory) {
      return existingHistory.map(item => processTimestamps(item, false));
    }
    
    // Process new data
    const newData = stockHistorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process for storage
    const processedNewData = batchProcessTimestamps(newData, true);
    
    // Combine with existing data, removing duplicates
    const combinedData = existingHistory ? 
      [...processedNewData, ...existingHistory.filter(existing => 
        !processedNewData.some(newItem => newItem.id === existing.id)
      )] : 
      processedNewData;
    
    // Sort by end date
    const sortedData = combinedData.sort((a, b) => {
      const dateA = a.endDate ? new Date(a.endDate) : new Date(0);
      const dateB = b.endDate ? new Date(b.endDate) : new Date(0);
      return dateB - dateA;
    });
    
    // Store combined data with user-specific key
    await storeData(`stockHistory_user_${userInfo.uid}`, sortedData);
    
    // Return in application format
    return sortedData.map(item => processTimestamps(item, false));
  } catch (error) {
    const userInfo = await retrieveData('user_info');
    const fallback = await retrieveData(`stockHistory_user_${userInfo?.uid}`);
    return fallback ? 
      fallback.map(item => processTimestamps(item, false)) : 
      handleError('getAndStoreUserStockHistory', error) || [];
  }
};


export const getStoredStockHistory = async () => {
  const data = await retrieveData('stockHistory_all');
  return data ? data.map(item => processTimestamps(item, false)) : null;
};

// Optimized active trades handling
export const getAndStoreActiveTrades = async () => {
  try {
    // Ensure stock history is up to date first (dependency)
    await getAndStoreStockHistory();
    
    // Check for updates
    const shouldUpdate = await updateCollectionIfNeeded('activeTrades', async () => true);
    if (!shouldUpdate) {
      const cachedData = await retrieveData('activeTrades');
      if (cachedData) return cachedData.map(item => processTimestamps(item, false));
    }
    
    // Fetch fresh data
    console.log('Fetching fresh active trades from Firestore');
    const activeTradesSnapshot = await getDocs(query(collection(db, "activeTrades")));
    
    if (activeTradesSnapshot.empty) return [];
    
    // Process data
    const activeTrades = activeTradesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Store processed data
    const processedTrades = batchProcessTimestamps(activeTrades, true);
    await storeData('activeTrades', processedTrades);
    
    return activeTrades;
  } catch (error) {
    // Return cached data as fallback
    const cachedData = await retrieveData('activeTrades');
    return cachedData ? 
      cachedData.map(item => processTimestamps(item, false)) : 
      handleError('getAndStoreActiveTrades', error) || [];
  }
};

// Get and store user-specific active trades
export const getAndStoreUserActiveTrades = async () => {
  try {
    // Get user info
    const userInfo = await retrieveData('user_info');
    if (!userInfo?.uid) {
      console.log('No user ID found');
      return [];
    }

    // Get all active trades first
    const allTrades = await getAndStoreActiveTrades();
    if (!allTrades || allTrades.length === 0) return [];

    // Filter trades for current user
    const userTrades = allTrades.filter(trade => 
      trade.usersList && Array.isArray(trade.usersList) && trade.usersList.includes(userInfo.uid)
    );
    
    // Store processed data
    const processedTrades = batchProcessTimestamps(userTrades, true);

    // Store user-specific trades
    await storeData('userActiveTrades', processedTrades);

    return processedTrades;
  } catch (error) {
    return handleError('getAndStoreUserActiveTrades', error) || [];
  }
};

export const getStoredActiveTrades = async () => {
  const data = await retrieveData('activeTrades');
  return data ? data.map(item => processTimestamps(item, false)) : null;
};

// Get user-specific active trades
export const getStoredUserActiveTrades = async () => {
  try {
    const userInfo = await retrieveData('user_info');
    if (!userInfo?.uid) return null;
    
    const activeTrades = await getStoredActiveTrades();
    if (!activeTrades) return null;
    
    // Filter trades for this user
    return activeTrades.filter(trade => 
      (trade.usersList || []).includes(userInfo.uid)
    );
  } catch (error) {
    return handleError('getStoredUserActiveTrades', error);
  }
};

// Optimized stock snapshots handling
export const getAndStoreStockSnapshots = async () => {
  try {
    // Check for updates
    const shouldUpdate = await updateCollectionIfNeeded('stockSnapshot', async () => true);
    console.log('Should update stock snapshots:', shouldUpdate);
    if (!shouldUpdate) {
      return await retrieveData('stockSnapshots');
    }
    
    // Fetch from Firestore
    console.log('Fetching stock snapshots from Firestore');
    const stockSnapshotSnapshot = await getDocs(
      query(collection(db, "stockSnapshot"), where("symbol", "==", "ALL"))
    );
    
    if (stockSnapshotSnapshot.empty) return null;
    
    const stockSnapshot = stockSnapshotSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))[0];
    
    // Process and store
    const processedData = processTimestamps(stockSnapshot, true);
    await storeData('stockSnapshots', processedData);
    
    return processedData;
  } catch (error) {
    return handleError('getAndStoreStockSnapshots', error);
  }
};

// User-specific data management (stats and preferences)
export const getAndStoreUserStats = async () => {
  try {
    const userInfo = await retrieveData('user_info');
    if (!userInfo?.uid) return null;
    
    // Check for updates
    const shouldUpdate = await updateCollectionIfNeeded('userStats', async () => true);
    if (!shouldUpdate) {
      return await retrieveData('userStats');
    }
    
    // Fetch from Firestore
    console.log(`Fetching user stats for user ${userInfo.uid}`);
    const userStatsSnapshot = await getDocs(
      query(collection(db, "userStats"), where("userID", "==", userInfo.uid))
    );
    
    if (userStatsSnapshot.empty) return null;
    
    // Process data
    const userStatsData = userStatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const processedData = batchProcessTimestamps(userStatsData, true);
    await storeData('userStats', processedData);
    
    return processedData;
  } catch (error) {
    return handleError('getAndStoreUserStats', error);
  }
};

// Consolidated utility functions
export const getAllUserCachedData = async () => {
  try {
    // Fetch all data in parallel
    const results = await Promise.all([
      getStoredUserStats(),
      getStoredActiveTrades(),
      retrieveData('stockSnapshots'),
      getStoredStockHistory()
    ]);
    
    return {
      userStats: results[0],
      activeTrades: results[1],
      stockSnapshots: results[2],
      stockHistory: results[3]
    };
  } catch (error) {
    return handleError('getAllUserCachedData', error);
  }
};

export const clearAllCachedData = async () => {
  try {
    await Preferences.clear();
    console.log('All cached data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing cached data:', error);
    return false;
  }
};
