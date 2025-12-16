export default class InputHandler {
    constructor() {
        this.keys = {};
        this.mobileJump = false;

        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mobile button
        const mobileBtn = document.getElementById('mobile-jump');
        if (mobileBtn) {
            mobileBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileJump = true;
            });

            mobileBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.mobileJump = true;
            });
        }
    }
}
