cc.Class({
    extends: cc.Component,

    properties: {
        cell_k_Prefeb: cc.Prefab,
        cell_v2_Prefeb: cc.Prefab,
        cell_v3_Prefeb: cc.Prefab,
        cell_h2_Prefeb: cc.Prefab,
        cell_h3_Prefeb: cc.Prefab,
        cellAreaNode: cc.Node,
        logoNode: cc.Node,
        helpTipNode: cc.Node,
        helpTipLabel: cc.Label,
        playNode: cc.Node,
        rankNode: cc.Node,

        rankAreaNode: cc.Node,
        mainAreaNode: cc.Node,
        backNode: cc.Node,
        btnAudio: {
            default: null,
            url: cc.AudioClip
        }
    },

    clickToRank() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.getOpenDataContext().postMessage({
                type: 'switchRoute',
                value: 1,
            })
        }
        this.showRank();
    },

    btnClick() {
        cc.audioEngine.playEffect(this.btnAudio);
    },

    showRank() {
        this.rankAreaNode.x = 0;
        this.mainAreaNode.active = false;
        this.button.hide();
    },

    showMain() {
        this.rankAreaNode.x = 640;
        this.mainAreaNode.active = true;
        this.button.show();
    },

    clickToPlay() {
        cc.director.loadScene('game');
    },

    clickToSolution() {
        cc.director.loadScene('solution');
    },

    getRandomMap() {
        let maps = [
            'ohhkoooookoooohhhoovhhooovhhhooooooo',
            // 'okoooookhhooovhhhoovhhhoohhhoooooooo',
            // 'hhvkoooovkooooohhhooohhhvooooovohhho',
            // 'oovooooovooooovhhhohhkooovokooovhhho',
            // 'oookoohhokoohhoooovvoooovvoooovhhhoo',
            // 'oookoohhokooovooooovhhhohhhhoooooooo',
            // 'oookooohhkooovhhhoovhhhoohhhoooooooo',
            // 'oooooooovooooovhhhhhhkoovookoovhhhoo',
            // 'ovokooovokooovohhhhhooooooooovoohhhv',
            // 'oovkoohhvkoooohhhovooooovvohhhovoooo',
            // 'vovkoovovkoovovhhhooohhooooovohhhovo',
            // 'ooooovhhokovhhhkovoooohhovohhhovoooo',
            // 'oovkoohhvkoohhoooovoohhhvoohhhvooooo',
            // 'oovkooovvkooovvhhhovooooohhoovohhhov',
            // 'hhvkoohhvkooooohhhooooooovhhhoovoooo',
            // 'hhvkvooovkvooovohhvoohhhvooooovooooo',
            // 'oooooohhvkoooovkoovvohhhvvoooohhhooo',
            // // 'oovkoohhvkoohhooooovohhhovhhhoooooo',
            // 'hhvkoohhvkoohhhooooooooovhhhoovhhhoo',
            // 'ovokhhovokovovhhovhhhoovoovhhooovooo',
            // 'ovokhhovokooovhhvohhoovooooovohhhovo'
        ];
        let index = parseInt(Math.random() * maps.length);
        return maps[index];
    },

    // LIFE-CYCLE CALLBACKS:

    initBg() {
        let ctx = this.cellAreaNode.getComponent(cc.Graphics);

        // 画第1条线
        // 从(100,100)到(300,300)画一条宽为3像素的绿色直线
        ctx.strokeColor = cc.Color.WHITE;
        for (let i = 0; i < 2; i++) {
            ctx.moveTo(0, -540 * i);
            ctx.lineTo(540, -540 * i);

            ctx.moveTo(540 * i, 0);
            ctx.lineTo(540 * i, -540);
        }

        for (let i = 0; i < 6; i++) {
            ctx.moveTo(0 + 45, -90 * i - 45);
            ctx.lineTo(540 - 45, -90 * i - 45);

            ctx.moveTo(90 * i + 45, 0 - 45);
            ctx.lineTo(90 * i + 45, -540 + 45);
        }

        ctx.moveTo(270 + 45, -540 + 45);
        ctx.lineTo(270 + 45, -540);

        ctx.moveTo(90 * 3, -540);
        ctx.lineTo(90 * 3, -540 - 45);

        ctx.moveTo(90 * 4, -540);
        ctx.lineTo(90 * 4, -540 - 45);

        ctx.stroke();
    },

    resetMap() {
        this.cellAreaNode.removeAllChildren();
        let map = this.getRandomMap();
        let maxHCnt = 6;
        this.cellHSize = 90;
        this.cellVSize = 90;

        for (let i = 0; i < map.length; i++) {
            if (map.charAt(i) == 'h') {
                let count = 1;
                for (let j = i + 1; j < (parseInt(i / maxHCnt) + 1) * maxHCnt; j++) {
                    if (map.charAt(j) == 'h') {
                        count++;
                    }
                    if (count > 3) {
                        count = 2;
                        break;
                    }
                }
                if (count == 2) {
                    let cellNode = cc.instantiate(this.cell_h2_Prefeb);
                    cellNode.setPosition(cc.v2(i % maxHCnt * this.cellHSize, parseInt(i / maxHCnt) * this.cellVSize * -1));
                    this.cellAreaNode.addChild(cellNode);
                    this.cellNodeArr.push(cellNode);
                }
                if (count == 3) {
                    let cellNode = cc.instantiate(this.cell_h3_Prefeb);
                    cellNode.setPosition(cc.v2(i % maxHCnt * this.cellHSize, parseInt(i / maxHCnt) * this.cellVSize * -1));
                    this.cellAreaNode.addChild(cellNode);
                    this.cellNodeArr.push(cellNode);
                }
                i += count - 1;
            }
            else if (map.charAt(i) == 'v' && map.charAt(i - 6) != 'v') {
                let count = 1;
                for (let j = parseInt(i / maxHCnt) + 1; j < maxHCnt; j++) {
                    if (map.charAt(j * maxHCnt + i % maxHCnt) == 'v') {
                        count++;
                    }
                    if (count > 3) {
                        count = 2;
                        break;
                    }
                }
                if (count == 2) {
                    let cellNode = cc.instantiate(this.cell_v2_Prefeb);
                    cellNode.setPosition(cc.v2(i % maxHCnt * this.cellHSize, parseInt(i / maxHCnt) * this.cellVSize * -1));
                    this.cellAreaNode.addChild(cellNode);
                    this.cellNodeArr.push(cellNode);
                }
                if (count == 3) {
                    let cellNode = cc.instantiate(this.cell_v3_Prefeb);
                    cellNode.setPosition(cc.v2(i % maxHCnt * this.cellHSize, parseInt(i / maxHCnt) * this.cellVSize * -1));
                    this.cellAreaNode.addChild(cellNode);
                    this.cellNodeArr.push(cellNode);
                }
            }
            else if (map.charAt(i) == 'k' && map.charAt(i - 6) != 'k') {
                let count = 1;
                for (let j = parseInt(i / maxHCnt) + 1; j < maxHCnt; j++) {
                    if (map.charAt(j * maxHCnt + i % maxHCnt) == 'k') {
                        count++;
                    }
                }
                if (count == 2) {
                    let cellNode = cc.instantiate(this.cell_k_Prefeb);
                    cellNode.setPosition(cc.v2(i % maxHCnt * this.cellHSize, parseInt(i / maxHCnt) * this.cellVSize * -1));
                    this.cellAreaNode.addChild(cellNode);
                    this.cellNodeArr.push(cellNode);
                }
            }
        }
        setTimeout(() => {
            this.solution();
        }, 2000);
    },

    solution() {
        let dua = 1;
        let seq = cc.sequence(
            cc.moveTo(dua, this.cellNodeArr[2].position.x - 2 * 90, this.cellNodeArr[2].position.y),
            cc.callFunc(() => {
                seq = cc.sequence(
                    cc.moveTo(dua, this.cellNodeArr[1].position.x, this.cellNodeArr[1].position.y - 90 * 1),
                    cc.callFunc(() => {
                        seq = cc.sequence(
                            cc.moveTo(dua, this.cellNodeArr[0].position.x + 90 * 3, this.cellNodeArr[0].position.y),
                            cc.callFunc(() => {
                                seq = cc.sequence(
                                    cc.moveTo(dua, this.cellNodeArr[1].position.x, this.cellNodeArr[1].position.y + 90),
                                    cc.callFunc(() => {
                                        seq = cc.sequence(
                                            cc.moveTo(dua, this.cellNodeArr[2].position.x + 90 * 2, this.cellNodeArr[2].position.y),
                                            cc.callFunc(() => {
                                                seq = cc.sequence(
                                                    cc.moveTo(dua, this.cellNodeArr[3].position.x, this.cellNodeArr[3].position.y + 90 * 3),
                                                    cc.callFunc(() => {
                                                        seq = cc.sequence(
                                                            cc.moveTo(dua, this.cellNodeArr[2].position.x - 90 * 2, this.cellNodeArr[2].position.y),
                                                            cc.callFunc(() => {
                                                                seq = cc.sequence(
                                                                    cc.moveTo(dua, this.cellNodeArr[4].position.x - 90, this.cellNodeArr[4].position.y),
                                                                    cc.callFunc(() => {
                                                                        seq = cc.sequence(
                                                                            cc.moveTo(dua, this.cellNodeArr[5].position.x - 90 * 2, this.cellNodeArr[5].position.y),
                                                                            cc.callFunc(() => {
                                                                                seq = cc.sequence(
                                                                                    cc.moveTo(dua, this.cellNodeArr[1].position.x, this.cellNodeArr[1].position.y - 90 * 4),
                                                                                    cc.callFunc(() => {
                                                                                        setTimeout(() => {
                                                                                            // this.resetMap();
                                                                                            this.repeatPlay();
                                                                                        }, 1000);
                                                                                    })
                                                                                );

                                                                                this.cellNodeArr[1].runAction(seq);
                                                                            })
                                                                        );

                                                                        this.cellNodeArr[5].runAction(seq);
                                                                    })
                                                                );

                                                                this.cellNodeArr[4].runAction(seq);
                                                            })
                                                        );

                                                        this.cellNodeArr[2].runAction(seq);
                                                    })
                                                );

                                                this.cellNodeArr[3].runAction(seq);
                                            })
                                        );

                                        this.cellNodeArr[2].runAction(seq);
                                    })
                                );

                                this.cellNodeArr[1].runAction(seq);
                            })
                        );

                        this.cellNodeArr[0].runAction(seq);
                    })
                );

                this.cellNodeArr[1].runAction(seq);
            })
        );

        this.cellNodeArr[2].runAction(seq);

    },

    onLoad() {
        window.home = this;
        this.cellNodeArr = [];
        this.initBg();
        this.resetMap();
        cc.director.preloadScene('game');
        this.cellAreaNode.getComponent('cellArea').disableTouch();
        this.mapId = 1057;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.rankAreaNode.active = true;
            this.rankNode.active = true;
            wx.showShareMenu({
                withShareTicket: true,
                menus: ['shareAppMessage', 'shareTimeline']
            })
            wx.onShareAppMessage(() => {
                return {
                    title: '听说通过率只有0.8%的游戏',
                    imageUrl: 'https://636c-cloud1-0gx5292p6d4e5ef3-1309513586.tcb.qcloud.la/share.png?sign=aeed8af1c1fcc58e9560ac588b45a753&t=1664193194',
                    success: function (t) {
                        console.log('分享成功');
                    },
                    fail: function (t) {
                        console.log('分享失败');
                    }
                }
            })
            let object = wx.getLaunchOptionsSync();
            this.mapId = parseInt(object.query['mapId']);
            if (this.mapId) {
                this.helpTipNode.active = true;
                this.helpTipLabel.string += ' > ' + this.mapId;
            }

            let res = wx.getSystemInfoSync();
            let windowSize = cc.view.getVisibleSize();
            console.log(res.screenWidth,res.screenHeight,windowSize.width,windowSize.height);
            let left = res.screenWidth / windowSize.width * 510;
            let top = res.screenHeight /2 - res.screenHeight / windowSize.height * 440;
            let width = res.screenHeight / windowSize.height * 80;
            console.log(left,top,width);
            this.button = wx.createGameClubButton({
                icon: 'green',
                style: {
                    left: left,
                    top: top,
                    width: width,
                    height: width
                }
            })
        }
    },

    onDestroy(){
        this.button.destroy();
    },

    repeatPlay() {
        let blink = new cc.Blink(100, 100)
        this.playNode.runAction(blink);
    },
});
