cc.Class({
    extends: cc.Component,

    properties: {
        cell_k_Prefeb: cc.Prefab,
        cell_v2_Prefeb: cc.Prefab,
        cell_v3_Prefeb: cc.Prefab,
        cell_h2_Prefeb: cc.Prefab,
        cell_h3_Prefeb: cc.Prefab,
        cellAreaNode: cc.Node,
        level1Node: cc.Node,
        level2Node: cc.Node,
        clockLabel: cc.Label,
        costLabel: cc.Label,

        gamingNode: cc.Node,
        failNode: cc.Node,
        successNode: cc.Node,
        audio: cc.AudioClip,
        hardNode: cc.Node,
        rankAreaNode: cc.Node,
        resetNode: cc.Node,
        resetCountLabel: cc.Label,
        changeNode: cc.Node,
        changeCountLabel: cc.Label,
        destroyNode: cc.Node,
        destroyCountLabel: cc.Label,
        btnAudio: {
            default: null,
            url: cc.AudioClip
        }
    },

    btnClick() {
        cc.audioEngine.playEffect(this.btnAudio);
    },

    share() {
        this.btnClick();
        setTimeout(() => {
            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                wx.shareAppMessage({
                    title: '和我一起来挑战' + this.mapIndex + '关吧~',
                    imageUrl: 'https://636c-cloud1-0gx5292p6d4e5ef3-1309513586.tcb.qcloud.la/share.png?sign=aeed8af1c1fcc58e9560ac588b45a753&t=1664193194',
                    query: "mapId=" + this.mapIndex,
                })
            }
        }, 500);
    },
    testMap(round, level) {
        // let xhr = new XMLHttpRequest();
        // xhr.onreadystatechange = () => {
        //     if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
        //         let response = xhr.responseText;
        //         console.log('linbo:', `'${JSON.parse(response).a0}',`);
        //     }
        // }

        // xhr.open('GET', `http://bbh.gaoqingpai.com/hrd/res/HD/Round${round}/${level}.json`);
        // xhr.send();

        console.log('linbo:', round, level);
    },

    getRandomMap1() {
        let maps;
        if (this.mapRandomIndex == 1) {
            maps = this.maps1;
        } else if (this.mapRandomIndex == 2) {
            maps = this.maps2;
        } else {
            maps = this.maps3;
        }
        if (this.map1Index == -1) {
            this.map1Index = parseInt(Math.random() * maps.length);
            console.log('当前关卡1:', this.mapRandomIndex, this.map1Index);
            this.mapIndex = this.mapRandomIndex * 1000 + this.map1Index;
        }

        return maps[this.map1Index];
    },

    getRandomMap2() {
        let maps;
        if (this.mapRandomIndex == 1) {
            maps = this.maps5;
        } else if (this.mapRandomIndex == 2) {
            maps = this.maps4;
        } else {
            maps = this.maps3;
        }
        if (this.map2Index == -1) {
            this.map2Index = parseInt(Math.random() * maps.length);
            console.log('当前关卡2:', 6 - this.mapRandomIndex, this.map2Index);
            this.mapIndex = this.mapRandomIndex * 1000 + this.map1Index;
        }
        return maps[this.map2Index];
    },

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

    changeLevel2() {
        if (this.firstLevel) {
            this.firstLevel = false;
            this.cellAreaNode.active = false;
            this.hardNode.active = true;
            let blink = new cc.Blink(100, 100)
            this.hardNode.runAction(blink);
            clearInterval(this.timeIndex);
            setTimeout(() => {
                this.hardNode.active = false;
                this.cellAreaNode.active = true;
                this.resetMap();
                this.timeIndex = setInterval(() => {
                    if (!this.showAlert) {
                        this.clockLabel.string = --this.time;
                        this.cost++;
                        this.current = cc.audioEngine.play(this.audio, false);
                        if (this.time == 0) {
                            this.fail();
                        }
                    }
                }, 1000);
            }, 3000);
        } else {
            this.success();
        }
    },

    success() {
        clearInterval(this.timeIndex);
        cc.audioEngine.stop(this.current);
        this.gamingNode.active = false;
        this.successNode.active = true;
        this.costLabel.string = this.cost;
        this.rankAreaNode.x = 0;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.getOpenDataContext().postMessage({
                type: 'updateCost',
                value: this.cost,
            })
            wx.getOpenDataContext().postMessage({
                type: 'switchRoute',
                value: 0,
            })
        }
    },

    //消除
    destroyRandomBlock() {
        this.btnClick();
        if (this.destroyTimes == -1) {
            this.showAlert = true;
            let self = this;
            Alert.show("移出道具", "随机移出一个方块", function () {
                self.btnClick();
                self.showAlert = false;
                //todo播放广告
                self.destroyTimes = 1;
                self.destroyCountLabel.string = self.destroyTimes;
            }, function () {
                self.btnClick();
                self.showAlert = false;
            }, null, 0.1);
        } else {
            if (this.destroyTimes > 0) {
                //随机移出一个方块
                let randomIndex = parseInt(Math.random() * this.cellNodeArr.length);
                let randomNode = this.cellNodeArr[randomIndex];

                let dua = 0.6;
                let seq = cc.sequence(
                    cc.fadeOut(dua),
                    cc.callFunc(() => {
                        randomNode.active = false;
                        this.removeRandomNode(randomNode);
                    })
                );
                randomNode.runAction(seq);

                this.destroyTimes--;
            }
            if (this.destroyTimes == 0) {
                //禁用消除 按钮
                this.destroyNode.getComponent(cc.Button).interactable = false;
                this.destroyNode.opacity = 128;
                this.destroyCountLabel.string = '+';
            }
        }
    },

    removeRandomNode(hitNode) {
        let x = parseInt(hitNode.x / 90);
        let y = parseInt(hitNode.y / -90);
        if (hitNode.name == 'h2' || hitNode.name == 'h3') {
            let selfCount = parseInt(hitNode.height / 90);
            for (let i = 0; i < selfCount; i++) {
                this.cellNode2dMapArr[y][x + i] = 'o';
            }
        } else {
            let selfCount = parseInt(hitNode.width / 90);
            for (let i = 0; i < selfCount; i++) {
                this.cellNode2dMapArr[y + i][x] = 'o';
            }
        }
    },

    //继续挑战
    replay() {
        cc.director.loadScene('game');
    },

    //重新挑战
    retry() {
        this.firstLevel = true;
        this.destroyNode.getComponent(cc.Button).interactable = true;
        this.destroyNode.opacity = 255;
        this.destroyCountLabel.string = '+';
        this.resetTimes = -1;
        this.resetNode.getComponent(cc.Button).interactable = true;
        this.resetNode.opacity = 255;
        this.resetCountLabel.string = '+';
        this.changeTimes = -1;
        this.changeNode.getComponent(cc.Button).interactable = true;
        this.changeNode.opacity = 255;
        this.changeCountLabel.string = '+';

        this.rankAreaNode.x = 640;
        this.gamingNode.active = true;
        this.failNode.active = false;
        this.resetMap();
        this.timeIndex = setInterval(() => {
            if (!this.showAlert) {
                this.clockLabel.string = --this.time;
                this.cost++;
                this.current = cc.audioEngine.play(this.audio, false);
                if (this.time == 0) {
                    this.fail();
                }
            }
        }, 1000);
    },

    //换一关
    change() {
        this.btnClick();
        if (this.changeTimes == -1) {
            this.showAlert = true;
            let self = this;
            Alert.show("洗牌道具", "随机打乱所有方块", function () {
                self.btnClick();
                //todo播放广告
                self.showAlert = false;
                self.changeTimes = 1;
                self.changeCountLabel.string = self.changeTimes;
            }, function () {
                self.btnClick();
                self.showAlert = false;
            }, null, 0.1);
        } else {
            if (this.changeTimes > 0) {
                this.changeTimes--;
                this.map1Index = -1;
                this.map2Index = -1;
                this.resetMap();
            }
            if (this.changeTimes == 0) {
                //禁用消除 按钮
                this.changeNode.getComponent(cc.Button).interactable = false;
                this.changeNode.opacity = 128;
                this.changeCountLabel.string = '+';
            }
        }
    },

    //重置
    reset() {
        this.btnClick();
        if (this.resetTimes == -1) {
            this.showAlert = true;
            let self = this;
            Alert.show("重置道具", "重置所有方块并把他们放回原位置", function () {
                self.btnClick();
                self.showAlert = false;
                self.resetTimes = 1;
                self.resetCountLabel.string = self.resetTimes;
            }, function () {
                self.btnClick();
                self.showAlert = false;
            }, null, 0.1);
        } else {
            if (this.resetTimes > 0) {
                this.resetTimes--;
                this.resetMap();
            }
            if (this.resetTimes == 0) {
                //禁用重置 按钮
                this.resetCountLabel.string = '+';
                this.resetNode.getComponent(cc.Button).interactable = false;
                this.resetNode.opacity = 128;
            }
        }
    },

    fail() {
        clearInterval(this.timeIndex);
        cc.audioEngine.stop(this.current);
        this.gamingNode.active = false;
        this.failNode.active = true;
        this.rankAreaNode.x = 0;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.getOpenDataContext().postMessage({
                type: 'switchRoute',
                value: 0,
            })
        }
    },
    //开始解析map成对于的方块
    parseMapToBlock(map) {
        this.cellAreaNode.removeAllChildren();
        this.cellNodeArr = [];
        let ret = map.split("@", 140);
        let sj = [];
        for (var k = 0; k < 10; k++) { //初始化 每个可挪动块
            sj[k] = [];
            for (var i = 0; i < 14; i++) {
                sj[k][i] = "";
            }
        }
        for (var i = 0; i < ret.length; i++) {
            sj[parseInt(i % 10)][parseInt(i / 10)] = ret[i];
        }
        //新建一个2d 的map来存放地图数据，方便判断当前节点可移动范围
        this.cellNode2dMapArr = [];
        for (var i = 0; i < 6; i++) {
            this.cellNode2dMapArr[i] = [];
            for (var j = 0; j < 6; j++) {
                this.cellNode2dMapArr[i][j] = "o";
            }
        }

        var addid = 0;
        for (var k = 0; k < 50; k++) { //块表现
            addid = 0;
            for (var i = 0; i < 140; i++) {
                var x = parseInt(i % 10);
                var y = parseInt(i / 10);
                if (sj[x][y] == k.toString()) {
                    addid++;
                    //判断是几格的块
                    if (addid == 1 && k < 30) {
                        if (sj[x][y] == sj[x + 1][y] && sj[x][y] == sj[x + 2][y]) {
                            // console.log("3格横", x, y);
                            let cellNode = cc.instantiate(this.cell_h3_Prefeb);
                            cellNode.setPosition(cc.v2((x - 1) * this.cellHSize, (y - 1) * this.cellVSize * -1));
                            this.cellAreaNode.addChild(cellNode);
                            this.cellNodeArr.push(cellNode);

                            this.cellNode2dMapArr[y - 1][x - 1] = "h"
                            this.cellNode2dMapArr[y - 1][x] = "h"
                            this.cellNode2dMapArr[y - 1][x + 1] = "h"
                        } else if (sj[x][y] == sj[x + 1][y]) {
                            // console.log("2格横", x, y);
                            let cellNode = cc.instantiate(this.cell_h2_Prefeb);
                            cellNode.setPosition(cc.v2((x - 1) * this.cellHSize, (y - 1) * this.cellVSize * -1));
                            this.cellAreaNode.addChild(cellNode);
                            this.cellNodeArr.push(cellNode);

                            this.cellNode2dMapArr[y - 1][x - 1] = "h"
                            this.cellNode2dMapArr[y - 1][x] = "h"
                        } else if (sj[x][y] == sj[x][y + 1] && sj[x][y] == sj[x][y + 2]) {
                            // console.log("3竖格", x, y);
                            let cellNode = cc.instantiate(this.cell_v3_Prefeb);
                            cellNode.setPosition(cc.v2((x - 1) * this.cellHSize, (y - 1) * this.cellVSize * -1));
                            this.cellAreaNode.addChild(cellNode);
                            this.cellNodeArr.push(cellNode);

                            this.cellNode2dMapArr[y - 1][x - 1] = "v"
                            this.cellNode2dMapArr[y][x - 1] = "v"
                            this.cellNode2dMapArr[y + 1][x - 1] = "v"
                        } else {
                            let cellNode = cc.instantiate(this.cell_v2_Prefeb);
                            cellNode.setPosition(cc.v2((x - 1) * this.cellHSize, (y - 1) * this.cellVSize * -1));
                            this.cellAreaNode.addChild(cellNode);
                            this.cellNodeArr.push(cellNode);

                            this.cellNode2dMapArr[y - 1][x - 1] = "v"
                            this.cellNode2dMapArr[y][x - 1] = "v"
                        }
                    } else if (k == 30 && addid == 1) {
                        // console.log("k", x, y);
                        let cellNode = cc.instantiate(this.cell_k_Prefeb);
                        cellNode.setPosition(cc.v2((x - 1) * this.cellHSize, (y - 1) * this.cellVSize * -1));
                        this.cellAreaNode.addChild(cellNode);

                        this.cellNode2dMapArr[y - 1][x - 1] = "k"
                        this.cellNode2dMapArr[y][x - 1] = "k"
                    }
                }
            }
        }
    },

    resetMap() {
        let map;
        if (this.firstLevel) {
            this.level1Node.opacity = 255;
            this.level2Node.opacity = 128;
            map = this.getRandomMap1();
        } else {
            this.level1Node.opacity = 128;
            this.level2Node.opacity = 255;
            map = this.getRandomMap2();
        }

        this.time = 60;
        this.cost = 0;
        this.cellHSize = 90;
        this.cellVSize = 90;
        this.parseMapToBlock(map);
        if (!this.firstLevel) {
            this.cellAreaNode.x = 270;
            this.move(this.cellAreaNode, -540, 0);
        }
    },

    back() {
        cc.director.loadScene('home');
    },

    move(node, x, y) {
        //添加动画
        let dua = 1;
        let seq = cc.sequence(
            cc.moveTo(dua, node.x + x, node.y + y),
            cc.callFunc(() => {
                setTimeout(() => {

                }, 1000);
            })
        );

        node.runAction(seq);
    },

    onLoad() {
        window.game = this;
        this.showAlert = false;
        this.firstLevel = true;
        this.map1Index = -1;
        this.map2Index = -1;
        this.destroyTimes = -1;
        this.resetTimes = -1;
        this.changeTimes = -1;
        this.mapRandomIndex = parseInt(Math.random() * 3 + 1);//取[1,4)之间的数据1，2，3
        this.time = 60;
        this.initBg();
        this.initMaps();
        this.resetMap();
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.rankAreaNode.active = true;
        }

        this.timeIndex = setInterval(() => {
            if (!this.showAlert) {
                this.clockLabel.string = --this.time;
                this.cost++;
                this.current = cc.audioEngine.play(this.audio, false);
                if (this.time == 0) {
                    this.fail();
                }
            }
        }, 1000);
    },

    initMaps() {
        this.maps1 = [
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@@@30@@@x@x@x@x@@@2@2@2@@x@x@x@x@@11@3@3@@@x@x@x@x@@11@4@4@4@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@12@30@@@x@x@x@x@@@12@30@@@x@x@x@x@@@@2@2@2@x@x@x@x@@@@3@3@3@x@x@x@x@11@@@@@@x@x@x@x@11@@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@@x@x@x@x@@@11@@@@x@x@x@x@@@11@1@1@1@x@x@x@x@@3@3@30@@@x@x@x@x@@12@@30@@@x@x@x@x@@12@2@2@2@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@1@1@@30@@@x@x@x@x@2@2@@@@@x@x@x@x@11@12@@@@@x@x@x@x@11@12@@@@@x@x@x@x@11@3@3@3@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@1@1@@30@@@x@x@x@x@@11@@@@@x@x@x@x@@11@4@4@4@@x@x@x@x@2@2@3@3@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@1@1@30@@@x@x@x@x@@11@2@2@2@@x@x@x@x@@11@3@3@3@@x@x@x@x@@4@4@4@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@11@@@@x@x@x@x@@@11@3@3@3@x@x@x@x@1@1@1@30@@@x@x@x@x@12@@@30@@@x@x@x@x@12@2@2@2@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@@3@3@3@x@x@x@x@1@1@@@@@x@x@x@x@@@@@@12@x@x@x@x@@@2@2@2@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@@@2@2@2@@x@x@x@x@12@@@@@@x@x@x@x@12@13@@3@3@3@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@12@30@@@x@x@x@x@11@@12@30@@@x@x@x@x@11@@12@1@1@1@x@x@x@x@@@@2@2@@x@x@x@x@@@@@13@@x@x@x@x@3@3@3@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@11@x@x@x@x@2@2@@30@@11@x@x@x@x@4@4@4@30@@11@x@x@x@x@@@@@1@1@x@x@x@x@@12@@3@3@3@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@3@3@11@30@@@x@x@x@x@4@4@@@@@x@x@x@x@12@@@1@1@1@x@x@x@x@12@@@2@2@2@x@x@x@x@12@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@30@@@x@x@x@x@@11@12@30@@@x@x@x@x@@11@12@3@3@3@x@x@x@x@@11@@@@@x@x@x@x@@1@1@@@13@x@x@x@x@@2@2@2@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@12@30@@@x@x@x@x@2@2@12@30@@@x@x@x@x@@@@3@3@3@x@x@x@x@@@@@@@x@x@x@x@@11@4@4@4@@x@x@x@x@@11@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@12@30@13@@x@x@x@x@@@12@30@13@@x@x@x@x@@@12@@2@2@x@x@x@x@11@@@3@3@3@x@x@x@x@11@@@@@@x@x@x@x@11@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@11@30@@@x@x@x@x@@@11@30@@@x@x@x@x@12@13@@2@2@2@x@x@x@x@12@13@@@@@x@x@x@x@3@3@3@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@2@2@@@@@x@x@x@x@@12@@3@3@3@x@x@x@x@@12@@4@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@2@2@11@30@@@x@x@x@x@3@3@3@@@@x@x@x@x@@@@@@@x@x@x@x@12@4@4@4@@@x@x@x@x@12@5@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@30@3@3@x@x@x@x@@11@@30@@13@x@x@x@x@@11@2@2@@13@x@x@x@x@1@1@1@@@13@x@x@x@x@@@12@4@4@@x@x@x@x@@@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@30@3@3@x@x@x@x@@11@@30@@@x@x@x@x@@11@2@2@12@@x@x@x@x@1@1@@@12@@x@x@x@x@@@@@13@@x@x@x@x@4@4@4@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@12@4@4@@@x@x@x@x@@12@@30@3@3@x@x@x@x@@12@@30@@@x@x@x@x@11@1@1@2@2@13@x@x@x@x@11@@@@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@2@2@@@@@x@x@x@x@12@3@3@3@@@x@x@x@x@12@@@4@4@4@x@x@x@x@12@@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@2@2@11@30@@@x@x@x@x@@@@3@3@3@x@x@x@x@@4@4@@@@x@x@x@x@12@5@5@5@@@x@x@x@x@12@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@2@2@2@x@x@x@x@@@12@30@@14@x@x@x@x@1@1@@30@@14@x@x@x@x@11@13@@@@14@x@x@x@x@11@13@@3@3@3@x@x@x@x@11@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@1@x@x@x@x@2@2@11@30@@@x@x@x@x@@@11@30@@@x@x@x@x@3@3@3@@@@x@x@x@x@12@4@4@@@@x@x@x@x@12@5@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@30@12@@x@x@x@x@@11@@30@12@@x@x@x@x@@11@2@2@12@@x@x@x@x@1@1@13@@@@x@x@x@x@@@13@4@4@4@x@x@x@x@3@3@3@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@@30@@@x@x@x@x@@@@30@@@x@x@x@x@11@12@@4@4@4@x@x@x@x@11@12@@5@5@5@x@x@x@x@@2@2@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@30@3@3@x@x@x@x@@11@@30@@@x@x@x@x@@11@2@2@13@@x@x@x@x@1@1@1@@13@14@x@x@x@x@@@@@12@14@x@x@x@x@@@@@12@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@1@1@@30@@@x@x@x@x@2@2@3@3@@13@x@x@x@x@@@@@@13@x@x@x@x@12@11@@4@4@4@x@x@x@x@12@11@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@@30@@@x@x@x@x@@@@30@@13@x@x@x@x@@@4@4@4@13@x@x@x@x@@11@3@3@3@12@x@x@x@x@@11@2@2@2@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@13@@@@x@x@x@x@11@@13@@@@x@x@x@x@11@@14@3@3@3@x@x@x@x@1@1@14@30@@@x@x@x@x@@12@@30@@@x@x@x@x@@12@2@2@2@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@1@1@30@14@@x@x@x@x@@@2@2@14@@x@x@x@x@11@12@13@@14@@x@x@x@x@11@12@13@3@3@3@x@x@x@x@11@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@12@x@x@x@x@@@@30@@12@x@x@x@x@2@2@@3@3@@x@x@x@x@@@4@4@4@@x@x@x@x@@11@5@5@5@@x@x@x@x@@11@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@13@30@@@x@x@x@x@@@13@30@@@x@x@x@x@4@4@@@3@3@x@x@x@x@@@@@@@x@x@x@x@11@12@@2@2@2@x@x@x@x@11@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@13@x@x@x@x@2@2@@30@@13@x@x@x@x@1@1@1@@@13@x@x@x@x@@@@@@@x@x@x@x@11@12@@3@3@3@x@x@x@x@11@12@@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@1@1@@30@@@x@x@x@x@2@2@3@3@@@x@x@x@x@@@4@4@12@@x@x@x@x@@11@5@5@12@@x@x@x@x@@11@@@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@1@1@@30@@@x@x@x@x@@11@3@3@3@@x@x@x@x@@11@4@4@4@@x@x@x@x@2@2@@@5@5@x@x@x@x@@@@@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@1@1@1@30@@@x@x@x@x@2@2@12@@@@x@x@x@x@@11@12@@@13@x@x@x@x@@11@3@3@3@13@x@x@x@x@@11@4@4@4@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@13@4@4@@@x@x@x@x@@13@@30@3@3@x@x@x@x@@13@@30@@@x@x@x@x@1@1@2@2@11@12@x@x@x@x@@@@@11@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@@30@@@x@x@x@x@4@4@4@30@@11@x@x@x@x@13@12@@3@3@11@x@x@x@x@13@12@2@2@2@11@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@12@2@2@13@x@x@x@x@@@12@30@@13@x@x@x@x@@1@1@30@3@3@x@x@x@x@@11@4@4@4@@x@x@x@x@@11@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@1@@@x@x@x@x@@2@2@30@@@x@x@x@x@@@@30@@@x@x@x@x@@@@3@3@3@x@x@x@x@@12@11@@4@4@x@x@x@x@@12@11@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@11@@x@x@x@x@@@@@11@@x@x@x@x@@@@1@1@1@x@x@x@x@12@3@3@30@2@2@x@x@x@x@12@13@@30@@@x@x@x@x@12@13@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@12@x@x@x@x@@11@@30@@12@x@x@x@x@@11@2@2@2@12@x@x@x@x@@@@3@3@3@x@x@x@x@@@5@5@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@@x@x@x@x@@@3@3@2@2@x@x@x@x@@12@4@4@11@@x@x@x@x@@12@@@11@@x@x@x@x@@12@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@@@@x@x@x@x@11@1@1@1@@@x@x@x@x@11@2@2@30@@@x@x@x@x@3@3@12@30@@@x@x@x@x@@@12@5@5@5@x@x@x@x@4@4@4@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@@@1@1@x@x@x@x@@5@5@30@@11@x@x@x@x@@12@@30@@11@x@x@x@x@@12@4@4@4@11@x@x@x@x@@12@3@3@2@2@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@@@30@1@1@x@x@x@x@@12@3@3@2@2@x@x@x@x@@12@@@11@@x@x@x@x@@12@4@4@11@@x@x@x@x@@@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@1@x@x@x@x@@@@30@@11@x@x@x@x@4@4@12@30@@11@x@x@x@x@@13@12@2@2@11@x@x@x@x@@13@@3@3@3@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@1@1@30@@@x@x@x@x@@2@2@30@@@x@x@x@x@@@3@3@3@@x@x@x@x@12@11@4@4@@@x@x@x@x@12@11@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@12@2@2@30@@@x@x@x@x@12@13@@3@3@3@x@x@x@x@12@13@@4@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@@@x@x@x@x@@@11@@@@x@x@x@x@2@2@11@@13@@x@x@x@x@3@3@3@30@13@@x@x@x@x@@12@@30@13@@x@x@x@x@@12@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@@@11@30@@@x@x@x@x@2@2@11@@@@x@x@x@x@@12@3@3@3@13@x@x@x@x@@12@4@4@4@13@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@2@2@30@@@x@x@x@x@@3@3@@@12@x@x@x@x@@11@4@4@@12@x@x@x@x@@11@5@5@5@12@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@11@@x@x@x@x@@@@30@11@@x@x@x@x@@12@1@1@11@@x@x@x@x@@12@13@3@3@3@x@x@x@x@@12@13@4@4@4@x@x@x@x@@2@2@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@30@@@x@x@x@x@@@12@30@@@x@x@x@x@1@1@12@4@4@13@x@x@x@x@11@3@3@3@@13@x@x@x@x@11@@@@@13@x@x@x@x@2@2@2@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@13@30@@@x@x@x@x@11@12@13@30@@@x@x@x@x@11@12@4@4@4@@x@x@x@x@2@2@2@@@@x@x@x@x@3@3@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@@@@x@x@x@x@@@@30@@@x@x@x@x@2@2@2@30@@13@x@x@x@x@11@12@3@3@@13@x@x@x@x@11@12@4@4@4@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@1@30@13@@x@x@x@x@2@2@2@30@13@@x@x@x@x@3@3@12@@@@x@x@x@x@@11@12@@@@x@x@x@x@@11@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@2@2@30@@@x@x@x@x@@11@@3@3@3@x@x@x@x@@11@13@@@12@x@x@x@x@1@1@13@@@12@x@x@x@x@@@13@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@30@@@x@x@x@x@1@1@12@30@@@x@x@x@x@2@2@2@@@@x@x@x@x@3@3@@@5@5@x@x@x@x@@11@@@@@x@x@x@x@@11@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@12@x@x@x@x@11@2@2@2@@12@x@x@x@x@@@@30@3@3@x@x@x@x@@@13@30@@@x@x@x@x@@@13@4@4@4@x@x@x@x@@@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@@@@@x@x@x@x@2@2@2@30@@@x@x@x@x@3@3@3@30@@@x@x@x@x@11@12@4@4@4@@x@x@x@x@11@12@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@30@@@x@x@x@x@1@1@12@30@@@x@x@x@x@11@@2@2@3@3@x@x@x@x@11@@@4@4@4@x@x@x@x@@@@5@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@@3@3@3@x@x@x@x@@@@4@4@4@x@x@x@x@2@2@12@@@@x@x@x@x@@@12@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@@@30@@@x@x@x@x@@11@5@5@5@@x@x@x@x@12@11@@@@@x@x@x@x@12@2@2@3@3@@x@x@x@x@12@4@4@4@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@12@@30@@@x@x@x@x@11@12@@30@@@x@x@x@x@11@12@2@2@2@@x@x@x@x@1@1@13@@@14@x@x@x@x@@@13@@@14@x@x@x@x@@@13@3@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@12@2@2@30@@@x@x@x@x@12@14@@3@3@3@x@x@x@x@13@14@@@@@x@x@x@x@13@14@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@@30@@@x@x@x@x@@11@@30@@@x@x@x@x@12@11@4@4@4@13@x@x@x@x@12@2@2@2@@13@x@x@x@x@12@3@3@3@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@1@1@x@x@x@x@@@11@30@@@x@x@x@x@12@13@2@2@2@@x@x@x@x@12@13@3@3@14@@x@x@x@x@12@13@@@14@@x@x@x@x@@@@@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@@@@x@x@x@x@1@1@12@30@@@x@x@x@x@11@2@2@30@@@x@x@x@x@11@@3@3@3@@x@x@x@x@11@@4@4@4@@x@x@x@x@@@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@2@2@11@12@x@x@x@x@13@3@3@3@11@12@x@x@x@x@13@4@4@30@@12@x@x@x@x@@@@30@@@x@x@x@x@14@15@@5@5@5@x@x@x@x@14@15@@@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@13@@11@30@2@2@x@x@x@x@13@8@8@30@3@3@x@x@x@x@@9@9@4@4@12@x@x@x@x@@@@5@5@12@x@x@x@x@@7@7@@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@30@4@4@x@x@x@x@1@1@13@30@@@x@x@x@x@@12@13@@@@x@x@x@x@11@12@2@2@3@3@x@x@x@x@11@@@@@@x@x@x@x@@@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@30@12@@x@x@x@x@@11@@30@12@@x@x@x@x@@11@1@1@12@@x@x@x@x@@2@2@2@@@x@x@x@x@@@13@@@@x@x@x@x@3@3@13@@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@@3@3@x@x@x@x@1@1@13@30@@@x@x@x@x@2@2@14@30@@@x@x@x@x@11@12@14@@4@4@x@x@x@x@11@12@5@5@5@@x@x@x@x@@12@@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@@@@x@x@x@x@11@3@3@3@13@14@x@x@x@x@1@1@15@30@13@14@x@x@x@x@12@@15@30@4@4@x@x@x@x@12@@@5@5@5@x@x@x@x@@2@2@2@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@14@x@x@x@x@@@12@@@14@x@x@x@x@1@1@12@30@@@x@x@x@x@2@2@@30@4@4@x@x@x@x@11@@3@3@3@13@x@x@x@x@11@@@@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@15@@x@x@x@x@@@@30@15@@x@x@x@x@1@1@13@30@@14@x@x@x@x@11@@13@@@14@x@x@x@x@11@@2@2@2@14@x@x@x@x@11@3@3@@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@11@2@2@30@@@x@x@x@x@11@12@@3@3@3@x@x@x@x@@12@@4@4@4@x@x@x@x@@@@@5@5@x@x@x@x@7@7@@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@14@@x@x@x@x@2@2@@30@14@@x@x@x@x@3@3@12@30@5@5@x@x@x@x@11@@12@6@6@6@x@x@x@x@11@@13@@7@7@x@x@x@x@4@4@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@30@2@2@x@x@x@x@11@1@1@30@13@@x@x@x@x@@15@3@3@13@@x@x@x@x@12@15@4@4@13@@x@x@x@x@12@@16@@5@5@x@x@x@x@6@6@16@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@2@2@2@x@x@x@x@@@13@30@@@x@x@x@x@1@1@13@30@@@x@x@x@x@11@@3@3@4@4@x@x@x@x@11@12@@@@@x@x@x@x@@12@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@13@x@x@x@x@@@11@30@@13@x@x@x@x@1@1@11@30@12@13@x@x@x@x@2@2@@@12@@x@x@x@x@@14@3@3@3@@x@x@x@x@@14@4@4@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@6@6@x@x@x@x@@12@2@2@13@@x@x@x@x@@12@@@13@14@x@x@x@x@@12@3@3@13@14@x@x@x@x@4@4@@5@5@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@@@@x@x@x@x@11@@7@7@7@@x@x@x@x@1@1@@6@6@@x@x@x@x@12@4@4@30@5@5@x@x@x@x@12@@@30@@13@x@x@x@x@2@2@@3@3@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@30@@@x@x@x@x@11@@13@30@2@2@x@x@x@x@12@@13@3@3@3@x@x@x@x@12@@13@@4@4@x@x@x@x@@@@@15@14@x@x@x@x@@5@5@5@15@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@12@30@@@x@x@x@x@11@@12@30@2@2@x@x@x@x@11@6@6@6@13@14@x@x@x@x@@5@5@5@13@14@x@x@x@x@@@4@4@13@14@x@x@x@x@@@3@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@@11@12@x@x@x@x@@@@30@11@12@x@x@x@x@6@6@16@30@@12@x@x@x@x@14@13@16@2@2@2@x@x@x@x@14@13@3@3@3@@x@x@x@x@14@13@5@5@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@@@x@x@x@x@14@4@4@30@@@x@x@x@x@14@13@@30@2@2@x@x@x@x@15@13@@3@3@11@x@x@x@x@15@5@5@5@12@11@x@x@x@x@6@6@@@12@11@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@30@1@1@x@x@x@x@11@13@@30@@14@x@x@x@x@@13@2@2@15@14@x@x@x@x@12@13@3@3@15@14@x@x@x@x@12@@16@4@4@4@x@x@x@x@6@6@16@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@12@30@1@1@x@x@x@x@@11@12@30@@@x@x@x@x@@11@2@2@13@@x@x@x@x@@3@3@@13@@x@x@x@x@4@4@@@5@5@x@x@x@x@@@@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@13@30@@@x@x@x@x@@11@13@30@@@x@x@x@x@@12@1@1@1@@x@x@x@x@@12@14@2@2@@x@x@x@x@3@3@14@@@@x@x@x@x@@4@4@@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@1@1@@x@x@x@x@11@@12@2@2@2@x@x@x@x@11@3@3@30@@@x@x@x@x@11@13@@30@@@x@x@x@x@@13@@4@4@4@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@13@30@@@x@x@x@x@@12@13@30@@@x@x@x@x@11@12@2@2@3@3@x@x@x@x@11@@@4@4@@x@x@x@x@@@5@5@5@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@11@1@1@30@@@x@x@x@x@11@12@@3@3@3@x@x@x@x@11@12@@4@4@@x@x@x@x@@2@2@5@5@@x@x@x@x@@@6@6@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@11@x@x@x@x@@@@@@11@x@x@x@x@@1@1@1@@12@x@x@x@x@2@2@14@30@@12@x@x@x@x@@13@14@30@3@3@x@x@x@x@@13@14@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@2@2@x@x@x@x@3@3@3@30@12@@x@x@x@x@@11@4@4@12@@x@x@x@x@@11@@@@@x@x@x@x@@@5@5@14@@x@x@x@x@@6@6@6@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@11@12@@30@@@x@x@x@x@11@12@3@3@4@4@x@x@x@x@2@2@5@5@14@@x@x@x@x@13@@@@14@@x@x@x@x@13@@6@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@1@1@30@@@x@x@x@x@11@12@@6@6@6@x@x@x@x@11@12@@5@5@5@x@x@x@x@@2@2@2@@@x@x@x@x@3@3@@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@'
        ];
        this.maps2 = [
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@12@x@x@x@x@@@@30@@12@x@x@x@x@@@@@2@2@x@x@x@x@11@@13@3@3@3@x@x@x@x@11@@13@@@@x@x@x@x@11@@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@12@30@@@x@x@x@x@11@@12@30@@13@x@x@x@x@11@@2@2@2@13@x@x@x@x@@@3@3@3@13@x@x@x@x@@@@@@@x@x@x@x@4@4@4@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@11@@3@3@@x@x@x@x@@11@12@30@4@4@x@x@x@x@@11@12@30@@@x@x@x@x@1@1@2@2@13@@x@x@x@x@@@@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@@30@11@@x@x@x@x@4@4@@30@11@@x@x@x@x@3@3@2@2@11@@x@x@x@x@@12@5@5@5@@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@@@@30@@11@x@x@x@x@@3@3@30@@@x@x@x@x@@13@12@2@2@2@x@x@x@x@@13@12@@14@@x@x@x@x@@13@12@@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@14@x@x@x@x@@@@30@@14@x@x@x@x@@@@30@2@2@x@x@x@x@@12@13@3@3@3@x@x@x@x@11@12@13@@@@x@x@x@x@11@12@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@12@@2@2@2@@x@x@x@x@12@@3@3@3@@x@x@x@x@@@4@4@4@@x@x@x@x@@@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@30@@@x@x@x@x@1@1@13@30@@@x@x@x@x@11@12@2@2@2@@x@x@x@x@11@12@3@3@3@@x@x@x@x@@@4@4@4@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@@x@x@x@x@1@1@11@@@@x@x@x@x@2@2@2@@@@x@x@x@x@3@3@3@30@@@x@x@x@x@12@4@4@30@@@x@x@x@x@12@5@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@11@@@30@@@x@x@x@x@11@@12@3@3@3@x@x@x@x@11@@12@4@4@@x@x@x@x@1@1@12@@13@@x@x@x@x@2@2@2@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@13@@x@x@x@x@12@@11@30@13@@x@x@x@x@12@2@2@2@13@@x@x@x@x@3@3@3@@@@x@x@x@x@@@@@@@x@x@x@x@4@4@4@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@@@@x@x@x@x@@@12@1@1@11@x@x@x@x@@2@2@30@@11@x@x@x@x@@13@@30@@11@x@x@x@x@@13@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@@@11@2@2@2@x@x@x@x@@13@3@3@12@@x@x@x@x@@13@@@12@@x@x@x@x@@@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@@x@x@x@x@@@@2@2@@x@x@x@x@@4@4@3@3@11@x@x@x@x@@12@5@5@5@11@x@x@x@x@@12@@@@11@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@@@@x@x@x@x@1@1@13@@@@x@x@x@x@2@2@2@30@@@x@x@x@x@3@3@3@30@@@x@x@x@x@11@12@@@@@x@x@x@x@11@12@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@3@3@3@@x@x@x@x@4@4@5@5@12@@x@x@x@x@@@@@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@@@@x@x@x@x@@@@@12@@x@x@x@x@2@2@@30@12@@x@x@x@x@3@3@3@30@12@@x@x@x@x@@11@4@4@5@5@x@x@x@x@@11@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@13@3@3@3@x@x@x@x@@12@13@2@2@@x@x@x@x@@12@13@@14@@x@x@x@x@@1@1@1@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@@@@30@@11@x@x@x@x@@@@30@2@2@x@x@x@x@14@13@12@3@3@3@x@x@x@x@14@13@12@@@@x@x@x@x@14@13@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@@11@30@@@x@x@x@x@@@11@2@2@2@x@x@x@x@@@3@3@3@12@x@x@x@x@@13@@@@12@x@x@x@x@@13@4@4@4@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@2@2@11@30@@@x@x@x@x@12@3@3@30@@@x@x@x@x@12@4@4@4@@@x@x@x@x@12@5@5@5@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@12@@30@11@@x@x@x@x@@12@2@2@11@@x@x@x@x@@12@3@3@11@@x@x@x@x@@@13@4@4@4@x@x@x@x@@@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@@@13@@x@x@x@x@2@2@12@30@13@@x@x@x@x@@11@12@30@13@@x@x@x@x@@11@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@@13@12@30@@11@x@x@x@x@@13@12@30@2@2@x@x@x@x@@13@12@3@3@3@x@x@x@x@@@4@4@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@@@@x@x@x@x@1@1@12@30@@@x@x@x@x@11@2@2@30@5@5@x@x@x@x@11@3@3@3@@@x@x@x@x@11@4@4@4@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@12@@@1@1@x@x@x@x@@12@13@30@2@2@x@x@x@x@@12@13@30@@11@x@x@x@x@@4@4@3@3@11@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@@@30@@@x@x@x@x@@@11@4@4@4@x@x@x@x@@12@11@3@3@@x@x@x@x@@12@11@@13@@x@x@x@x@@2@2@2@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@@@11@30@13@@x@x@x@x@2@2@2@30@13@@x@x@x@x@@12@@@3@3@x@x@x@x@@12@@@@@x@x@x@x@@12@@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@14@x@x@x@x@11@12@13@30@@14@x@x@x@x@11@12@13@2@2@@x@x@x@x@11@@13@3@3@3@x@x@x@x@@@@@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@12@30@@@x@x@x@x@2@2@12@30@@@x@x@x@x@3@3@3@@@@x@x@x@x@4@4@4@@@@x@x@x@x@11@@@@@@x@x@x@x@11@5@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@2@2@@11@x@x@x@x@@@@30@@11@x@x@x@x@@1@1@30@@11@x@x@x@x@@@3@3@4@4@x@x@x@x@@12@@@@@x@x@x@x@@12@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@11@x@x@x@x@@@2@2@@11@x@x@x@x@4@4@3@3@@11@x@x@x@x@12@13@@@@@x@x@x@x@12@13@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@@30@@13@x@x@x@x@11@12@@30@@13@x@x@x@x@11@1@1@1@@13@x@x@x@x@@@14@2@2@@x@x@x@x@3@3@14@@15@@x@x@x@x@@@14@@15@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@11@@x@x@x@x@@@@30@11@@x@x@x@x@@2@2@30@11@@x@x@x@x@@12@3@3@3@@x@x@x@x@@12@4@4@5@5@x@x@x@x@@@@@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@1@1@11@x@x@x@x@@@12@30@@11@x@x@x@x@2@2@12@30@@11@x@x@x@x@@3@3@3@@@x@x@x@x@@13@@@@@x@x@x@x@@13@4@4@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@@x@x@x@x@@@11@@@@x@x@x@x@@@11@2@2@12@x@x@x@x@5@5@5@30@@12@x@x@x@x@@13@@30@@12@x@x@x@x@@13@4@4@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@30@@@x@x@x@x@@@13@30@1@1@x@x@x@x@3@3@13@@12@11@x@x@x@x@14@@2@2@12@11@x@x@x@x@14@@@@@@x@x@x@x@14@4@4@4@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@@1@1@11@x@x@x@x@@3@3@3@@11@x@x@x@x@12@4@4@30@2@2@x@x@x@x@12@13@@30@@@x@x@x@x@12@13@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@1@11@@x@x@x@x@@@@@11@@x@x@x@x@@@12@30@2@2@x@x@x@x@3@3@12@30@@@x@x@x@x@@13@12@4@4@4@x@x@x@x@@13@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@4@4@30@@@x@x@x@x@@13@12@2@2@11@x@x@x@x@@13@12@@@11@x@x@x@x@@14@12@3@3@3@x@x@x@x@@14@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@1@x@x@x@x@@@12@30@2@2@x@x@x@x@5@5@12@30@@11@x@x@x@x@13@@12@3@3@11@x@x@x@x@13@@4@4@4@11@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@2@2@@x@x@x@x@11@@12@@@@x@x@x@x@@@12@3@3@3@x@x@x@x@4@4@12@30@@@x@x@x@x@@13@@30@@@x@x@x@x@@13@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@@x@x@x@x@@@11@1@1@1@x@x@x@x@12@2@2@30@@@x@x@x@x@12@13@@30@@14@x@x@x@x@12@13@3@3@3@14@x@x@x@x@@@4@4@4@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@@2@2@11@x@x@x@x@5@5@12@30@@11@x@x@x@x@@13@12@30@@11@x@x@x@x@@13@4@4@3@3@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@@x@x@x@x@@@@2@2@@x@x@x@x@5@5@@3@3@13@x@x@x@x@11@12@4@4@4@13@x@x@x@x@11@12@@@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@14@@30@@@x@x@x@x@@14@15@1@1@1@x@x@x@x@@13@15@2@2@11@x@x@x@x@@13@15@@12@11@x@x@x@x@@3@3@3@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@3@3@3@x@x@x@x@11@12@@30@4@4@x@x@x@x@11@12@@30@5@5@x@x@x@x@11@12@@@@13@x@x@x@x@1@1@2@2@@13@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@12@30@@@x@x@x@x@2@2@12@30@@@x@x@x@x@3@3@6@6@@@x@x@x@x@11@5@5@5@@@x@x@x@x@11@@@@@@x@x@x@x@11@4@4@4@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@1@@@x@x@x@x@@11@@30@6@6@x@x@x@x@@11@@30@5@5@x@x@x@x@@11@@@@12@x@x@x@x@@2@2@3@3@12@x@x@x@x@@@@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@@2@2@30@@@x@x@x@x@@12@3@3@3@13@x@x@x@x@@12@4@4@@13@x@x@x@x@@12@5@5@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@12@30@3@3@x@x@x@x@@11@12@4@4@4@x@x@x@x@2@2@12@@@13@x@x@x@x@@@@@@13@x@x@x@x@@@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@@@30@@@x@x@x@x@12@2@2@2@@15@x@x@x@x@12@@11@3@3@15@x@x@x@x@12@@11@@13@14@x@x@x@x@1@1@11@@13@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@@11@30@5@5@x@x@x@x@@@11@4@4@4@x@x@x@x@@13@2@2@2@12@x@x@x@x@@13@@@@12@x@x@x@x@@@3@3@3@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@1@@@x@x@x@x@@@11@30@@@x@x@x@x@2@2@11@30@@13@x@x@x@x@@12@3@3@3@13@x@x@x@x@@12@@@@13@x@x@x@x@@12@4@4@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@11@x@x@x@x@4@4@5@5@@11@x@x@x@x@12@3@3@3@@11@x@x@x@x@12@@13@@2@2@x@x@x@x@12@@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@@2@2@30@@@x@x@x@x@13@12@3@3@3@14@x@x@x@x@13@12@@@@14@x@x@x@x@13@12@4@4@4@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@13@@@1@1@x@x@x@x@@13@@30@2@2@x@x@x@x@@13@@30@@@x@x@x@x@4@4@3@3@11@12@x@x@x@x@@@5@5@11@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@12@3@3@14@x@x@x@x@@11@12@30@15@14@x@x@x@x@1@1@12@30@15@14@x@x@x@x@13@@@@@@x@x@x@x@13@2@2@2@@@x@x@x@x@13@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@12@11@x@x@x@x@@@@30@12@11@x@x@x@x@@13@1@1@12@11@x@x@x@x@@13@14@2@2@2@x@x@x@x@@13@14@@@@x@x@x@x@@3@3@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@2@2@@x@x@x@x@@@@30@13@@x@x@x@x@@3@3@30@13@@x@x@x@x@@11@4@4@13@@x@x@x@x@@11@12@5@5@5@x@x@x@x@@11@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@12@@11@30@5@5@x@x@x@x@12@2@2@2@@13@x@x@x@x@3@3@3@@@13@x@x@x@x@@@@@@13@x@x@x@x@4@4@4@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@13@@x@x@x@x@@2@2@30@13@@x@x@x@x@@3@3@@13@@x@x@x@x@12@11@@@@@x@x@x@x@12@11@4@4@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@14@4@4@@x@x@x@x@11@@14@@13@@x@x@x@x@11@5@5@30@13@@x@x@x@x@1@1@1@30@13@@x@x@x@x@@12@2@2@2@@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@@30@6@6@x@x@x@x@@11@@30@@@x@x@x@x@@3@3@4@4@12@x@x@x@x@@@@5@5@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@11@x@x@x@x@@@@30@@11@x@x@x@x@@4@4@30@@11@x@x@x@x@12@3@3@2@2@@x@x@x@x@12@13@@@@@x@x@x@x@12@13@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@@@14@13@x@x@x@x@2@2@@30@14@13@x@x@x@x@11@12@@30@14@13@x@x@x@x@11@12@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@@@2@2@12@11@x@x@x@x@@13@3@3@3@11@x@x@x@x@@13@14@4@4@4@x@x@x@x@@13@14@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@3@3@3@@11@x@x@x@x@13@14@15@30@@11@x@x@x@x@13@14@15@30@1@1@x@x@x@x@@14@15@2@2@2@x@x@x@x@@@@@12@@x@x@x@x@@@@@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@2@2@11@30@@@x@x@x@x@3@3@3@30@@@x@x@x@x@@12@@4@4@4@x@x@x@x@@12@@5@5@5@x@x@x@x@@@@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@5@5@13@@x@x@x@x@4@4@12@30@13@@x@x@x@x@@11@12@30@13@@x@x@x@x@@11@3@3@2@2@x@x@x@x@@@@@1@1@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@2@2@12@x@x@x@x@11@@@@@12@x@x@x@x@11@3@3@30@@12@x@x@x@x@4@4@4@30@@@x@x@x@x@@@13@5@5@5@x@x@x@x@@@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@13@30@@@x@x@x@x@11@12@13@30@1@1@x@x@x@x@11@12@@2@2@@x@x@x@x@@@@@14@@x@x@x@x@4@4@3@3@14@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@5@5@@12@@x@x@x@x@@4@4@30@12@13@x@x@x@x@@11@@30@12@13@x@x@x@x@@11@3@3@2@2@x@x@x@x@@@@@1@1@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@@@@x@x@x@x@1@1@12@@@@x@x@x@x@2@2@2@@@@x@x@x@x@3@3@3@30@@@x@x@x@x@11@4@4@30@6@6@x@x@x@x@11@5@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@12@2@2@30@@14@x@x@x@x@12@13@4@4@4@14@x@x@x@x@12@13@3@3@3@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@@30@11@@x@x@x@x@4@4@@30@11@@x@x@x@x@3@3@2@2@11@@x@x@x@x@@12@5@5@5@@x@x@x@x@@12@6@6@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@5@5@@x@x@x@x@11@@@30@13@@x@x@x@x@11@1@1@30@13@@x@x@x@x@2@2@3@3@13@@x@x@x@x@@12@4@4@4@@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@@12@11@30@@@x@x@x@x@13@12@2@2@2@@x@x@x@x@13@4@4@3@3@@x@x@x@x@13@@@@@@x@x@x@x@5@5@5@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@1@1@@30@@13@x@x@x@x@@11@2@2@@13@x@x@x@x@@11@3@3@@13@x@x@x@x@@@12@5@5@5@x@x@x@x@4@4@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@@@x@x@x@x@@12@2@2@@@x@x@x@x@@12@11@30@5@5@x@x@x@x@@12@11@30@@13@x@x@x@x@@3@3@4@4@13@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@12@@30@1@1@x@x@x@x@@12@@30@11@@x@x@x@x@@12@2@2@11@@x@x@x@x@3@3@13@@11@@x@x@x@x@@@13@4@4@4@x@x@x@x@5@5@5@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@@x@x@x@x@@@11@1@1@1@x@x@x@x@@@2@2@2@12@x@x@x@x@13@3@3@30@@12@x@x@x@x@13@14@@30@@@x@x@x@x@13@14@@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@2@2@11@30@@@x@x@x@x@3@3@4@4@@12@x@x@x@x@@13@5@5@5@12@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@@14@30@@@x@x@x@x@@@14@1@1@1@x@x@x@x@13@@14@2@2@11@x@x@x@x@13@@3@3@12@11@x@x@x@x@13@4@4@4@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@6@6@11@x@x@x@x@@@@@@11@x@x@x@x@@5@5@30@@11@x@x@x@x@@4@4@30@1@1@x@x@x@x@@12@@2@2@2@x@x@x@x@@12@@3@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@1@x@x@x@x@@@14@30@@11@x@x@x@x@4@4@14@30@@11@x@x@x@x@13@12@2@2@2@11@x@x@x@x@13@12@@@3@3@x@x@x@x@13@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@1@1@1@@x@x@x@x@11@12@2@2@@@x@x@x@x@11@12@@30@3@3@x@x@x@x@@@@30@13@@x@x@x@x@5@5@4@4@13@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@2@2@11@30@@@x@x@x@x@12@3@3@@5@5@x@x@x@x@12@4@4@4@@13@x@x@x@x@@@@@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@@2@2@30@@@x@x@x@x@13@12@3@3@3@14@x@x@x@x@13@12@@@@14@x@x@x@x@13@12@4@4@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@5@5@@x@x@x@x@11@@@30@@@x@x@x@x@11@1@1@30@13@@x@x@x@x@2@2@3@3@13@@x@x@x@x@@12@@@13@@x@x@x@x@@12@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@@@14@@x@x@x@x@2@2@13@30@14@@x@x@x@x@11@12@13@30@14@@x@x@x@x@11@12@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@@30@6@6@x@x@x@x@@11@@30@@@x@x@x@x@@3@3@4@4@12@x@x@x@x@@5@5@5@@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@13@@@1@1@x@x@x@x@@13@@30@2@2@x@x@x@x@12@13@@30@@@x@x@x@x@12@4@4@3@3@11@x@x@x@x@12@5@5@5@@11@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@@x@x@x@x@11@@12@@@@x@x@x@x@2@2@12@30@@@x@x@x@x@@@12@30@@14@x@x@x@x@13@@3@3@3@14@x@x@x@x@13@@4@4@4@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@@1@1@1@x@x@x@x@11@12@@@2@2@x@x@x@x@@12@@30@3@3@x@x@x@x@@@@30@@13@x@x@x@x@4@4@5@5@@13@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@12@30@1@1@x@x@x@x@4@4@12@30@@11@x@x@x@x@13@@12@2@2@11@x@x@x@x@13@@3@3@3@11@x@x@x@x@5@5@5@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@11@x@x@x@x@@@@30@@11@x@x@x@x@13@3@3@3@@11@x@x@x@x@13@14@15@@2@2@x@x@x@x@13@14@15@@12@@x@x@x@x@1@1@15@@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@2@2@11@30@@@x@x@x@x@12@3@3@30@@@x@x@x@x@12@@@4@4@4@x@x@x@x@12@@@5@5@5@x@x@x@x@@@@@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@3@3@3@@x@x@x@x@6@6@4@4@12@@x@x@x@x@@@5@5@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@@15@30@@@x@x@x@x@12@@15@3@3@3@x@x@x@x@12@@15@@@@x@x@x@x@11@1@1@@13@14@x@x@x@x@11@2@2@2@13@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@',
        ];
        this.maps3 = [
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@11@@@1@1@x@x@x@x@@11@13@30@2@2@x@x@x@x@@11@13@30@@@x@x@x@x@@4@4@5@5@12@x@x@x@x@@@@6@6@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@12@30@3@3@x@x@x@x@@11@12@30@13@@x@x@x@x@5@5@4@4@13@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@3@3@@x@x@x@x@1@1@12@30@@@x@x@x@x@2@2@2@30@@@x@x@x@x@11@@@4@4@4@x@x@x@x@11@@@5@5@5@x@x@x@x@@@@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@@x@x@x@x@@@11@30@@@x@x@x@x@@@11@30@4@4@x@x@x@x@@2@2@2@14@13@x@x@x@x@@12@@@14@13@x@x@x@x@@12@3@3@3@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@12@30@@@x@x@x@x@@11@12@30@@@x@x@x@x@@@12@1@1@1@x@x@x@x@14@15@@2@2@@x@x@x@x@14@15@@@13@@x@x@x@x@14@3@3@3@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@@5@5@11@x@x@x@x@@4@4@30@12@11@x@x@x@x@@13@@30@12@11@x@x@x@x@@13@3@3@1@1@x@x@x@x@@@@@2@2@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@1@1@@13@12@x@x@x@x@@2@2@30@13@12@x@x@x@x@@11@@30@13@12@x@x@x@x@@11@3@3@4@4@x@x@x@x@@@@@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@@x@x@x@x@11@@12@30@@@x@x@x@x@11@@12@5@5@5@x@x@x@x@2@2@2@@@13@x@x@x@x@@3@3@@@13@x@x@x@x@4@4@4@@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@11@x@x@x@x@@@@30@@11@x@x@x@x@@12@3@3@2@2@x@x@x@x@@12@4@4@5@5@x@x@x@x@@@@@@@x@x@x@x@@@@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@@@11@x@x@x@x@@@12@1@1@11@x@x@x@x@2@2@@30@@11@x@x@x@x@13@14@@30@3@3@x@x@x@x@13@14@@4@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@@@30@@@x@x@x@x@@@11@2@2@2@x@x@x@x@@12@11@3@3@@x@x@x@x@@12@11@@13@14@x@x@x@x@@4@4@4@13@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@12@11@x@x@x@x@@1@1@30@12@11@x@x@x@x@@2@2@30@12@11@x@x@x@x@@13@@@@@x@x@x@x@@13@3@3@4@4@x@x@x@x@@5@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@@2@2@30@@@x@x@x@x@@12@3@3@3@13@x@x@x@x@@12@4@4@4@13@x@x@x@x@@12@@5@5@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@6@6@@12@@x@x@x@x@@5@5@30@12@@x@x@x@x@@11@@30@12@@x@x@x@x@@11@3@3@4@4@x@x@x@x@@@2@2@1@1@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@11@@x@x@x@x@@@4@4@11@@x@x@x@x@14@13@3@3@11@@x@x@x@x@14@13@12@2@2@2@x@x@x@x@14@13@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@15@x@x@x@x@12@2@2@30@@15@x@x@x@x@12@13@3@3@3@14@x@x@x@x@12@13@@@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@@@11@@13@@x@x@x@x@@2@2@30@13@@x@x@x@x@3@3@3@30@13@@x@x@x@x@@12@4@4@5@5@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@@x@x@x@x@@@11@1@1@1@x@x@x@x@12@2@2@30@@@x@x@x@x@12@13@@30@@14@x@x@x@x@12@13@3@3@3@14@x@x@x@x@@13@@4@4@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@2@2@1@1@11@x@x@x@x@@@@@@11@x@x@x@x@@@12@3@3@3@x@x@x@x@4@4@12@30@@@x@x@x@x@@13@12@30@@@x@x@x@x@@13@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@1@1@1@@x@x@x@x@11@12@2@2@@@x@x@x@x@@12@@30@3@3@x@x@x@x@@@@30@13@@x@x@x@x@5@5@4@4@13@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@3@3@3@x@x@x@x@11@@@30@@@x@x@x@x@1@1@12@30@@15@x@x@x@x@@13@12@@@15@x@x@x@x@14@13@2@2@2@15@x@x@x@x@14@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@11@2@2@2@x@x@x@x@@@11@30@@@x@x@x@x@13@3@3@30@@15@x@x@x@x@13@14@4@4@4@15@x@x@x@x@13@14@@@@15@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@@x@x@x@x@11@@@30@@@x@x@x@x@11@@12@4@4@4@x@x@x@x@11@@12@@@@x@x@x@x@2@2@12@@13@14@x@x@x@x@@3@3@3@13@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@@@14@x@x@x@x@11@2@2@2@@14@x@x@x@x@1@1@13@30@@14@x@x@x@x@12@@13@30@4@4@x@x@x@x@12@3@3@3@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@@x@x@x@x@1@1@11@30@@13@x@x@x@x@2@2@11@30@@13@x@x@x@x@@12@4@4@5@5@x@x@x@x@@12@@@@@x@x@x@x@3@3@3@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@3@3@3@x@x@x@x@11@@@30@@@x@x@x@x@1@1@14@30@@15@x@x@x@x@12@13@14@@@15@x@x@x@x@12@13@2@2@2@15@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@12@13@@@1@1@x@x@x@x@12@13@14@30@2@2@x@x@x@x@12@13@14@30@@11@x@x@x@x@@4@4@3@3@11@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@4@4@@12@11@x@x@x@x@14@3@3@30@12@11@x@x@x@x@14@13@@30@12@11@x@x@x@x@14@13@2@2@1@1@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@13@@@@x@x@x@x@11@@13@4@4@4@x@x@x@x@11@1@1@1@@@x@x@x@x@2@2@@30@14@@x@x@x@x@@12@@30@14@@x@x@x@x@@12@3@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@30@@@x@x@x@x@@11@@30@12@@x@x@x@x@@11@1@1@12@@x@x@x@x@2@2@2@@12@@x@x@x@x@@@13@4@4@4@x@x@x@x@3@3@13@@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@12@@11@30@@@x@x@x@x@12@@@5@5@5@x@x@x@x@2@2@2@@13@@x@x@x@x@3@3@@@13@@x@x@x@x@4@4@4@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@2@2@11@@@@x@x@x@x@3@3@3@30@@@x@x@x@x@4@4@4@30@@@x@x@x@x@@12@5@5@5@@x@x@x@x@@12@6@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@@x@x@x@x@11@12@@30@@@x@x@x@x@11@12@2@2@@@x@x@x@x@11@12@3@3@3@@x@x@x@x@5@5@4@4@13@@x@x@x@x@@@@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@1@1@@@@13@x@x@x@x@2@2@12@30@14@13@x@x@x@x@@11@12@30@14@13@x@x@x@x@@11@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@@x@x@x@x@@@@30@@@x@x@x@x@11@2@2@30@4@4@x@x@x@x@11@@3@3@3@12@x@x@x@x@11@@13@5@5@12@x@x@x@x@@@13@@@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@@x@x@x@x@@@11@1@1@1@x@x@x@x@@2@2@30@@@x@x@x@x@@12@@30@@14@x@x@x@x@13@12@3@3@3@14@x@x@x@x@13@12@4@4@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@@12@30@@@x@x@x@x@@@12@1@1@1@x@x@x@x@14@13@12@2@2@@x@x@x@x@14@13@3@3@11@@x@x@x@x@14@4@4@4@11@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@12@@6@6@2@2@x@x@x@x@12@@@3@3@3@x@x@x@x@12@@@4@4@4@x@x@x@x@@@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@3@3@4@4@12@x@x@x@x@11@@@@@12@x@x@x@x@11@2@2@30@@12@x@x@x@x@1@1@1@30@@@x@x@x@x@@@13@@@@x@x@x@x@@@13@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@30@12@@x@x@x@x@@11@@30@12@@x@x@x@x@@11@1@1@12@@x@x@x@x@2@2@13@@@@x@x@x@x@@@13@5@5@5@x@x@x@x@4@4@3@3@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@12@@@1@1@x@x@x@x@@12@@30@2@2@x@x@x@x@@12@@30@13@11@x@x@x@x@5@5@4@4@13@11@x@x@x@x@@@@3@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@11@x@x@x@x@@@@30@@11@x@x@x@x@@4@4@30@@11@x@x@x@x@@3@3@2@2@@x@x@x@x@@12@@6@6@6@x@x@x@x@@12@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@2@2@@x@x@x@x@11@@@30@12@@x@x@x@x@11@4@4@30@12@@x@x@x@x@3@3@3@@12@@x@x@x@x@@@13@@@@x@x@x@x@@@13@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@@@@x@x@x@x@@@11@2@2@2@x@x@x@x@@@3@3@3@@x@x@x@x@13@4@4@30@@@x@x@x@x@13@12@@30@@@x@x@x@x@13@12@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@@@30@@@x@x@x@x@11@@13@2@2@2@x@x@x@x@11@12@13@3@3@14@x@x@x@x@11@12@13@@15@14@x@x@x@x@1@1@1@@15@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@12@@x@x@x@x@11@@@@12@@x@x@x@x@11@2@2@30@12@@x@x@x@x@3@3@3@30@@@x@x@x@x@@13@@@@@x@x@x@x@@13@4@4@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@@x@x@x@x@@@12@30@@@x@x@x@x@@@12@2@2@@x@x@x@x@13@3@3@3@11@@x@x@x@x@13@14@@@11@@x@x@x@x@@14@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@13@x@x@x@x@11@@@30@@13@x@x@x@x@11@2@2@30@5@5@x@x@x@x@3@3@3@@@@x@x@x@x@@@12@@@@x@x@x@x@@@12@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@11@x@x@x@x@@1@1@30@12@11@x@x@x@x@13@2@2@30@12@11@x@x@x@x@13@14@@@@@x@x@x@x@13@14@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@13@@30@1@1@x@x@x@x@@13@@30@11@@x@x@x@x@@13@4@4@11@12@x@x@x@x@@@3@3@3@12@x@x@x@x@@@14@2@2@12@x@x@x@x@@@14@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@@@@x@x@x@x@2@2@11@@@@x@x@x@x@@3@3@3@@@x@x@x@x@4@4@4@30@@@x@x@x@x@12@5@5@30@@@x@x@x@x@12@6@6@6@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@@@@x@x@x@x@@@13@3@3@@x@x@x@x@1@1@13@@@@x@x@x@x@11@2@2@30@14@@x@x@x@x@11@12@@30@14@@x@x@x@x@11@12@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@2@2@@30@@@x@x@x@x@1@1@12@3@3@13@x@x@x@x@@11@12@4@4@13@x@x@x@x@@11@12@5@5@13@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@@x@x@x@x@@2@2@30@@@x@x@x@x@@12@3@3@3@13@x@x@x@x@@12@4@4@@13@x@x@x@x@@12@5@5@5@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@@@14@x@x@x@x@@11@@@@14@x@x@x@x@@11@13@3@3@3@x@x@x@x@2@2@13@30@@@x@x@x@x@@12@13@30@@@x@x@x@x@@12@@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@@13@2@2@12@11@x@x@x@x@@13@3@3@12@11@x@x@x@x@@13@14@4@4@4@x@x@x@x@@@14@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@4@4@@11@x@x@x@x@3@3@12@30@@11@x@x@x@x@@13@12@30@@11@x@x@x@x@@13@5@5@1@1@x@x@x@x@@@@@2@2@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@12@@@1@1@x@x@x@x@@12@13@30@2@2@x@x@x@x@@12@13@30@11@@x@x@x@x@5@5@4@4@11@@x@x@x@x@@@3@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@2@2@2@@@@x@x@x@x@12@13@@3@3@3@x@x@x@x@12@13@@4@4@4@x@x@x@x@@@@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@@2@2@14@x@x@x@x@@12@13@3@3@14@x@x@x@x@@12@13@@@14@x@x@x@x@@@13@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@11@@x@x@x@x@@@@30@11@@x@x@x@x@@12@2@2@11@@x@x@x@x@@12@13@1@1@1@x@x@x@x@@12@13@@@14@x@x@x@x@@4@4@3@3@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@13@x@x@x@x@11@2@2@@@13@x@x@x@x@11@@@30@5@5@x@x@x@x@3@3@3@30@@@x@x@x@x@@12@4@4@4@@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@11@2@2@30@@@x@x@x@x@11@3@3@4@4@12@x@x@x@x@@@13@@@12@x@x@x@x@@@13@5@5@5@x@x@x@x@@@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@11@30@1@1@x@x@x@x@2@2@11@30@@@x@x@x@x@12@@11@5@5@@x@x@x@x@12@4@4@4@13@@x@x@x@x@3@3@3@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@1@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@@30@4@4@x@x@x@x@@12@3@3@14@@x@x@x@x@@12@13@@14@@x@x@x@x@2@2@13@@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@@@11@2@2@@x@x@x@x@3@3@11@30@13@@x@x@x@x@12@4@4@30@13@@x@x@x@x@12@@@@@@x@x@x@x@12@5@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@12@11@x@x@x@x@@1@1@30@12@11@x@x@x@x@13@2@2@@12@@x@x@x@x@13@14@@@@@x@x@x@x@13@14@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@1@1@12@@x@x@x@x@11@2@2@30@12@@x@x@x@x@11@3@3@30@12@@x@x@x@x@@13@@@@@x@x@x@x@@13@4@4@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@@30@5@5@x@x@x@x@@11@@30@12@13@x@x@x@x@3@3@4@4@12@13@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@2@2@11@30@@@x@x@x@x@12@3@3@30@@@x@x@x@x@12@13@@4@4@4@x@x@x@x@12@13@@5@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@@@14@x@x@x@x@11@@13@2@2@14@x@x@x@x@11@1@1@30@@14@x@x@x@x@11@12@@30@3@3@x@x@x@x@@12@@4@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@2@2@13@x@x@x@x@@3@3@30@@13@x@x@x@x@@12@@30@@13@x@x@x@x@@12@4@4@4@@x@x@x@x@@12@@@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@@@11@x@x@x@x@@@12@1@1@11@x@x@x@x@@2@2@30@@11@x@x@x@x@@13@@30@5@5@x@x@x@x@@13@3@3@3@@x@x@x@x@@@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@@x@x@x@x@@@@30@11@@x@x@x@x@@3@3@30@11@@x@x@x@x@4@4@2@2@11@@x@x@x@x@@12@@5@5@5@x@x@x@x@@12@@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@13@12@30@1@1@x@x@x@x@@13@12@30@@11@x@x@x@x@@13@2@2@@11@x@x@x@x@@3@3@3@@11@x@x@x@x@@@14@4@4@@x@x@x@x@@@14@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@12@@@1@1@x@x@x@x@@12@@30@2@2@x@x@x@x@@12@@30@@@x@x@x@x@@4@4@3@3@11@x@x@x@x@@5@5@6@6@11@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@2@2@2@14@x@x@x@x@11@@13@30@@14@x@x@x@x@1@1@13@30@@14@x@x@x@x@@12@3@3@3@@x@x@x@x@@12@4@4@4@@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@2@2@@x@x@x@x@3@3@11@@@@x@x@x@x@12@4@4@30@13@@x@x@x@x@12@@@30@13@@x@x@x@x@12@@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@@@@x@x@x@x@11@@14@2@2@2@x@x@x@x@1@1@14@30@@15@x@x@x@x@12@13@@30@@15@x@x@x@x@12@13@3@3@3@15@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@1@1@@@x@x@x@x@@11@13@30@@@x@x@x@x@2@2@13@30@@@x@x@x@x@12@@13@4@4@@x@x@x@x@12@3@3@3@14@@x@x@x@x@12@@@@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@11@x@x@x@x@@@@30@@11@x@x@x@x@@2@2@30@@11@x@x@x@x@@3@3@4@4@@x@x@x@x@@12@@@5@5@x@x@x@x@@12@@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@@x@x@x@x@11@4@4@4@@@x@x@x@x@11@3@3@30@@@x@x@x@x@12@@13@30@@@x@x@x@x@12@@13@5@5@5@x@x@x@x@2@2@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@13@@x@x@x@x@1@1@@@13@@x@x@x@x@2@2@@30@5@5@x@x@x@x@11@3@3@30@@@x@x@x@x@11@@12@4@4@4@x@x@x@x@11@@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@11@12@13@30@@@x@x@x@x@11@12@13@2@2@2@x@x@x@x@3@3@3@@@14@x@x@x@x@@@@@@14@x@x@x@x@4@4@4@@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@14@@x@x@x@x@11@@13@30@14@@x@x@x@x@11@@13@4@4@@x@x@x@x@2@2@13@@@@x@x@x@x@@12@3@3@3@@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@12@11@x@x@x@x@@@13@30@12@11@x@x@x@x@@@13@@3@3@x@x@x@x@2@2@13@@@@x@x@x@x@@14@4@4@4@@x@x@x@x@@14@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@@@11@x@x@x@x@@@12@1@1@11@x@x@x@x@2@2@2@30@@@x@x@x@x@@3@3@30@5@5@x@x@x@x@@13@@@@@x@x@x@x@@13@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@2@2@30@1@1@x@x@x@x@@@@30@@13@x@x@x@x@@11@3@3@@13@x@x@x@x@@11@4@4@4@13@x@x@x@x@@11@12@@@@x@x@x@x@@@12@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@@x@x@x@x@1@1@11@30@@@x@x@x@x@2@2@2@30@@@x@x@x@x@@3@3@3@@@x@x@x@x@13@12@4@4@@@x@x@x@x@13@12@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@13@@30@1@1@x@x@x@x@@13@4@4@4@11@x@x@x@x@@13@12@@@11@x@x@x@x@5@5@12@@@11@x@x@x@x@@@3@3@2@2@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@@2@2@12@x@x@x@x@@3@3@30@@12@x@x@x@x@@11@@30@@12@x@x@x@x@@11@4@4@5@5@x@x@x@x@@@6@6@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@@@@x@x@x@x@1@1@11@30@@@x@x@x@x@12@2@2@30@3@3@x@x@x@x@12@13@@4@4@4@x@x@x@x@12@13@@5@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@2@2@2@x@x@x@x@11@@13@30@@@x@x@x@x@1@1@13@30@@14@x@x@x@x@@12@3@3@3@14@x@x@x@x@@12@4@4@@14@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@12@@@@@x@x@x@x@11@12@@30@1@1@x@x@x@x@11@12@@30@2@2@x@x@x@x@@@@@@@x@x@x@x@@4@4@3@3@13@x@x@x@x@@5@5@5@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@11@x@x@x@x@@@@1@1@11@x@x@x@x@4@4@@30@12@11@x@x@x@x@14@13@@30@12@@x@x@x@x@14@13@3@3@2@2@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@@14@@x@x@x@x@11@1@1@1@14@@x@x@x@x@2@2@13@30@14@@x@x@x@x@12@@13@30@4@4@x@x@x@x@12@3@3@3@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@@x@x@x@x@@@@30@11@@x@x@x@x@5@5@@30@11@@x@x@x@x@4@4@2@2@11@@x@x@x@x@12@13@@3@3@3@x@x@x@x@12@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@30@13@@x@x@x@x@11@@12@30@13@@x@x@x@x@@@12@2@2@2@x@x@x@x@@@3@3@3@14@x@x@x@x@@@@@@14@x@x@x@x@@@4@4@4@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@30@@@x@x@x@x@@11@@30@@@x@x@x@x@12@11@3@3@14@@x@x@x@x@12@4@4@4@14@@x@x@x@x@12@@13@@14@@x@x@x@x@1@1@13@2@2@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@@1@1@30@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@3@3@3@12@x@x@x@x@@4@4@5@5@12@x@x@x@x@@6@6@6@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
        ];
        this.maps4 = [
            'x@x@x@x@x@x@x@x@x@x@x@@11@12@30@6@6@x@x@x@x@@11@12@30@@15@x@x@x@x@@11@5@5@13@15@x@x@x@x@1@1@@@13@15@x@x@x@x@2@2@@@14@@x@x@x@x@3@3@4@4@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@6@6@@13@x@x@x@x@11@12@@30@@13@x@x@x@x@11@12@@30@5@5@x@x@x@x@1@1@1@@14@@x@x@x@x@2@2@3@3@14@@x@x@x@x@@@4@4@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@',
            'x@x@x@x@x@x@x@x@x@x@x@@12@@30@4@4@x@x@x@x@11@12@@30@@14@x@x@x@x@11@12@@3@3@14@x@x@x@x@11@1@1@1@16@15@x@x@x@x@2@2@13@@16@15@x@x@x@x@@@13@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@2@2@2@@x@x@x@x@11@@@30@@12@x@x@x@x@11@4@4@30@@12@x@x@x@x@11@@13@3@3@3@x@x@x@x@@@13@@@@x@x@x@x@1@1@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@@@12@x@x@x@x@11@@@@@12@x@x@x@x@@4@4@4@@@x@x@x@x@3@3@3@30@@@x@x@x@x@@@13@30@@@x@x@x@x@@@13@2@2@2@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@@x@x@x@x@@@@30@@11@x@x@x@x@13@4@4@30@@11@x@x@x@x@13@@12@2@2@2@x@x@x@x@13@@12@@@@x@x@x@x@3@3@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@@x@x@x@x@11@@@30@@13@x@x@x@x@11@2@2@30@@13@x@x@x@x@@@12@4@4@4@x@x@x@x@3@3@12@@@@x@x@x@x@@@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@@@@x@x@x@x@11@@@@@@x@x@x@x@11@2@2@2@@@x@x@x@x@3@3@3@30@@13@x@x@x@x@@@12@30@@13@x@x@x@x@@@12@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@13@x@x@x@x@@@11@30@@13@x@x@x@x@@12@11@@2@2@x@x@x@x@@12@11@3@3@3@x@x@x@x@@@@@@@x@x@x@x@@@5@5@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@@@@30@@11@x@x@x@x@13@14@@30@2@2@x@x@x@x@13@14@12@3@3@3@x@x@x@x@13@14@12@@@@x@x@x@x@4@4@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@@30@4@4@x@x@x@x@@11@2@2@3@3@x@x@x@x@@5@5@6@6@12@x@x@x@x@@@@@@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@11@@x@x@x@x@4@4@@@11@12@x@x@x@x@3@3@2@2@11@12@x@x@x@x@@13@@5@5@5@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@@13@@30@@11@x@x@x@x@14@13@12@30@2@2@x@x@x@x@14@13@12@3@3@3@x@x@x@x@4@4@12@@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@@x@x@x@x@@@@30@11@@x@x@x@x@6@6@@30@11@@x@x@x@x@5@5@4@4@11@@x@x@x@x@@12@3@3@2@2@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@@x@x@x@x@13@4@4@4@@11@x@x@x@x@13@5@5@5@@11@x@x@x@x@3@3@12@@@@x@x@x@x@@@12@2@2@2@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@13@x@x@x@x@@@@30@@13@x@x@x@x@11@3@3@@@@x@x@x@x@11@@12@4@4@4@x@x@x@x@11@@12@@5@5@x@x@x@x@2@2@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@14@@x@x@x@x@12@@11@30@14@@x@x@x@x@12@@11@4@4@@x@x@x@x@2@2@11@@@@x@x@x@x@13@@3@3@3@@x@x@x@x@13@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@@x@x@x@x@11@@12@30@@@x@x@x@x@11@@12@30@4@4@x@x@x@x@11@2@2@2@14@@x@x@x@x@@13@@@14@@x@x@x@x@@13@3@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@1@1@@@x@x@x@x@@11@@30@@14@x@x@x@x@2@2@2@30@@14@x@x@x@x@@@12@4@4@4@x@x@x@x@@@12@@13@@x@x@x@x@3@3@3@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@14@x@x@x@x@@@@30@@14@x@x@x@x@@12@@@4@4@x@x@x@x@11@12@13@3@3@3@x@x@x@x@11@12@13@@@@x@x@x@x@2@2@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@11@@x@x@x@x@3@3@2@2@11@@x@x@x@x@12@@13@4@4@4@x@x@x@x@12@@13@@@@x@x@x@x@12@5@5@5@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@1@1@x@x@x@x@@@11@30@@13@x@x@x@x@@@2@2@@13@x@x@x@x@@3@3@4@4@13@x@x@x@x@@12@@@@@x@x@x@x@@12@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@14@@@30@@11@x@x@x@x@14@13@12@30@2@2@x@x@x@x@14@13@12@3@3@3@x@x@x@x@4@4@12@@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@@@@x@x@x@x@11@@@@@@x@x@x@x@11@@@4@4@4@x@x@x@x@2@2@2@30@14@13@x@x@x@x@@@12@30@14@13@x@x@x@x@@@12@3@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@4@4@@30@12@11@x@x@x@x@3@3@2@2@@11@x@x@x@x@@13@@5@5@5@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@11@x@x@x@x@@3@3@3@@11@x@x@x@x@13@@12@2@2@2@x@x@x@x@13@@12@@@14@x@x@x@x@4@4@4@@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@@x@x@x@x@@@@30@@11@x@x@x@x@@4@4@30@@11@x@x@x@x@@3@3@2@2@11@x@x@x@x@@12@@@@@x@x@x@x@@12@5@5@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@@x@x@x@x@11@12@13@30@@@x@x@x@x@11@12@13@5@5@5@x@x@x@x@2@2@13@4@4@@x@x@x@x@@@@@@@x@x@x@x@3@3@3@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@14@x@x@x@x@@@11@30@@14@x@x@x@x@@@11@4@4@13@x@x@x@x@2@2@11@@@13@x@x@x@x@12@3@3@3@@@x@x@x@x@12@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@@@@@x@x@x@x@3@3@@2@2@11@x@x@x@x@12@4@4@30@@11@x@x@x@x@12@13@14@30@@11@x@x@x@x@12@13@14@1@1@1@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@13@x@x@x@x@@@11@30@@13@x@x@x@x@@@11@30@4@4@x@x@x@x@2@2@11@@@@x@x@x@x@@12@3@3@3@14@x@x@x@x@@12@@@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@11@x@x@x@x@@@@2@2@11@x@x@x@x@4@4@3@3@@11@x@x@x@x@@12@5@5@6@6@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@1@x@x@x@x@@@@30@@11@x@x@x@x@12@3@3@30@@11@x@x@x@x@12@13@14@2@2@2@x@x@x@x@12@13@14@@@@x@x@x@x@4@4@14@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@12@@@@x@x@x@x@3@3@12@2@2@11@x@x@x@x@4@4@13@30@@11@x@x@x@x@@14@13@30@@11@x@x@x@x@@14@@1@1@1@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@3@3@4@4@x@x@x@x@@@@@@12@x@x@x@x@@6@6@5@5@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@13@@x@x@x@x@@11@@30@13@@x@x@x@x@@11@3@3@13@@x@x@x@x@2@2@12@@4@4@x@x@x@x@@@12@5@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@5@5@@@x@x@x@x@@11@4@4@6@6@x@x@x@x@2@2@3@3@12@@x@x@x@x@@@@@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@11@@x@x@x@x@@12@2@2@11@@x@x@x@x@@12@3@3@11@@x@x@x@x@@12@13@5@5@5@x@x@x@x@4@4@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@4@4@@x@x@x@x@@@13@@14@@x@x@x@x@1@1@1@@14@@x@x@x@x@11@12@@30@5@5@x@x@x@x@11@12@@30@@@x@x@x@x@11@12@6@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@@1@1@x@x@x@x@@@13@@12@11@x@x@x@x@@3@3@3@12@11@x@x@x@x@@14@@30@2@2@x@x@x@x@@14@@30@@@x@x@x@x@@14@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@1@1@11@x@x@x@x@@@12@30@13@11@x@x@x@x@2@2@2@30@13@11@x@x@x@x@@14@@@4@4@x@x@x@x@@14@@@@@x@x@x@x@@14@3@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@@x@x@x@x@@@@30@@11@x@x@x@x@3@3@@2@2@11@x@x@x@x@4@4@13@@@@x@x@x@x@12@@13@5@5@5@x@x@x@x@12@@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@@@30@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@3@3@6@6@x@x@x@x@@11@@@12@@x@x@x@x@4@4@5@5@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@3@3@3@@x@x@x@x@4@4@5@5@12@@x@x@x@x@@6@6@6@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@@12@11@30@@@x@x@x@x@@12@2@2@@@x@x@x@x@@12@3@3@3@@x@x@x@x@5@5@4@4@13@@x@x@x@x@@@@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@14@13@12@30@@11@x@x@x@x@14@13@12@30@2@2@x@x@x@x@14@13@12@3@3@3@x@x@x@x@4@4@@@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@@@@x@x@x@x@11@1@1@@@14@x@x@x@x@2@2@12@30@@14@x@x@x@x@@13@12@30@@14@x@x@x@x@@13@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@@@@x@x@x@x@11@1@1@@@14@x@x@x@x@2@2@12@30@@14@x@x@x@x@@13@12@30@@14@x@x@x@x@@13@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@2@2@@14@x@x@x@x@@12@13@3@3@14@x@x@x@x@@12@13@@@14@x@x@x@x@@@13@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@14@x@x@x@x@2@2@2@30@@14@x@x@x@x@12@3@3@@@14@x@x@x@x@12@13@@@@@x@x@x@x@12@13@4@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@15@x@x@x@x@11@13@14@30@@15@x@x@x@x@12@13@14@30@3@3@x@x@x@x@12@13@14@2@2@2@x@x@x@x@@@@@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@4@4@@30@12@11@x@x@x@x@3@3@2@2@12@11@x@x@x@x@@13@5@5@5@@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@11@12@13@30@@@x@x@x@x@11@12@13@5@5@5@x@x@x@x@2@2@13@4@4@@x@x@x@x@14@@@@@@x@x@x@x@14@3@3@3@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@6@6@@30@12@11@x@x@x@x@5@5@4@4@12@11@x@x@x@x@@13@@2@2@2@x@x@x@x@@13@@3@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@13@30@@11@x@x@x@x@@@13@2@2@11@x@x@x@x@@4@4@3@3@11@x@x@x@x@@12@@5@5@5@x@x@x@x@@12@@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@11@x@x@x@x@@@@2@2@11@x@x@x@x@6@6@@3@3@11@x@x@x@x@12@13@@4@4@4@x@x@x@x@12@13@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@15@@@30@11@@x@x@x@x@15@4@4@4@11@@x@x@x@x@15@3@3@@12@@x@x@x@x@@14@13@@12@@x@x@x@x@@14@13@2@2@2@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@@4@4@30@12@11@x@x@x@x@3@3@2@2@12@11@x@x@x@x@13@14@5@5@5@@x@x@x@x@13@14@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@@x@x@x@x@11@12@@30@@@x@x@x@x@11@12@2@2@@@x@x@x@x@@12@3@3@4@4@x@x@x@x@@5@5@6@6@13@x@x@x@x@@@@@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@@x@x@x@x@@@11@30@2@2@x@x@x@x@5@5@11@30@@12@x@x@x@x@13@@11@3@3@12@x@x@x@x@13@@4@4@4@12@x@x@x@x@@@@@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@@@3@3@12@11@x@x@x@x@@4@4@2@2@11@x@x@x@x@@13@@5@5@5@x@x@x@x@@13@@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@2@2@3@3@@@x@x@x@x@12@4@4@4@@@x@x@x@x@12@13@5@5@@@x@x@x@x@12@13@6@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@@x@x@x@x@11@@12@@@@x@x@x@x@11@@12@3@3@14@x@x@x@x@2@2@2@30@@14@x@x@x@x@@13@@30@@14@x@x@x@x@@13@5@5@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@@x@x@x@x@@@11@30@@@x@x@x@x@2@2@11@30@@13@x@x@x@x@3@3@11@@@13@x@x@x@x@@12@4@4@4@13@x@x@x@x@@12@5@5@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@14@@1@1@x@x@x@x@@@14@2@2@11@x@x@x@x@@5@5@30@12@11@x@x@x@x@@13@@30@12@11@x@x@x@x@@13@4@4@3@3@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@13@x@x@x@x@@11@2@2@2@13@x@x@x@x@@@12@3@3@@x@x@x@x@5@5@12@@@14@x@x@x@x@@@4@4@4@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@3@3@6@6@x@x@x@x@@@4@4@12@@x@x@x@x@7@7@5@5@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@30@1@1@x@x@x@x@@@12@30@@11@x@x@x@x@@@4@4@@11@x@x@x@x@14@3@3@2@2@11@x@x@x@x@14@13@@5@5@5@x@x@x@x@14@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@12@2@2@3@3@@x@x@x@x@12@4@4@4@@@x@x@x@x@12@5@5@5@@@x@x@x@x@6@6@7@7@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@1@1@13@30@@@x@x@x@x@2@2@13@3@3@@x@x@x@x@11@@4@4@4@@x@x@x@x@11@12@5@5@5@@x@x@x@x@11@12@6@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@11@12@13@30@3@3@x@x@x@x@11@12@13@4@4@4@x@x@x@x@2@2@13@@5@5@x@x@x@x@@@@@@@x@x@x@x@@@@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@12@@x@x@x@x@11@@13@@12@@x@x@x@x@@@13@30@2@2@x@x@x@x@3@3@13@30@@@x@x@x@x@14@@4@4@4@15@x@x@x@x@14@@@@@15@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@11@@x@x@x@x@@@@30@11@@x@x@x@x@13@12@1@1@11@@x@x@x@x@13@12@14@2@2@2@x@x@x@x@13@12@14@@@15@x@x@x@x@@4@4@3@3@15@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@13@12@1@1@1@x@x@x@x@@13@12@30@@11@x@x@x@x@2@2@2@30@@11@x@x@x@x@14@15@4@4@@11@x@x@x@x@14@15@@@@@x@x@x@x@14@3@3@3@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@1@1@1@x@x@x@x@@@13@30@@11@x@x@x@x@6@6@13@30@@11@x@x@x@x@@12@2@2@2@11@x@x@x@x@@12@3@3@3@@x@x@x@x@@12@4@4@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@2@2@12@x@x@x@x@@3@3@30@@12@x@x@x@x@@13@@30@@12@x@x@x@x@@13@4@4@4@@x@x@x@x@@13@5@5@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@11@x@x@x@x@@@@2@2@11@x@x@x@x@12@4@4@3@3@11@x@x@x@x@12@13@5@5@6@6@x@x@x@x@12@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@12@@30@1@1@x@x@x@x@@12@@30@@11@x@x@x@x@@12@4@4@@11@x@x@x@x@@5@5@5@@11@x@x@x@x@@@13@@2@2@x@x@x@x@6@6@13@@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@2@2@1@1@x@x@x@x@@@@30@3@3@x@x@x@x@6@6@6@30@@@x@x@x@x@@13@12@5@5@11@x@x@x@x@@13@12@@@11@x@x@x@x@@@12@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@13@30@1@1@x@x@x@x@11@12@13@30@@14@x@x@x@x@11@12@13@2@2@14@x@x@x@x@@@@3@3@3@x@x@x@x@@@5@5@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@30@1@1@x@x@x@x@11@@@30@@13@x@x@x@x@12@@@2@2@13@x@x@x@x@12@4@4@3@3@13@x@x@x@x@@14@@5@5@5@x@x@x@x@@14@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@14@x@x@x@x@@11@2@2@2@14@x@x@x@x@@3@3@4@4@13@x@x@x@x@@@12@@@13@x@x@x@x@@@12@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@@x@x@x@x@12@11@6@6@@@x@x@x@x@12@11@5@5@5@@x@x@x@x@2@2@4@4@13@@x@x@x@x@@3@3@3@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@@x@x@x@x@@@2@2@12@11@x@x@x@x@4@4@3@3@12@11@x@x@x@x@13@14@@@12@@x@x@x@x@13@14@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@1@@@x@x@x@x@@2@2@30@@@x@x@x@x@@11@@30@7@7@x@x@x@x@@11@3@3@3@12@x@x@x@x@@4@4@@@12@x@x@x@x@@5@5@6@6@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@30@1@1@x@x@x@x@@@13@30@11@@x@x@x@x@@@4@4@11@12@x@x@x@x@@3@3@3@11@12@x@x@x@x@@14@2@2@5@5@x@x@x@x@@14@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@1@1@@@x@x@x@x@11@12@@30@@14@x@x@x@x@11@2@2@30@@14@x@x@x@x@@@13@4@4@4@x@x@x@x@3@3@13@@5@5@x@x@x@x@@@13@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@30@1@1@x@x@x@x@@@13@30@12@11@x@x@x@x@@@3@3@12@11@x@x@x@x@@4@4@2@2@11@x@x@x@x@@14@@5@5@5@x@x@x@x@@14@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@11@@x@x@x@x@@@4@4@11@12@x@x@x@x@5@5@3@3@@12@x@x@x@x@13@14@2@2@2@12@x@x@x@x@13@14@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@@@x@x@x@x@11@1@1@30@14@@x@x@x@x@11@2@2@@14@@x@x@x@x@11@12@13@@14@@x@x@x@x@@12@13@5@5@5@x@x@x@x@3@3@4@4@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@11@@x@x@x@x@@@2@2@11@@x@x@x@x@4@4@3@3@11@@x@x@x@x@12@13@5@5@5@@x@x@x@x@12@13@6@6@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@@@2@2@12@11@x@x@x@x@@4@4@3@3@11@x@x@x@x@@13@@@@@x@x@x@x@@13@5@5@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@11@@x@x@x@x@@@4@4@11@12@x@x@x@x@5@5@3@3@11@12@x@x@x@x@@13@@@2@2@x@x@x@x@@13@6@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@30@5@5@x@x@x@x@11@@@30@14@13@x@x@x@x@11@@4@4@14@13@x@x@x@x@1@1@3@3@14@13@x@x@x@x@@12@2@2@2@@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@30@@15@x@x@x@x@11@@12@30@@15@x@x@x@x@2@2@12@@@15@x@x@x@x@@13@14@3@3@3@x@x@x@x@@13@14@@4@4@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@30@6@6@x@x@x@x@11@1@1@30@@@x@x@x@x@2@2@12@3@3@13@x@x@x@x@@@12@4@4@13@x@x@x@x@@@12@5@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@@x@x@x@x@11@@12@30@@@x@x@x@x@2@2@12@30@@14@x@x@x@x@@13@3@3@3@14@x@x@x@x@@13@@@@14@x@x@x@x@@13@5@5@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@@@@x@x@x@x@@@13@3@3@14@x@x@x@x@11@2@2@30@@14@x@x@x@x@11@12@@30@@14@x@x@x@x@11@12@5@5@4@4@x@x@x@x@1@1@1@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@13@@x@x@x@x@@11@@30@13@@x@x@x@x@@11@2@2@13@@x@x@x@x@@11@@3@3@@x@x@x@x@@@12@4@4@4@x@x@x@x@6@6@12@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@@@2@2@12@11@x@x@x@x@4@4@3@3@12@11@x@x@x@x@@13@@@6@6@x@x@x@x@@13@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
        ];
        this.maps5 = [
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@@@@x@x@x@x@@11@@@@12@x@x@x@x@@11@2@2@2@12@x@x@x@x@3@3@3@30@@@x@x@x@x@@@13@30@@@x@x@x@x@@@13@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@@@11@30@@@x@x@x@x@2@2@11@30@@@x@x@x@x@@3@3@4@4@12@x@x@x@x@@13@@@@12@x@x@x@x@@13@5@5@5@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@12@5@5@5@x@x@x@x@2@2@12@4@4@13@x@x@x@x@@@12@@@13@x@x@x@x@@@3@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@13@@1@1@11@x@x@x@x@@13@@30@@11@x@x@x@x@@13@@30@2@2@x@x@x@x@@5@5@5@12@@x@x@x@x@4@4@3@3@12@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@13@x@x@x@x@2@2@11@30@@13@x@x@x@x@12@4@4@5@5@13@x@x@x@x@12@@@@@@x@x@x@x@3@3@3@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@30@1@1@x@x@x@x@@@13@30@@11@x@x@x@x@5@5@13@@@11@x@x@x@x@@3@3@2@2@11@x@x@x@x@@12@@4@4@4@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@@@@x@x@x@x@@11@@@@@x@x@x@x@@11@2@2@2@12@x@x@x@x@5@5@5@30@@12@x@x@x@x@@@13@30@3@3@x@x@x@x@@@13@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@13@x@x@x@x@2@2@11@30@@13@x@x@x@x@12@3@3@4@4@13@x@x@x@x@12@5@5@5@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@@@@x@x@x@x@11@12@@@@@x@x@x@x@11@12@3@3@3@13@x@x@x@x@2@2@2@30@@13@x@x@x@x@@@14@30@@@x@x@x@x@@@14@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@14@@30@1@1@x@x@x@x@@14@@30@@11@x@x@x@x@4@4@4@@@11@x@x@x@x@@@13@2@2@2@x@x@x@x@@@13@@@12@x@x@x@x@@3@3@3@@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@13@30@@@x@x@x@x@11@12@13@30@@@x@x@x@x@11@12@5@5@@@x@x@x@x@11@12@4@4@4@@x@x@x@x@2@2@3@3@14@@x@x@x@x@@@@@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@13@@11@30@14@@x@x@x@x@13@2@2@30@14@@x@x@x@x@3@3@4@4@14@@x@x@x@x@@12@@@@@x@x@x@x@@12@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@12@5@5@@11@x@x@x@x@@12@14@30@@11@x@x@x@x@@12@14@30@1@1@x@x@x@x@4@4@4@@13@@x@x@x@x@3@3@2@2@13@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@1@1@11@x@x@x@x@14@@13@@12@11@x@x@x@x@14@2@2@2@12@11@x@x@x@x@14@15@@30@4@4@x@x@x@x@@15@@30@@@x@x@x@x@@15@3@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@@@2@2@@11@x@x@x@x@4@4@12@30@3@3@x@x@x@x@5@5@12@30@@@x@x@x@x@13@@12@6@6@6@x@x@x@x@13@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@@@12@30@@11@x@x@x@x@@@12@30@2@2@x@x@x@x@5@5@12@@@13@x@x@x@x@14@4@4@4@@13@x@x@x@x@14@@@@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@12@30@@@x@x@x@x@@11@12@30@@@x@x@x@x@@11@2@2@@@x@x@x@x@@11@3@3@3@@x@x@x@x@5@5@4@4@13@@x@x@x@x@@6@6@6@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@3@3@30@12@11@x@x@x@x@@13@@30@12@11@x@x@x@x@@13@2@2@12@11@x@x@x@x@4@4@14@@1@1@x@x@x@x@@@14@@@@x@x@x@x@5@5@5@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@@x@x@x@x@@@11@30@5@5@x@x@x@x@2@2@11@@@14@x@x@x@x@12@@11@4@4@14@x@x@x@x@12@3@3@3@@13@x@x@x@x@@@@@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@2@2@@@x@x@x@x@11@12@@30@@15@x@x@x@x@1@1@1@30@@15@x@x@x@x@@@13@4@4@4@x@x@x@x@@@13@@14@@x@x@x@x@3@3@3@@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@@@11@30@@@x@x@x@x@2@2@11@30@@@x@x@x@x@@3@3@4@4@12@x@x@x@x@@13@5@5@5@12@x@x@x@x@@13@6@6@@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@@x@x@x@x@@@13@30@2@2@x@x@x@x@5@5@13@30@@11@x@x@x@x@@@13@3@3@11@x@x@x@x@@14@4@4@4@12@x@x@x@x@@14@@@@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@@@x@x@x@x@1@1@11@30@@@x@x@x@x@@2@2@@5@5@x@x@x@x@@12@13@4@4@14@x@x@x@x@@12@13@@@14@x@x@x@x@@3@3@3@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@13@@x@x@x@x@@11@@30@13@@x@x@x@x@@11@6@6@13@@x@x@x@x@2@2@12@5@5@@x@x@x@x@@@12@4@4@@x@x@x@x@@@3@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@@@11@30@@@x@x@x@x@2@2@11@30@@@x@x@x@x@@3@3@4@4@13@x@x@x@x@@12@5@5@5@13@x@x@x@x@@12@6@6@6@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@15@x@x@x@x@11@@12@30@@15@x@x@x@x@@@12@30@4@4@x@x@x@x@2@2@12@@@@x@x@x@x@@13@3@3@3@14@x@x@x@x@@13@@@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@12@4@4@4@x@x@x@x@11@@12@30@@@x@x@x@x@@@@30@3@3@x@x@x@x@13@@14@2@2@15@x@x@x@x@13@@14@@@15@x@x@x@x@1@1@1@@@15@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@14@@1@1@x@x@x@x@12@@14@30@11@@x@x@x@x@12@3@3@30@11@@x@x@x@x@4@4@2@2@11@@x@x@x@x@@13@5@5@5@@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@@30@@@x@x@x@x@@11@12@3@3@3@x@x@x@x@2@2@12@4@4@13@x@x@x@x@@@12@5@5@13@x@x@x@x@@@@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@14@@12@1@1@11@x@x@x@x@14@@12@30@@11@x@x@x@x@2@2@12@30@@11@x@x@x@x@@3@3@4@4@@x@x@x@x@@13@5@5@5@@x@x@x@x@@13@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@@x@x@x@x@11@2@2@30@@@x@x@x@x@11@12@@30@4@4@x@x@x@x@@12@3@3@3@13@x@x@x@x@@@@@@13@x@x@x@x@@6@6@5@5@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@@@@x@x@x@x@11@1@1@@@14@x@x@x@x@2@2@13@30@15@14@x@x@x@x@@12@13@30@15@14@x@x@x@x@@12@3@3@4@4@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@14@@x@x@x@x@@11@@30@14@13@x@x@x@x@@11@3@3@14@13@x@x@x@x@2@2@12@4@4@13@x@x@x@x@@@12@5@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@11@x@x@x@x@14@5@5@5@@11@x@x@x@x@14@@13@2@2@2@x@x@x@x@4@4@13@@@12@x@x@x@x@3@3@3@@@12@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@4@4@4@@@11@x@x@x@x@@@13@@@11@x@x@x@x@@@13@30@1@1@x@x@x@x@5@5@13@30@@12@x@x@x@x@14@@2@2@2@12@x@x@x@x@14@@3@3@3@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@15@x@x@x@x@11@@@30@@15@x@x@x@x@11@13@@30@4@4@x@x@x@x@12@13@14@3@3@3@x@x@x@x@12@13@14@@@@x@x@x@x@2@2@14@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@12@11@x@x@x@x@13@2@2@2@12@11@x@x@x@x@13@3@3@3@@@x@x@x@x@4@4@14@@@@x@x@x@x@@@14@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@5@5@@@x@x@x@x@@@14@30@@@x@x@x@x@@@14@30@4@4@x@x@x@x@2@2@13@3@3@11@x@x@x@x@@12@13@@@11@x@x@x@x@@12@1@1@1@11@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@1@1@@@x@x@x@x@@11@@30@@14@x@x@x@x@2@2@2@30@@14@x@x@x@x@@@13@5@5@5@x@x@x@x@@@13@@12@@x@x@x@x@3@3@4@4@12@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@1@1@x@x@x@x@@@11@30@@@x@x@x@x@@@@2@2@12@x@x@x@x@4@4@3@3@13@12@x@x@x@x@@14@@@13@12@x@x@x@x@@14@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@4@4@4@@15@x@x@x@x@11@13@@30@@15@x@x@x@x@12@13@14@30@3@3@x@x@x@x@12@13@14@2@2@2@x@x@x@x@1@1@14@@@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@@@11@30@@@x@x@x@x@@12@2@2@@@x@x@x@x@@12@3@3@6@6@x@x@x@x@@12@@@@13@x@x@x@x@@4@4@5@5@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@5@5@@14@x@x@x@x@11@12@@30@@14@x@x@x@x@@12@@30@4@4@x@x@x@x@1@1@1@@13@@x@x@x@x@2@2@3@3@13@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@@@@x@x@x@x@11@12@@@@@x@x@x@x@11@12@3@3@3@13@x@x@x@x@2@2@2@30@@13@x@x@x@x@@@14@30@4@4@x@x@x@x@@@14@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@2@2@14@@x@x@x@x@11@@13@30@14@@x@x@x@x@1@1@13@30@14@@x@x@x@x@@12@@3@3@3@x@x@x@x@@12@4@4@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@11@@x@x@x@x@12@2@2@2@11@@x@x@x@x@12@@14@5@5@5@x@x@x@x@13@@14@@@@x@x@x@x@13@3@3@4@4@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@5@5@5@x@x@x@x@11@@14@@@@x@x@x@x@11@@14@4@4@13@x@x@x@x@1@1@1@30@@13@x@x@x@x@@12@@30@@13@x@x@x@x@@12@2@2@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@13@4@4@@x@x@x@x@11@@13@30@@@x@x@x@x@1@1@13@30@@@x@x@x@x@2@2@3@3@@15@x@x@x@x@@12@@@@15@x@x@x@x@@12@5@5@5@15@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@2@2@30@12@11@x@x@x@x@@13@@30@12@11@x@x@x@x@@13@1@1@12@@x@x@x@x@3@3@14@@4@4@x@x@x@x@@@14@5@5@5@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@1@@@x@x@x@x@@11@13@30@@@x@x@x@x@@11@13@30@4@4@x@x@x@x@@12@14@3@3@15@x@x@x@x@@12@14@@@15@x@x@x@x@@2@2@2@@15@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@15@@@@x@x@x@x@1@1@15@4@4@14@x@x@x@x@11@2@2@30@@14@x@x@x@x@11@12@13@30@@14@x@x@x@x@11@12@13@3@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@@@@x@x@x@x@@12@11@30@@@x@x@x@x@@12@@30@6@6@x@x@x@x@@12@4@4@5@5@x@x@x@x@2@2@3@3@13@@x@x@x@x@@@@@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@30@1@1@x@x@x@x@@@13@30@@11@x@x@x@x@6@6@13@@@11@x@x@x@x@@3@3@2@2@11@x@x@x@x@@12@4@4@@@x@x@x@x@@12@5@5@5@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@12@13@11@30@@@x@x@x@x@12@13@11@3@3@3@x@x@x@x@2@2@@4@4@14@x@x@x@x@@@@@@14@x@x@x@x@@@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@1@1@x@x@x@x@@@11@30@@@x@x@x@x@@@11@2@2@12@x@x@x@x@4@4@3@3@13@12@x@x@x@x@@14@@@13@12@x@x@x@x@@14@@@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@13@x@x@x@x@2@2@11@30@@13@x@x@x@x@12@3@3@4@4@13@x@x@x@x@12@@@5@5@@x@x@x@x@@@@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@@@x@x@x@x@12@@11@30@@@x@x@x@x@12@@11@3@3@@x@x@x@x@12@2@2@2@14@15@x@x@x@x@@13@@@14@15@x@x@x@x@@13@4@4@4@15@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@@x@x@x@x@@@11@30@13@@x@x@x@x@@2@2@30@13@@x@x@x@x@3@3@4@4@13@@x@x@x@x@@12@5@5@6@6@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@13@x@x@x@x@2@2@11@30@@13@x@x@x@x@12@3@3@4@4@13@x@x@x@x@12@@5@5@5@@x@x@x@x@@@@6@6@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@1@1@1@@@x@x@x@x@11@@12@30@@@x@x@x@x@2@2@12@30@5@5@x@x@x@x@@@13@4@4@14@x@x@x@x@@@13@@@14@x@x@x@x@3@3@3@@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@13@@12@30@@11@x@x@x@x@13@@12@30@4@4@x@x@x@x@2@2@12@@@15@x@x@x@x@14@@3@3@3@15@x@x@x@x@14@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@@@12@30@@11@x@x@x@x@@@12@30@5@5@x@x@x@x@2@2@12@@@14@x@x@x@x@@13@3@3@3@14@x@x@x@x@@13@@@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@@@@x@x@x@x@@@@@@@x@x@x@x@1@1@14@3@3@15@x@x@x@x@2@2@14@30@@15@x@x@x@x@11@12@13@30@@15@x@x@x@x@11@12@13@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@13@@x@x@x@x@@11@@30@13@@x@x@x@x@@11@2@2@13@@x@x@x@x@3@3@12@4@4@@x@x@x@x@@@12@5@5@5@x@x@x@x@6@6@6@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@@@@x@x@x@x@@@11@@@@x@x@x@x@@2@2@3@3@14@x@x@x@x@@4@4@30@@14@x@x@x@x@@12@13@30@@14@x@x@x@x@@12@13@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@@6@6@13@x@x@x@x@@11@@@@13@x@x@x@x@@11@@30@5@5@x@x@x@x@4@4@4@30@12@@x@x@x@x@2@2@3@3@12@@x@x@x@x@1@1@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@30@13@15@x@x@x@x@@@11@30@13@15@x@x@x@x@@@11@4@4@@x@x@x@x@2@2@11@@@14@x@x@x@x@@12@3@3@3@14@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@2@2@@@x@x@x@x@11@12@@30@@15@x@x@x@x@1@1@1@30@@15@x@x@x@x@@@13@4@4@4@x@x@x@x@@@13@@@14@x@x@x@x@@3@3@3@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@@@x@x@x@x@@11@12@30@5@5@x@x@x@x@@11@12@4@4@4@x@x@x@x@2@2@13@@@14@x@x@x@x@@@13@@@14@x@x@x@x@3@3@3@@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@1@1@@13@x@x@x@x@11@12@@30@@13@x@x@x@x@11@12@@30@2@2@x@x@x@x@@3@3@3@14@@x@x@x@x@4@4@5@5@14@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@@30@@11@x@x@x@x@12@2@2@2@@11@x@x@x@x@12@3@3@3@@@x@x@x@x@4@4@13@@5@5@x@x@x@x@@@13@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@13@1@1@11@x@x@x@x@@@13@@12@11@x@x@x@x@@2@2@2@12@11@x@x@x@x@15@14@@30@3@3@x@x@x@x@15@14@@30@@@x@x@x@x@@14@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@30@6@6@x@x@x@x@@@12@30@@@x@x@x@x@@@5@5@13@@x@x@x@x@3@3@4@4@13@@x@x@x@x@@11@@@13@@x@x@x@x@@11@2@2@1@1@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@13@@2@2@11@x@x@x@x@@13@@@@11@x@x@x@x@@13@@30@1@1@x@x@x@x@5@5@5@30@12@@x@x@x@x@4@4@3@3@12@@x@x@x@x@6@6@6@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@14@@@@x@x@x@x@1@1@14@@@@x@x@x@x@11@3@3@4@4@13@x@x@x@x@11@2@2@30@@13@x@x@x@x@11@12@@30@@13@x@x@x@x@@12@@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@2@2@2@11@x@x@x@x@@@12@@@11@x@x@x@x@@@12@30@1@1@x@x@x@x@3@3@12@30@@@x@x@x@x@@13@4@4@4@14@x@x@x@x@@13@5@5@5@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@@12@11@30@@@x@x@x@x@@12@2@2@@@x@x@x@x@@12@3@3@6@6@x@x@x@x@@4@4@5@5@13@x@x@x@x@@@@@@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@1@1@1@x@x@x@x@@@11@30@@13@x@x@x@x@2@2@11@30@@13@x@x@x@x@12@3@3@4@4@13@x@x@x@x@12@@@5@5@5@x@x@x@x@@@@6@6@6@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@13@@x@x@x@x@@11@@30@13@@x@x@x@x@@11@4@4@13@@x@x@x@x@2@2@12@@5@5@x@x@x@x@@@12@@@14@x@x@x@x@3@3@3@@@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@@12@11@30@@@x@x@x@x@@12@2@2@@@x@x@x@x@@12@3@3@4@4@x@x@x@x@@@@@13@@x@x@x@x@6@6@5@5@13@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@1@1@30@11@@x@x@x@x@@@@30@11@@x@x@x@x@@@2@2@11@@x@x@x@x@@13@3@3@4@4@x@x@x@x@@13@12@5@5@5@x@x@x@x@6@6@12@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@2@2@1@1@x@x@x@x@@11@@30@@@x@x@x@x@12@3@3@30@@@x@x@x@x@12@@13@5@5@5@x@x@x@x@12@@13@@14@@x@x@x@x@4@4@4@@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@1@1@@@x@x@x@x@@11@@30@@15@x@x@x@x@12@2@2@30@@15@x@x@x@x@12@13@14@3@3@3@x@x@x@x@12@13@14@@4@4@x@x@x@x@@@14@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@15@5@5@@x@x@x@x@11@@15@@@@x@x@x@x@11@@4@4@14@@x@x@x@x@1@1@1@30@14@13@x@x@x@x@@12@@30@14@13@x@x@x@x@@12@2@2@3@3@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@@30@5@5@x@x@x@x@11@@12@30@@@x@x@x@x@11@@12@3@3@13@x@x@x@x@1@1@2@2@@13@x@x@x@x@@15@14@@@13@x@x@x@x@@15@14@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@13@30@@@x@x@x@x@11@12@13@30@@@x@x@x@x@11@12@2@2@@@x@x@x@x@11@12@3@3@4@4@x@x@x@x@@@@@14@@x@x@x@x@6@6@5@5@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@1@1@1@11@x@x@x@x@13@@12@@@11@x@x@x@x@13@@12@30@5@5@x@x@x@x@2@2@12@30@@15@x@x@x@x@@14@3@3@3@15@x@x@x@x@@14@4@4@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@@16@@5@5@x@x@x@x@11@@16@@13@@x@x@x@x@11@1@1@30@13@14@x@x@x@x@2@2@2@30@13@14@x@x@x@x@@12@3@3@4@4@x@x@x@x@@12@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@13@30@@@x@x@x@x@11@12@13@30@@@x@x@x@x@11@12@2@2@@@x@x@x@x@@12@3@3@4@4@x@x@x@x@@@@@14@@x@x@x@x@6@6@5@5@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@11@30@1@1@x@x@x@x@14@@11@30@@@x@x@x@x@14@@11@2@2@12@x@x@x@x@5@5@3@3@13@12@x@x@x@x@@15@4@4@13@12@x@x@x@x@@15@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@@30@1@1@x@x@x@x@@@11@30@@@x@x@x@x@@@11@2@2@13@x@x@x@x@@4@4@3@3@13@x@x@x@x@@12@5@5@5@13@x@x@x@x@@12@6@6@7@7@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@@30@@@x@x@x@x@11@@@30@@15@x@x@x@x@11@@5@5@5@15@x@x@x@x@11@12@3@3@4@4@x@x@x@x@@12@13@@14@@x@x@x@x@2@2@13@@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@@12@@@11@x@x@x@x@@@12@@@11@x@x@x@x@@2@2@1@1@11@x@x@x@x@14@3@3@30@16@@x@x@x@x@14@13@15@30@16@@x@x@x@x@14@13@15@4@4@4@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@12@5@5@@15@x@x@x@x@11@12@13@@@15@x@x@x@x@11@12@13@30@4@4@x@x@x@x@1@1@1@30@14@@x@x@x@x@2@2@3@3@14@@x@x@x@x@@@@@@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@11@30@@@x@x@x@x@@@11@30@@@x@x@x@x@@12@2@2@@@x@x@x@x@@12@3@3@4@4@x@x@x@x@@12@@@13@14@x@x@x@x@5@5@6@6@13@14@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@@11@2@2@1@1@x@x@x@x@@11@@30@@@x@x@x@x@14@3@3@30@@@x@x@x@x@14@@12@5@5@5@x@x@x@x@14@@12@@15@13@x@x@x@x@4@4@4@@15@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@13@30@@@x@x@x@x@11@12@13@30@@@x@x@x@x@11@12@3@3@@@x@x@x@x@11@12@4@4@4@@x@x@x@x@2@2@5@5@14@@x@x@x@x@@@6@6@14@@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@11@12@13@1@1@1@x@x@x@x@11@12@13@30@@@x@x@x@x@@14@15@30@2@2@x@x@x@x@@14@15@3@3@16@x@x@x@x@@@@@@16@x@x@x@x@@@4@4@4@16@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@15@@@@x@x@x@x@11@@15@@@@x@x@x@x@11@2@2@4@4@13@x@x@x@x@11@3@3@30@@13@x@x@x@x@@12@14@30@@13@x@x@x@x@@12@14@5@5@5@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
            'x@x@x@x@x@x@x@x@x@x@x@1@1@1@@@@x@x@x@x@11@2@2@30@@@x@x@x@x@11@12@@30@7@7@x@x@x@x@11@12@3@3@3@13@x@x@x@x@@4@4@4@@13@x@x@x@x@@5@5@6@6@13@x@x@x@x@40@40@40@@40@40@x@x@x@x@31@31@31@@31@31@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@x@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
        ];
    },

    onDestroy() {
        clearInterval(this.timeIndex);
        cc.audioEngine.stop(this.current);
    },
});

