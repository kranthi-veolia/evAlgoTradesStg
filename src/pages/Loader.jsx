import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonSkeletonText,
  IonProgressBar,
  IonButton,
  IonIcon,
  IonText,
  IonBadge,
  IonRow,
  IonCol
} from '@ionic/react';
import { trendingDown } from 'ionicons/icons';
import './StockCardSkeleton.css';

const StockCardSkeleton = () => {
  return (
    <div className="stock-skeleton-container">
      {/* First Stock Card */}
      <IonCard className="stock-card-skeleton">
        <IonCardContent>
          {/* Header with Stock Symbol and Chart Icon */}
          <IonRow className="stock-header">
            <IonCol size="8" className="stock-symbol-container">
              <div className="symbol-badge-container">
                <IonText className="stock-symbol">
                  <IonSkeletonText animated style={{ width: '120px', height: '30px' }} />
                </IonText>
                {/* <IonBadge className="m-badge">
                  <IonSkeletonText animated style={{ width: '20px', height: '20px' }} />
                </IonBadge> */}
              </div>
            </IonCol>
            <IonCol size="4" className="chart-icon">
              <IonSkeletonText animated style={{ width: '40px', height: '30px', float: 'right' }} />
            </IonCol>
          </IonRow>

          {/* Price and Change */}
          <IonRow className="stock-price-container">
            <IonCol size="2">
              <IonText className="stock-price">
                <IonSkeletonText animated style={{ width: '70px', height: '28px' }} />
              </IonText>
            </IonCol>
            <IonCol size="6">
              <div className="price-change">
                <IonSkeletonText animated style={{ width: '90px', height: '28px', borderRadius: '15px' }} />
              </div>
            </IonCol>
          </IonRow>

          {/* Trade Signal Progress Bar */}
          <div className="trade-signal-container">
            <IonProgressBar value={0.7} className="trade-progress-bar"></IonProgressBar>
            <IonRow>
              <IonCol size="8">
                <IonSkeletonText animated style={{ width: '200px', height: '20px', marginTop: '5px' }} />
              </IonCol>
              <IonCol size="4" className="text-right">
                <IonSkeletonText animated style={{ width: '80px', height: '20px', marginTop: '5px', float: 'right' }} />
              </IonCol>
            </IonRow>
          </div>

          {/* Last Day Performance */}
          <IonRow className="last-day-container">
            <IonCol size="6">
              <div className="last-day-label">
                <IonText>
                  <IonSkeletonText animated style={{ width: '60px', height: '20px' }} />
                </IonText>
              </div>
              <div className="price-change small">
                <IonSkeletonText animated style={{ width: '60px', height: '20px', borderRadius: '15px' }} />
              </div>
            </IonCol>
            <IonCol size="6">
              <div className="button-container">
                <IonSkeletonText animated style={{ width: '100px', height: '28px', borderRadius: '15px' }} />
                <IonSkeletonText animated style={{ width: '100px', height: '28px', borderRadius: '15px' }} />
              </div>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>

      {/* Second Stock Card */}
      <IonCard className="stock-card-skeleton">
        <IonCardContent>
          {/* Header with Stock Symbol and Chart Icon */}
          <IonRow className="stock-header">
            <IonCol size="8" className="stock-symbol-container">
              <div className="symbol-badge-container">
                <IonText className="stock-symbol">
                  <IonSkeletonText animated style={{ width: '120px', height: '30px' }} />
                </IonText>
                {/* <IonBadge className="m-badge">
                  <IonSkeletonText animated style={{ width: '20px', height: '20px' }} />
                </IonBadge> */}
              </div>
            </IonCol>
            <IonCol size="4" className="chart-icon">
              <IonSkeletonText animated style={{ width: '40px', height: '30px', float: 'right' }} />
            </IonCol>
          </IonRow>

          {/* Price and Change */}
          <IonRow className="stock-price-container">
            <IonCol size="2">
              <IonText className="stock-price">
                <IonSkeletonText animated style={{ width: '80px', height: '28px' }} />
              </IonText>
            </IonCol>
            <IonCol size="6">
              <div className="price-change">
                <IonSkeletonText animated style={{ width: '100px', height: '28px', borderRadius: '15px' }} />
              </div>
            </IonCol>
          </IonRow>

          {/* Trade Signal Progress Bar */}
          <div className="trade-signal-container">
            <IonProgressBar value={0.7} className="trade-progress-bar"></IonProgressBar>
            <IonRow>
              <IonCol size="8">
                <IonSkeletonText animated style={{ width: '200px', height: '20px', marginTop: '5px' }} />
              </IonCol>
              <IonCol size="4" className="text-right">
                <IonSkeletonText animated style={{ width: '80px', height: '20px', marginTop: '5px', float: 'right' }} />
              </IonCol>
            </IonRow>
          </div>

          {/* Last Day Performance */}
          <IonRow className="last-day-container">
            <IonCol size="6">
              <div className="last-day-label">
                <IonText>
                  <IonSkeletonText animated style={{ width: '60px', height: '20px' }} />
                </IonText>
              </div>
              <div className="price-change small">
                <IonSkeletonText animated style={{ width: '60px', height: '20px', borderRadius: '15px' }} />
              </div>
            </IonCol>
            <IonCol size="6">
              <div className="button-container">
                <IonSkeletonText animated style={{ width: '100px', height: '28px', borderRadius: '15px' }} />
                <IonSkeletonText animated style={{ width: '100px', height: '28px', borderRadius: '15px' }} />
              </div>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default StockCardSkeleton;
