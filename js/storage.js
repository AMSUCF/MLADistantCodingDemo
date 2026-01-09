/**
 * Storage Module - localStorage abstraction layer
 * Handles all data persistence for the 90s CMS
 */

const STORAGE_KEYS = {
    CONFIG: 'geocities_cms_config',
    POSTS: 'geocities_cms_posts',
    GUESTBOOK: 'geocities_cms_guestbook',
    DRAFT: 'geocities_cms_draft',
    HIT_COUNT: 'geocities_cms_hits'
};

const Storage = {
    /**
     * Get a value from localStorage
     */
    get(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    /**
     * Set a value in localStorage
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    /**
     * Remove a value from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    /**
     * Clear all app data
     */
    clear() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    /**
     * Get site configuration
     */
    getConfig() {
        return this.get(STORAGE_KEYS.CONFIG) || this.getDefaultConfig();
    },

    /**
     * Save site configuration
     */
    setConfig(config) {
        return this.set(STORAGE_KEYS.CONFIG, config);
    },

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            siteName: "~*~My Awesome Homepage~*~",
            siteTagline: "Welcome 2 my corner of the web!!!",
            author: "WebMaster2000",
            createdDate: new Date().toISOString(),
            theme: "rainbow"
        };
    },

    /**
     * Get all posts
     */
    getAllPosts() {
        return this.get(STORAGE_KEYS.POSTS) || [];
    },

    /**
     * Save all posts
     */
    savePosts(posts) {
        return this.set(STORAGE_KEYS.POSTS, posts);
    },

    /**
     * Get guestbook entries
     */
    getGuestbook() {
        return this.get(STORAGE_KEYS.GUESTBOOK) || this.getDefaultGuestbook();
    },

    /**
     * Save guestbook entries
     */
    saveGuestbook(entries) {
        return this.set(STORAGE_KEYS.GUESTBOOK, entries);
    },

    /**
     * Get default guestbook with fake entries
     */
    getDefaultGuestbook() {
        return [
            {
                id: 'guest_1',
                name: '~*SparkleQueen*~',
                email: 'sparkle@aol.com',
                website: 'http://sparkles.geocities.com',
                message: 'OMG ur site is sooo cool!!! Luv the colors!! Add me 2 ur links plz!! ^_^',
                date: '1999-03-15T10:30:00Z'
            },
            {
                id: 'guest_2',
                name: 'SurfDude99',
                email: 'surfer@hotmail.com',
                website: '',
                message: 'Radical page dude! The animations are totally tubular! Keep it up! 8-)',
                date: '1999-04-22T14:45:00Z'
            },
            {
                id: 'guest_3',
                name: 'CyberPunk2000',
                email: 'cyber@yahoo.com',
                website: 'http://cyber.tripod.com',
                message: 'The future is HERE! Nice graphics and cool design. Visited from WebRing!',
                date: '1999-05-10T09:15:00Z'
            },
            {
                id: 'guest_4',
                name: 'xX_DarkAngel_Xx',
                email: 'dark@lycos.com',
                website: '',
                message: 'cool site... check out mine sometime... we should trade links...',
                date: '1999-06-18T22:00:00Z'
            }
        ];
    },

    /**
     * Get hit counter
     */
    getHitCount() {
        let count = this.get(STORAGE_KEYS.HIT_COUNT);
        if (count === null) {
            count = 9847; // Start with a "realistic" number
            this.set(STORAGE_KEYS.HIT_COUNT, count);
        }
        return count;
    },

    /**
     * Increment hit counter
     */
    incrementHitCount() {
        let count = this.getHitCount();
        count += Math.floor(Math.random() * 3) + 1; // Add 1-3 visitors
        this.set(STORAGE_KEYS.HIT_COUNT, count);
        return count;
    },

    /**
     * Get draft
     */
    getDraft() {
        return this.get(STORAGE_KEYS.DRAFT);
    },

    /**
     * Save draft
     */
    saveDraft(draft) {
        return this.set(STORAGE_KEYS.DRAFT, draft);
    },

    /**
     * Clear draft
     */
    clearDraft() {
        return this.remove(STORAGE_KEYS.DRAFT);
    },

    /**
     * Export all data as JSON string
     */
    exportData() {
        const data = {
            config: this.getConfig(),
            posts: this.getAllPosts(),
            guestbook: this.getGuestbook(),
            hitCount: this.getHitCount(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    /**
     * Import data from JSON string
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.config) this.setConfig(data.config);
            if (data.posts) this.savePosts(data.posts);
            if (data.guestbook) this.saveGuestbook(data.guestbook);
            if (data.hitCount) this.set(STORAGE_KEYS.HIT_COUNT, data.hitCount);
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    },

    /**
     * Initialize storage with default data if empty
     */
    initialize() {
        if (!this.get(STORAGE_KEYS.CONFIG)) {
            this.setConfig(this.getDefaultConfig());
        }
        if (!this.get(STORAGE_KEYS.POSTS)) {
            this.savePosts(this.getDefaultPosts());
        }
        if (!this.get(STORAGE_KEYS.GUESTBOOK)) {
            this.saveGuestbook(this.getDefaultGuestbook());
        }
        this.incrementHitCount();
    },

    /**
     * Get default posts for demo
     */
    getDefaultPosts() {
        return [
            {
                id: 'post_' + (Date.now() - 86400000 * 3),
                title: '~*~Welcome 2 My Site!!!~*~',
                content: 'Hey everyone!!! Welcome 2 my new homepage!!! I worked SO hard on this and Im really proud of how it turned out ^_^\n\nI will be posting about my life, my thoughts, cool links I find, and whatever else I feel like lol!\n\nMake sure 2 sign my guestbook and check out my links page!!!\n\nL8r!\n- WebMaster2000',
                author: 'WebMaster2000',
                tags: ['welcome', 'personal', 'announcement'],
                category: 'diary',
                mood: 'excited',
                music: 'Backstreet Boys - I Want It That Way',
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                isDraft: false
            },
            {
                id: 'post_' + (Date.now() - 86400000),
                title: 'Cool Links I Found Today!!!',
                content: 'OMG you guys I found the COOLEST sites today while surfing the web!!!\n\n* This one site has like a million animated GIFs, totally gonna use some for my page\n* Found a tutorial on how to make your cursor leave sparkle trails!!!\n* Joined 3 new WebRings today, my site is gonna get SO many visitors now\n\nThe internet is SO amazing, theres always something new to discover!\n\nDoes anyone know any other cool sites? Leave a comment or sign my guestbook!!!',
                author: 'WebMaster2000',
                tags: ['links', 'internet', 'cool stuff'],
                category: 'thoughts',
                mood: 'happy',
                music: 'Smash Mouth - All Star',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                isDraft: false
            }
        ];
    }
};