var Alert = {
    _alert: null,           // prefab
    _titleLabel: null,   // 标题
    _detailLabel: null,   // 内容
    _enterButton: null,   // 确定按钮
    _cancelButton: null,   // 取消按钮
    _closeButton: null,   // 关闭按钮
    _enterCallBack: null,   // 确定回调事件
    _cancelCallBack: null,   // 取消回调事件
    _animSpeed: 0.3,    // 动画速度
};

/**
 * detailString :   内容 string 类型.
 * enterCallBack:   确定点击事件回调  function 类型.
 * neeCancel:       是否展示取消按钮 bool 类型 default YES.
 * duration:        动画速度 default = 0.3.
*/
Alert.show = function (titleString, detailString, enterCallBack, cancelCallBack, needCancel, animSpeed) {

    // 引用
    var self = this;

    // 判断
    if (Alert._alert != undefined) return;

    // 
    Alert._animSpeed = animSpeed ? animSpeed : Alert._animSpeed;

    // 加载 prefab 创建
    cc.loader.loadRes("Alert", cc.Prefab, function (error, prefab) {

        if (error) {
            cc.error(error);
            return;
        }

        // 实例 
        var alert = cc.instantiate(prefab);

        // Alert 持有
        Alert._alert = alert;

        // 动画 
        var cbFadeOut = cc.callFunc(self.onFadeOutFinish, self);
        var cbFadeIn = cc.callFunc(self.onFadeInFinish, self);
        self.actionFadeIn = cc.sequence(cc.spawn(cc.fadeTo(Alert._animSpeed, 255), cc.scaleTo(Alert._animSpeed, 1.0)), cbFadeIn);
        self.actionFadeOut = cc.sequence(cc.spawn(cc.fadeTo(Alert._animSpeed, 0), cc.scaleTo(Alert._animSpeed, 0.5)), cbFadeOut);

        // 获取子节点
        Alert._titleLabel = cc.find("alertBackground/title_bg/titleLabel", alert).getComponent(cc.Label);
        Alert._detailLabel = cc.find("alertBackground/detailLabel", alert).getComponent(cc.Label);
        Alert._cancelButton = cc.find("alertBackground/cancelButton", alert);
        Alert._enterButton = cc.find("alertBackground/enterButton", alert);

        // 添加点击事件
        Alert._enterButton.on('click', self.onButtonClicked, self);
        Alert._cancelButton.on('click', self.onButtonClicked, self);

        // 父视图
        Alert._alert.parent = cc.find("Canvas");

        // 展现 alert
        self.startFadeIn();

        // 参数
        self.configAlert(titleString, detailString, enterCallBack, cancelCallBack, needCancel, animSpeed);

    });

    // 参数
    self.configAlert = function (titleString, detailString, enterCallBack, cancelCallBack, needCancel, animSpeed) {

        // 确定回调
        Alert._enterCallBack = enterCallBack;
        // 取消回调
        Alert._cancelCallBack = cancelCallBack;
        // 内容
        Alert._titleLabel.string = titleString;
        // 内容
        Alert._detailLabel.string = detailString;
        // 是否需要取消按钮
        if (needCancel || needCancel == undefined) { // 显示
            Alert._cancelButton.active = true;
        } else {  // 隐藏
            Alert._cancelButton.active = false;
            Alert._enterButton.x = 0;
        }
    };

    // 执行弹进动画
    self.startFadeIn = function () {
        cc.eventManager.pauseTarget(Alert._alert, true);
        Alert._alert.position = cc.p(0, 0);
        Alert._alert.setScale(0.5);
        Alert._alert.opacity = 0;
        Alert._alert.runAction(self.actionFadeIn);
    };

    // 执行弹出动画
    self.startFadeOut = function () {
        cc.eventManager.pauseTarget(Alert._alert, true);
        Alert._alert.runAction(self.actionFadeOut);
    };

    // 弹进动画完成回调
    self.onFadeInFinish = function () {
        cc.eventManager.resumeTarget(Alert._alert, true);
    };

    // 弹出动画完成回调
    self.onFadeOutFinish = function () {
        self.onDestory();
    };

    // 按钮点击事件
    self.onButtonClicked = function (event) {
        if (event.target.name == "enterButton") {
            if (self._enterCallBack) {
                self._enterCallBack();
            }
        } else if (event.target.name == "cancelButton") {
            if (self._cancelCallBack) {
                self._cancelCallBack();
            }
        }
        self.startFadeOut();
    };

    // 销毁 alert (内存管理还没搞懂，暂且这样写吧~v~)
    self.onDestory = function () {
        Alert._alert.destroy();
        Alert._enterCallBack = null;
        Alert._cancelCallBack = null;
        Alert._alert = null;
        Alert._titleLabel = null;
        Alert._detailLabel = null;
        Alert._cancelButton = null;
        Alert._enterButton = null;
        Alert._animSpeed = 0.3;
    };
};
