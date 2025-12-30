import React, { useState } from 'react';

// Exact lavender color from MyHealthAlly: #9d8cba
const lavender = {
  primary: '#9d8cba',
  light: '#b8acd0',
  lighter: '#e8e4f0',
  dark: '#7d6c9a',
};

const CheckIcon = () => (
  <svg className="w-5 h-5" style={{ color: lavender.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const LOGO_BASE64 = "data:image/webp;base64,UklGRkQEAABXRUJQVlA4WAoAAAAgAAAARwAARwAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggVgIAABAOAJ0BKkgASAA+USSPRaOiIRH6rgA4BQSzgGfC3yTVG+SmPNAmS7mZ0OkMpZKiG2wQvXJQfxKwew26FYSnLcxuFMCFZHnAx+nFQ/HCoRdDG8mzVAyd/CIA3/779bl7bEfSWr9roZqP9fByf9L3Bx+G7EYU5bnjKQAA/d9FolX2zFCcDNrF5d7p7IbP6H1yTVYxP2WJpnJ6RHHQbiA/Bmf52hZMV1h5hHeQuXOHFuBO98zJQgbl1o0fnVWC9u32kX9XxDuBHNc5hQKCHZKeiGhXZ8F4vXmq6j10WeG+BHz3dNq+Dqr4+2l4+dfo1DgYs4mVENA+xY6kMSmPukRr3KkEEfXHQTbxDBH6VLR7IXjvlSFtetU0x7NYhoQB9nOmeyzrTOLOjM1m9d61QXyjFVe3VrNdpkgHBovRTrS8hkiuhuvw4c6ffc7sAd2Idn6mq+Y+nrxZxqrQh9aTMf38dIc/hsQuksyv2DY6aLETTTvKr510Wd+JMbgIYLyk8JAlDGmLzY4yxEEvRRkMzcJpW/SH8I9evgVoTyR4elAWzdwvsANi+WDCq9bdlte+CZ1Klg9pN3B6Xgjt5p16oufqTrzmKd8y53DtZrSiY4VhanPdS5DWLzl6HL7eZo9KjDp8lJOeLeH7t3hQuIkcOBO7bliBVNERj1IYHjmZuGWCg0cx1uYqk+A9TKJHcUSPU6rgCWvo8YqHz2/xhH8FNWkC+0adbmfNR7cXFhb2BQWowlx+RiIw9y+iZ604+sFnnQx+gcWOVl0ostOZAuRcB4lXiyNPCA8wAAA=";

export default function MHAPricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: "Essential",
      tagline: "Get started with core access",
      monthlyPrice: 69,
      annualPrice: 690,
      foundingMonthly: 49,
      foundingAnnual: 490,
      features: [
        { name: "2 lab orders per year", included: true },
        { name: "4 prescription refills per year", included: true },
        { name: "2 specialist referrals per year", included: true },
        { name: "AI health Q&A (unlimited)", included: true },
        { name: "Health data logging & tracking", included: true },
        { name: "Symptom checker", included: true },
        { name: "Unlimited lab orders", included: false },
        { name: "Unlimited refills & referrals", included: false },
        { name: "Priority care team messaging", included: false },
        { name: "Quarterly MD consultations", included: false },
      ],
      cta: "Start Essential",
      popular: false,
    },
    {
      name: "Complete",
      tagline: "Unlimited practice access",
      monthlyPrice: 120,
      annualPrice: 1200,
      foundingMonthly: 99,
      foundingAnnual: 990,
      features: [
        { name: "Unlimited lab orders", included: true },
        { name: "Unlimited prescription refills", included: true },
        { name: "Unlimited specialist referrals", included: true },
        { name: "Appointment booking", included: true },
        { name: "AI health Q&A (unlimited)", included: true },
        { name: "Health data logging & tracking", included: true },
        { name: "Symptom checker", included: true },
        { name: "Care team messaging", included: true },
        { name: "Priority support", included: false },
        { name: "Quarterly MD consultations", included: false },
      ],
      cta: "Start Complete",
      popular: true,
    },
    {
      name: "Family",
      tagline: "Unlimited access for your household",
      monthlyPrice: 199,
      annualPrice: 1990,
      foundingMonthly: 169,
      foundingAnnual: 1690,
      subtitle: "Up to 5 members",
      features: [
        { name: "Unlimited lab orders", included: true },
        { name: "Unlimited prescription refills", included: true },
        { name: "Unlimited specialist referrals", included: true },
        { name: "Appointment booking", included: true },
        { name: "AI health Q&A (unlimited)", included: true },
        { name: "Health data logging & tracking", included: true },
        { name: "Symptom checker", included: true },
        { name: "Care team messaging", included: true },
        { name: "Priority support", included: false },
        { name: "Quarterly MD consultations", included: false },
      ],
      cta: "Start Family Plan",
      popular: false,
    },
    {
      name: "Premium",
      tagline: "White-glove concierge care",
      monthlyPrice: 299,
      annualPrice: 2990,
      foundingMonthly: 249,
      foundingAnnual: 2490,
      features: [
        { name: "Unlimited lab orders", included: true },
        { name: "Unlimited prescription refills", included: true },
        { name: "Unlimited specialist referrals", included: true },
        { name: "Appointment booking", included: true },
        { name: "AI health Q&A (unlimited)", included: true },
        { name: "Health data logging & tracking", included: true },
        { name: "Symptom checker", included: true },
        { name: "Priority care team messaging", included: true },
        { name: "Quarterly MD video consultations", included: true },
        { name: "Same-day response guarantee", included: true },
      ],
      cta: "Start Premium",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(to bottom, #f1f5f9, ${lavender.lighter}40, #ffffff)` }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${lavender.lighter}80` }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${lavender.lighter}60` }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: `${lavender.lighter}40` }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={LOGO_BASE64} 
              alt="MyHealthAlly" 
              className="w-20 h-20 rounded-xl shadow-lg"
            />
          </div>
          
          <div 
            className="inline-flex items-center gap-2 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-lg"
            style={{ background: `linear-gradient(to right, ${lavender.primary}, ${lavender.light})`, boxShadow: `0 10px 25px -5px ${lavender.lighter}` }}
          >
            <StarIcon />
            <span>Founding Member Pricing — First 100 Only • 6 Months</span>
            <StarIcon />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-700 mb-4 tracking-tight">
            MyHealth<span style={{ color: lavender.primary }}>Ally</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            Complete medical practice access at your fingertips. Labs, refills, referrals, appointments — all in one app.
          </p>
          
          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md border border-slate-200">
            <button
              onClick={() => setIsAnnual(false)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all"
              style={!isAnnual ? { backgroundColor: lavender.primary, color: 'white' } : { color: '#475569' }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2"
              style={isAnnual ? { backgroundColor: lavender.primary, color: 'white' } : { color: '#475569' }}
            >
              Annual
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={isAnnual ? { backgroundColor: lavender.light, color: 'white' } : { backgroundColor: lavender.lighter, color: lavender.dark }}
              >
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative bg-white rounded-2xl transition-all duration-300 hover:scale-[1.02]"
              style={plan.popular 
                ? { boxShadow: `0 25px 50px -12px ${lavender.lighter}`, border: `2px solid ${lavender.light}` }
                : { boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }
              }
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span 
                    className="text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
                    style={{ background: `linear-gradient(to right, ${lavender.primary}, ${lavender.light})` }}
                  >
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-700 mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{plan.tagline}</p>
                {plan.subtitle && (
                  <span 
                    className="inline-block text-xs font-medium px-2 py-1 rounded-full mb-3"
                    style={{ backgroundColor: lavender.lighter, color: lavender.dark }}
                  >
                    {plan.subtitle}
                  </span>
                )}
                
                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-700">
                      ${isAnnual ? plan.foundingAnnual : plan.foundingMonthly}
                    </span>
                    <span className="text-slate-500 text-sm">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-400 line-through">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span 
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${lavender.lighter}80`, color: lavender.dark }}
                    >
                      Founding rate (6 mo)
                    </span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <button
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all"
                  style={plan.popular 
                    ? { 
                        background: `linear-gradient(to right, ${lavender.primary}, ${lavender.light})`, 
                        color: 'white',
                        boxShadow: `0 10px 25px -5px ${lavender.lighter}`
                      }
                    : { backgroundColor: '#f1f5f9', color: '#475569' }
                  }
                >
                  {plan.cta}
                </button>
              </div>
              
              {/* Features */}
              <div className="border-t border-slate-100 p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? <CheckIcon /> : <XIcon />}
                      <span className={`text-sm ${feature.included ? 'text-slate-600' : 'text-slate-400'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison to competitors */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6">
            <h2 className="text-2xl font-bold text-white">How MyHealthAlly Compares</h2>
            <p className="text-slate-300 text-sm mt-1">Premium care at a fraction of the cost</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="text-sm font-medium text-slate-500">Service</div>
              <div className="text-sm font-medium text-slate-500">Their Price</div>
              <div className="text-sm font-medium" style={{ color: lavender.primary }}>MHA Complete</div>
            </div>
            {[
              { name: "One Medical", price: "$199/year", note: "Clinic access only" },
              { name: "Forward Health", price: "$149/month", note: "AI + diagnostics" },
              { name: "Parsley Health", price: "$175/month", note: "Functional medicine" },
              { name: "Concierge MD", price: "$200-400/month", note: "Full access" },
            ].map((comp, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 py-4 border-t border-slate-100 items-center">
                <div>
                  <div className="font-medium text-slate-700">{comp.name}</div>
                  <div className="text-xs text-slate-500">{comp.note}</div>
                </div>
                <div className="text-slate-600 font-medium">{comp.price}</div>
                <div className="font-bold text-lg" style={{ color: lavender.primary }}>$99/mo*</div>
              </div>
            ))}
            <div className="mt-4 text-xs text-slate-500">*Founding member rate for first 6 months. Regular price $120/month thereafter.</div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="text-center">
          <div className="inline-flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: lavender.primary }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              HIPAA Compliant
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: lavender.primary }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              256-bit Encryption
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: lavender.primary }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Real Medical Team
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: lavender.primary }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Cancel Anytime
            </span>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Questions?</h2>
          <p className="text-slate-500 mb-6">We're here to help you choose the right plan.</p>
          <button 
            className="inline-flex items-center gap-2 font-medium transition-colors"
            style={{ color: lavender.primary }}
          >
            View FAQ
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-slate-500">
          Secure patient engagement platform
        </div>
      </div>
    </div>
  );
}
