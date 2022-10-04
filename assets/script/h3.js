cc.Class({
    extends: cc.Component,

    properties: {
        audio1: {
            default: null,
            type: cc.AudioClip
        },
        audio2: {
            default: null,
            type: cc.AudioClip
        }
    },
    onLoad() {
        if(this.demo)return;
        this.canMove = true;
        this.node.on('touchstart', this.touchStart, this);
        this.node.on('touchmove', this.touchMove, this);
        this.node.on('touchend', this.touchEnd, this);
        this.node.on('touchcancel', this.touchEnd, this);
    },

    disableTouch(){
        this.demo = true;
    },

    onDestroy() {
        if(this.demo)return;
        cc.audioEngine.stop(this.current1);
        cc.audioEngine.stop(this.current2);
        this.node.off('touchstart', this.touchStart, this);
        this.node.off('touchmove', this.touchMove, this);
        this.node.off('touchend', this.touchEnd, this);
        this.node.off('touchcancel', this.touchCancel, this);
    },

    onCollisionEnter(other) {
        this.canMove = false;
    },

    onCollisionExit(other) {
        this.canMove = true;
    },

    touchStart(e) {
        this.startPos = this.node.position;
    },

    touchMove(e) {
        if (!this.canMove) return;
        let delta = e.getDelta();

        if (this.node.x <= 0 && delta.x < 0) {
            return;
        }
        if (this.node.x >= 90 * 3 && delta.x > 0) {
            return;
        }
        let x = this.node.x;
        x += delta.x;
        if (x <= 0) {
            this.node.x = 0;
        } else if (x >= 90 * 3) {
            this.node.x = 90 * 3;
        } else {
            this.node.x = x;
        }
    },

    touchEnd(e) {
        if (this.node.x < 0) {
            this.node.x = 0;
        }
        if (this.node.x > 90 * 3) {
            this.node.x = 90 * 3;
        }
        let count = Math.round((this.node.x - this.startPos.x)/90);
        this.node.x=this.startPos.x+count*90;
        if (this.canMove) {
            this.current2 = cc.audioEngine.play(this.audio2, false, 1);
        } else {
            if(count<-1){
                this.node.x+=90;
            }
            if(count>1){
                this.node.x-=90;
            }
            this.current1 = cc.audioEngine.play(this.audio1, false, 1);
        }
    },
});
