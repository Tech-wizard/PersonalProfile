//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.once(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    p.launchAnimations = function () {
        var _this = this;
        this._iAnimMode = AnimModes.ANIM_ROT;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            _this._iAnimMode = (_this._iAnimMode + 1) % 3;
        }, this);
        this._nScaleBase = 0;
        /// 根据当前模式调整旋转度数或缩放正弦基数形成相应动画
        this.addEventListener(egret.Event.ENTER_FRAME, function (evt) {
            /*** 本示例关键代码段开始 ***/
            switch (_this._iAnimMode) {
                case AnimModes.ANIM_ROT:
                    _this.Mlab.rotation += Main.STEP_ROT;
                    break;
                case AnimModes.ANIM_SCALE:
                    _this.Mlab.scaleX = _this.Mlab.scaleY = 0.8 + 0.5 * Math.abs(Math.sin(_this._nScaleBase += Main.STEP_SCALE));
                    break;
            }
            /*** 本示例关键代码段结束 ***/
            // this._txInfo.text = 
            //       "旋转角度:" + this.Mlab.rotation 
            //     +"\n缩放比例:" + this.Mlab.scaleX.toFixed(2)
            //     +"\n\n轻触进入" +(["缩放","静止","旋转"][this._iAnimMode])+ "模式";
            return false; /// 友情提示： startTick 中回调返回值表示执行结束是否立即重绘
        }, this);
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        var Page_1 = new Page();
        this.addChild(Page_1);
        Page_1.touchEnabled = true;
        pagemove(Page_1); //页面具有滑动效果
        // var sky_1: egret.Bitmap = this.createBitmapByName("end_jpg");
        // Page_1.addChild(sky_1);
        // sky_1.width = stageW;
        // sky_1.height = stageH;
        var Blackgound = new egret.Shape();
        Blackgound.graphics.beginFill(0x6B8E23, 0.9);
        Blackgound.graphics.drawRect(0, 0, stageW, stageH);
        Blackgound.graphics.endFill();
        Page_1.addChild(Blackgound);
        var text = new egret.TextField();
        text.textColor = 0xffffff;
        text.width = 540;
        text.size = 30;
        text.lineSpacing = 40;
        text.bold = false;
        //设置文本的混合样式
        text.textFlow = [
            { text: "我想要见证", style: { "size": 30 } },
            { text: "人类", style: { "textColor": 0x32CD99, "size": 60, "strokeColor": 0x6699cc, "stroke": 2, "fontFamily": "微软雅黑" } },
            { text: "文明的", style: { "fontFamily": "微软雅黑" } },
            { text: "各种", style: { "fontFamily": "楷体" } },
            { text: "\n科技", style: { "textColor": 0x70DBDB } },
            { text: "\n社会", style: { "textColor": 0x70DBDB } },
            { text: "\n文化", style: { "textColor": 0x70DBDB } },
            { text: "\n信仰", style: { "textColor": 0x70DBDB } },
            { text: "\n" },
            { text: "的", style: { "size": 32 } },
            { text: "发", style: { "size": 30 } },
            { text: "展\n", style: { "size": 26 } },
            { text: "吸引我的是", style: { "italic": true, "textColor": 0xff2400 } },
            { text: "未知的未来！", style: { "fontFamily": "微软雅黑" } },
        ];
        /*** 本示例关键代码段结束 ***/
        text.x = 320 - text.textWidth / 2;
        text.y = 600 - text.textHeight / 2;
        Page_1.addChild(text);
        var Page_2 = new Page();
        this.addChild(Page_2);
        Page_2.touchEnabled = true;
        pagemove(Page_2); //页面具有滑动效果
        var sky_2 = this.createBitmapByName("light_jpg");
        Page_2.addChild(sky_2);
        sky_2.width = stageW;
        sky_2.height = stageH;
        var Page_3 = new Page();
        this.addChild(Page_3);
        Page_3.touchEnabled = true;
        pagemove(Page_3); //页面具有滑动效果
        var sky_3 = this.createBitmapByName("cloud_jpg");
        Page_3.addChild(sky_3);
        sky_3.width = stageW;
        sky_3.height = stageH;
        var topMask = new egret.Shape();
        topMask.graphics.beginFill(0x000000, 0.15);
        topMask.graphics.drawRect(0, 0, stageW, 172);
        topMask.graphics.endFill();
        topMask.y = 33;
        this.addChild(topMask);
        var icon = this.createBitmapByName("tou_jpeg");
        this.addChild(icon);
        icon.x = 26;
        icon.y = 33;
        var line = new egret.Shape();
        line.graphics.lineStyle(2, 0xffffff);
        line.graphics.moveTo(0, 0);
        line.graphics.lineTo(0, 117);
        line.graphics.endFill();
        line.x = 216;
        line.y = 61;
        this.addChild(line);
        var colorLabel = new egret.TextField();
        colorLabel.textColor = 0xffffff;
        colorLabel.width = stageW - 172;
        colorLabel.textAlign = "center";
        colorLabel.text = "白宇昆";
        colorLabel.stroke = 2;
        colorLabel.strokeColor = 0x000000;
        colorLabel.size = 24;
        colorLabel.x = 172;
        colorLabel.y = 80;
        this.addChild(colorLabel);
        /// 展示用显示对象： 乐符按钮
        this.Mlab = this.createBitmapByName("normalmusic_svg");
        this.addChild(this.Mlab);
        this.Mlab.anchorOffsetX = this.Mlab.width / 2;
        this.Mlab.anchorOffsetY = this.Mlab.height / 2;
        this.Mlab.x = this.stage.stageWidth * 11 / 12;
        this.Mlab.y = this.stage.stageHeight * 0.24;
        /// 提示信息
        this._txInfo = new egret.TextField;
        this.addChild(this._txInfo);
        this._txInfo.size = 28; /* private _txInfo:egret.TextField; */
        this._txInfo.x = 50;
        this._txInfo.y = 50;
        this._txInfo.textAlign = egret.HorizontalAlign.LEFT;
        this._txInfo.textColor = 0x000000;
        this._txInfo.type = egret.TextFieldType.DYNAMIC;
        this._txInfo.lineSpacing = 6;
        this._txInfo.multiline = true;
        this.launchAnimations();
        var textfield = new egret.TextField();
        this.addChild(textfield);
        textfield.alpha = 0;
        textfield.width = stageW - 172;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.size = 24;
        textfield.textColor = 0xffffff;
        textfield.x = 172;
        textfield.y = 135;
        this.textfield = textfield;
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description_json", this.startAnimation, this);
        function pagemove(p) {
            p.addEventListener(egret.TouchEvent.TOUCH_BEGIN, p.mouseDown, p);
            p.addEventListener(egret.TouchEvent.TOUCH_END, p.mouseUp, p);
        }
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    p.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];
            self.changeDescription(textfield, lineArr);
            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };
        change();
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    p.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    /// 旋转及缩放步长设定
    Main.STEP_ROT = 3;
    Main.STEP_SCALE = .03;
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
var Page = (function (_super) {
    __extends(Page, _super);
    function Page() {
        _super.apply(this, arguments);
        this._touchStatus = false; //当前触摸状态，按下时，值为true
        this._distance = new egret.Point(); //鼠标点击时，记录坐标位置差
    }
    var d = __define,c=Page,p=c.prototype;
    p.mouseDown = function (evt) {
        this._touchStatus = true;
        this._distance.y = evt.stageY - this.y;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
    };
    p.mouseMove = function (evt) {
        if (this._touchStatus) {
            this.y = evt.stageY - this._distance.y;
            if (this.y < -this.stage.stageHeight / 2) {
                egret.Tween.get(this).to({ x: 0, y: -1136 }, 350, egret.Ease.sineIn)
                    .wait(300).to({ x: 0, y: 0 }, 100, egret.Ease.sineIn);
                this.parent.addChildAt(this, 0);
                this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
            }
            if (this.y > this.stage.stageHeight / 2) {
                egret.Tween.get(this).to({ x: 0, y: -1136 }, 350, egret.Ease.sineIn)
                    .wait(300).to({ x: 0, y: 0 }, 100, egret.Ease.sineIn);
                this.parent.addChildAt(this, 0);
                this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
            }
        }
    };
    p.mouseUp = function (evt) {
        this._touchStatus = false;
        if (this.y >= -this.stage.stageHeight / 2) {
            egret.Tween.get(this).to({ x: 0, y: 0 }, 300, egret.Ease.sineIn);
        }
        if (this.y <= this.stage.stageHeight / 2) {
            egret.Tween.get(this).to({ x: 0, y: 0 }, 300, egret.Ease.sineIn);
        }
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
    };
    return Page;
}(egret.DisplayObjectContainer));
egret.registerClass(Page,'Page');
var AnimModes = (function () {
    function AnimModes() {
    }
    var d = __define,c=AnimModes,p=c.prototype;
    AnimModes.ANIM_ROT = 0;
    AnimModes.ANIM_SCALE = 1;
    return AnimModes;
}());
egret.registerClass(AnimModes,'AnimModes');
//# sourceMappingURL=Main.js.map