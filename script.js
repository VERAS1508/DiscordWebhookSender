// Webook - Discord Webhook Interface
// Main application state and functionality

class WebookApp {
    constructor() {
        this.webhooks = [];
        this.savedMessages = [];
        this.embeds = [];
        this.currentWebhook = null;
        this.currentEmbedIndex = null;
        
        // Message pool state
        this.messagePoolIndex = 0;
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.renderWebhooks();
        this.renderSavedMessages();
        this.updatePreview();
        this.renderWebhookCheckboxes();
        
        // Loop state
        this.isLooping = false;
        this.currentLoop = null;
        this.loopIteration = 0;
        this.totalLoops = 0;
    }

    // Storage management
    loadFromStorage() {
        const savedWebhooks = localStorage.getItem('webook_webhooks');
        const savedMessages = localStorage.getItem('webook_messages');
        
        if (savedWebhooks) {
            this.webhooks = JSON.parse(savedWebhooks);
        }
        
        if (savedMessages) {
            this.savedMessages = JSON.parse(savedMessages);
        }
    }

    saveToStorage() {
        localStorage.setItem('webook_webhooks', JSON.stringify(this.webhooks));
        localStorage.setItem('webook_messages', JSON.stringify(this.savedMessages));
    }

    // Event binding
    bindEvents() {
        // Webhook management
        document.getElementById('addWebhookBtn').addEventListener('click', () => this.showWebhookModal());
        document.getElementById('saveWebhookBtn').addEventListener('click', () => this.saveWebhook());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideWebhookModal());
        
        // Embed management
        document.getElementById('addEmbedBtn').addEventListener('click', () => this.showEmbedModal());
        document.getElementById('clearEmbedsBtn').addEventListener('click', () => this.clearEmbeds());
        document.getElementById('saveEmbedBtn').addEventListener('click', () => this.saveEmbed());
        document.getElementById('cancelEmbedBtn').addEventListener('click', () => this.hideEmbedModal());
        
