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

        gamingNode: cc.Node,
        hardNode: cc.Node,
        resetNode: cc.Node,
        resetCountLabel: cc.Label,
        changeNode: cc.Node,
        changeCountLabel: cc.Label,
        destroyNode: cc.Node,
        destroyCountLabel: cc.Label,
        btnAudio: cc.AudioClip
    },

    btnClick() {
        cc.audioEngine.playEffect(this.btnAudio);
    },

    share() {
        this.btnClick();
        setTimeout(() => {
            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                let res = wx.getSystemInfoSync();
                let windowSize = cc.view.getVisibleSize();
                let left = res.screenWidth / windowSize.width * 510;
                console.log('res.screenWidth: ', res.screenWidth , 'res.screenHeight: ',res.screenHeight, 'windowSize: ', windowSize);
                let top = windowSize.height / 2 - 180;
                let width = windowSize.width;

                console.log('top: ', top , 'width: ', width);
                wx.shareAppMessage({
                    title: '和我一起来挑战' + this.mapIndex + '关~',
                    imageUrl: canvas.toTempFilePathSync({
                        x: 0,
                        y: top,
                        width: canvas.width,
                        height: canvas.width,
                        destWidth: width,
                        destHeight: width * 0.8
                    }),
                    query: "mapId=" + this.mapIndex,
                })
            }
        }, 500);
    },
    // testMap(round, level) {
    //     let xhr = new XMLHttpRequest();
    //     xhr.onreadystatechange = () => {
    //         if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
    //             let response = xhr.responseText;
    //             console.log('linbo:', `'${JSON.parse(response).a0}',`);
    //         }
    //     }

    //     xhr.open('GET', `http://bbh.gaoqingpai.com/hrd/res/HD/Round${round}/${level}.json`);
    //     xhr.send();
    // },

    getRandomMap1() {
        let maps;
        if (this.mapRandomIndex == 1) {
            maps = window.home.maps1();
        } else if (this.mapRandomIndex == 2) {
            maps = window.home.maps2();
        } else {
            maps = window.home.maps3();
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
            maps = window.home.maps5();
        } else if (this.mapRandomIndex == 2) {
            maps = window.home.maps4();
        } else {
            maps = window.home.maps3();
        }
        if (this.map2Index == -1) {
            this.map2Index = parseInt(Math.random() * maps.length);
            console.log('当前关卡2:', 6 - this.mapRandomIndex, this.map2Index);
            this.mapIndex = (6 - this.mapRandomIndex) * 1000 + this.map2Index;
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

    //消除
    destroyRandomBlock() {
        this.btnClick();
        if (this.destroyTimes == -1) {
            this.showAlert = true;
            let self = this;
            Alert.show("移出道具", "随机移出一个方块", function () {
                self.share();
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
                // this.destroyNode.getComponent(cc.Button).interactable = false;
                // this.destroyNode.opacity = 128;
                this.destroyCountLabel.string = '+';
                this.destroyTimes = -1;
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

    //换一关
    change() {
        this.btnClick();
        if (this.changeTimes == -1) {
            this.showAlert = true;
            let self = this;
            Alert.show("洗牌道具", "随机打乱所有方块", function () {
                self.share();
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
                // //禁用消除 按钮
                // this.changeNode.getComponent(cc.Button).interactable = false;
                // this.changeNode.opacity = 128;
                this.changeCountLabel.string = '+';
                this.changeTimes = -1
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
                self.share();
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
                // this.resetNode.getComponent(cc.Button).interactable = false;
                // this.resetNode.opacity = 128;

                this.resetTimes = -1;
            }
        }
    },

    success() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.getOpenDataContext().postMessage({
                type: 'updateCost',
                value: this.cost,
            })
        }
        cc.director.loadScene('success');
    },

    fail() {
        cc.director.loadScene('fail');
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
        this.resetMap();

        this.timeIndex = setInterval(() => {
            if (!this.showAlert) {
                this.clockLabel.string = --this.time;
                this.cost++;
                if (this.time == 0) {
                    this.fail();
                }
            }
        }, 1000);
    },

    onDestroy() {
        clearInterval(this.timeIndex);
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
