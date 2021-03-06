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

class Main extends egret.DisplayObjectContainer {


    /// 旋转及缩放步长设定
    private static STEP_ROT: number = 3;
    private static STEP_SCALE: number = .03;

    private _sound: egret.Sound;
    private _channel: egret.SoundChannel;

    public constructor() {
        super();
        this.once(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }



    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");


    }

    private Mlab: egret.Bitmap;
    private _txInfo: egret.TextField;





    private launchAnimations(): void {

        this._iAnimMode = AnimModes.ANIM_ROT;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this._iAnimMode = (this._iAnimMode + 1) % 3;
        }, this);

        this._nScaleBase = 0;

        /// 根据当前模式调整旋转度数或缩放正弦基数形成相应动画
        this.addEventListener(egret.Event.ENTER_FRAME, (evt: egret.Event) => {

            /*** 本示例关键代码段开始 ***/
            switch (this._iAnimMode) {
                case AnimModes.ANIM_ROT:        /// 仅旋转
                    this.Mlab.rotation += Main.STEP_ROT;
                    break;
                case AnimModes.ANIM_SCALE:        /// 仅缩放，缩放范围 0.5~1
                    this.Mlab.scaleX = this.Mlab.scaleY = 0.8 + 0.2 * Math.abs(Math.sin(this._nScaleBase += Main.STEP_SCALE));
                    break;
            }
            /*** 本示例关键代码段结束 ***/

            // this._txInfo.text = 
            //       "旋转角度:" + this.Mlab.rotation 
            //     +"\n缩放比例:" + this.Mlab.scaleX.toFixed(2)
            //     +"\n\n轻触进入" +(["缩放","静止","旋转"][this._iAnimMode])+ "模式";

            return false;  /// 友情提示： startTick 中回调返回值表示执行结束是否立即重绘
        }, this);
    }

    /// 用于记录当前的模式，模式切换通过触摸舞台触发
    private _iAnimMode: number;
    private _nScaleBase: number;


    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;



    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield: egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene(): void {
        var stageW: number = this.stage.stageWidth;
        var stageH: number = this.stage.stageHeight;



        var Page_1: Page = new Page();
        this.addChild(Page_1);
        Page_1.touchEnabled = true;
        pagemove(Page_1);//页面具有滑动效果

        // var sky_1: egret.Bitmap = this.createBitmapByName("end_jpg");
        // Page_1.addChild(sky_1);
        // sky_1.width = stageW;
        // sky_1.height = stageH;

        var Blackgound = new egret.Shape();
        Blackgound.graphics.beginFill(0x90EE90, 0.2);
        Blackgound.graphics.drawRect(0, 0, stageW, stageH);
        Blackgound.graphics.endFill();
        Page_1.addChild(Blackgound);

        var text: egret.TextField = new egret.TextField();
        text.textColor = 0xffffff;
        text.width = 540;
        text.size = 30;
        text.lineSpacing = 40;
        text.bold = false;


        //设置文本的混合样式
        text.textFlow = <Array<egret.ITextElement>>[
            { text: "我想要见证", style: { "size": 30, "textColor": 0x545454 } },
            { text: "人类", style: { "textColor": 0x32CD99, "size": 60, "strokeColor": 0x000000, "stroke": 2, "fontFamily": "微软雅黑" } },
            { text: "文明的", style: { "fontFamily": "微软雅黑", "textColor": 0x545454 } },
            { text: "各种", style: { "fontFamily": "楷体", "textColor": 0x545454 } },
            { text: "\n科技", style: { "textColor": 0x8E2323 } },
            { text: "\n社会", style: { "textColor": 0x8E2323 } },
            { text: "\n文化", style: { "textColor": 0x8E2323 } },
            { text: "\n信仰", style: { "textColor": 0x8E2323 } },
            { text: "\n" },
            { text: "的", style: { "size": 32, "textColor": 0x545454 } },
            { text: "发", style: { "size": 30, "textColor": 0x545454 } },
            { text: "展\n", style: { "size": 26, "textColor": 0x545454 } },
            { text: "吸引我的是   ", style: { "italic": true, "textColor": 0xff2400 } },
            { text: "未知的未来！", style: { "size": 32,"fontFamily": "微软雅黑", "textColor": 0x545454 } },//楷体

        ];
        /*** 本示例关键代码段结束 ***/

        text.x = 320 - text.textWidth / 2;
        text.y = 550 - text.textHeight / 2;
        Page_1.addChild(text);


        var Page_2: Page = new Page();
        this.addChild(Page_2);
        Page_2.touchEnabled = true;
        pagemove(Page_2);//页面具有滑动效果

        var sky_2: egret.Bitmap = this.createBitmapByName("light_jpg");
        Page_2.addChild(sky_2);
        sky_2.width = stageW;
        sky_2.height = stageH;

        var text_3 = new egret.TextField();
        text_3.textColor = 0xffffff;
        text_3.width = stageW - 172;
        text_3.textAlign = "center";
        text_3.text = "想制作成HTML5游戏的类型";
        text_3.size = 26;
        text_3.anchorOffsetX = text_3.width / 2;
        text_3.anchorOffsetY = text_3.height / 2;
        text_3.x = stageW / 2;
        text_3.y = 1060;
        Page_2.addChild(text_3);

        var dc2: egret.Bitmap = this.createBitmapByName("dc2_jpg");
        Page_2.addChild(dc2);
        dc2.scaleX = 1;
        dc2.scaleY = 1;
        dc2.anchorOffsetX = dc2.width / 2;
        dc2.anchorOffsetY = dc2.height / 2;
        dc2.x = this.stage.stageWidth / 2;
        dc2.y = 670;
        dc2.alpha = 1;

        var eu: egret.Bitmap = this.createBitmapByName("eu_jpg");
        Page_2.addChild(eu);
        eu.scaleX = dc2.width / eu.width;
        eu.scaleY = dc2.width / eu.width;
        eu.anchorOffsetX = eu.width / 2;
        eu.anchorOffsetY = eu.height / 2;
        eu.x = this.stage.stageWidth / 2;
        eu.y = this.stage.stageHeight * 5 / 6 - 50;
        eu.alpha = 0;

        var rl: egret.Bitmap = this.createBitmapByName("rl_png");
        Page_2.addChild(rl);
        rl.scaleX = dc2.width / rl.width;
        rl.scaleY = dc2.width / rl.width;
        rl.anchorOffsetX = rl.width / 2;
        rl.anchorOffsetY = rl.height / 2;
        rl.x = this.stage.stageWidth / 2;
        rl.y = this.stage.stageHeight * 5 / 6 - 50;
        rl.alpha = 0;


        var changedc2: Function = function () {

            var dc2tw = egret.Tween.get(dc2);
            dc2tw.to({ "alpha": 1 }, 500);
            dc2tw.wait(3000);
            dc2tw.to({ "alpha": 0 }, 500);
            dc2tw.call(changeeu, self);

        }

        var changeeu: Function = function () {

            var eutw = egret.Tween.get(eu);
            eutw.to({ "alpha": 1 }, 500);
            eutw.wait(3000);
            eutw.to({ "alpha": 0 }, 500);
            eutw.call(changerl, self);

        }

        var changerl: Function = function () {

            var rltw = egret.Tween.get(rl);
            rltw.to({ "alpha": 1 }, 500);
            rltw.wait(3000);
            rltw.to({ "alpha": 0 }, 500);
            rltw.call(changedc2, self);

        }
        changedc2();  //图片循环

        var Page_3: Page = new Page();
        this.addChild(Page_3);
        Page_3.touchEnabled = true;
        pagemove(Page_3);//页面具有滑动效果



        var sky_3: egret.Bitmap = this.createBitmapByName("cloud_jpg");
        Page_3.addChild(sky_3);
        sky_3.width = stageW;
        sky_3.height = stageH;


        var text_2: egret.TextField = new egret.TextField();
        text_2.textColor = 0xffffff;
        text_2.width = 540;
        text_2.size = 30;
        text_2.lineSpacing = 25;
        text_2.bold = false;


        text_2.textFlow = <Array<egret.ITextElement>>[
            { text: "在不远的未来想要从事\n", style: { "size": 30, "fontFamily": "微软雅黑", "textColor": 0x000000 } },
            { text: "         不会被AI替代的工作！", style: { "size": 32, "fontFamily": "微软雅黑", "textColor": 0x000000 } },//楷体

        ];
        text_2.x = 380 - text.textWidth / 2;
        text_2.y = 1160 - text.textHeight / 2;

        Page_3.addChild(text_2);

        var topMask = new egret.Shape();
        topMask.graphics.beginFill(0x000000, 0.15);
        topMask.graphics.drawRect(0, 0, stageW, 172);
        topMask.graphics.endFill();
        topMask.y = 33;
        this.addChild(topMask);

        var icon: egret.Bitmap = this.createBitmapByName("tou_jpeg");
        this.addChild(icon);
        icon.x = 26;
        icon.y = 33;

        var shockicon: Function = function () {
            var icontw = egret.Tween.get(icon);
            icontw.to({ "rotation": 10 }, 100);
            icontw.to({ "rotation": -10 }, 100);
            icontw.to({ "rotation": 0 }, 100);
            icontw.wait(2000);
            icontw.call(shockicon, self);
        }
        shockicon();
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

        var music: egret.Sound = RES.getRes("music_mp3");
        var musicChannel: egret.SoundChannel;
        var stop_time: number = 0;
        musicChannel = music.play(stop_time, 0);//定义音乐
        var Anim_point = AnimModes.Anim_0;//定义按钮模式

        this.Mlab.touchEnabled = true;
        this.Mlab.addEventListener(egret.TouchEvent.TOUCH_TAP, changeAnim, this);


        /// 提示信息
        this._txInfo = new egret.TextField;
        this.addChild(this._txInfo);

        this._txInfo.size = 28;  /* private _txInfo:egret.TextField; */
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
        RES.getResAsync("description_json", this.startAnimation, this)


        function changescale(icon: egret.Bitmap, sX: number, sY: number): void {
            var n = 0;
            icon.anchorOffsetX = icon.width / 2;
            icon.anchorOffsetY = icon.height / 2;//改变锚点位置
            icon.addEventListener(egret.Event.ENTER_FRAME, (evt: egret.Event) => {
                icon.scaleX = icon.scaleY = 0.5 * sX + 0.5 * sY * Math.abs(Math.sin(n += Main.STEP_SCALE));
            }, this);             /// 仅缩放，缩放范围
        }//自身放大缩小

        function changeAnim(e: egret.TouchEvent): void {
            Anim_point = (Anim_point + 1) % 2;
            switch (Anim_point) {
                case AnimModes.Anim_0:
                    musicChannel = music.play(stop_time, 0);
                    break;
                case AnimModes.Anim_1:
                    stop_time = musicChannel.position;
                    musicChannel.stop();
                    musicChannel = null;
                    break;
            }
        }//改变音乐播放模式


        function if_playmusic(e: egret.TouchEvent): void {
            switch (Anim_point) {
                case AnimModes.Anim_0: music.play();
                    break;
                case AnimModes.Anim_1: music.close();
                    break;
            }
        }

        function pagemove(p: Page): void {
            p.addEventListener(egret.TouchEvent.TOUCH_BEGIN, p.mouseDown, p);
            p.addEventListener(egret.TouchEvent.TOUCH_END, p.mouseUp, p);
        }
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }




    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: Array<any>): void {
        var self: any = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr: Array<Array<egret.ITextElement>> = [];
        for (var i: number = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }

        var textfield = self.textfield;
        var count = -1;
        var change: Function = function () {
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
    }

    /**
     * 切换描述内容
     * Switch to described content
     */
    private changeDescription(textfield: egret.TextField, textFlow: Array<egret.ITextElement>): void {
        textfield.textFlow = textFlow;
    }
}

