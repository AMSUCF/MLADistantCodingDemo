/**
 * Post Manager - CRUD operations for blog posts
 */

const PostManager = {
    /**
     * Get all posts (excluding deleted)
     */
    getAll(includeDeleted = false) {
        const posts = Storage.getAllPosts();
        if (includeDeleted) return posts;
        return posts.filter(p => !p.isDeleted);
    },

    /**
     * Get a single post by ID
     */
    getById(id) {
        const posts = this.getAll(true);
        return posts.find(p => p.id === id) || null;
    },

    /**
     * Create a new post
     */
    create(postData) {
        const posts = Storage.getAllPosts();
        const now = new Date().toISOString();

        const newPost = {
            id: 'post_' + Date.now(),
            title: postData.title || 'Untitled Post',
            content: postData.content || '',
            author: postData.author || Storage.getConfig().author,
            tags: this.parseTags(postData.tags),
            category: postData.category || 'diary',
            mood: postData.mood || '',
            music: postData.music || '',
            createdAt: now,
            updatedAt: now,
            isDraft: postData.isDraft || false,
            isDeleted: false
        };

        posts.unshift(newPost); // Add to beginning
        Storage.savePosts(posts);
        return newPost;
    },

    /**
     * Update an existing post
     */
    update(id, postData) {
        const posts = Storage.getAllPosts();
        const index = posts.findIndex(p => p.id === id);

        if (index === -1) return null;

        posts[index] = {
            ...posts[index],
            title: postData.title !== undefined ? postData.title : posts[index].title,
            content: postData.content !== undefined ? postData.content : posts[index].content,
            tags: postData.tags !== undefined ? this.parseTags(postData.tags) : posts[index].tags,
            category: postData.category !== undefined ? postData.category : posts[index].category,
            mood: postData.mood !== undefined ? postData.mood : posts[index].mood,
            music: postData.music !== undefined ? postData.music : posts[index].music,
            isDraft: postData.isDraft !== undefined ? postData.isDraft : posts[index].isDraft,
            updatedAt: new Date().toISOString()
        };

        Storage.savePosts(posts);
        return posts[index];
    },

    /**
     * Delete a post (soft delete)
     */
    delete(id) {
        const posts = Storage.getAllPosts();
        const index = posts.findIndex(p => p.id === id);

        if (index === -1) return false;

        posts[index].isDeleted = true;
        posts[index].updatedAt = new Date().toISOString();
        Storage.savePosts(posts);
        return true;
    },

    /**
     * Permanently delete a post
     */
    permanentDelete(id) {
        const posts = Storage.getAllPosts();
        const filtered = posts.filter(p => p.id !== id);
        Storage.savePosts(filtered);
        return filtered.length < posts.length;
    },

    /**
     * Filter posts by category
     */
    getByCategory(category) {
        return this.getAll().filter(p => p.category === category);
    },

    /**
     * Filter posts by tag
     */
    getByTag(tag) {
        return this.getAll().filter(p => p.tags.includes(tag.toLowerCase()));
    },

    /**
     * Search posts by title or content
     */
    search(query) {
        const q = query.toLowerCase();
        return this.getAll().filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q)
        );
    },

    /**
     * Get recent posts
     */
    getRecent(limit = 5) {
        return this.getAll()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    },

    /**
     * Get all unique tags
     */
    getAllTags() {
        const tags = new Set();
        this.getAll().forEach(p => {
            p.tags.forEach(t => tags.add(t));
        });
        return Array.from(tags).sort();
    },

    /**
     * Get all categories with counts
     */
    getCategoryCounts() {
        const counts = {};
        this.getAll().forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        return counts;
    },

    /**
     * Parse tags from string or array
     */
    parseTags(tags) {
        if (!tags) return [];
        if (Array.isArray(tags)) {
            return tags.map(t => t.trim().toLowerCase()).filter(t => t);
        }
        return tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
    },

    /**
     * Get available categories
     */
    getCategories() {
        return [
            { id: 'diary', name: 'Dear Diary', icon: '📔' },
            { id: 'thoughts', name: 'Random Thoughts', icon: '💭' },
            { id: 'rants', name: 'Rants & Raves', icon: '🔥' },
            { id: 'links', name: 'Cool Links', icon: '🔗' },
            { id: 'life', name: 'Life Updates', icon: '✨' }
        ];
    },

    /**
     * Get available moods
     */
    getMoods() {
        return [
            { id: '', name: '-- Select Mood --' },
            { id: 'happy', name: 'Happy :)' },
            { id: 'excited', name: 'Excited!!!' },
            { id: 'thoughtful', name: 'Thoughtful...' },
            { id: 'sad', name: 'Sad :(' },
            { id: 'angry', name: 'Angry >:(' },
            { id: 'tired', name: 'Tired zzz' },
            { id: 'creative', name: 'Creative ~*~' },
            { id: 'bored', name: 'Bored -_-' },
            { id: 'hyper', name: 'HYPER!!!!' }
        ];
    },

    /**
     * Format date for display
     */
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    },

    /**
     * Generate excerpt from content
     */
    getExcerpt(content, length = 150) {
        const text = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    }
};
