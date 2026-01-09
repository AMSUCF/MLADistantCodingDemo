/**
 * Main Application Controller
 * Handles routing, view rendering, and initialization
 */

const App = {
    // Current view state
    currentView: 'home',
    autoSaveInterval: null,

    /**
     * Initialize the application
     */
    init() {
        // Initialize storage with default data
        Storage.initialize();

        // Update hit counter display
        this.updateHitCounter();
        this.updateMarqueeHits();

        // Set up router
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());

        // Initialize effects
        Effects.init();

        // Handle initial route
        this.handleRoute();

        console.log('~*~ App Initialized ~*~');
    },

    /**
     * Handle route changes
     */
    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const [route, queryString] = hash.split('?');
        const params = new URLSearchParams(queryString || '');

        // Clear any auto-save interval
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }

        // Route to appropriate view
        switch (route) {
            case 'home':
                this.renderHome();
                break;
            case 'posts':
                this.renderPostList(params);
                break;
            case 'post':
                this.renderPost(params.get('id'));
                break;
            case 'new':
                this.renderEditor();
                break;
            case 'edit':
                this.renderEditor(params.get('id'));
                break;
            case 'guestbook':
                this.renderGuestbook();
                break;
            default:
                this.render404();
        }

        this.currentView = route;
        this.updateActiveNav(route);
    },

    /**
     * Update active navigation highlight
     */
    updateActiveNav(route) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('href') === '#' + route) {
                btn.classList.add('active');
            }
        });
    },

    /**
     * Update hit counter display
     */
    updateHitCounter() {
        const count = Storage.getHitCount();
        const countStr = count.toString().padStart(5, '0');
        const container = document.getElementById('hit-counter');
        if (container) {
            container.innerHTML = countStr.split('').map(d =>
                `<span class="counter-digit">${d}</span>`
            ).join('');
        }
    },

    /**
     * Update marquee hit count
     */
    updateMarqueeHits() {
        const count = Storage.getHitCount();
        const el = document.getElementById('marquee-hits');
        if (el) {
            el.textContent = count.toString().padStart(4, '0');
        }
    },

    /**
     * Render home page
     */
    renderHome() {
        const config = Storage.getConfig();
        const recentPosts = PostManager.getRecent(3);

        let postsHtml = '';
        if (recentPosts.length === 0) {
            postsHtml = `
                <div class="no-posts">
                    <p>No posts yet! <a href="#new">Create your first post!</a></p>
                </div>
            `;
        } else {
            postsHtml = recentPosts.map(post => this.renderPostCard(post)).join('');
        }

        const html = `
            <div class="home-view">
                <div class="welcome-box">
                    <h2 class="welcome-title rainbow-text">★ Welcome 2 My Page! ★</h2>
                    <div class="welcome-content">
                        <p>Hey there!!! Thanks 4 visiting my homepage!!!</p>
                        <p>This is where I post all my thoughts, cool links, and random stuff! Feel free 2 look around and dont forget 2 sign my <a href="#guestbook">guestbook</a>!!!</p>
                        <p class="blink">>>> Check out my latest posts below! <<<</p>
                    </div>
                </div>

                <hr class="rainbow-hr">

                <div class="recent-posts">
                    <h2 class="section-title">
                        <span class="title-star bounce">★</span>
                        Recent Posts
                        <span class="title-star bounce">★</span>
                    </h2>
                    <div class="posts-list">
                        ${postsHtml}
                    </div>
                    ${recentPosts.length > 0 ? '<p class="view-all"><a href="#posts" class="link-btn">View All Posts >>></a></p>' : ''}
                </div>
            </div>
        `;

        document.getElementById('content').innerHTML = html;
    },

    /**
     * Render post list
     */
    renderPostList(params) {
        const filterTag = params.get('tag');
        const filterCategory = params.get('category');

        let posts = PostManager.getAll();
        let filterText = '';

        if (filterTag) {
            posts = PostManager.getByTag(filterTag);
            filterText = `Showing posts tagged: "${filterTag}"`;
        } else if (filterCategory) {
            posts = PostManager.getByCategory(filterCategory);
            const cat = PostManager.getCategories().find(c => c.id === filterCategory);
            filterText = `Showing posts in: "${cat ? cat.name : filterCategory}"`;
        }

        const tags = PostManager.getAllTags();
        const categories = PostManager.getCategories();
        const categoryCounts = PostManager.getCategoryCounts();

        let postsHtml = '';
        if (posts.length === 0) {
            postsHtml = `
                <div class="no-posts">
                    <p>No posts found! ${filterTag || filterCategory ? '<a href="#posts">Clear filter</a>' : '<a href="#new">Create your first post!</a>'}</p>
                </div>
            `;
        } else {
            postsHtml = posts.map(post => this.renderPostCard(post)).join('');
        }

        const html = `
            <div class="posts-view">
                <h2 class="page-title">
                    <span class="title-star spin">★</span>
                    All Posts
                    <span class="title-star spin">★</span>
                </h2>

                ${filterText ? `<p class="filter-text">${filterText} <a href="#posts">[clear]</a></p>` : ''}

                <div class="filter-section">
                    <div class="filter-group">
                        <span class="filter-label">Categories:</span>
                        ${categories.map(cat => `
                            <a href="#posts?category=${cat.id}" class="filter-btn ${filterCategory === cat.id ? 'active' : ''}">
                                ${cat.icon} ${cat.name} (${categoryCounts[cat.id] || 0})
                            </a>
                        `).join('')}
                    </div>
                    ${tags.length > 0 ? `
                        <div class="filter-group">
                            <span class="filter-label">Tags:</span>
                            ${tags.map(tag => `
                                <a href="#posts?tag=${tag}" class="tag-btn ${filterTag === tag ? 'active' : ''}">#${tag}</a>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <hr class="rainbow-hr">

                <div class="posts-list">
                    ${postsHtml}
                </div>
            </div>
        `;

        document.getElementById('content').innerHTML = html;
    },

    /**
     * Render a post card for lists
     */
    renderPostCard(post) {
        const excerpt = PostManager.getExcerpt(post.content);
        const date = PostManager.formatDate(post.createdAt);
        const category = PostManager.getCategories().find(c => c.id === post.category);

        return `
            <article class="post-card">
                <div class="post-header">
                    <h3 class="post-title">
                        <a href="#post?id=${post.id}">${this.escapeHtml(post.title)}</a>
                    </h3>
                    <span class="post-category">${category ? category.icon + ' ' + category.name : ''}</span>
                </div>
                <div class="post-meta">
                    <span class="meta-date">📅 ${date}</span>
                    ${post.mood ? `<span class="meta-mood">Mood: ${post.mood}</span>` : ''}
                </div>
                <p class="post-excerpt">${this.escapeHtml(excerpt)}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        ${post.tags.map(tag => `<a href="#posts?tag=${tag}" class="tag">#${tag}</a>`).join(' ')}
                    </div>
                    <a href="#post?id=${post.id}" class="read-more">Read More >>></a>
                </div>
            </article>
        `;
    },

    /**
     * Render single post view
     */
    renderPost(id) {
        const post = PostManager.getById(id);

        if (!post) {
            this.render404('Post not found!');
            return;
        }

        const date = PostManager.formatDate(post.createdAt);
        const updatedDate = post.updatedAt !== post.createdAt ? PostManager.formatDate(post.updatedAt) : null;
        const category = PostManager.getCategories().find(c => c.id === post.category);

        // Convert newlines to <br> for display
        const contentHtml = this.escapeHtml(post.content).replace(/\n/g, '<br>');

        const html = `
            <div class="post-view">
                <article class="post-full">
                    <header class="post-header-full">
                        <h2 class="post-title-full rainbow-text">${this.escapeHtml(post.title)}</h2>
                        <div class="post-meta-full">
                            <span class="meta-author">By: ${this.escapeHtml(post.author)}</span>
                            <span class="meta-date">📅 ${date}</span>
                            ${updatedDate ? `<span class="meta-updated">(Updated: ${updatedDate})</span>` : ''}
                        </div>
                        <div class="post-meta-extra">
                            ${category ? `<span class="meta-category">${category.icon} ${category.name}</span>` : ''}
                            ${post.mood ? `<span class="meta-mood">Current Mood: <strong>${post.mood}</strong></span>` : ''}
                            ${post.music ? `<span class="meta-music">🎵 Listening to: <em>${this.escapeHtml(post.music)}</em></span>` : ''}
                        </div>
                    </header>

                    <hr class="rainbow-hr">

                    <div class="post-content">
                        ${contentHtml}
                    </div>

                    <hr class="rainbow-hr">

                    <footer class="post-footer-full">
                        <div class="post-tags-full">
                            Tags: ${post.tags.map(tag => `<a href="#posts?tag=${tag}" class="tag">#${tag}</a>`).join(' ')}
                        </div>
                        <div class="post-actions">
                            <a href="#edit?id=${post.id}" class="action-btn edit-btn">✏️ Edit</a>
                            <button onclick="App.deletePost('${post.id}')" class="action-btn delete-btn">🗑️ Delete</button>
                        </div>
                    </footer>
                </article>

                <div class="post-nav">
                    <a href="#posts" class="nav-link"><<< Back to Posts</a>
                </div>
            </div>
        `;

        document.getElementById('content').innerHTML = html;
    },

    /**
     * Render editor (new/edit)
     */
    renderEditor(id = null) {
        const isEditing = !!id;
        let post = null;
        let draft = null;

        if (isEditing) {
            post = PostManager.getById(id);
            if (!post) {
                this.render404('Post not found!');
                return;
            }
        } else {
            // Check for saved draft
            draft = Storage.getDraft();
        }

        const categories = PostManager.getCategories();
        const moods = PostManager.getMoods();
        const config = Storage.getConfig();

        const data = post || draft || {
            title: '',
            content: '',
            author: config.author,
            tags: [],
            category: 'diary',
            mood: '',
            music: ''
        };

        const html = `
            <div class="editor-view">
                <h2 class="page-title">
                    <span class="title-star bounce">★</span>
                    ${isEditing ? 'Edit Post' : 'New Post'}
                    <span class="title-star bounce">★</span>
                </h2>

                ${draft && !isEditing ? `
                    <div class="draft-notice">
                        <p>📝 You have a saved draft! <button onclick="App.clearDraft()" class="link-btn">Discard it</button></p>
                    </div>
                ` : ''}

                <form id="post-form" class="post-form" onsubmit="App.savePost(event, ${isEditing ? `'${id}'` : 'null'})">
                    <div class="form-group">
                        <label for="title" class="form-label">~*~ Title ~*~</label>
                        <input type="text" id="title" name="title" class="form-input" required maxlength="200"
                               value="${this.escapeHtml(data.title)}" placeholder="Enter an awesome title!!!">
                    </div>

                    <div class="form-group">
                        <label for="content" class="form-label">Your Thoughts:</label>
                        <textarea id="content" name="content" class="form-textarea" required
                                  placeholder="Write whatever u want!!!">${this.escapeHtml(data.content)}</textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="category" class="form-label">Category:</label>
                            <select id="category" name="category" class="form-select">
                                ${categories.map(cat => `
                                    <option value="${cat.id}" ${data.category === cat.id ? 'selected' : ''}>
                                        ${cat.icon} ${cat.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="mood" class="form-label">Current Mood:</label>
                            <select id="mood" name="mood" class="form-select">
                                ${moods.map(mood => `
                                    <option value="${mood.id}" ${data.mood === mood.id ? 'selected' : ''}>
                                        ${mood.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="tags" class="form-label">Tags (comma separated):</label>
                        <input type="text" id="tags" name="tags" class="form-input"
                               value="${Array.isArray(data.tags) ? data.tags.join(', ') : data.tags}"
                               placeholder="thoughts, life, cool stuff">
                    </div>

                    <div class="form-group">
                        <label for="music" class="form-label">Currently Listening To:</label>
                        <input type="text" id="music" name="music" class="form-input"
                               value="${this.escapeHtml(data.music || '')}"
                               placeholder="Artist - Song Title">
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-save">
                            <span class="btn-star">★</span> Save Post <span class="btn-star">★</span>
                        </button>
                        <button type="button" class="btn-cancel" onclick="App.cancelEdit()">Cancel</button>
                    </div>
                </form>

                <p class="auto-save-notice" id="auto-save-status">Auto-save enabled</p>
            </div>
        `;

        document.getElementById('content').innerHTML = html;

        // Set up auto-save (only for new posts)
        if (!isEditing) {
            this.autoSaveInterval = setInterval(() => this.autoSaveDraft(), 30000);
        }
    },

    /**
     * Save post from form
     */
    savePost(event, id = null) {
        event.preventDefault();

        const form = document.getElementById('post-form');
        const postData = {
            title: form.title.value,
            content: form.content.value,
            category: form.category.value,
            mood: form.mood.value,
            tags: form.tags.value,
            music: form.music.value
        };

        let result;
        if (id) {
            result = PostManager.update(id, postData);
        } else {
            result = PostManager.create(postData);
            Storage.clearDraft();
        }

        if (result) {
            // Clear auto-save
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
                this.autoSaveInterval = null;
            }
            window.location.hash = '#post?id=' + result.id;
        } else {
            alert('Error saving post! Please try again.');
        }
    },

    /**
     * Auto-save draft
     */
    autoSaveDraft() {
        const form = document.getElementById('post-form');
        if (!form) return;

        const draftData = {
            title: form.title.value,
            content: form.content.value,
            category: form.category.value,
            mood: form.mood.value,
            tags: form.tags.value,
            music: form.music.value,
            savedAt: new Date().toISOString()
        };

        Storage.saveDraft(draftData);

        const status = document.getElementById('auto-save-status');
        if (status) {
            status.textContent = 'Draft saved at ' + new Date().toLocaleTimeString();
            status.classList.add('saved');
            setTimeout(() => status.classList.remove('saved'), 2000);
        }
    },

    /**
     * Clear draft
     */
    clearDraft() {
        Storage.clearDraft();
        this.renderEditor();
    },

    /**
     * Cancel editing
     */
    cancelEdit() {
        if (confirm('Are you sure? Unsaved changes will be lost!')) {
            window.location.hash = '#posts';
        }
    },

    /**
     * Delete post
     */
    deletePost(id) {
        if (confirm('Are you SURE you want to delete this post??? This cannot be undone!!!')) {
            if (PostManager.permanentDelete(id)) {
                window.location.hash = '#posts';
            } else {
                alert('Error deleting post!');
            }
        }
    },

    /**
     * Render guestbook
     */
    renderGuestbook() {
        const entries = Storage.getGuestbook();

        const entriesHtml = entries.map(entry => `
            <div class="guestbook-entry">
                <div class="entry-header">
                    <span class="entry-name">${this.escapeHtml(entry.name)}</span>
                    <span class="entry-date">${new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <p class="entry-message">${this.escapeHtml(entry.message)}</p>
                ${entry.website ? `<p class="entry-website"><a href="${this.escapeHtml(entry.website)}" target="_blank">Visit my site!</a></p>` : ''}
            </div>
        `).join('');

        const html = `
            <div class="guestbook-view">
                <h2 class="page-title rainbow-text">
                    <span class="title-star bounce">★</span>
                    Sign My Guestbook!!!
                    <span class="title-star bounce">★</span>
                </h2>

                <div class="guestbook-intro">
                    <p>Thanks 4 visiting!!! Please sign my guestbook and let me know what u think of my site ^_^</p>
                </div>

                <hr class="rainbow-hr">

                <form id="guestbook-form" class="guestbook-form" onsubmit="App.signGuestbook(event)">
                    <div class="form-group">
                        <label for="guest-name" class="form-label">Your Name:</label>
                        <input type="text" id="guest-name" name="name" class="form-input" required maxlength="50"
                               placeholder="CoolDude99">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="guest-email" class="form-label">Email (optional):</label>
                            <input type="email" id="guest-email" name="email" class="form-input"
                                   placeholder="you@aol.com">
                        </div>

                        <div class="form-group">
                            <label for="guest-website" class="form-label">Your Website (optional):</label>
                            <input type="url" id="guest-website" name="website" class="form-input"
                                   placeholder="http://yoursite.geocities.com">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="guest-message" class="form-label">Message:</label>
                        <textarea id="guest-message" name="message" class="form-textarea" required
                                  placeholder="Leave a message!!!" rows="4"></textarea>
                    </div>

                    <button type="submit" class="btn-save">
                        <span class="btn-star">★</span> Sign Guestbook! <span class="btn-star">★</span>
                    </button>
                </form>

                <hr class="rainbow-hr">

                <h3 class="entries-title">Previous Signatures (${entries.length})</h3>
                <div class="guestbook-entries">
                    ${entriesHtml}
                </div>
            </div>
        `;

        document.getElementById('content').innerHTML = html;
    },

    /**
     * Sign guestbook
     */
    signGuestbook(event) {
        event.preventDefault();

        const form = document.getElementById('guestbook-form');
        const entry = {
            id: 'guest_' + Date.now(),
            name: form.name.value,
            email: form.email.value,
            website: form.website.value,
            message: form.message.value,
            date: new Date().toISOString()
        };

        const entries = Storage.getGuestbook();
        entries.unshift(entry);
        Storage.saveGuestbook(entries);

        alert('Thanks 4 signing my guestbook!!!');
        this.renderGuestbook();
    },

    /**
     * Render 404 page
     */
    render404(message = 'Page Not Found!') {
        const html = `
            <div class="error-view">
                <h2 class="error-title blink">404 - ${message}</h2>
                <div class="error-content">
                    <p class="error-icon spin">😵</p>
                    <p>Oops!!! The page you were looking for doesnt exist!</p>
                    <p>Maybe it was moved, or maybe it never existed at all...</p>
                    <p><a href="#home" class="link-btn"><<< Back to Home</a></p>
                </div>
            </div>
        `;

        document.getElementById('content').innerHTML = html;
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
