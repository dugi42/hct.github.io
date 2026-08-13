/**
 * consent.js — DSGVO consent gate for Google Analytics.
 *
 * Google Analytics only loads after the visitor explicitly accepts; the
 * choice is stored in localStorage. gtag() always exists so inline event
 * handlers never throw — without consent the calls simply go nowhere.
 */
(() => {
    const GA_ID = 'G-YWXF7HR51T';
    const STORAGE_KEY = 'hct-analytics-consent'; // 'granted' | 'denied'

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };

    const loadAnalytics = () => {
        const s = document.createElement('script');
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(s);
        gtag('js', new Date());
        gtag('config', GA_ID, { anonymize_ip: true });
    };

    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }

    if (stored === 'granted') {
        loadAnalytics();
        return;
    }
    if (stored === 'denied') return;

    const showBanner = () => {
        const banner = document.createElement('div');
        banner.id = 'consent-banner';
        banner.className = 'fixed bottom-0 inset-x-0 z-[60] bg-[#111118] border-t border-[#2a2a35] p-4';
        banner.innerHTML = `
            <div class="container mx-auto flex flex-col sm:flex-row items-center gap-4 max-w-4xl">
                <p class="text-sm text-gray-400 flex-1">
                    Wir verwenden Google Analytics, um die Nutzung unserer Website zu verstehen.
                    Die Daten werden erst nach deiner Zustimmung erfasst.
                    <a href="/pages/2025_Datenschutz.html" class="underline hover:text-white">Datenschutzerkl&auml;rung</a>
                </p>
                <div class="flex gap-3">
                    <button id="consent-decline" class="text-sm font-semibold text-gray-400 hover:text-white px-4 py-2 border border-[#2a2a35] rounded-lg transition-colors">Ablehnen</button>
                    <button id="consent-accept" class="text-sm font-semibold text-white bg-hc-red hover:bg-[#d30510] px-4 py-2 rounded-lg transition-colors">Akzeptieren</button>
                </div>
            </div>`;
        document.body.appendChild(banner);

        const choose = value => {
            try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ignore */ }
            banner.remove();
            if (value === 'granted') loadAnalytics();
        };
        document.getElementById('consent-accept').addEventListener('click', () => choose('granted'));
        document.getElementById('consent-decline').addEventListener('click', () => choose('denied'));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBanner);
    } else {
        showBanner();
    }
})();
