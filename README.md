# Webook - Discord Webhook Interface

![Webook Screenshot](https://via.placeholder.com/800x450/7289da/ffffff?text=Webook+Preview)

A powerful, feature-rich web-based Discord webhook interface similar to Discohook. Manage multiple webhooks, compose messages with rich embeds, schedule deliveries, and automate message sending - all from your browser.

## ✨ Features

### 🎯 Core Features
- **Webhook Management**: Add, edit, and delete multiple Discord webhooks
- **Multiple Webhook Selection**: Send messages to multiple webhooks simultaneously
- **Message Editor**: Compose messages with custom username and avatar
- **Rich Embed Builder**: Create beautiful Discord embeds with titles, descriptions, colors, and footers
- **Real-time Preview**: See exactly how your message will look before sending
- **Message Templates**: Save and load message templates for reuse

### ⚡ Advanced Features
- **Message Looping**: Send messages repeatedly with configurable delay between sends
- **Random Delay**: Add ±50% random variation to loop delays for more natural timing
- **Message Variables**: Use dynamic variables like `{counter}`, `{timestamp}`, `{date}`, `{time}`, `{random}`
- **Message Pool**: Create a pool of messages to send sequentially
- **Random Identity**: Use random names and avatars from custom lists
- **Webhook Testing**: Test webhooks before sending actual messages
- **Bulk Webhook Import**: Import multiple webhooks at once from text
- **Message Scheduling**: Schedule messages for future delivery (once, daily, weekly, monthly)
- **Send History**: Track all sent messages with success/failure status
- **Import/Export**: Backup and restore your webhooks, saved messages, and history
- **Local Storage**: All data is stored locally in your browser
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Option 1: Run Locally (Recommended)
1. Clone or download this repository
2. Navigate to the project directory
3. Start a local HTTP server:
   ```bash
   # Using Python (any version)
   python -m http.server 8080
   
   # Using Node.js (if you have npm)
   npx serve .
   
   # Using PHP
   php -S localhost:8080
   ```
4. Open your browser and navigate to `http://localhost:8080`

### Option 2: Open Directly
Simply open `index.html` in your web browser (note: some features may be limited due to CORS restrictions).

## 📖 Complete Tutorial

### Step 1: Get Your Discord Webhook URL
1. Open Discord and go to your server
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **"New Webhook"** or select an existing one
4. Click **"Copy Webhook URL"**
5. The URL format should be: `https://discord.com/api/webhooks/...`

### Step 2: Add Your First Webhook
1. Open Webook in your browser
2. Click the **"Add Webhook"** button in the sidebar
3. Enter a name (e.g., "My Server Announcements")
4. Paste your Discord webhook URL
5. Click **"Save Webhook"**

### Step 3: Compose Your First Message
1. Select your webhook from the sidebar
2. Enter an optional username (defaults to "Webhook")
3. Add an optional avatar URL (supports any image URL)
4. Type your message in the content area
5. Use **"Preview"** to see how it will look in Discord

### Step 4: Add Rich Embeds
1. Click **"Add Embed"** in the Embed Builder section
2. Set a title, description, and color
3. Add footer text if desired
4. Click **"Save Embed"**
5. You can add multiple embeds to a single message

### Step 5: Send Your Message
1. Review your message in the preview panel
2. Click **"Send Message"**
3. Check your Discord channel - your message should appear!

## 🔧 Advanced Usage Guide

### Multiple Webhook Selection
1. Add multiple webhooks using the **"Add Webhook"** button
2. In the **"Advanced Controls"** section, check the webhooks you want to target
3. Use **"Select All"** / **"Deselect All"** for quick selection
4. Click **"Send Message"** to send to all selected webhooks simultaneously

### Message Looping (Automated Sending)
1. Set the **"Loop Count"** (1-100) - how many times to send the message
2. Set the **"Delay (ms)"** (0-60000) - delay between sends in milliseconds
3. Enable **"Random delay (±50%)"** for more natural timing
4. Select target webhooks
5. Click **"Start Loop"** to begin automated sending
6. Click **"Stop Loop"** to stop at any time
7. Monitor loop progress in the status indicator

### Message Variables
Use these variables in your message content:
- `{counter}` - Current loop iteration number
- `{timestamp}` - ISO timestamp (e.g., 2025-01-01T12:00:00.000Z)
- `{date}` - Current date (e.g., 01/01/2025)
- `{time}` - Current time (e.g., 12:00:00 PM)
- `{random}` - Random number between 0-999
- `{unixtime}` - Unix timestamp
- `{random_name}` - Random name from your list (when using Random Identity)
- `{random_avatar}` - Random avatar URL from your list

### Message Pool
1. Enable **"Use sequential message from pool"**
2. Click **"Add Current to Pool"** to save your current message to the pool
3. Click **"Manage Pool"** to view, load, or delete messages from the pool
4. When enabled, messages will be sent sequentially from the pool during loops

### Random Identity
1. Enable **"Use random name/avatar"**
2. Enter a list of names (one per line)
3. Enter a list of avatar URLs (one per line)
4. Each message will use a random name and avatar from your lists

### Message Scheduling
1. Click the **"Schedule"** button
2. Select date and time for delivery
3. Choose repeat frequency: Once, Daily, Weekly, or Monthly
4. Click **"Schedule"** - the message will be sent automatically at the specified time

### Bulk Webhook Import
1. Click the **"Bulk Import"** button
2. Paste webhooks in either format:
   - `Name:URL` (one per line)
   - Just URLs (will be named "Webhook 1", "Webhook 2", etc.)
3. Click **"Import"** to add all valid webhooks at once

## 💾 Data Management

### Local Storage
All data is stored locally in your browser's `localStorage`. This means:
- ✅ Your data stays on your computer
- ✅ No data is sent to any server except Discord
- ✅ No account or login required
- ⚠️ Clearing browser data will delete your saved webhooks and messages

### Backup & Restore
- **Export**: Click **"Export Config"** in the footer to download a backup file
- **Import**: Click **"Import Config"** to restore from a backup file
- **Export History**: Export your send history as JSON
- **Clear History**: Remove all send history entries

## 🔒 Security & Privacy

### What Webook Stores
- Webhook URLs (encrypted in localStorage)
- Saved message templates
- Message pool entries
- Random identity lists
- Send history
- Scheduled messages

### What Webook Does NOT Do
- ❌ Send data to any server except Discord
- ❌ Track or analyze your usage
- ❌ Require internet connection (except for sending messages)
- ❌ Store your Discord credentials

### Security Best Practices
1. Never share exported configuration files containing webhook URLs
2. Use different webhooks for different purposes
3. Regularly export your configuration as backup
4. Revoke webhook URLs if they're compromised

## 🖥️ Browser Compatibility

- **Chrome** 60+ (Recommended)
- **Firefox** 55+
- **Safari** 11+
- **Edge** 79+
- **Opera** 47+

## ⌨️ Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S` - Save current message
- `Ctrl+Enter` / `Cmd+Enter` - Send message
- `Ctrl+P` / `Cmd+P` - Preview message
- `Escape` - Close modal dialogs
- `Ctrl+Z` / `Cmd+Z` - Undo (in text fields)

## 🐛 Troubleshooting

### Common Issues & Solutions

#### "Failed to send message" Error
1. **Check internet connection** - Ensure you're online
2. **Verify webhook URL** - Make sure it's correct and hasn't been deleted in Discord
3. **Check Discord permissions** - Ensure the webhook has permission to send to the channel
4. **Review browser console** - Press F12 → Console for detailed error messages

#### Preview Not Updating
1. Ensure you've entered some content in the message editor
2. Try clicking the **"Preview"** button manually
3. Check browser console for JavaScript errors (F12 → Console)

#### Data Lost After Browser Clear
1. **Always export before clearing** - Use **"Export Config"** to backup
2. **Import after clearing** - Use **"Import Config"** to restore
3. **Consider browser sync** - Some browsers can sync localStorage data

#### Loop Not Stopping
1. Click **"Stop Loop"** button
2. If unresponsive, refresh the page (loops will be cancelled)
3. Check browser console for errors

## 🏗️ Project Structure

```
webook/
├── index.html          # Main HTML file
├── style.css           # Stylesheet (992 lines)
├── script.js           # Main JavaScript application (2084 lines)
├── README.md           # This documentation file
└── (optional assets)   # Future: icons, screenshots, etc.
```

### Technologies Used
- **HTML5** - Semantic markup and structure
- **CSS3** - Flexbox, Grid, CSS Variables, responsive design
- **Vanilla JavaScript (ES6+)** - No frameworks or dependencies
- **Font Awesome** - Icon library
- **Google Fonts** - Poppins and Roboto Mono fonts

### Development
No build process required - it's a pure client-side application. Simply edit the files and refresh your browser.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and structure
- Add comments for complex logic
- Test changes thoroughly
- Update documentation if needed

## 🆘 Support

- **GitHub Issues**: [Open an issue](https://github.com/yourusername/webook/issues) for bugs or feature requests
- **Documentation**: Check this README first
- **Community**: Join our Discord server (link coming soon)

## ⚠️ Disclaimer

**Webook** is a third-party tool and is **not affiliated with Discord Inc.** Use at your own risk. Always follow Discord's [Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).

---

**Made with ❤️ for the Discord community**

*Last updated: April 2025*
