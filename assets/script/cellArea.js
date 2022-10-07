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
        },
        audio3: {
            default: null,
            type: cc.AudioClip
        },
    },

    onLoad() {
        if (this.demo) return;
        this.canMove = true;
        this.node.on('touchstart', this.touchStart, this);
        this.node.on('touchmove', this.touchMove, this);
        this.node.on('touchend', this.touchEnd, this);
        this.node.on('touchcancel', this.touchEnd, this);
    },

    disableTouch() {
        this.demo = true;
    },

    onDestroy() {
        if (this.demo) return;
        cc.audioEngine.stop(this.current1);
        cc.audioEngine.stop(this.current2);
        cc.audioEngine.stop(this.current3);
        this.node.off('touchstart', this.touchStart, this);
        this.node.off('touchmove', this.touchMove, this);
        this.node.off('touchend', this.touchEnd, this);
        this.node.off('touchcancel', this.touchCancel, this);
    },

    touchStart(e) {
        let pos = e.getLocation();
        let n_pos = this.node.convertToNodeSpaceAR(pos);
        for (let i = 0; i < window.game.cellAreaNode.childrenCount; i++) {
            let node = window.game.cellAreaNode.children[i];
            if (node.getBoundingBox().contains(n_pos)) {
                this.hitNode = node;
                this.startPos = node.position;
                this.calculate();
            }
        }
    },

    calculate() {
        if (!this.hitNode) return;
        this.leftCount = 0;
        this.rightCount = 0;
        this.topCount = 0;
        this.downCount = 0;
        let hitNode = this.hitNode;
        let x = parseInt(hitNode.x / 90);
        let y = parseInt(hitNode.y / -90);
        if (hitNode.name == 'v2' || hitNode.name == 'v3' || hitNode.name == 'k') {
            let count = parseInt(hitNode.width / 90);
            for (let i = y - 1; i >= 0; i--) {
                if (window.game.cellNode2dMapArr[i][x] == 'o') {
                    this.topCount++;
                } else {
                    break;
                }
            }
            for (let i = y + count; i < 6; i++) {
                if (window.game.cellNode2dMapArr[i][x] == 'o') {
                    this.downCount++;
                } else {
                    break;
                }
            }
        } else {
            let count = parseInt(hitNode.height / 90);
            for (let i = x - 1; i >= 0; i--) {
                if (window.game.cellNode2dMapArr[y][i] == 'o') {
                    this.leftCount++;
                } else {
                    break;
                }
            }
            for (let i = x + count; i < 6; i++) {
                if (window.game.cellNode2dMapArr[y][i] == 'o') {
                    this.rightCount++;
                } else {
                    break;
                }
            }
        }

        this.left = this.startPos.x - 90 * this.leftCount;
        this.right = this.startPos.x + 90 * this.rightCount;
        this.top = this.startPos.y + 90 * this.topCount;
        this.bottom = this.startPos.y - 90 * this.downCount;
    },

    touchMove(e) {
        if (!this.hitNode) return;
        let delta = e.getDelta();
        if (this.hitNode.name == 'h2' || this.hitNode.name == 'h3') {
            let x = this.hitNode.x + delta.x;
            if (x <= this.left && delta.x < 0) {
                this.hitNode.x = this.left;
                return;
            }
            if (x >= this.right && delta.x > 0) {
                this.hitNode.x = this.right;
                return;
            }
            this.hitNode.x = x;
        } else {
            let y = this.hitNode.y + delta.y;
            if (y >= this.top && delta.y > 0) {
                this.hitNode.y = this.top;
                return;
            }
            if (y <= this.bottom && delta.y < 0) {
                this.hitNode.y = this.bottom;
                return;
            }
            this.hitNode.y = y;
        }
    },

    touchEnd(e) {
        if (!this.hitNode) return;
        //对其到网格
        if (this.hitNode.name == 'h2' || this.hitNode.name == 'h3') {
            let count = Math.round((this.hitNode.x - this.startPos.x) / 90);
            this.hitNode.x = this.startPos.x + count * 90;
            this.adjust2dMap(count);
            this.playMusic(count);
        } else {
            let count = Math.round((this.hitNode.y - this.startPos.y) / 90);
            this.hitNode.y = this.startPos.y + count * 90;
            this.adjust2dMap(count);
            this.playMusic(count);
        }
        this.hitNode = null;
    },

    playMusic(count){
        if (count == 0) {
            this.current1 = cc.audioEngine.play(this.audio1, false, 1);
        } else {
            //判断胜利
            if (this.hitNode.name == 'k' && this.hitNode.y == -360) {
                window.game.changeLevel2();
                this.current3 = cc.audioEngine.play(this.audio3, false, 1);
            } else {
                this.current2 = cc.audioEngine.play(this.audio2, false, 1);
            }
        }
    },

    adjust2dMap(count) {
        if (!this.hitNode) return;
        let x = parseInt(this.startPos.x / 90);
        let y = parseInt(this.startPos.y / -90);
        if (this.hitNode.name == 'h2' || this.hitNode.name == 'h3') {
            let selfCount = parseInt(this.hitNode.height / 90);
            if (count < 0) {//左移
                for (let i = 0; i < selfCount; i++) {
                    window.game.cellNode2dMapArr[y][x + count + i] = 'h';
                }
                for (let i = 0; i < -count; i++) {
                    window.game.cellNode2dMapArr[y][x + selfCount + count + i] = 'o';
                }
            } else {//右移
                for (let i = 0; i < count; i++) {
                    window.game.cellNode2dMapArr[y][x + i] = 'o';
                }
                for (let i = 0; i < selfCount; i++) {
                    window.game.cellNode2dMapArr[y][x + count + i] = 'h';
                }
            }
        } else {
            let selfCount = parseInt(this.hitNode.width / 90);
            if (count < 0) {//下移
                for (let i = 0; i < selfCount; i++) {
                    if (this.hitNode.name == 'k') window.game.cellNode2dMapArr[y - count + i][x] = 'k';
                    else window.game.cellNode2dMapArr[y - count + i][x] = 'v';
                }
                for (let i = 0; i < -count; i++) {
                    window.game.cellNode2dMapArr[y + i][x] = 'o';
                }
            } else {//上移
                for (let i = 0; i < count; i++) {
                    window.game.cellNode2dMapArr[y + selfCount - i - 1][x] = 'o';
                }
                for (let i = 0; i < selfCount; i++) {
                    if (this.hitNode.name == 'k')
                        window.game.cellNode2dMapArr[y - count + i][x] = 'k';
                    else window.game.cellNode2dMapArr[y - count + i][x] = 'v';
                }
            }
        }
    }
});
