import React, { useEffect } from 'react';
import '../styles/AdsenseBanner.css';

const AdsenseBanner = ({ slot, className = '' }) => {
  const adsenseClient = process.env.REACT_APP_ADSENSE_CLIENT;

  useEffect(() => {
    if (!adsenseClient || !slot) return;

    try {
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      // Keep UI stable if ad script is blocked by browser extensions.
      console.log('AdSense render skipped:', error?.message || error);
    }
  }, [adsenseClient, slot]);

  if (!adsenseClient || !slot) {
    return null;
  }

  return (
    <div className={`adsense-wrap ${className}`.trim()}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdsenseBanner;