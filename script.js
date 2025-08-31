/**
 * Twitter Mass Unfollow Tool
 * 
 * A professional tool for mass unfollowing Twitter accounts
 * Built with vanilla JavaScript, HTML5, and CSS3
 * 
 * Features:
 * - Twitter API v1.1 integration with OAuth 1.0a
 * - Demo mode for testing without API keys
 * - Mass unfollow functionality with progress tracking
 * - Real-time status updates and error handling
 * - Support for both free and elevated API access
 * 
 * @author Your Name
 * @version 1.0.0
 * @license MIT
 */

// Twitter API configuration
const TWITTER_CONFIG = {
    // These keys are required for Twitter API v2 access
    // You can get these keys from Twitter Developer Portal
    apiKey: '', // Consumer Key (API Key)
    apiSecret: '', // Consumer Secret (API Secret)
    accessToken: '', // Access Token
    accessTokenSecret: '', // Access Token Secret
    bearerToken: '' // Bearer Token for v2 API
};

class TwitterUnfollowApp {
    constructor() {
        this.isAuthenticated = false;
        this.followingCount = 0;
        this.unfollowedCount = 0;
        this.isProcessing = false;
        
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        const authButton = document.getElementById('authButton');
        const unfollowAllButton = document.getElementById('unfollowAllButton');

        authButton.addEventListener('click', () => this.authenticate());
        unfollowAllButton.addEventListener('click', () => this.unfollowAll());
        
        const testApiButton = document.getElementById('testApiButton');
        if (testApiButton) {
            testApiButton.addEventListener('click', () => this.testAPI());
        }
        
        const clearKeysButton = document.getElementById('clearKeysButton');
        if (clearKeysButton) {
            clearKeysButton.addEventListener('click', () => this.clearSavedKeys());
        }
        
        const loadDefaultKeysButton = document.getElementById('loadDefaultKeysButton');
        if (loadDefaultKeysButton) {
            loadDefaultKeysButton.addEventListener('click', () => this.loadDefaultKeys());
        }
        
        const demoModeButton = document.getElementById('demoModeButton');
        if (demoModeButton) {
            demoModeButton.addEventListener('click', () => this.enableDemoMode());
        }
    }

    /**
     * Checks authentication status and loads saved tokens
     * If no tokens are found, loads default demo keys
     */
    checkAuthStatus() {
        // Check saved tokens
        const savedTokens = this.getSavedTokens();
        
        // If no saved keys, use default demo keys
        if (!savedTokens.apiKey) {
            const defaultTokens = {
                apiKey: 'Zkt0eAercpIpBP8lqce6PsvJT',
                apiSecret: 'd2f0xygZiZ4umXKfWQ6ppViHJ5ktxW0j507Urj6jp0PtxjES9I',
                accessToken: '1909532946597285888-ozFUi5bVwrFhaxzbJyXpNW6HmKDUJW',
                accessTokenSecret: 'qshG6lXIqndxtF1MsMC5goFPQ1PfrIbbaf4IWZnf6f1Q6'
            };
            this.saveTokens(defaultTokens);
            this.addStatusMessage('🔑 Default API keys loaded', 'info');
        }
        
        if (savedTokens.accessToken && savedTokens.accessTokenSecret) {
            this.isAuthenticated = true;
            this.showUnfollowSection();
            this.loadFollowingCount();
        }
    }

    getSavedTokens() {
        return {
            accessToken: localStorage.getItem('twitter_access_token'),
            accessTokenSecret: localStorage.getItem('twitter_access_token_secret'),
            apiKey: localStorage.getItem('twitter_api_key'),
            apiSecret: localStorage.getItem('twitter_api_secret')
        };
    }

    saveTokens(tokens) {
        localStorage.setItem('twitter_access_token', tokens.accessToken);
        localStorage.setItem('twitter_access_token_secret', tokens.accessTokenSecret);
        localStorage.setItem('twitter_api_key', tokens.apiKey);
        localStorage.setItem('twitter_api_secret', tokens.apiSecret);
    }

