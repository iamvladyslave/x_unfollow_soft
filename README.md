# 🐦 Twitter Mass Unfollow Tool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Twitter API](https://img.shields.io/badge/Twitter%20API-v1.1-blue.svg)](https://developer.twitter.com/)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/yourusername)

> A professional tool for mass unfollowing Twitter accounts with a modern cyberpunk interface

## ✨ Features

- 🔐 **OAuth 1.0a Authentication** - Secure Twitter API integration
- 🚀 **Mass Unfollow** - Unfollow all accounts with one click
- 🧪 **Demo Mode** - Test interface without API keys
- 📊 **Real-time Progress** - Live tracking of unfollow operations
- 🎨 **Modern UI** - Cyberpunk-inspired dark theme with neon accents
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Secure** - Local token storage, no external data transmission

## 🛠️ Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Quick Start
1. Clone the repository:
```bash
git clone https://github.com/iamvladyslave/twitter-mass-unfollow.git
cd twitter-mass-unfollow
```

2. Start a local server:
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

3. Open `http://localhost:8000` in your browser

## 🔑 API Configuration

### Free API (Limited)
- Basic authentication only
- Demo mode functionality
- No access to user data

### Elevated Access (Recommended)
- Full API functionality
- Requires Twitter Developer approval
- Access to user data and actions

### Enterprise API (Full)
- Unlimited access
- Paid service
- Professional support

## 📋 Usage

### 1. Demo Mode
- Click "🧪 Enable Demo Mode"
- Test interface functionality
- No API keys required

### 2. Real API
- Click "Authenticate with Twitter"
- Enter your API keys
- Test API connection
- Use mass unfollow feature

### 3. Mass Unfollow
- Confirm account count
- Click "🚨 Unfollow ALL"
- Monitor progress in real-time
- View operation status

## 🏗️ Architecture

```
├── index.html          # Main interface
├── style.css           # Cyberpunk styling
├── script.js           # Application logic
├── twitter-api.js      # Twitter API integration
├── oauth.js           # OAuth 1.0a implementation
└── README.md          # Documentation
```

### Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: OAuth 1.0a (RFC 5849)
- **API**: Twitter API v1.1
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Animations**: CSS Keyframes, Transforms

## 🔧 Development

### Project Structure
```
twitter-mass-unfollow/
├── src/                    # Source files
│   ├── js/                # JavaScript modules
│   ├── css/               # Stylesheets
│   └── assets/            # Images and resources
├── docs/                   # Documentation
├── screenshots/            # UI screenshots
└── examples/               # Usage examples
```

### Building
```bash
# Install dependencies (if any)
npm install

# Build project
npm run build

# Start development server
npm run dev
```

### Code Style
- ES6+ JavaScript
- CSS Custom Properties
- Semantic HTML
- Accessibility compliance
- Mobile-first responsive design

## 🧪 Testing

### Manual Testing
1. **Demo Mode**: Test without API keys
2. **API Integration**: Test with real keys
3. **Error Handling**: Test various error scenarios
4. **Responsive Design**: Test on different devices

### Browser Compatibility
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 📚 API Reference

### Twitter API Endpoints
- `GET /users/show.json` - Get user information
- `GET /friends/list.json` - Get following list
- `POST /friendships/destroy.json` - Unfollow user
- `GET /account/settings.json` - Account settings

### OAuth Parameters
- `oauth_consumer_key` - API Key
- `oauth_token` - Access Token
- `oauth_signature_method` - HMAC-SHA1
- `oauth_timestamp` - Unix timestamp
- `oauth_nonce` - Random string

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- [Twitter Developer Platform](https://developer.twitter.com/) for API access
- [OAuth 1.0a RFC 5849](https://tools.ietf.org/html/rfc5849) for authentication
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) for theming
- [Monospace Fonts](https://fonts.google.com/specimen/Source+Code+Pro) for code aesthetics

---

**Made with ❤️ by [iamvladyslave](https://github.com/iamvladyslave)**

*If this project helps you, please give it a ⭐ star on GitHub!*
