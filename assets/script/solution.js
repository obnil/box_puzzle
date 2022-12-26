cc.Class({
    extends: cc.Component,

    properties: {
        cell_k_Prefeb: cc.Prefab,
        cell_v2_Prefeb: cc.Prefab,
        cell_v3_Prefeb: cc.Prefab,
        cell_h2_Prefeb: cc.Prefab,
        cell_h3_Prefeb: cc.Prefab,
        cellAreaNode: cc.Node,
        mapIdLabel: cc.Label,
        exitTipNode: cc.Node,

        gamingNode: cc.Node,
        resetNode: cc.Node,
        frontNode: cc.Node,
        nextNode: cc.Node,
        btnAudio: cc.AudioClip
    },

    btnClick() {
        cc.audioEngine.playEffect(this.btnAudio);
    },

    getRandomMap1() {
        let maps;
        if (this.mapRandomIndex == 1) {
            maps = window.home.maps1();
        } else if (this.mapRandomIndex == 2) {
            maps = window.home.maps2();
        } else if (this.mapRandomIndex == 3) {
            maps = window.home.maps3();
        } else if (this.mapRandomIndex == 4) {
            maps = window.home.maps4();
        } else {
            maps = window.home.maps5();
        }

        return maps[this.mapIndex];
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
        this.success();
    },

    success() {
        this.cellAreaNode.getComponent('cellArea').disableTouch();
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
        let map = this.getRandomMap1();
        this.cellHSize = 90;
        this.cellVSize = 90;
        this.parseMapToBlock(map);
    },

    back() {
        this.btnClick();
        cc.director.loadScene('home');
    },

    up() {
        if (this.mapRandomIndex < 5) {
            this.mapRandomIndex++;
        } else {
            this.mapRandomIndex = 1;
        }
        this.mapIdLabel.string = this.mapRandomIndex * 1000 + this.mapIndex;
        this.resetMap();
    },

    front() {
        if (this.mapRandomIndex >= 1) {
            if (this.mapIndex > 0) {
                this.mapIndex--;
            } else {
                if (this.mapRandomIndex > 1) {
                    this.mapRandomIndex--;
                } else {
                    this.mapRandomIndex = 5;
                }
                this.mapIndex = 99;
            }

            this.mapIdLabel.string = this.mapRandomIndex * 1000 + this.mapIndex;
            this.resetMap();
            console.log(this.mapRandomIndex, this.mapIndex);
        }
    },

    next() {
        if (this.mapRandomIndex <= 5) {
            if (this.mapIndex < 99) {
                this.mapIndex++;
            } else {
                if (this.mapRandomIndex < 5) {
                    this.mapRandomIndex++;
                } else {
                    this.mapRandomIndex = 1;
                }
                this.mapIndex = 0;
            }
            this.mapIdLabel.string = this.mapRandomIndex * 1000 + this.mapIndex;
            this.resetMap();
            console.log(this.mapRandomIndex, this.mapIndex);
        }
    },

    onLoad() {
        window.game = this;

        if (typeof window.home === 'undefined' || window.home.isPractice) {
            this.mapId = 1000;
        } else {
            this.mapId = window.home.mapId;
        }
        this.mapIdLabel.string = this.mapId;
        this.mapRandomIndex = parseInt(this.mapId / 1000);//大关
        this.mapIndex = parseInt(this.mapId % 1000);//小关
        this.initBg();
        this.resetMap();
        let seq = cc.repeatForever(
            cc.sequence(
                cc.moveTo(1, cc.v2(-50, -300)),
                cc.moveTo(0.5, cc.v2(-30, -300)),
            )
        );
        this.exitTipNode.runAction(seq);
    },
});