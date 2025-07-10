import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Calculator from './pages/calculator.jsx';
import InfoPage from './pages/infoPage';
import NotFound from './pages/NotFound';
import { Navigate } from 'react-router-dom';
import Setting from "./pages/settings.jsx";
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookieConsent, {getCookieConsentValue} from 'react-cookie-consent';

const GA_ID = 'G-W502BDD62S';


export default function App() {
    useEffect(() => {
        const consent = getCookieConsentValue('wwa_cookie_consent');
        if (consent === 'true' && typeof window.gtag === 'function') {
            window.gtag('config', GA_ID, { anonymize_ip: true });
        }
    }, []);

    const handleAccept = () => {
        if (typeof window.gtag === 'function') {
            window.gtag('config', GA_ID, { anonymize_ip: true });
        }
    };

    const handleReject = () => {
        document.cookie = "wwa_cookie_consent=false;path=/;max-age=" + 60 * 60 * 24 * 365;
    };
    usePageTracking();

    return (
        <>
            <Routes>
                {/*<Route path="/" element={<Navigate to="/" />} />*/}
                <Route path="/" element={<Calculator />} />
                <Route path="/info" element={<InfoPage />} />
                <Route path="/settings" element={<Setting />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
            </Routes>
            <CookieConsent
                enableDeclineButton
                declineButtonText="Reject"
                onAccept={handleAccept}
                onDecline={handleReject}
                cookieName="wwa_cookie_consent"
                location="bottom"
                buttonText="Accept"
                style={{ background: "#2B373B", opacity: 0.9}}
                buttonStyle={{ color: "#fff", backgroundColor: "#20bfb9", fontSize: "13px" }}
                declineButtonStyle={{ color: "#fff", backgroundColor: "#777", fontSize: "13px", marginLeft: "1rem" }}
            >
                This site uses cookies to analyze traffic via Google Analytics. No personal information is shared.{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "underline" }}>Learn more</a>.
            </CookieConsent>
        </>

    );
}

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        const consent = getCookieConsentValue('wwa_cookie_consent');
        if (consent === 'true' && typeof window.gtag === 'function') {
            window.gtag('event', 'page_view', {
                page_path: location.pathname + location.search,
                page_location: window.location.href,
                page_title: document.title,
            });
        }
    }, [location]);
}