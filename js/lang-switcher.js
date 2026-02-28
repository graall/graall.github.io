/**
 * Language Switcher for MQTT Client Website
 * Automatically detects browser language and offers to switch to appropriate version
 */

(function() {
    'use strict';

    // Debug: Log that script is loaded
    console.log('Language switcher script loaded');

    // Configuration
    const CONFIG = {
        defaultLanguage: 'en',
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

    // Debug: Log current page information
    console.log('Current page info:', currentPage);

    /**
     * Get user's preferred language
     * @returns {string} Language code ('ru' or 'en')
     */
    function getUserLanguage() {
        console.log('Getting user language preference');

        // Check localStorage first
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && CONFIG.supportedLanguages.includes(savedLang)) {
            console.log('Using saved language preference:', savedLang);
            return savedLang;
        }

        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && CONFIG.languageMap[browserLang]) {
            console.log('Using browser language:', browserLang, '->', CONFIG.languageMap[browserLang]);
            return CONFIG.languageMap[browserLang];
        }

        // Default to English
        console.log('Using default language:', CONFIG.defaultLanguage);
        return CONFIG.defaultLanguage;
    }

    /**
     * Get current page language
     * @returns {string} Current language ('ru' or 'en')
     */
    function getCurrentPageLanguage() {
        console.log('Determining language for file:', currentPage.fileName);

        // If filename contains -ru., it's Russian
        if (currentPage.fileName.includes('-ru.')) {
            console.log('Detected Russian language');
            return 'ru';
        }
        // All other files (without -ru. suffix) are considered English (default)
        console.log('Defaulting to English language');
        return 'en';
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
            if (newFileName === '' || newFileName === 'index-ru.html') {
                newFileName = 'index.html';
            } else {
                // Replace -ru.html with .html
                newFileName = newFileName.replace('-ru.html', '.html');
            }
        } else if (currentLang === 'en' && targetLang === 'ru') {
            // English to Russian
            if (newFileName === '' || newFileName === 'index.html') {
                newFileName = 'index-ru.html';
            } else {
                // Add -ru suffix to English pages
                newFileName = newFileName.replace('.html', '-ru.html');
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
        try {
            const currentLang = getCurrentPageLanguage();
            const targetLang = currentLang === 'ru' ? 'en' : 'ru';
            const targetLangName = targetLang === 'ru' ? 'Русский' : 'English';
            const switchUrl = getAlternativeLanguageUrl(targetLang);

            // Create a fixed position language switcher in the top-right corner
            const switcher = document.createElement('div');
            switcher.className = 'language-switcher';
            switcher.style.cssText = `
                position: fixed;
                top: 15px;
                right: 15px;
                z-index: 9999;
                font-size: 14px;
            `;

            switcher.innerHTML = `
                <a href="${switchUrl}" style="
                    color: #007bff;
                    text-decoration: none;
                    padding: 5px 10px;
                    border: 1px solid #007bff;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(5px);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    display: inline-block;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='rgba(0, 123, 255, 0.1)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.9)'" title="Switch to ${targetLangName}">
                    ${targetLang.toUpperCase()}
                </a>
            `;

            // Insert directly into the body to ensure it's always visible
            document.body.appendChild(switcher);

            // Debug information
            console.log('Language switcher added:', { currentLang, targetLang, switchUrl });
        } catch (error) {
            console.error('Error adding language switcher:', error);
        }
    }

    /**
     * Initialize language switcher
     */
    function init() {
        try {
            console.log('Initializing language switcher');

            // Add language switcher to header
            addLanguageSwitcherToHeader();

            // Detect user language and show suggestion if needed
            const userLang = getUserLanguage();
            const currentPageLang = getCurrentPageLanguage();

            console.log('Language detection:', { userLang, currentPageLang });

            // Show suggestion only if user's preferred language differs from current page
            if (userLang !== currentPageLang) {
                setTimeout(() => {
                    showLanguageSuggestion(userLang);
                }, 1000); // Show after 1 second
            }
        } catch (error) {
            console.error('Error initializing language switcher:', error);
        }
    }

    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();