    authenticate() {
        // В реальном приложении здесь должна быть OAuth авторизация
        // Для демонстрации используем простую форму ввода ключей
        
        const apiKey = prompt('Введите ваш Twitter API Key:');
        const apiSecret = prompt('Введите ваш Twitter API Secret:');
        const accessToken = prompt('Введите ваш Access Token:');
        const accessTokenSecret = prompt('Введите ваш Access Token Secret:');

        if (apiKey && apiSecret && accessToken && accessTokenSecret) {
            const tokens = { apiKey, apiSecret, accessToken, accessTokenSecret };
            this.saveTokens(tokens);
            this.isAuthenticated = true;
            this.showUnfollowSection();
            this.loadFollowingCount();
            this.addStatusMessage('✅ Авторизация успешна!', 'success');
        } else {
            this.addStatusMessage('❌ Необходимо ввести все ключи API', 'error');
        }
    }

    showUnfollowSection() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('unfollowSection').style.display = 'block';
        document.getElementById('statusSection').style.display = 'block';
    }

    /**
     * Loads the count of accounts being followed
     * Attempts to use real API first, falls back to demo mode if needed
     */
    async loadFollowingCount() {
        try {
            const tokens = this.getSavedTokens();
            if (!tokens.apiKey || !tokens.apiSecret) {
                throw new Error('API keys not configured');
            }

            this.addStatusMessage('📊 Loading following count...', 'info');
            
            // Create Twitter API instance
            const twitterAPI = new TwitterAPI(tokens);
            
            try {
                // Get real following count
                this.addStatusMessage('🔍 Testing API connection...', 'info');
                
                // First test basic API access
                this.addStatusMessage('🔍 Testing basic API access...', 'info');
                const userInfo = await twitterAPI.getUserInfo();
                this.addStatusMessage(`✅ Basic API access available! User: @${userInfo.screen_name}`, 'success');
                
                // Now try to get following count
                this.addStatusMessage('📊 Getting following count...', 'info');
                this.followingCount = await twitterAPI.getFollowingCount();
                document.getElementById('followingCount').textContent = this.followingCount;
                this.addStatusMessage(`✅ Following count loaded: ${this.followingCount}`, 'success');
            } catch (apiError) {
                // Show detailed error
                this.addStatusMessage(`❌ API Error: ${apiError.message}`, 'error');
                
                // Detailed error diagnosis
                if (apiError.message.includes('Forbidden')) {
                    this.addStatusMessage('🚫 Access denied. Possible reasons:', 'error');
                    this.addStatusMessage('• Insufficient application permissions', 'error');
                    this.addStatusMessage('• Elevated access required', 'error');
                    this.addStatusMessage('• Check settings in Twitter Developer Portal', 'error');
                } else if (apiError.message.includes('Unauthorized')) {
                    this.addStatusMessage('🔑 Authentication error. Check API keys', 'error');
                } else if (apiError.message.includes('Rate limit')) {
                    this.addStatusMessage('⏳ Rate limit exceeded. Please wait', 'error');
                }
                
                this.addStatusMessage('⚠️ Switching to demo mode', 'info');
                
                // Try alternative endpoints
                this.addStatusMessage('🔄 Trying alternative endpoints...', 'info');
                try {
                    await this.testAlternativeEndpoints(twitterAPI);
                } catch (altError) {
                    this.addStatusMessage(`❌ Alternative endpoints also unavailable: ${altError.message}`, 'error');
                }
                
                this.followingCount = Math.floor(Math.random() * 1000) + 100;
                document.getElementById('followingCount').textContent = this.followingCount;
                this.addStatusMessage(`📊 Demo: ${this.followingCount} following accounts`, 'info');
            }
        } catch (error) {
            this.addStatusMessage(`❌ Loading error: ${error.message}`, 'error');
        }
    }

    /**
     * Initiates the mass unfollow process
     * Shows confirmation dialog and starts the operation
     */
    async unfollowAll() {
        if (this.isProcessing) return;

        const confirmed = confirm(
            `⚠️ WARNING!\n\n` +
            `Are you sure you want to unfollow ALL ${this.followingCount} accounts?\n\n` +
            `This action is IRREVERSIBLE!\n\n` +
            `Click OK to confirm.`
        );

        if (!confirmed) {
            this.addStatusMessage('❌ Operation cancelled by user', 'info');
            return;
        }

        this.isProcessing = true;
        this.unfollowedCount = 0;
        document.getElementById('unfollowAllButton').disabled = true;
        document.getElementById('progress').style.display = 'block';

        try {
            await this.processUnfollows();
        } catch (error) {
            this.addStatusMessage(`❌ Critical error: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
            document.getElementById('unfollowAllButton').disabled = false;
        }
    }

    async processUnfollows() {
        const tokens = this.getSavedTokens();
        const totalFollowing = this.followingCount;
        
        if (!tokens.apiKey || !tokens.apiSecret) {
            // Демо-режим
            return this.processUnfollowsDemo(totalFollowing);
        }

        try {
            // Создаем экземпляр Twitter API
            const twitterAPI = new TwitterAPI(tokens);
            
            // Настраиваем callback для отслеживания прогресса
            const progressCallback = (data) => {
                if (data.type === 'unfollow') {
                    if (data.success) {
                        this.unfollowedCount = data.count;
                        this.updateProgress();
                        this.updateStats();
                        
                        // Добавляем сообщение каждые 10 отписок
                        if (this.unfollowedCount % 10 === 0) {
                            this.addStatusMessage(
                                `✅ Отписано от @${data.user.screen_name}: ${this.unfollowedCount}/${totalFollowing}`, 
                                'success'
                            );
                        }
                    } else {
                        this.addStatusMessage(
                            `❌ Ошибка отписки от @${data.user.screen_name}: ${data.error}`, 
                            'error'
                        );
                    }
                } else if (data.type === 'rate_limit_wait') {
                    this.addStatusMessage(
                        `⏳ Rate limit превышен, ждем ${Math.ceil(data.waitTime)} секунд...`, 
                        'info'
                    );
                }
            };

            // Запускаем массовую отписку
            const result = await twitterAPI.massUnfollowAll(progressCallback, 1000);
            
            this.addStatusMessage(
                `🎉 Операция завершена! Отписано от ${result} пользователей`, 
                'success'
            );
            
        } catch (error) {
            this.addStatusMessage(`❌ Ошибка API: ${error.message}`, 'error');
            
            // Если API не работает, переключаемся на демо-режим
            this.addStatusMessage('🔄 Переключаюсь на демо-режим...', 'info');
            await this.processUnfollowsDemo(totalFollowing);
        }
    }

    async processUnfollowsDemo(totalFollowing) {
        // Демо-режим для тестирования интерфейса
        for (let i = 0; i < totalFollowing; i++) {
            if (!this.isProcessing) break;

            try {
                // Симуляция задержки API
                await this.delay(100 + Math.random() * 200);
                
                this.unfollowedCount++;
                this.updateProgress();
                this.updateStats();
                
                // Добавляем сообщение каждые 10 отписок
                if (this.unfollowedCount % 10 === 0) {
                    this.addStatusMessage(
                        `✅ Демо: Отписано ${this.unfollowedCount}/${totalFollowing}`, 
                        'success'
                    );
                }
                
            } catch (error) {
                this.addStatusMessage(
                    `❌ Демо ошибка: ${error.message}`, 
                    'error'
                );
            }
        }

        this.addStatusMessage(
            `🎉 Демо завершено! Отписано от ${this.unfollowedCount} пользователей`, 
            'success'
        );
    }

    async unfollowUser(userId, tokens) {
        // Реальная реализация отписки через Twitter API
        // Для демонстрации возвращаем Promise.resolve()
        return Promise.resolve();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateProgress() {
        const percentage = Math.round((this.unfollowedCount / this.followingCount) * 100);
        document.getElementById('progressBar').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = `${percentage}%`;
    }

    updateStats() {
        document.getElementById('unfollowedCount').textContent = this.unfollowedCount;
    }

    addStatusMessage(message, type = 'info') {
        const statusMessages = document.getElementById('statusMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `status-message ${type}`;
        messageElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        statusMessages.appendChild(messageElement);
        statusMessages.scrollTop = statusMessages.scrollHeight;
    }

    // Метод для тестирования (можно удалить в продакшене)
    testMode() {
        this.addStatusMessage('🧪 Включен тестовый режим', 'info');
        this.followingCount = 50;
        document.getElementById('followingCount').textContent = this.followingCount;
        this.showUnfollowSection();
    }

    // Метод для тестирования API
    async testAPI() {
        const tokens = this.getSavedTokens();
        
        if (!tokens.apiKey || !tokens.apiSecret) {
            this.addStatusMessage('❌ API ключи не найдены', 'error');
            return;
        }

        this.addStatusMessage('🧪 Тестирую API подключение...', 'info');
        
        try {
            const twitterAPI = new TwitterAPI(tokens);
            
            // Тестируем простой запрос
            this.addStatusMessage('🔍 Проверяю аутентификацию...', 'info');
            
            // Пробуем получить информацию о пользователе
            const userInfo = await twitterAPI.getUserInfo();
            this.addStatusMessage(`✅ API работает! Пользователь: @${userInfo.screen_name}`, 'success');
            this.addStatusMessage(`📊 Подписок: ${userInfo.friends_count}`, 'success');
            
            // Обновляем счетчик
            this.followingCount = userInfo.friends_count;
            document.getElementById('followingCount').textContent = this.followingCount;
            
        } catch (error) {
            this.addStatusMessage(`❌ Ошибка API: ${error.message}`, 'error');
            
            // Показываем детали ошибки
            if (error.message.includes('401')) {
                this.addStatusMessage('🔑 Ошибка аутентификации - проверьте API ключи', 'error');
            } else if (error.message.includes('403')) {
                this.addStatusMessage('🚫 Доступ запрещен - проверьте права приложения', 'error');
            } else if (error.message.includes('429')) {
                this.addStatusMessage('⏳ Превышен лимит запросов - подождите', 'error');
            } else if (error.message.includes('CORS')) {
                this.addStatusMessage('🌐 Проблема CORS - используйте локальный сервер', 'error');
            }
        }
    }

    // Метод для очистки сохраненных ключей
    clearSavedKeys() {
        if (confirm('Вы действительно хотите удалить все сохраненные API ключи?')) {
            localStorage.removeItem('twitter_api_key');
            localStorage.removeItem('twitter_api_secret');
            localStorage.removeItem('twitter_access_token');
            localStorage.removeItem('twitter_access_token_secret');
            
            this.addStatusMessage('🗑️ API ключи удалены', 'info');
            this.isAuthenticated = false;
            
            // Возвращаемся к экрану авторизации
            document.getElementById('authSection').style.display = 'block';
            document.getElementById('unfollowSection').style.display = 'none';
            document.getElementById('statusSection').style.display = 'none';
            
            this.addStatusMessage('🔐 Enter new API keys', 'info');
        }
    }

    /**
     * Enables demo mode for testing without API keys
     * This allows users to test the interface functionality
     */
    enableDemoMode() {
        this.isDemoMode = true;
        this.addStatusMessage('🧪 Demo mode enabled', 'success');
        this.addStatusMessage('📊 You can now test the interface functionality', 'info');
        
        // Show unfollow section
        this.showUnfollowSection();
        
        // Generate demo data
        this.followingCount = Math.floor(Math.random() * 1000) + 100;
        document.getElementById('followingCount').textContent = this.followingCount;
        this.addStatusMessage(`📊 Demo: ${this.followingCount} following accounts`, 'info');
    }

    /**
     * Tests alternative Twitter API endpoints to find available ones
     * This helps diagnose which API permissions are available
     */
    async testAlternativeEndpoints(twitterAPI) {
        const endpoints = [
            { name: 'Account Settings', method: 'GET', path: '/account/settings.json' },
            { name: 'Rate Limits', method: 'GET', path: '/application/rate_limit_status.json' },
            { name: 'User Timeline', method: 'GET', path: '/statuses/user_timeline.json', params: { count: 1 } },
            { name: 'Home Timeline', method: 'GET', path: '/statuses/home_timeline.json', params: { count: 1 } }
        ];

        for (const endpoint of endpoints) {
            try {
                this.addStatusMessage(`🔍 Testing: ${endpoint.name}`, 'info');
                
                if (endpoint.method === 'GET') {
                    if (endpoint.params) {
                        await twitterAPI.makeRequest('GET', endpoint.path, endpoint.params);
                    } else {
                        await twitterAPI.makeRequest('GET', endpoint.path);
                    }
                    this.addStatusMessage(`✅ ${endpoint.name} available!`, 'success');
                    return true; // Found working endpoint
                }
            } catch (error) {
                this.addStatusMessage(`❌ ${endpoint.name}: ${error.message}`, 'error');
            }
        }
        
        throw new Error('All test endpoints unavailable');
    }

    /**
     * Loads default demo API keys for testing purposes
     * These keys are for demonstration only and have limited access
     */
    loadDefaultKeys() {
        const defaultTokens = {
            apiKey: 'Zkt0eAercpIpBP8lqce6PsvJT',
            apiSecret: 'd2f0xygZiZ4umXKfWQ6ppViHJ5ktxW0j507Urj6jp0PtxjES9I',
            accessToken: '1909532946597285888-ozFUi5bVwrFhaxzbJyXpNW6HmKDUJW',
            accessTokenSecret: 'qshG6lXIqndxtF1MsMC5goFPQ1PfrIbbaf4IWZnf6f1Q6'
        };
        
        this.saveTokens(defaultTokens);
        this.addStatusMessage('🔑 Default API keys loaded', 'success');
        
        // Automatically proceed to testing
        this.isAuthenticated = true;
        this.showUnfollowSection();
        this.loadFollowingCount();
    }

}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = new TwitterUnfollowApp();
    
    // Для демонстрации можно включить тестовый режим
    // app.testMode();
    
    // Добавляем глобальную ссылку для отладки
    window.twitterApp = app;
});

/**
 * Shows help information about obtaining Twitter API keys
 * Displays step-by-step instructions for developers
 */
function showApiHelp() {
    const helpText = `
🔑 How to get Twitter API keys:

1. Go to https://developer.twitter.com/
2. Create a new application
3. Get the following keys:
   - Consumer Key (API Key)
   - Consumer Secret (API Secret)
   - Access Token
   - Access Token Secret

⚠️ IMPORTANT: For mass unfollowing, you need elevated API access!
   Free API keys have limited permissions and won't work for this tool.
   
💡 Alternative: Use demo mode to test the interface functionality.
    `;
    
    alert(helpText);
}

/**
 * Adds help button to the interface
 * Provides users with information about API requirements
 */
document.addEventListener('DOMContentLoaded', () => {
    const helpButton = document.createElement('button');
    helpButton.textContent = '❓ API Help';
    helpButton.className = 'btn btn-secondary';
    helpButton.style.marginTop = '20px';
    helpButton.onclick = showApiHelp;
    
    document.getElementById('authSection').appendChild(helpButton);
});
