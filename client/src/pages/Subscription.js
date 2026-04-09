import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Subscription.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Subscription = ({ onToast }) => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const plans = {
    free: {
      name: 'Free',
      price: 0,
      features: ['Basic music streaming', 'Ads support', '480p quality', 'Limited skip']
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: ['Ad-free streaming', '720p quality', 'Unlimited skips', 'Offline downloads', 'Priority support']
    },
    pro: {
      name: 'Pro',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: ['Everything in Premium', '1080p quality', 'High fidelity audio', 'Family sharing (4 users)', 'Exclusive content']
    }
  };

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/subscriptions/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCurrentSubscription(data.subscription);
      } else {
        onToast(data.message || 'Failed to load subscription', 'error');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      onToast('Error loading subscription', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const validateCoupon = async () => {
    const normalizedCouponCode = couponCode.trim();

    if (!normalizedCouponCode) {
      setCouponValidation(null);
      return;
    }

    // Don't allow coupon on free plan
    if (selectedPlan === 'free') {
      onToast('Cannot apply coupon to free plan', 'error');
      return;
    }

    try {
      const amount = selectedPlan === 'premium' 
        ? (billingCycle === 'monthly' ? 99 : 990)
        : (billingCycle === 'monthly' ? 199 : 1990);

      const response = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: normalizedCouponCode,
          amount,
          plan: selectedPlan,
          billingCycle
        })
      });

      const data = await response.json();
      setCouponValidation(data);
      
      if (!data.success) {
        onToast(data.message, 'error');
      } else {
        onToast('Coupon applied successfully!', 'success');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      onToast('Error validating coupon', 'error');
    }
  };

  const handleSubscribe = async () => {
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem('token');
      const normalizedCouponCode = couponCode.trim() || null;

      if (selectedPlan === 'free') {
        const response = await fetch('http://localhost:5000/api/subscriptions/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            plan: selectedPlan,
            billingCycle,
            couponCode: null
          })
        });

        const data = await response.json();
        if (data.success) {
          onToast('Subscription activated! 🎉', 'success');
          setShowSubscriptionModal(false);
          setCouponCode('');
          setCouponValidation(null);
          fetchSubscription();
        } else {
          onToast(data.message || 'Error creating subscription', 'error');
        }
        return;
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        onToast('Razorpay SDK failed to load. Check internet and try again.', 'error');
        return;
      }

      const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!keyId) {
        onToast('Razorpay key is missing. Set REACT_APP_RAZORPAY_KEY_ID.', 'error');
        return;
      }

      const orderResponse = await fetch('http://localhost:5000/api/subscriptions/payment/order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle,
          couponCode: normalizedCouponCode
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        onToast(orderData.message || 'Unable to initiate payment', 'error');
        return;
      }

      if (!orderData.paymentRequired) {
        onToast('Subscription activated! 🎉', 'success');
        setShowSubscriptionModal(false);
        setCouponCode('');
        setCouponValidation(null);
        fetchSubscription();
        return;
      }

      const options = {
        key: keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Music Player',
        description: `${selectedPlan} plan (${billingCycle})`,
        order_id: orderData.order.id,
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch('http://localhost:5000/api/subscriptions/payment/verify', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ...paymentResponse,
                plan: selectedPlan,
                billingCycle,
                couponCode: normalizedCouponCode
              })
            });

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              onToast('Payment successful! Subscription activated 🎉', 'success');
              setShowSubscriptionModal(false);
              setCouponCode('');
              setCouponValidation(null);
              fetchSubscription();
            } else {
              onToast(verifyData.message || 'Payment verification failed', 'error');
            }
          } catch (error) {
            console.error('Payment verify error:', error);
            onToast('Error verifying payment', 'error');
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: localStorage.getItem('username') || 'Music User'
        },
        theme: {
          color: '#1db954'
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            onToast('Payment cancelled', 'info');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      return;
    } catch (error) {
      console.error('Error creating subscription:', error);
      onToast('Error creating subscription', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        onToast('Subscription cancelled', 'success');
        fetchSubscription();
      } else {
        onToast(data.message || 'Error cancelling subscription', 'error');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      onToast('Error cancelling subscription', 'error');
    }
  };

  if (loading) {
    return <div className="subscription"><p className="loading">Loading subscription...</p></div>;
  }

  const getPrice = (plan) => {
    return billingCycle === 'monthly' 
      ? plans[plan].monthlyPrice 
      : plans[plan].yearlyPrice;
  };

  const currentPlan = currentSubscription?.plan || 'free';

  return (
    <div className="subscription">
      <div className="subscription-header">
        <h2>✨ Subscription Plans</h2>
        <p>Choose the perfect plan for your music experience</p>
      </div>

      {currentSubscription && (
        <div className="current-subscription-banner">
          <div className="banner-content">
            <p>You're currently on the <strong>{plans[currentPlan].name} Plan</strong></p>
            {currentSubscription.endDate && (
              <p>Valid until: <strong>{new Date(currentSubscription.endDate).toLocaleDateString()}</strong></p>
            )}
          </div>
          {currentSubscription.plan !== 'free' && (
            <button 
              className="cancel-subscription-btn"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </button>
          )}
        </div>
      )}

      <div className="billing-toggle">
        <span className={billingCycle === 'monthly' ? 'active' : ''}>📅 Monthly</span>
        <button 
          className="toggle-btn"
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
        >
          <span className={billingCycle === 'monthly' ? 'left' : 'right'}></span>
        </button>
        <span className={billingCycle === 'yearly' ? 'active' : ''}>📆 Yearly <span className="save-badge">Save 17%</span></span>
      </div>

      <div className="plans-grid">
        {Object.entries(plans).map(([planKey, plan]) => (
          <div 
            key={planKey}
            className={`plan-card ${currentPlan === planKey ? 'active' : ''} ${planKey === 'pro' ? 'featured' : ''}`}
          >
            {planKey === 'pro' && <div className="featured-badge">Most Popular</div>}
            
            <h3>{plan.name}</h3>
            
            <div className="price-section">
              {planKey === 'free' ? (
                <p className="price">Free</p>
              ) : (
                <>
                  <p className="price">₹{getPrice(planKey)}</p>
                  <p className="billing-period">/{billingCycle === 'monthly' ? 'month' : 'year'}</p>
                </>
              )}
            </div>

            <ul className="features-list">
              {plan.features.map((feature, idx) => (
                <li key={idx}>
                  <span className="feature-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`subscribe-btn ${currentPlan === planKey ? 'current' : ''}`}
              onClick={() => {
                setSelectedPlan(planKey);
                setShowSubscriptionModal(true);
                setCouponCode('');
                setCouponValidation(null);
              }}
              disabled={currentPlan === planKey}
            >
              {currentPlan === planKey ? '✓ Current Plan' : planKey === 'free' ? 'Downgrade' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>

      {showSubscriptionModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowSubscriptionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowSubscriptionModal(false)}
            >
              ✕
            </button>

            <h3>Upgrade to {plans[selectedPlan].name} Plan</h3>
            
            <div className="modal-details">
              <p><strong>Plan:</strong> {plans[selectedPlan].name}</p>
              <p><strong>Billing Cycle:</strong> {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</p>
              <p className="price"><strong>Amount:</strong> ₹{getPrice(selectedPlan)}</p>
            </div>

            {selectedPlan !== 'free' && (
            <div className="coupon-section">
              <label>Have a coupon code?</label>
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponValidation(null);
                  }}
                  className="coupon-input"
                />
                <button 
                  className="apply-coupon-btn"
                  onClick={validateCoupon}
                  disabled={!couponCode}
                >
                  Apply
                </button>
              </div>

              {couponValidation && (
                <div className={`coupon-result ${couponValidation.success ? 'success' : 'error'}`}>
                  {couponValidation.success ? (
                    <>
                      <p>✓ Coupon applied! You save ₹{couponValidation.coupon.discountAmount}</p>
                      <p className="final-amount">Final Amount: ₹{couponValidation.coupon.finalAmount}</p>
                    </>
                  ) : (
                    <p>✗ {couponValidation.message}</p>
                  )}
                </div>
              )}
            </div>
            )}

            <div className="payment-summary">
              <div className="summary-row">
                <span>Base Amount:</span>
                <span>₹{getPrice(selectedPlan)}</span>
              </div>
              {couponValidation?.success && (
                <>
                  <div className="summary-row discount">
                    <span>Discount:</span>
                    <span>-₹{couponValidation.coupon.discountAmount}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{couponValidation.coupon.finalAmount}</span>
                  </div>
                </>
              )}
            </div>

            <button
              className="confirm-btn"
              onClick={handleSubscribe}
              disabled={processingPayment}
            >
              {processingPayment ? '⏳ Processing...' : '💳 Confirm & Subscribe'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
