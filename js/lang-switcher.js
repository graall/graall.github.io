/**
 * Language Switcher for MQTT Client Website
 * Automatically detects browser language and offers to switch to appropriate version
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        defaultLanguage: 'ru',
        supportedLanguages: ['ru', 'en'],
        languageMap: {
            'ru': 'ru',
            'en': 'en',
            'ru-RU': 'ru',
            'en-US': 'en',
            'en-GB': 'en',
            'en-AU': 'en',
            'en-CA': 'en'
        }
    };

    // Current page information
    const currentPage = {
        path: window.location.pathname,
        fileName: window.location.pathname.split('/').pop(),
        search: window.location.search,
        hash: window.location.hash
    };

    /**
     * Get user's preferred language
     * @returns {string} Language code ('ru' or 'en')
     */
    function getUserLanguage() {
        // Check localStorage first
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && CONFIG.supportedLanguages.includes(savedLang)) {
            return savedLang;
        }

        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && CONFIG.languageMap[browserLang]) {
            return CONFIG.languageMap[browserLang];
        }

        // Default to Russian
        return CONFIG.defaultLanguage;
    }

    /**
     * Get current page language
     * @returns {string} Current language ('ru' or 'en')
     */
    function getCurrentPageLanguage() {
        if (currentPage.fileName.includes('-en.')) {
            return 'en';
        }
        return 'ru';
    }

    /**
     * Get alternative language version URL
     * @param {string} targetLang - Target language code
     * @returns {string} URL of alternative language version
     */
    function getAlternativeLanguageUrl(targetLang) {
        const currentLang = getCurrentPageLanguage();

        if (currentLang === targetLang) {
            return currentPage.path + currentPage.search + currentPage.hash;
        }

        let newFileName = currentPage.fileName;

        if (currentLang === 'ru' && targetLang === 'en') {
            // Russian to English
            if (newFileName === '' || newFileName === 'index.html') {
                newFileName = 'index-en.html';
            } else {
                newFileName = newFileName.replace('.html', '-en.html');
            }
        } else if (currentLang === 'en' && targetLang === 'ru') {
            // English to Russian
            if (newFileName === 'index-en.html') {
                newFileName = 'index.html';
            } else {
                newFileName = newFileName.replace('-en.html', '.html');
            }
        }

        // Construct new URL
        const pathParts = currentPage.path.split('/');
        pathParts[pathParts.length - 1] = newFileName;
        const newPath = pathParts.join('/');

        return newPath + currentPage.search + currentPage.hash;
    }

    /**
     * Show language switch suggestion
     * @param {string} suggestedLang - Suggested language code
     */
    function showLanguageSuggestion(suggestedLang) {
        // Check if suggestion was already shown in this session
        if (sessionStorage.getItem('langSuggestionShown')) {
            return;
        }

        // Don't show suggestion if user already chose a language
        if (localStorage.getItem('preferredLanguage')) {
            return;
        }

        const currentLang = getCurrentPageLanguage();
        if (currentLang === suggestedLang) {
            return;
        }

        // Create suggestion element
        const suggestion = document.createElement('div');
        suggestion.id = 'language-suggestion';
        suggestion.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #333;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
        `;

        const message = suggestedLang === 'en' ?
            'We noticed you might prefer the English version of this page. ' :
            'Мы заметили, что вы можете предпочесть русскую версию этой страницы. ';

        const switchText = suggestedLang === 'en' ? 'Switch to English' : 'Переключиться на русский';
        const cancelText = suggestedLang === 'en' ? 'No thanks' : 'Нет, спасибо';

        suggestion.innerHTML = `
            <div style="display: inline-block; max-width: 800px; text-align: left;">
                <p style="margin: 0 0 10px 0;">${message}</p>
                <button id="switch-lang-btn" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    margin-right: 10px;
                    cursor: pointer;
                    border-radius: 4px;
                ">${switchText}</button>
                <button id="cancel-lang-btn" style="
                    background: transparent;
                    color: #ccc;
                    border: 1px solid #ccc;
                    padding: 8px 16px;
                    cursor: pointer;
                    border-radius: 4px;
                ">${cancelText}</button>
            </div>
        `;

        document.body.insertBefore(suggestion, document.body.firstChild);

        // Add event listeners
        document.getElementById('switch-lang-btn').addEventListener('click', function() {
            localStorage.setItem('preferredLanguage', suggestedLang);
            sessionStorage.setItem('langSuggestionShown', 'true');
            window.location.href = getAlternativeLanguageUrl(suggestedLang);
        });

        document.getElementById('cancel-lang-btn').addEventListener('click', function() {
            sessionStorage.setItem('langSuggestionShown', 'true');
            suggestion.style.display = 'none';
        });
    }

    /**
     * Add language switcher to header
     */
    function addLanguageSwitcherToHeader() {
        const currentLang = getCurrentPageLanguage();
        const targetLang = currentLang === 'ru' ? 'en' : 'ru';
        const targetLangName = targetLang === 'ru' ? 'Русский' : 'English';
        const switchUrl = getAlternativeLanguageUrl(targetLang);

        // Try to find header or create language switcher element
        const headers = document.querySelectorAll('header, .header, nav, .navbar');
        let targetElement = null;

        if (headers.length > 0) {
            targetElement = headers[0];
        } else {
            // Try to find a suitable place in the beginning of body
            targetElement = document.body.firstChild;
        }

        if (targetElement) {
            const switcher = document.createElement('div');
            switcher.className = 'language-switcher';
            switcher.style.cssText = `
                float: right;
                margin: 10px;
                font-size: 14px;
            `;

            switcher.innerHTML = `
                <a href="${switchUrl}" style="
                    color: #007bff;
                    text-decoration: none;
                    padding: 5px 10px;
                    border: 1px solid #007bff;
                    border-radius: 4px;
                " title="Switch to ${targetLangName}">
                    ${targetLang.toUpperCase()}
                </a>
            `;

            // Insert at the beginning of the target element
            targetElement.insertBefore(switcher, targetElement.firstChild);
        }
    }

    /**
     * Initialize language switcher
     */
    function init() {
        // Add language switcher to header
        addLanguageSwitcherToHeader();

        // Detect user language and show suggestion if needed
        const userLang = getUserLanguage();
        const currentPageLang = getCurrentPageLanguage();

        // Show suggestion only if user's preferred language differs from current page
        if (userLang !== currentPageLang) {
            setTimeout(() => {
                showLanguageSuggestion(userLang);
            }, 1000); // Show after 1 second
        }
    }

    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();