        // Message actions
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('previewBtn').addEventListener('click', () => this.updatePreview());
        document.getElementById('saveMessageBtn').addEventListener('click', () => this.saveCurrentMessage());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearEditor());
        
        // Real-time preview updates
        ['username', 'avatarUrl', 'content'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updatePreview());
        });
        
    // Footer actions
    document.getElementById('exportBtn').addEventListener('click', (e) => {
        e.preventDefault();
        this.exportConfig();
    });
    
    document.getElementById('importBtn').addEventListener('click', (e) => {
        e.preventDefault();
        this.importConfig();
    });
    
    document.getElementById('helpBtn').addEventListener('click', (e) => {
        e.preventDefault();
        this.showHelp();
    });
    
    document.getElementById('githubBtn').addEventListener('click', (e) => {
        e.preventDefault();
        this.openGitHub();
    });
        
        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Advanced controls events
        document.getElementById('loopSendBtn').addEventListener('click', () => this.startLoop());
        document.getElementById('stopLoopBtn').addEventListener('click', () => this.stopLoop());
        document.getElementById('selectAllBtn').addEventListener('click', () => this.selectAllWebhooks());
        document.getElementById('deselectAllBtn').addEventListener('click', () => this.deselectAllWebhooks());
        
        // Update webhook checkboxes when webhooks change
        this.updateWebhookCheckboxes();
        
        // New feature event listeners
        document.getElementById('useMessagePool').addEventListener('change', (e) => {
            document.getElementById('messagePoolControls').style.display = e.target.checked ? 'block' : 'none';
            this.updatePoolInfo();
        });
        
        document.getElementById('useRandomIdentity').addEventListener('change', (e) => {
            document.getElementById('randomIdentityControls').style.display = e.target.checked ? 'block' : 'none';
            this.loadRandomIdentityData();
        });
        
        document.getElementById('addToPoolBtn').addEventListener('click', () => this.addCurrentToPool());
        document.getElementById('managePoolBtn').addEventListener('click', () => this.manageMessagePool());
        
        // Load saved data
        this.loadMessagePool();
        this.loadRandomIdentityData();
        this.updatePoolInfo();
    }

    // Webhook management
    showWebhookModal(webhook = null) {
        const modal = document.getElementById('webhookModal');
        const nameInput = document.getElementById('webhookName');
        const urlInput = document.getElementById('webhookUrl');
        
        if (webhook) {
            nameInput.value = webhook.name;
            urlInput.value = webhook.url;
            this.currentWebhook = webhook;
        } else {
            nameInput.value = '';
            urlInput.value = '';
            this.currentWebhook = null;
        }
        
        modal.classList.add('active');
        nameInput.focus();
    }

    hideWebhookModal() {
        document.getElementById('webhookModal').classList.remove('active');
        this.currentWebhook = null;
    }

    saveWebhook() {
        const name = document.getElementById('webhookName').value.trim();
        const url = document.getElementById('webhookUrl').value.trim();
        
        if (!name || !url) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }
        
        if (!this.isValidWebhookUrl(url)) {
            this.showAlert('Please enter a valid Discord webhook URL', 'error');
            return;
        }
        
        if (this.currentWebhook) {
            // Update existing webhook
            this.currentWebhook.name = name;
            this.currentWebhook.url = url;
        } else {
            // Add new webhook
            const webhook = {
                id: Date.now().toString(),
                name,
                url,
                createdAt: new Date().toISOString()
            };
            this.webhooks.push(webhook);
        }
        
        this.saveToStorage();
        this.renderWebhooks();
        this.hideWebhookModal();
        this.showAlert('Webhook saved successfully!', 'success');
    }

    isValidWebhookUrl(url) {
        return url.startsWith('https://discord.com/api/webhooks/') || 
               url.startsWith('https://discordapp.com/api/webhooks/');
    }

    deleteWebhook(id) {
        if (confirm('Are you sure you want to delete this webhook?')) {
            this.webhooks = this.webhooks.filter(wh => wh.id !== id);
            this.saveToStorage();
            this.renderWebhooks();
            this.showAlert('Webhook deleted', 'info');
        }
    }

    selectWebhook(webhook) {
        // Remove active class from all webhooks
        document.querySelectorAll('.webhook-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected webhook
        const element = document.querySelector(`[data-webhook-id="${webhook.id}"]`);
        if (element) {
            element.classList.add('active');
        }
        
        this.currentWebhook = webhook;
        this.showAlert(`Selected webhook: ${webhook.name}`, 'info');
    }

    renderWebhooks() {
        const container = document.getElementById('webhookList');
        
        if (this.webhooks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <p>No webhooks added yet</p>
                    <p class="small">Click "Add Webhook" to get started</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.webhooks.map(webhook => `
            <div class="webhook-item" data-webhook-id="${webhook.id}">
                <div class="webhook-name">${this.escapeHtml(webhook.name)}</div>
                <div class="webhook-url">${this.escapeHtml(webhook.url)}</div>
                <div class="webhook-actions">
                    <button class="edit-btn" onclick="app.editWebhook('${webhook.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="app.deleteWebhook('${webhook.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add click event to select webhook
        container.querySelectorAll('.webhook-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.webhook-actions')) {
                    const id = item.dataset.webhookId;
                    const webhook = this.webhooks.find(wh => wh.id === id);
                    if (webhook) this.selectWebhook(webhook);
                }
            });
        });
    }

    editWebhook(id) {
        const webhook = this.webhooks.find(wh => wh.id === id);
        if (webhook) {
            this.showWebhookModal(webhook);
        }
    }

    // Embed management
    showEmbedModal(embedIndex = null) {
        const modal = document.getElementById('embedModal');
        const titleInput = document.getElementById('embedTitle');
        const descInput = document.getElementById('embedDescription');
        const colorInput = document.getElementById('embedColor');
        const footerInput = document.getElementById('embedFooter');
        
        if (embedIndex !== null && this.embeds[embedIndex]) {
            const embed = this.embeds[embedIndex];
            titleInput.value = embed.title || '';
            descInput.value = embed.description || '';
            colorInput.value = embed.color || '#5865F2';
            footerInput.value = embed.footer || '';
            this.currentEmbedIndex = embedIndex;
        } else {
            titleInput.value = '';
            descInput.value = '';
            colorInput.value = '#5865F2';
            footerInput.value = '';
            this.currentEmbedIndex = null;
        }
        
        modal.classList.add('active');
        titleInput.focus();
    }

    hideEmbedModal() {
        document.getElementById('embedModal').classList.remove('active');
        this.currentEmbedIndex = null;
    }

    saveEmbed() {
        const title = document.getElementById('embedTitle').value.trim();
        const description = document.getElementById('embedDescription').value.trim();
        const color = document.getElementById('embedColor').value;
        const footer = document.getElementById('embedFooter').value.trim();
        
        const embed = {
            title: title || null,
            description: description || null,
            color,
            footer: footer || null,
            timestamp: new Date().toISOString()
        };
        
        if (this.currentEmbedIndex !== null) {
            // Update existing embed
            this.embeds[this.currentEmbedIndex] = embed;
        } else {
            // Add new embed
            this.embeds.push(embed);
        }
        
        this.renderEmbeds();
        this.hideEmbedModal();
        this.updatePreview();
        this.showAlert('Embed saved successfully!', 'success');
    }

    deleteEmbed(index) {
        this.embeds.splice(index, 1);
        this.renderEmbeds();
        this.updatePreview();
        this.showAlert('Embed deleted', 'info');
    }

    clearEmbeds() {
        if (this.embeds.length > 0 && confirm('Clear all embeds?')) {
            this.embeds = [];
            this.renderEmbeds();
            this.updatePreview();
            this.showAlert('All embeds cleared', 'info');
        }
    }

    renderEmbeds() {
        const container = document.getElementById('embedList');
        
        if (this.embeds.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-layer-group"></i><p>No embeds added</p></div>';
            return;
        }
        
        container.innerHTML = this.embeds.map((embed, index) => `
            <div class="embed-item" style="border-left-color: ${embed.color}">
                <div class="embed-item-header">
                    <div style="display: flex; align-items: center;">
                        <div class="embed-color" style="background-color: ${embed.color}"></div>
                        <div class="embed-title">${embed.title || 'Untitled Embed'}</div>
                    </div>
                    <div class="embed-actions">
                        <button class="edit-btn" onclick="app.showEmbedModal(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="app.deleteEmbed(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${embed.description ? `<div class="embed-description">${this.escapeHtml(embed.description.substring(0, 100))}${embed.description.length > 100 ? '...' : ''}</div>` : ''}
                ${embed.footer ? `<div class="embed-footer">${this.escapeHtml(embed.footer)}</div>` : ''}
            </div>
        `).join('');
    }

    // Message sending
    async sendMessage() {
        if (!this.currentWebhook) {
            this.showAlert('Please select a webhook first', 'error');
            return;
        }
        
        const username = document.getElementById('username').value.trim();
        const avatarUrl = document.getElementById('avatarUrl').value.trim();
        const content = document.getElementById('content').value.trim();
        
        if (!content && this.embeds.length === 0) {
            this.showAlert('Please enter message content or add an embed', 'error');
            return;
        }
        
        const payload = {
            username: username || undefined,
            avatar_url: avatarUrl || undefined,
            content: content || undefined,
            embeds: this.embeds.length > 0 ? this.embeds.map(embed => ({
                title: embed.title,
                description: embed.description,
                color: parseInt(embed.color.replace('#', ''), 16),
                footer: embed.footer ? { text: embed.footer } : undefined,
                timestamp: embed.timestamp
            })) : undefined
        };
        
        // Remove undefined values
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined) {
                delete payload[key];
            }
        });
        
        if (payload.embeds) {
            payload.embeds.forEach(embed => {
                Object.keys(embed).forEach(key => {
                    if (embed[key] === undefined) {
                        delete embed[key];
                    }
                });
            });
        }
        
        const sendBtn = document.getElementById('sendBtn');
        const originalText = sendBtn.innerHTML;
        sendBtn.innerHTML = '<span class="loading"></span> Sending...';
        sendBtn.disabled = true;
        
        try {
            const response = await fetch(this.currentWebhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                this.showAlert('Message sent successfully!', 'success');
                // Add to recent messages
                this.addToRecentMessages(payload);
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showAlert(`Failed to send message: ${error.message}`, 'error');
        } finally {
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
        }
    }

    addToRecentMessages(payload) {
        const message = {
            id: Date.now().toString(),
            username: payload.username || 'Webhook',
            content: payload.content || '(Embed only)',
            embeds: payload.embeds || [],
            sentAt: new Date().toISOString()
        };
        
        this.savedMessages.unshift(message);
        if (this.savedMessages.length > 10) {
            this.savedMessages = this.savedMessages.slice(0, 10);
        }
        
        this.saveToStorage();
        this.renderSavedMessages();
    }

    // Message management
    saveCurrentMessage() {
        const username = document.getElementById('username').value.trim();
        const avatarUrl = document.getElementById('avatarUrl').value.trim();
        const content = document.getElementById('content').value.trim();
        
        if (!content && this.embeds.length === 0) {
            this.showAlert('Please enter message content or add an embed', 'error');
            return;
        }
        
        const name = prompt('Enter a name for this message:');
        if (!name) return;
        
        const message = {
            id: Date.now().toString(),
            name,
            username: username || undefined,
            avatarUrl: avatarUrl || undefined,
            content: content || undefined,
            embeds: [...this.embeds],
            savedAt: new Date().toISOString()
        };
        
        this.savedMessages.unshift(message);
        this.saveToStorage();
        this.renderSavedMessages();
        this.showAlert('Message saved successfully!', 'success');
    }

    loadMessage(message) {
        document.getElementById('username').value = message.username || '';
        document.getElementById('avatarUrl').value = message.avatarUrl || '';
        document.getElementById('content').value = message.content || '';
        this.embeds = message.embeds ? [...message.embeds] : [];
        
        this.renderEmbeds();
        this.updatePreview();
        this.showAlert(`Loaded message: ${message.name}`, 'info');
    }

    deleteMessage(id) {
        if (confirm('Are you sure you want to delete this saved message?')) {
            this.savedMessages = this.savedMessages.filter(msg => msg.id !== id);
            this.saveToStorage();
            this.renderSavedMessages();
            this.showAlert('Message deleted', 'info');
        }
    }

    renderSavedMessages() {
        const container = document.getElementById('savedMessages');
        
        if (this.savedMessages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-alt"></i>
                    <p>No saved messages</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.savedMessages.map(message => `
            <div class="message-item" data-message-id="${message.id}">
                <div class="webhook-name">${this.escapeHtml(message.name)}</div>
                <div class="webhook-url">${message.content ? this.escapeHtml(message.content.substring(0, 50)) + (message.content.length > 50 ? '...' : '') : '(Embed only)'}</div>
                <div class="webhook-actions">
                    <button class="edit-btn" onclick="app.loadMessageFromSaved('${message.id}')">
                        <i class="fas fa-upload"></i>
                    </button>
                    <button class="delete-btn" onclick="app.deleteMessage('${message.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadMessageFromSaved(id) {
        const message = this.savedMessages.find(msg => msg.id === id);
        if (message) {
            this.loadMessage(message);
        }
    }

    clearEditor() {
        if (confirm('Clear all message content?')) {
            document.getElementById('username').value = '';
            document.getElementById('avatarUrl').value = '';
            document.getElementById('content').value = '';
            this.embeds = [];
            this.renderEmbeds();
            this.updatePreview();
            this.showAlert('Editor cleared', 'info');
        }
    }

    // Preview
    updatePreview() {
        const container = document.getElementById('previewContainer');
        const username = document.getElementById('username').value.trim();
        const avatarUrl = document.getElementById('avatarUrl').value.trim();
        const content = document.getElementById('content').value.trim();
        
        if (!username && !content && this.embeds.length === 0) {
            container.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-comment-slash"></i>
                    <p>Message preview will appear here</p>
                    <p class="small">Edit the message to see a preview</p>
                </div>
            `;
            return;
        }
        
        let previewHtml = `
            <div class="preview-message">
                <div class="preview-header">
                    <div class="preview-avatar" style="background: ${avatarUrl ? `url('${this.escapeHtml(avatarUrl)}') center/cover` : '#7289da'}"></div>
                    <div class="preview-username">${this.escapeHtml(username || 'Webhook')}</div>
                </div>
        `;
        
        if (content) {
            previewHtml += `
                <div class="preview-content">${this.escapeHtml(content).replace(/\n/g, '<br>')}</div>
            `;
        }
        
        if (this.embeds.length > 0) {
            this.embeds.forEach(embed => {
                previewHtml += `
                    <div class="preview-embed" style="border-left-color: ${embed.color}">
                        ${embed.title ? `<div class="embed-preview-title">${this.escapeHtml(embed.title)}</div>` : ''}
                        ${embed.description ? `<div class="embed-preview-description">${this.escapeHtml(embed.description).replace(/\n/g, '<br>')}</div>` : ''}
                        ${embed.footer ? `<div class="embed-preview-footer">${this.escapeHtml(embed.footer)}</div>` : ''}
                    </div>
                `;
            });
        }
        
        previewHtml += '</div>';
        container.innerHTML = previewHtml;
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${this.escapeHtml(message)}</span>
        `;
        
        document.querySelector('.container').insertBefore(alert, document.querySelector('footer'));
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    // Import/Export
    exportConfig() {
        const config = {
            webhooks: this.webhooks,
            savedMessages: this.savedMessages,
            version: '1.0',
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(config, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `webook-config-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showAlert('Configuration exported successfully!', 'success');
    }

    importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const config = JSON.parse(event.target.result);
                    
                    if (!config.webhooks || !config.savedMessages) {
                        throw new Error('Invalid configuration file');
                    }
                    
                    if (confirm('This will replace your current webhooks and saved messages. Continue?')) {
                        this.webhooks = config.webhooks;
                        this.savedMessages = config.savedMessages;
                        this.saveToStorage();
                        this.renderWebhooks();
                        this.renderSavedMessages();
                        this.showAlert('Configuration imported successfully!', 'success');
                    }
                } catch (error) {
                    this.showAlert(`Failed to import configuration: ${error.message}`, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    showHelp() {
        const helpMessage = `
            <h3>Webook Help</h3>
            <p><strong>Getting Started:</strong></p>
            <ol>
                <li>Click "Add Webhook" to add your Discord webhook URL</li>
                <li>Select a webhook from the list to use it</li>
                <li>Compose your message in the editor</li>
                <li>Use the embed builder for rich embeds</li>
                <li>Click "Send Message" to send</li>
            </ol>
            <p><strong>Advanced Features:</strong></p>
            <ul>
                <li><strong>Multiple Webhook Selection:</strong> Check multiple webhooks to send to all at once</li>
                <li><strong>Message Looping:</strong> Send messages repeatedly with configurable delay</li>
                <li><strong>Loop Count:</strong> Set how many times to send the message</li>
                <li><strong>Delay Control:</strong> Set delay between sends in milliseconds</li>
                <li><strong>Select All/Deselect All:</strong> Quickly select or deselect all webhooks</li>
            </ul>
            <p><strong>Note:</strong> All data is stored locally in your browser.</p>
        `;
        
        alert(helpMessage.replace(/<[^>]*>/g, ''));
    }

    openGitHub() {
        window.open('https://github.com/VERAS1508/DiscordWebhookSender', '_blank');
    }

    showWelcomeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <h2><i class="fas fa-robot"></i> Welcome to Webook!</h2>
                <div style="margin: 20px 0;">
                    <p><strong>Webook is a powerful Discord webhook interface with these key features:</strong></p>
                    <ul style="margin: 15px 0; padding-left: 20px;">
                        <li>📝 <strong>Message Editor</strong> - Compose messages with custom username and avatar</li>
                        <li>🎨 <strong>Rich Embeds</strong> - Create beautiful Discord embeds with colors and footers</li>
                        <li>🔄 <strong>Message Looping</strong> - Send messages repeatedly with configurable delays</li>
                        <li>📊 <strong>Multiple Webhooks</strong> - Send to multiple Discord channels simultaneously</li>
                        <li>💾 <strong>Local Storage</strong> - All data stays on your computer</li>
                        <li>⏰ <strong>Scheduling</strong> - Schedule messages for future delivery</li>
                    </ul>
                    
                    <div style="background: rgba(114, 137, 218, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h3 style="margin-top: 0; color: #7289da;">Quick Start Guide</h3>
                        <ol style="margin: 10px 0; padding-left: 20px;">
                            <li>Click <strong>"Add Webhook"</strong> to add your Discord webhook URL</li>
                            <li>Select a webhook from the sidebar</li>
                            <li>Compose your message in the editor</li>
                            <li>Use <strong>"Preview"</strong> to see how it will look</li>
                            <li>Click <strong>"Send Message"</strong> to send to Discord</li>
                        </ol>
                    </div>
                    
                    <div style="font-size: 0.9rem; color: #888; margin-top: 20px;">
                        <p><strong>💡 Tip:</strong> All your data is stored locally in your browser. Use the <strong>"Export Config"</strong> button to backup your settings.</p>
                        <p><strong>🔒 Privacy:</strong> Webook only sends data to Discord - no third-party servers or tracking.</p>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-primary" id="getStartedBtn">Get Started</button>
                    <button class="btn btn-secondary" id="viewTutorialBtn">View Tutorial</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('#getStartedBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            // Auto-open webhook modal for first-time users
            setTimeout(() => {
                app.showWebhookModal();
            }, 300);
        });
        
        modal.querySelector('#viewTutorialBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            app.showHelp();
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Multiple webhook selection
    renderWebhookCheckboxes() {
        const container = document.getElementById('webhookTargets');
        
        if (this.webhooks.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-link"></i>
                    <p>No webhooks added yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.webhooks.map(webhook => `
            <div class="checkbox-item">
                <input type="checkbox" id="wh-${webhook.id}" value="${webhook.id}">
                <label for="wh-${webhook.id}">
                    <div>${this.escapeHtml(webhook.name)}</div>
                    <div class="checkbox-url">${this.escapeHtml(webhook.url)}</div>
                </label>
            </div>
        `).join('');
    }

    updateWebhookCheckboxes() {
        this.renderWebhookCheckboxes();
    }

    getSelectedWebhooks() {
        const selected = [];
        this.webhooks.forEach(webhook => {
            const checkbox = document.getElementById(`wh-${webhook.id}`);
            if (checkbox && checkbox.checked) {
                selected.push(webhook);
            }
        });
        return selected;
    }

    selectAllWebhooks() {
        this.webhooks.forEach(webhook => {
            const checkbox = document.getElementById(`wh-${webhook.id}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        this.showAlert('All webhooks selected', 'info');
    }

    deselectAllWebhooks() {
        this.webhooks.forEach(webhook => {
            const checkbox = document.getElementById(`wh-${webhook.id}`);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
        this.showAlert('All webhooks deselected', 'info');
    }

    // Message looping functionality - Enhanced to support message pool and random identity
    async startLoop() {
        const loopCount = parseInt(document.getElementById('loopCount').value);
        const delayMs = parseInt(document.getElementById('delayMs').value);
        const useRandomDelay = document.getElementById('randomDelay').checked;
        
        if (isNaN(loopCount) || loopCount < 1 || loopCount > 100) {
            this.showAlert('Please enter a valid loop count (1-100)', 'error');
            return;
        }
        
        if (isNaN(delayMs) || delayMs < 0 || delayMs > 60000) {
            this.showAlert('Please enter a valid delay (0-60000 ms)', 'error');
            return;
        }
        
        const selectedWebhooks = this.getSelectedWebhooks();
        if (selectedWebhooks.length === 0) {
            this.showAlert('Please select at least one webhook', 'error');
            return;
        }
        
        // Check if we should use message pool
        const useMessagePool = document.getElementById('useMessagePool').checked;
        const useRandomIdentity = document.getElementById('useRandomIdentity').checked;
        
        // Validate that we have something to send
        if (!useMessagePool) {
            const username = document.getElementById('username').value.trim();
            const avatarUrl = document.getElementById('avatarUrl').value.trim();
            const content = document.getElementById('content').value.trim();
            
            if (!content && this.embeds.length === 0) {
                this.showAlert('Please enter message content or add an embed', 'error');
                return;
            }
        } else {
            // Check message pool
            if (this.messagePool.length === 0) {
                this.showAlert('Message pool is empty! Add messages to pool first.', 'error');
                return;
            }
        }
        
        // Start loop
        this.isLooping = true;
        this.loopIteration = 0;
        this.totalLoops = loopCount;
        
        // Update UI
        document.getElementById('loopSendBtn').disabled = true;
        document.getElementById('stopLoopBtn').disabled = false;
        document.getElementById('sendBtn').disabled = true;
        
        // Show loop status
        this.showLoopStatus();
        
        // Loop function
        const loopFunction = async () => {
            if (!this.isLooping || this.loopIteration >= this.totalLoops) {
                this.stopLoop();
                return;
            }
            
            this.loopIteration++;
            this.updateLoopStatus();
            
            // Get message for this iteration
            let message;
            if (useMessagePool) {
                message = this.getNextMessageFromPool();
                if (!message) {
                    this.showAlert(`Loop ${this.loopIteration}/${this.totalLoops}: No message available from pool`, 'error');
                    this.scheduleNextLoop(loopFunction, delayMs, useRandomDelay);
                    return;
                }
            } else {
                const username = document.getElementById('username').value.trim();
                const avatarUrl = document.getElementById('avatarUrl').value.trim();
                const content = document.getElementById('content').value.trim();
                
                message = {
                    username: username || undefined,
                    avatarUrl: avatarUrl || undefined,
                    content: content || undefined,
                    embeds: [...this.embeds]
                };
            }
            
            // Get random identity if enabled
            let randomIdentity = null;
            if (useRandomIdentity) {
                randomIdentity = this.getRandomIdentity();
            }
            
            // Process variables in content
            const processedContent = message.content ? this.processVariables(message.content, randomIdentity) : undefined;
            
            // Use random identity if available
            const finalUsername = randomIdentity?.username || message.username;
            const finalAvatarUrl = randomIdentity?.avatarUrl || message.avatarUrl;
            
            const payload = {
                username: finalUsername || undefined,
                avatar_url: finalAvatarUrl || undefined,
                content: processedContent || undefined,
                embeds: message.embeds && message.embeds.length > 0 ? message.embeds.map(embed => ({
                    title: embed.title ? this.processVariables(embed.title, randomIdentity) : undefined,
                    description: embed.description ? this.processVariables(embed.description, randomIdentity) : undefined,
                    color: parseInt(embed.color?.replace('#', '') || '5865F2', 16),
                    footer: embed.footer ? { text: this.processVariables(embed.footer, randomIdentity) } : undefined,
                    timestamp: embed.timestamp
                })) : undefined
            };
            
            // Remove undefined values
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });
            
            if (payload.embeds) {
                payload.embeds.forEach(embed => {
                    Object.keys(embed).forEach(key => {
                        if (embed[key] === undefined) {
                            delete embed[key];
                        }
                    });
                });
            }
            
            // Final check: payload must have content or embeds
            if (!payload.content && (!payload.embeds || payload.embeds.length === 0)) {
                this.showAlert(`Loop ${this.loopIteration}/${this.totalLoops}: Message has no content or embeds`, 'error');
                this.scheduleNextLoop(loopFunction, delayMs, useRandomDelay);
                return;
            }
            
            // Send to all selected webhooks
            const promises = selectedWebhooks.map(async (webhook) => {
                try {
                    const response = await fetch(webhook.url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }
                    
                    // Add to history
                    this.addToHistory({
                        success: true,
                        webhook: webhook.name,
                        message: processedContent || '(Embed only)',
                        timestamp: new Date().toISOString(),
                        randomIdentity: useRandomIdentity ? true : false,
                        fromPool: useMessagePool ? true : false,
                        loopIteration: this.loopIteration
                    });
                    
                    return { success: true, webhook: webhook.name };
                } catch (error) {
                    // Add to history
                    this.addToHistory({
                        success: false,
                        webhook: webhook.name,
                        message: processedContent || '(Embed only)',
                        error: error.message,
                        timestamp: new Date().toISOString(),
                        randomIdentity: useRandomIdentity ? true : false,
                        fromPool: useMessagePool ? true : false,
                        loopIteration: this.loopIteration
                    });
                    
                    return { success: false, webhook: webhook.name, error: error.message };
                }
            });
            
            // Wait for all sends to complete
            const results = await Promise.all(promises);
            
            // Check results
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            if (failed > 0) {
                this.showAlert(`Loop ${this.loopIteration}/${this.totalLoops}: ${successful} successful, ${failed} failed`, 'error');
            } else {
                this.showAlert(`Loop ${this.loopIteration}/${this.totalLoops}: Sent to ${successful} webhook(s)`, 'success');
            }
            
            // Schedule next iteration if still looping
            if (this.isLooping && this.loopIteration < this.totalLoops) {
                this.scheduleNextLoop(loopFunction, delayMs, useRandomDelay);
            } else {
                this.stopLoop();
            }
        };
        
        // Start first iteration
        this.currentLoop = setTimeout(loopFunction, 0);
    }

    scheduleNextLoop(loopFunction, baseDelay, useRandomDelay) {
        if (!this.isLooping) return;
        
        let actualDelay = baseDelay;
        if (useRandomDelay) {
            // Add ±50% random variation
            const variation = baseDelay * 0.5;
            actualDelay = baseDelay - variation + Math.random() * (2 * variation);
            actualDelay = Math.max(0, Math.min(60000, actualDelay)); // Clamp to 0-60000
        }
        
        this.currentLoop = setTimeout(loopFunction, actualDelay);
    }

    stopLoop() {
        this.isLooping = false;
        
        if (this.currentLoop) {
            clearTimeout(this.currentLoop);
            this.currentLoop = null;
        }
        
        // Update UI
        document.getElementById('loopSendBtn').disabled = false;
        document.getElementById('stopLoopBtn').disabled = true;
        document.getElementById('sendBtn').disabled = false;
        
        // Remove loop status
        this.removeLoopStatus();
        
        this.showAlert(`Loop stopped. Sent ${this.loopIteration} of ${this.totalLoops} iterations.`, 'info');
    }

    showLoopStatus() {
        // Remove existing status
        this.removeLoopStatus();
        
        const status = document.createElement('div');
        status.className = 'loop-status';
        status.id = 'loopStatus';
        status.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>Looping: ${this.loopIteration}/${this.totalLoops}</span>
            <div class="loop-counter">Active</div>
        `;
        
        const advancedControls = document.querySelector('.advanced-controls');
        advancedControls.appendChild(status);
    }

    updateLoopStatus() {
        const status = document.getElementById('loopStatus');
        if (status) {
            status.querySelector('span').textContent = `Looping: ${this.loopIteration}/${this.totalLoops}`;
        }
    }

    removeLoopStatus() {
        const status = document.getElementById('loopStatus');
        if (status && status.parentNode) {
            status.parentNode.removeChild(status);
        }
    }

    // Enhanced send message to support multiple webhooks
    async sendToMultipleWebhooks() {
        const selectedWebhooks = this.getSelectedWebhooks();
        
        if (selectedWebhooks.length === 0) {
            // Fall back to single webhook mode
            if (!this.currentWebhook) {
                this.showAlert('Please select a webhook first', 'error');
                return;
            }
            selectedWebhooks.push(this.currentWebhook);
        }
        
        const username = document.getElementById('username').value.trim();
        const avatarUrl = document.getElementById('avatarUrl').value.trim();
        const content = document.getElementById('content').value.trim();
        
        if (!content && this.embeds.length === 0) {
            this.showAlert('Please enter message content or add an embed', 'error');
            return;
        }
        
        // Process variables in content
        const processedContent = this.processVariables(content);
        
        const payload = {
            username: username || undefined,
            avatar_url: avatarUrl || undefined,
            content: processedContent || undefined,
            embeds: this.embeds.length > 0 ? this.embeds.map(embed => ({
                title: embed.title ? this.processVariables(embed.title) : undefined,
                description: embed.description ? this.processVariables(embed.description) : undefined,
                color: parseInt(embed.color.replace('#', ''), 16),
                footer: embed.footer ? { text: this.processVariables(embed.footer) } : undefined,
                timestamp: embed.timestamp
            })) : undefined
        };
        
        // Remove undefined values
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined) {
                delete payload[key];
            }
        });
        
        if (payload.embeds) {
            payload.embeds.forEach(embed => {
                Object.keys(embed).forEach(key => {
                    if (embed[key] === undefined) {
                        delete embed[key];
                    }
                });
            });
        }
        
        const sendBtn = document.getElementById('sendBtn');
        const originalText = sendBtn.innerHTML;
        sendBtn.innerHTML = `<span class="loading"></span> Sending to ${selectedWebhooks.length} webhook(s)...`;
        sendBtn.disabled = true;
        
        try {
            const promises = selectedWebhooks.map(async (webhook) => {
                try {
                    const response = await fetch(webhook.url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }
                    
                    // Add to history
                    this.addToHistory({
                        success: true,
                        webhook: webhook.name,
                        message: processedContent || '(Embed only)',
                        timestamp: new Date().toISOString()
                    });
                    
                    return { success: true, webhook: webhook.name };
                } catch (error) {
                    // Add to history
                    this.addToHistory({
                        success: false,
                        webhook: webhook.name,
                        message: processedContent || '(Embed only)',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                    
                    return { success: false, webhook: webhook.name, error: error.message };
                }
            });
            
            const results = await Promise.all(promises);
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            if (failed > 0) {
                this.showAlert(`Sent to ${successful} webhook(s), ${failed} failed`, 'error');
            } else {
                this.showAlert(`Successfully sent to ${successful} webhook(s)!`, 'success');
            }
            
            // Add to recent messages
            this.addToRecentMessages(payload);
            
        } catch (error) {
            console.error('Error sending messages:', error);
            this.showAlert(`Failed to send messages: ${error.message}`, 'error');
        } finally {
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
        }
    }

    // Process message variables
    processVariables(text) {
        if (!text) return text;
        
        const now = new Date();
        const variables = {
            '{counter}': this.loopIteration || 1,
            '{timestamp}': now.toISOString(),
            '{date}': now.toLocaleDateString(),
            '{time}': now.toLocaleTimeString(),
            '{random}': Math.floor(Math.random() * 1000),
            '{unixtime}': Math.floor(now.getTime() / 1000)
        };
        
        let processed = text;
        Object.keys(variables).forEach(key => {
            processed = processed.replace(new RegExp(key, 'g'), variables[key]);
        });
        
        return processed;
    }

    // Send history
    addToHistory(entry) {
        let history = JSON.parse(localStorage.getItem('webook_history') || '[]');
        history.unshift(entry);
        
        // Keep only last 50 entries
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem('webook_history', JSON.stringify(history));
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        const history = JSON.parse(localStorage.getItem('webook_history') || '[]');
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-history"></i>
                    <p>No send history yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = history.map(entry => `
            <div class="history-item ${entry.success ? 'success' : 'error'}">
                <div class="history-time">${new Date(entry.timestamp).toLocaleTimeString()}</div>
                <div class="history-webhook">${this.escapeHtml(entry.webhook)}</div>
                <div class="history-message">${this.escapeHtml(entry.message.substring(0, 50))}${entry.message.length > 50 ? '...' : ''}</div>
                ${!entry.success ? `<div class="history-error" style="color: #f04747; font-size: 0.75rem;">${this.escapeHtml(entry.error)}</div>` : ''}
            </div>
        `).join('');
    }

    clearHistory() {
        if (confirm('Clear all send history?')) {
            localStorage.removeItem('webook_history');
            this.renderHistory();
            this.showAlert('History cleared', 'info');
        }
    }

    exportHistory() {
        const history = JSON.parse(localStorage.getItem('webook_history') || '[]');
        const dataStr = JSON.stringify(history, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `webook-history-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showAlert('History exported successfully!', 'success');
    }

    // Webhook testing
    async testWebhook() {
        const selectedWebhooks = this.getSelectedWebhooks();
        
        if (selectedWebhooks.length === 0) {
            if (!this.currentWebhook) {
                this.showAlert('Please select a webhook first', 'error');
                return;
            }
            selectedWebhooks.push(this.currentWebhook);
        }
        
        const testBtn = document.getElementById('testWebhookBtn');
        const originalText = testBtn.innerHTML;
        testBtn.innerHTML = '<span class="loading"></span> Testing...';
        testBtn.disabled = true;
        
        try {
            const results = [];
            for (const webhook of selectedWebhooks) {
                try {
                    const response = await fetch(webhook.url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            content: '✅ Webhook test successful! This is a test message from Webook.',
                            username: 'Webook Test',
                            avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
                        })
                    });
                    
                    if (response.ok) {
                        results.push({ success: true, webhook: webhook.name });
                    } else {
                        const errorText = await response.text();
                        results.push({ success: false, webhook: webhook.name, error: `HTTP ${response.status}: ${errorText}` });
                    }
                } catch (error) {
                    results.push({ success: false, webhook: webhook.name, error: error.message });
                }
            }
            
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            if (failed > 0) {
                const failedList = results.filter(r => !r.success).map(r => `${r.webhook}: ${r.error}`).join('\n');
                this.showAlert(`Test results: ${successful} successful, ${failed} failed. Check console for details.`, 'error');
                console.log('Failed webhook tests:', results.filter(r => !r.success));
            } else {
                this.showAlert(`All ${successful} webhook(s) tested successfully!`, 'success');
            }
            
        } catch (error) {
            console.error('Error testing webhooks:', error);
            this.showAlert(`Failed to test webhooks: ${error.message}`, 'error');
        } finally {
            testBtn.innerHTML = originalText;
            testBtn.disabled = false;
        }
    }

    // Bulk webhook import
    bulkImportWebhooks() {
        const input = document.createElement('textarea');
        input.className = 'bulk-textarea';
        input.placeholder = 'Paste webhooks here (one per line or name:url format)\nExample:\nMy Server:https://discord.com/api/webhooks/...\nAnother Server:https://discord.com/api/webhooks/...';
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-file-import"></i> Bulk Import Webhooks</h2>
                <div class="form-group">
                    <label>Webhook List</label>
                    ${input.outerHTML}
                    <div class="bulk-format">
                        Format: Name:URL (one per line) or just URLs
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="cancelBulkBtn">Cancel</button>
                    <button class="btn btn-primary" id="importBulkBtn">Import</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus the textarea
        setTimeout(() => {
            modal.querySelector('textarea').focus();
        }, 100);
        
        // Add event listeners
        modal.querySelector('#cancelBulkBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#importBulkBtn').addEventListener('click', () => {
            const text = modal.querySelector('textarea').value.trim();
            if (!text) {
                this.showAlert('Please enter webhook data', 'error');
                return;
            }
            
            const lines = text.split('\n').filter(line => line.trim());
            let imported = 0;
            let skipped = 0;
            
            lines.forEach(line => {
                let name, url;
                
                if (line.includes(':')) {
                    const parts = line.split(':');
                    name = parts[0].trim();
                    url = parts.slice(1).join(':').trim();
                } else {
                    name = `Webhook ${this.webhooks.length + 1}`;
                    url = line.trim();
                }
                
                if (this.isValidWebhookUrl(url)) {
                    const webhook = {
                        id: Date.now().toString() + Math.random(),
                        name,
                        url,
                        createdAt: new Date().toISOString()
                    };
                    this.webhooks.push(webhook);
                    imported++;
                } else {
                    skipped++;
                }
            });
            
            if (imported > 0) {
                this.saveToStorage();
                this.renderWebhooks();
                this.updateWebhookCheckboxes();
                this.showAlert(`Imported ${imported} webhook(s)${skipped > 0 ? `, skipped ${skipped} invalid` : ''}`, 'success');
            } else {
                this.showAlert('No valid webhooks found to import', 'error');
            }
            
            document.body.removeChild(modal);
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Message scheduling
    scheduleMessage() {
        const selectedWebhooks = this.getSelectedWebhooks();
        
        if (selectedWebhooks.length === 0) {
            if (!this.currentWebhook) {
                this.showAlert('Please select a webhook first', 'error');
                return;
            }
            selectedWebhooks.push(this.currentWebhook);
        }
        
        const username = document.getElementById('username').value.trim();
        const avatarUrl = document.getElementById('avatarUrl').value.trim();
        const content = document.getElementById('content').value.trim();
        
        if (!content && this.embeds.length === 0) {
            this.showAlert('Please enter message content or add an embed', 'error');
            return;
        }
        
        // Create schedule modal
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-clock"></i> Schedule Message</h2>
                <div class="form-group">
                    <label for="scheduleDate">Date</label>
                    <input type="date" id="scheduleDate" value="${now.toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="scheduleTime">Time (24h)</label>
                    <input type="time" id="scheduleTime" value="${currentTime}">
                </div>
                <div class="form-group">
                    <label for="scheduleRepeat">Repeat</label>
                    <select id="scheduleRepeat">
                        <option value="once">Once</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="cancelScheduleBtn">Cancel</button>
                    <button class="btn btn-primary" id="saveScheduleBtn">Schedule</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('#cancelScheduleBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#saveScheduleBtn').addEventListener('click', () => {
            const date = modal.querySelector('#scheduleDate').value;
            const time = modal.querySelector('#scheduleTime').value;
            const repeat = modal.querySelector('#scheduleRepeat').value;
            
            if (!date || !time) {
                this.showAlert('Please select date and time', 'error');
                return;
            }
            
            const scheduleTime = new Date(`${date}T${time}`);
            const now = new Date();
            
            if (scheduleTime < now) {
                this.showAlert('Schedule time must be in the future', 'error');
                return;
            }
            
            const delay = scheduleTime.getTime() - now.getTime();
            
            // Prepare payload
            const payload = {
                username: username || undefined,
                avatar_url: avatarUrl || undefined,
                content: content || undefined,
                embeds: this.embeds.length > 0 ? this.embeds.map(embed => ({
                    title: embed.title,
                    description: embed.description,
                    color: parseInt(embed.color.replace('#', ''), 16),
                    footer: embed.footer ? { text: embed.footer } : undefined,
                    timestamp: embed.timestamp
                })) : undefined
            };
            
            // Remove undefined values
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });
            
            if (payload.embeds) {
                payload.embeds.forEach(embed => {
                    Object.keys(embed).forEach(key => {
                        if (embed[key] === undefined) {
                            delete embed[key];
                        }
                    });
                });
            }
            
            // Schedule the message
            const scheduleId = `schedule_${Date.now()}`;
            const schedule = {
                id: scheduleId,
                webhooks: selectedWebhooks.map(wh => ({ name: wh.name, url: wh.url })),
                payload,
                scheduleTime: scheduleTime.toISOString(),
                repeat,
                createdAt: new Date().toISOString()
            };
            
            // Save schedule
            let schedules = JSON.parse(localStorage.getItem('webook_schedules') || '[]');
            schedules.push(schedule);
            localStorage.setItem('webook_schedules', JSON.stringify(schedules));
            
            // Set timeout
            const timeoutId = setTimeout(async () => {
                await this.executeScheduledMessage(schedule);
                
                // Handle repeats
                if (repeat !== 'once') {
                    this.rescheduleMessage(schedule);
                }
            }, delay);
            
            // Store timeout reference
            this.scheduledTimeouts = this.scheduledTimeouts || {};
            this.scheduledTimeouts[scheduleId] = timeoutId;
            
            this.showAlert(`Message scheduled for ${scheduleTime.toLocaleString()} (${repeat})`, 'success');
            document.body.removeChild(modal);
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    async executeScheduledMessage(schedule) {
        const promises = schedule.webhooks.map(async (webhook) => {
            try {
                const response = await fetch(webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(schedule.payload)
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                return { success: true, webhook: webhook.name };
            } catch (error) {
                return { success: false, webhook: webhook.name, error: error.message };
            }
        });
        
        const results = await Promise.all(promises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        // Add to history
        this.addToHistory({
            success: failed === 0,
            webhook: schedule.webhooks.map(wh => wh.name).join(', '),
            message: schedule.payload.content || '(Embed only)',
            timestamp: new Date().toISOString(),
            scheduled: true
        });
        
        if (failed > 0) {
            console.log('Scheduled message failed for some webhooks:', results.filter(r => !r.success));
        }
    }

    rescheduleMessage(schedule) {
        const now = new Date();
        const lastTime = new Date(schedule.scheduleTime);
        let nextTime;
        
        switch (schedule.repeat) {
            case 'daily':
                nextTime = new Date(lastTime);
                nextTime.setDate(nextTime.getDate() + 1);
                break;
            case 'weekly':
                nextTime = new Date(lastTime);
                nextTime.setDate(nextTime.getDate() + 7);
                break;
            case 'monthly':
                nextTime = new Date(lastTime);
                nextTime.setMonth(nextTime.getMonth() + 1);
                break;
            default:
                return;
        }
        
        const delay = nextTime.getTime() - now.getTime();
        
        if (delay > 0) {
            const timeoutId = setTimeout(async () => {
                await this.executeScheduledMessage(schedule);
                this.rescheduleMessage(schedule);
            }, delay);
            
            // Update schedule time
            schedule.scheduleTime = nextTime.toISOString();
            let schedules = JSON.parse(localStorage.getItem('webook_schedules') || '[]');
            schedules = schedules.map(s => s.id === schedule.id ? schedule : s);
            localStorage.setItem('webook_schedules', JSON.stringify(schedules));
            
            // Update timeout reference
            this.scheduledTimeouts[schedule.id] = timeoutId;
        }
    }

    // Message Pool functionality
    loadMessagePool() {
        const pool = localStorage.getItem('webook_message_pool');
        this.messagePool = pool ? JSON.parse(pool) : [];
    }

    saveMessagePool() {
        localStorage.setItem('webook_message_pool', JSON.stringify(this.messagePool));
    }

    addCurrentToPool() {
        const username = document.getElementById('username').value.trim();
        const avatarUrl = document.getElementById('avatarUrl').value.trim();
        const content = document.getElementById('content').value.trim();
        
        if (!content && this.embeds.length === 0) {
            this.showAlert('Please enter message content or add an embed', 'error');
            return;
        }
        
        const message = {
            id: Date.now().toString(),
            username: username || undefined,
            avatarUrl: avatarUrl || undefined,
            content: content || undefined,
            embeds: [...this.embeds],
            addedAt: new Date().toISOString()
        };
        
        this.messagePool.push(message);
        this.saveMessagePool();
        this.updatePoolInfo();
        this.showAlert('Message added to pool!', 'success');
    }

    updatePoolInfo() {
        const poolInfo = document.getElementById('poolInfo');
        if (poolInfo) {
            poolInfo.textContent = `Pool: ${this.messagePool.length} message(s)`;
        }
    }

    manageMessagePool() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-layer-group"></i> Manage Message Pool</h2>
                <div class="pool-list" id="poolList">
                    ${this.messagePool.length === 0 ? 
                        '<div class="empty-state small"><i class="fas fa-inbox"></i><p>Message pool is empty</p></div>' : 
                        this.messagePool.map((msg, index) => `
                            <div class="pool-item">
                                <div class="pool-item-content">${msg.content ? this.escapeHtml(msg.content.substring(0, 50)) + (msg.content.length > 50 ? '...' : '') : '(Embed only)'}</div>
                                ${msg.embeds && msg.embeds.length > 0 ? 
                                    `<div class="pool-item-embeds">${msg.embeds.length} embed(s)</div>` : ''}
                                <div class="pool-item-actions">
                                    <button class="load-pool-btn" data-index="${index}" title="Load">
                                        <i class="fas fa-upload"></i>
                                    </button>
                                    <button class="delete-pool-btn" data-index="${index}" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="closePoolBtn">Close</button>
                    <button class="btn btn-danger" id="clearPoolBtn">Clear Pool</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('#closePoolBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#clearPoolBtn').addEventListener('click', () => {
            if (confirm('Clear all messages from pool?')) {
                this.messagePool = [];
                this.saveMessagePool();
                this.updatePoolInfo();
                document.body.removeChild(modal);
                this.showAlert('Message pool cleared', 'info');
            }
        });
        
        // Load message from pool
        modal.querySelectorAll('.load-pool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                const message = this.messagePool[index];
                this.loadMessageFromPool(message);
                document.body.removeChild(modal);
            });
        });
        
        // Delete message from pool
        modal.querySelectorAll('.delete-pool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                if (confirm('Delete this message from pool?')) {
                    this.messagePool.splice(index, 1);
                    this.saveMessagePool();
                    this.updatePoolInfo();
                    this.manageMessagePool(); // Refresh modal
                    this.showAlert('Message removed from pool', 'info');
                }
            });
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    loadMessageFromPool(message) {
        document.getElementById('username').value = message.username || '';
        document.getElementById('avatarUrl').value = message.avatarUrl || '';
        document.getElementById('content').value = message.content || '';
        this.embeds = message.embeds ? [...message.embeds] : [];
        
        this.renderEmbeds();
        this.updatePreview();
        this.showAlert('Message loaded from pool', 'info');
    }

    getNextMessageFromPool() {
        if (this.messagePool.length === 0) {
            return null;
        }
        // Get the next message in sequence
        const message = {...this.messagePool[this.messagePoolIndex]};
        
        // Increment index for next call, wrap around if at end
        this.messagePoolIndex = (this.messagePoolIndex + 1) % this.messagePool.length;
        
        return message;
    }

    // Random Identity functionality
    loadRandomIdentityData() {
        const names = localStorage.getItem('webook_random_names');
        const avatars = localStorage.getItem('webook_random_avatars');
        
        if (names) {
            document.getElementById('randomNames').value = names;
        }
        
        if (avatars) {
            document.getElementById('randomAvatars').value = avatars;
        }
    }

    saveRandomIdentityData() {
        const names = document.getElementById('randomNames').value.trim();
        const avatars = document.getElementById('randomAvatars').value.trim();
        
        localStorage.setItem('webook_random_names', names);
        localStorage.setItem('webook_random_avatars', avatars);
    }

    getRandomIdentity() {
        const namesText = document.getElementById('randomNames').value.trim();
        const avatarsText = document.getElementById('randomAvatars').value.trim();
        
        const names = namesText.split('\n').filter(name => name.trim());
        const avatars = avatarsText.split('\n').filter(avatar => avatar.trim());
        
        let username = null;
        let avatarUrl = null;
        
        if (names.length > 0) {
            username = names[Math.floor(Math.random() * names.length)].trim();
        }
        
        if (avatars.length > 0) {
            avatarUrl = avatars[Math.floor(Math.random() * avatars.length)].trim();
        }
        
        return { username, avatarUrl };
    }

    // Enhanced processVariables with random identity support
    processVariables(text, randomIdentity = null) {
        if (!text) return text;
        
        const now = new Date();
        const variables = {
            '{counter}': this.loopIteration || 1,
            '{timestamp}': now.toISOString(),
            '{date}': now.toLocaleDateString(),
            '{time}': now.toLocaleTimeString(),
            '{random}': Math.floor(Math.random() * 1000),
            '{unixtime}': Math.floor(now.getTime() / 1000)
        };
        
        // Add random identity variables if available
        if (randomIdentity) {
            if (randomIdentity.username) {
                variables['{random_name}'] = randomIdentity.username;
            }
            if (randomIdentity.avatarUrl) {
                variables['{random_avatar}'] = randomIdentity.avatarUrl;
            }
        }
        
        let processed = text;
        Object.keys(variables).forEach(key => {
            processed = processed.replace(new RegExp(key, 'g'), variables[key]);
        });
        
        return processed;
    }

    // Enhanced sendToMultipleWebhooks with new features
    async sendToMultipleWebhooksEnhanced() {
        const selectedWebhooks = this.getSelectedWebhooks();
        
        if (selectedWebhooks.length === 0) {
            if (!this.currentWebhook) {
                this.showAlert('Please select a webhook first', 'error');
                return;
            }
            selectedWebhooks.push(this.currentWebhook);
        }
        
        // Check if we should use message pool
        const useMessagePool = document.getElementById('useMessagePool').checked;
        const useRandomIdentity = document.getElementById('useRandomIdentity').checked;
        
        let message;
        if (useMessagePool) {
            message = this.getNextMessageFromPool();
            if (!message) {
                this.showAlert('Message pool is empty!', 'error');
                return;
            }
            // Check if message from pool has content or embeds
            if (!message.content && (!message.embeds || message.embeds.length === 0)) {
                this.showAlert('Selected message from pool has no content or embeds', 'error');
                return;
            }
        } else {
            const username = document.getElementById('username').value.trim();
            const avatarUrl = document.getElementById('avatarUrl').value.trim();
            const content = document.getElementById('content').value.trim();
            
            if (!content && this.embeds.length === 0) {
                this.showAlert('Please enter message content or add an embed', 'error');
                return;
            }
            
            message = {
                username: username || undefined,
                avatarUrl: avatarUrl || undefined,
                content: content || undefined,
                embeds: [...this.embeds]
            };
        }
        
        // Get random identity if enabled
        let randomIdentity = null;
        if (useRandomIdentity) {
            randomIdentity = this.getRandomIdentity();
            this.saveRandomIdentityData();
        }
        
        // Process variables in content
        const processedContent = message.content ? this.processVariables(message.content, randomIdentity) : undefined;
        
        // Use random identity if available
        const finalUsername = randomIdentity?.username || message.username;
        const finalAvatarUrl = randomIdentity?.avatarUrl || message.avatarUrl;
        
        const payload = {
            username: finalUsername || undefined,
            avatar_url: finalAvatarUrl || undefined,
            content: processedContent || undefined,
            embeds: message.embeds && message.embeds.length > 0 ? message.embeds.map(embed => ({
                title: embed.title ? this.processVariables(embed.title, randomIdentity) : undefined,
                description: embed.description ? this.processVariables(embed.description, randomIdentity) : undefined,
                color: parseInt(embed.color?.replace('#', '') || '5865F2', 16),
                footer: embed.footer ? { text: this.processVariables(embed.footer, randomIdentity) } : undefined,
                timestamp: embed.timestamp
            })) : undefined
        };
        
        // Remove undefined values
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined) {
                delete payload[key];
            }
        });
        
        if (payload.embeds) {
            payload.embeds.forEach(embed => {
                Object.keys(embed).forEach(key => {
                    if (embed[key] === undefined) {
                        delete embed[key];
                    }
                });
            });
        }
        
        // Final check: payload must have content or embeds
        if (!payload.content && (!payload.embeds || payload.embeds.length === 0)) {
            this.showAlert('Message has no content or embeds to send', 'error');
            return;
        }
        
        const sendBtn = document.getElementById('sendBtn');
        const originalText = sendBtn.innerHTML;
        sendBtn.innerHTML = `<span class="loading"></span> Sending to ${selectedWebhooks.length} webhook(s)...`;
        sendBtn.disabled = true;
        
        try {
            const promises = selectedWebhooks.map(async (webhook) => {
                try {
                    const response = await fetch(webhook.url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }
                    
                    // Add to history
                    this.addToHistory({
                        success: true,
                        webhook: webhook.name,
                        message: processedContent || '(Embed only)',
                        timestamp: new Date().toISOString(),
                        randomIdentity: useRandomIdentity ? true : false,
                        fromPool: useMessagePool ? true : false
                    });
                    
                    return { success: true, webhook: webhook.name };
                } catch (error) {
                    // Add to history
                    this.addToHistory({
                        success: false,
                        webhook: webhook.name,
                        message: processedContent || '(Embed only)',
                        error: error.message,
                        timestamp: new Date().toISOString(),
                        randomIdentity: useRandomIdentity ? true : false,
                        fromPool: useMessagePool ? true : false
                    });
                    
                    return { success: false, webhook: webhook.name, error: error.message };
                }
            });
            
            const results = await Promise.all(promises);
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            if (failed > 0) {
                this.showAlert(`Sent to ${successful} webhook(s), ${failed} failed`, 'error');
            } else {
                this.showAlert(`Successfully sent to ${successful} webhook(s)!`, 'success');
            }
            
            // Add to recent messages if not from pool
            if (!useMessagePool) {
                this.addToRecentMessages(payload);
            }
            
        } catch (error) {
            console.error('Error sending messages:', error);
            this.showAlert(`Failed to send messages: ${error.message}`, 'error');
        } finally {
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
        }
    }
}

// Initialize the application
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new WebookApp();
    window.app = app; // Make app available globally for inline event handlers
    
    // Override the original sendMessage to use enhanced version
    document.getElementById('sendBtn').addEventListener('click', () => {
        app.sendToMultipleWebhooksEnhanced();
    });
    
    // Add event listeners for new features
    document.getElementById('testWebhookBtn').addEventListener('click', () => {
        app.testWebhook();
    });
    
    document.getElementById('scheduleBtn').addEventListener('click', () => {
        app.scheduleMessage();
    });
    
    document.getElementById('bulkImportBtn').addEventListener('click', () => {
        app.bulkImportWebhooks();
    });
    
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        app.clearHistory();
    });
    
    document.getElementById('exportHistoryBtn').addEventListener('click', () => {
        app.exportHistory();
    });
    
    // Load history on startup
    app.renderHistory();
    
    // Show welcome modal for first-time users
    setTimeout(() => {
        if (!localStorage.getItem('webook_welcome_shown')) {
            app.showWelcomeModal();
            localStorage.setItem('webook_welcome_shown', 'true');
        }
    }, 1000);
});
