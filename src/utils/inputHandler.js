const InputHandler = {
    keys: {},
    touchStart: null,
    touchEnd: null,

    init: function() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        window.addEventListener('touchstart', this.onTouchStart.bind(this));
        window.addEventListener('touchend', this.onTouchEnd.bind(this));
    },

    onKeyDown: function(event) {
        this.keys[event.code] = true;
    },

    onKeyUp: function(event) {
        this.keys[event.code] = false;
    },

    onTouchStart: function(event) {
        this.touchStart = event.touches[0];
    },

    onTouchEnd: function(event) {
        this.touchEnd = event.changedTouches[0];
    },

    isKeyPressed: function(key) {
        return this.keys[key] || false;
    },

    getTouchDirection: function() {
        if (this.touchStart && this.touchEnd) {
            const dx = this.touchEnd.clientX - this.touchStart.clientX;
            const dy = this.touchEnd.clientY - this.touchStart.clientY;
            return { dx, dy };
        }
        return null;
    }
};

export default InputHandler;