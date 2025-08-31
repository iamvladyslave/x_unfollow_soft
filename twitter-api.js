/**
 * Twitter API Integration for Mass Unfollow Tool
 * 
 * Provides OAuth 1.0a authentication and API endpoints for Twitter
 * Supports both free and elevated API access levels
 * 
 * Features:
 * - OAuth 1.0a signature generation
 * - Rate limit handling
 * - CORS proxy support
 * - Error handling and fallbacks
 * 
 * @author Your Name
 * @version 1.0.0
 * @license MIT
 */

class TwitterAPI {
    constructor(credentials) {
        this.credentials = credentials;
        this.baseURL = 'https://api.twitter.com/1.1';
        // Use public CORS proxy
        this.corsProxy = 'https://cors-anywhere.herokuapp.com/';
        this.rateLimitRemaining = 1000;
        this.rateLimitReset = 0;
    }

    /**
     * Creates headers for API request
     */
    createHeaders(method, url, params) {
        // Use proper OAuth 1.0a implementation
        const oauth = new OAuth1(
            this.credentials.apiKey,
            this.credentials.apiSecret,
            this.credentials.accessToken,
            this.credentials.accessTokenSecret
        );
        
        const oauthHeader = oauth.createHeader(method, url, params);
        
        return {
            'Authorization': oauthHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }

    /**
     * Executes API request with rate limit handling
     */
    async makeRequest(method, endpoint, params = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = this.createHeaders(method, url, params);

        // Check rate limits
        if (this.rateLimitRemaining <= 0) {
            const waitTime = Math.max(0, this.rateLimitReset - Date.now() / 1000);
            if (waitTime > 0) {
                throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime)} seconds.`);
            }
        }

        try {
            // Use CORS proxy to bypass restrictions
            const proxyUrl = `${this.corsProxy}${url}`;
            
            console.log(`🌐 Sending request through proxy: ${method} ${endpoint}`);
            
            const response = await fetch(proxyUrl, {
                method: method,
                headers: headers,
                body: method === 'POST' ? new URLSearchParams(params) : undefined
            });

            // Update rate limit information
            this.updateRateLimits(response.headers);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Twitter API Error: ${errorData.errors?.[0]?.message || response.statusText}`);
            }

            const result = await response.json();
            console.log(`✅ API request successful: ${method} ${endpoint}`);
            return result;
            
        } catch (error) {
            console.error(`❌ API request error ${method} ${endpoint}:`, error);
            
            // If CORS proxy doesn't work, try alternatives
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                console.log('🔄 Trying alternative CORS proxy...');
                return this.makeRequestWithAlternativeProxy(method, endpoint, params, headers);
            }
            
            throw error;
        }
    }

    /**
     * Alternative CORS proxy
     */
    async makeRequestWithAlternativeProxy(method, endpoint, params, headers) {
        const alternativeProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://cors.bridged.cc/',
            'https://thingproxy.freeboard.io/fetch/'
        ];

        for (const proxy of alternativeProxies) {
            try {
                const url = `${this.baseURL}${endpoint}`;
                const proxyUrl = `${proxy}${url}`;
                
                console.log(`🔄 Trying proxy: ${proxy}`);
                
                const response = await fetch(proxyUrl, {
                    method: method,
                    headers: headers,
                    body: method === 'POST' ? new URLSearchParams(params) : undefined
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log(`✅ Alternative proxy worked: ${proxy}`);
                    return result;
                }
            } catch (proxyError) {
                console.warn(`⚠️ Прокси ${proxy} не сработал:`, proxyError.message);
                continue;
            }
        }
        
        throw new Error('Все CORS прокси недоступны. Используйте демо-режим.');
    }

    /**
     * Обновляет информацию о rate limits из заголовков ответа
     */
    updateRateLimits(headers) {
        const remaining = headers.get('x-rate-limit-remaining');
        const reset = headers.get('x-rate-limit-reset');
        
        if (remaining !== null) {
            this.rateLimitRemaining = parseInt(remaining);
        }
        
        if (reset !== null) {
            this.rateLimitReset = parseInt(reset);
        }
    }

    /**
     * Получает список подписок пользователя
     */
    async getFollowingList(userId = null, cursor = -1, count = 200) {
        const params = {
            count: count,
            cursor: cursor
        };

        if (userId) {
            params.user_id = userId;
        }

        const response = await this.makeRequest('GET', '/friends/list.json', params);
        return response;
    }

    /**
     * Отписывается от пользователя
     */
    async unfollowUser(userId) {
        const params = {
            user_id: userId
        };

        const response = await this.makeRequest('POST', '/friendships/destroy.json', params);
        return response;
    }

    /**
     * Получает информацию о пользователе
     */
    async getUserInfo(screenName = null, userId = null) {
        const params = {};
        
        if (screenName) {
            params.screen_name = screenName;
        } else if (userId) {
            params.user_id = userId;
        } else {
            params.include_entities = false;
        }

        const response = await this.makeRequest('GET', '/users/show.json', params);
        return response;
    }

    /**
     * Получает количество подписок
     */
    async getFollowingCount(screenName = null, userId = null) {
        const userInfo = await this.getUserInfo(screenName, userId);
        return userInfo.friends_count;
    }

    /**
     * Массовая отписка от всех подписок
     */
    async massUnfollowAll(progressCallback = null, delayMs = 1000) {
        let cursor = -1;
        let totalUnfollowed = 0;
        let hasMore = true;

        while (hasMore) {
            try {
                // Получаем список подписок
                const followingList = await this.getFollowingList(null, cursor);
                
                if (!followingList.users || followingList.users.length === 0) {
                    break;
                }

                // Отписываемся от каждого пользователя
                for (const user of followingList.users) {
                    try {
                        await this.unfollowUser(user.id);
                        totalUnfollowed++;
                        
                        if (progressCallback) {
                            progressCallback({
                                type: 'unfollow',
                                user: user,
                                count: totalUnfollowed,
                                success: true
                            });
                        }

                        // Задержка между запросами
                        if (delayMs > 0) {
                            await this.delay(delayMs);
                        }

                    } catch (error) {
                        if (progressCallback) {
                            progressCallback({
                                type: 'unfollow',
                                user: user,
                                count: totalUnfollowed,
                                success: false,
                                error: error.message
                            });
                        }
                    }
                }

                // Проверяем, есть ли еще страницы
                cursor = followingList.next_cursor;
                hasMore = cursor !== 0;

            } catch (error) {
                if (error.message.includes('Rate limit')) {
                    // Ждем сброса rate limit
                    const waitTime = Math.max(0, this.rateLimitReset - Date.now() / 1000);
                    if (progressCallback) {
                        progressCallback({
                            type: 'rate_limit_wait',
                            waitTime: waitTime
                        });
                    }
                    await this.delay(waitTime * 1000);
                } else {
                    throw error;
                }
            }
        }

        return totalUnfollowed;
    }

    /**
     * Задержка между запросами
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TwitterAPI;
} else {
    window.TwitterAPI = TwitterAPI;
}