class Page extends egret.DisplayObjectContainer {   //实现翻页用的page类

    private _touchStatus: boolean = false;              //当前触摸状态，按下时，值为true
    private _distance: egret.Point = new egret.Point(); //鼠标点击时，记录坐标位置差

    public mouseDown(evt: egret.TouchEvent) {
        this._touchStatus = true;
        this._distance.y = evt.stageY - this.y;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
    }

    private mouseMove(evt: egret.TouchEvent) {
        if (this._touchStatus) {
            this.y = evt.stageY - this._distance.y;
            if (this.y < -this.stage.stageHeight * 3 / 5) {
                egret.Tween.get(this).to({ x: 0, y: -1136 }, 350, egret.Ease.sineIn)
                    .wait(300).to({ x: 0, y: 0 }, 100, egret.Ease.sineIn);
                this.parent.addChildAt(this, 0);
                this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
            }
            if (this.y > this.stage.stageHeight * 3 / 5) {
                egret.Tween.get(this).to({ x: 0, y: -1136 }, 350, egret.Ease.sineIn)
                    .wait(300).to({ x: 0, y: 0 }, 100, egret.Ease.sineIn);
                this.parent.addChildAt(this, 0);
                this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
            }


        }
    }

    public mouseUp(evt: egret.TouchEvent) {
        this._touchStatus = false;
        if (this.y >= -this.stage.stageHeight * 3 / 5) {
            egret.Tween.get(this).to({ x: 0, y: 0 }, 300, egret.Ease.sineIn);
        }
        if (this.y <= this.stage.stageHeight * 3 / 5) {
            egret.Tween.get(this).to({ x: 0, y: 0 }, 300, egret.Ease.sineIn);
        }
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
    }

}

class AnimModes {   //按钮模式
    public static ANIM_ROT: number = 0;
    public static ANIM_SCALE: number = 1;
    public static Anim_0: number = 0;
    public static Anim_1: number = 1;
}

