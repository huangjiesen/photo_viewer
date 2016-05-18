/**
 * 全屏图片查看器
 * 本插件基于JQuery1.8.3版本编写
 * @type {{getInstance}} 图片单例对象
 */
var PhotoViewer=(function () {
    //缓存图片查看器对象，方便实现单例
    var instantiated;

    //定义图片查看器
    function init() {
        //页面标签检测
        var $viewer = $(".photo_viewer");
        if($viewer.length>0) {
            throw "标签冲突，页面存在应用\"photo_viewer\"类样式的标签！";
        }

        //向页面添加查看器的相关标签元素
        var html = "<div class='photo_viewer'>";
        html+="<div class='photo_mask'></div>";
        html+="<div class='photo_change photo_left photo_prev'><div class='photo_change_btn'></div></div>";
        html+="<div class='photo_change photo_right photo_next'><div class='photo_change_btn'></div></div>";
        html+="<div class='photo_util'>";
        html+="<ul><li><i class='photo_line'></i></li>";
        html+="<li style='margin-left: 10px;'>第</li>";
        html+="<li class='photo_index'></li><li>张/总</li>";
        html+="<li class='photo_count'></li><li>张</li>";
        html+="<li style='margin-left: 10px;'><i class='photo_line'></i></li>";
        html+="<li class='photo_btn photo_prev'>上一张</li>";
        html+="<li><i class='photo_line'></i></li>";
        html+="<li class='photo_btn photo_next'>下一张</li>";
        html+="<li><i class='photo_line'></i></li>";
        html+="<li class='photo_btn photo_zoom_in' title='放大'></li>";//<img src='imgs/zoom_in.png'>
        html+="<li class='photo_percent'></li><li>%</li>";
        html+="<li class='photo_btn photo_zoom_out' title='缩小'></li>";//<img src='imgs/zoom_out.png'>
        html+="<li><i class='photo_line'></i></li>";
        html+="<li class='photo_btn resize_btn'>原始尺寸</li>";
        html+="<li><i class='photo_line'></i></li>";
        html+="<li class='photo_btn photo_rotating' title='旋转'></li>";//<img src='imgs/rotating.png'>
        html+="<li><i class='photo_line'></i></li>";
        html+="<li class='photo_btn photo_close'>关闭</li>";
        html+="<li><i class='photo_line'></i></li></ul>";
        html+="</div><div class='photo_container'>";
        html+="<img class='photo_view' /><div class='photo_loading'></div></div></div>";
        $viewer=$(html);
        html = null;
        $viewer.appendTo("body");

        var pv = this;
        //规定图片相对链接的基准URL
        pv.BASE_HREF = "";

        //常用标签元素对象
        var $view=$viewer.find(".photo_view"),$percent=$viewer.find(".photo_percent"),$loading=$viewer.find(".photo_loading");
        var $index=$viewer.find(".photo_index"),$count=$viewer.find(".photo_count");

        /**重置图片显示信息*/
        pv.reset = function () {
            $percent.text(pv.percent = 100);
            $view.removeAttr("style");
        };
        /**显示图片*/
        pv.view = function () {
            $index.text(pv.index+1);
            pv.reset();
            pv.rotateDeg = 0;

            $loading.show();
            $view.hide().attr("src", pv.BASE_HREF+pv.imgs[pv.index]).load(function () {
                pv.setPosition();
                $view.show();
                $loading.hide();
            });
        };
        /**保存图片显示器的高宽*/
        pv.resize = function () {
            //如果有显示图片，则调整图片的位置
            if($viewer.is(":visible")){
                pv.width = $viewer.outerWidth(true);
                pv.height = $viewer.outerHeight(true);
                pv.setPosition();
            }
        };
        /**设置图片位置*/
        pv.setPosition = function () {
            var left = (pv.width-$view.outerWidth(true))/2;
            var top = (pv.height-$view.outerHeight(true)-51)/2;
            $view.css({"left":left+"px","top":top+"px"});
        };
        /**
         * 图片的伸缩处理
         * @param zoomIn 是否放大、为false时表示缩小图片
         */
        pv.zoom = function (zoomIn) {
            //最大5倍，最小十分之一
            if(zoomIn&&pv.percent>=500||pv.percent<=10&&!zoomIn) {
                return;
            }
            var h = $view.innerHeight(), w = $view.innerWidth();
            //伸缩5%
            var p = parseInt(pv.percent*0.05),ph = parseInt(h*0.05),pw = parseInt(w*0.05);
            p = p < 1 ? 1 : p;
            ph = ph < 1 ? 1 : ph;
            pw = pw < 1 ? 1 : pw;

            //如果是缩小，将数改为负
            if(!zoomIn) {
                p = -p,ph = -ph,pw = -pw;
            }

            //伸缩重新图片的位置
            var left=parseInt($view.css("left")),top=parseInt($view.css("top"));

            $percent.text( pv.percent =  pv.percent+ p);
            $view.css({
                "height":(h+ ph)+"px",
                "width":(w+ pw)+"px",
                "top":parseInt(top-ph/2)+"px",
                "left":parseInt(left-pw/2)+"px"
            });
        };
        /**
         * 旋转图片
         */
        pv.transform = function () {
            $view.css("transform","rotate("+pv.rotateDeg+"deg)");
            $view.css("-ms-transform","rotate("+pv.rotateDeg+"deg)");
            $view.css("-webkit-transform","rotate("+pv.rotateDeg+"deg)");
            $view.css("-moz-transform","rotate("+pv.rotateDeg+"deg)");
            $view.css("-o-transform","rotate("+pv.rotateDeg+"deg)");
        };
        //放大图片点击事件
        $viewer.find(".photo_zoom_in").click(function () {
            pv.zoom(true);
        });
        //缩小图片点击事件
        $viewer.find(".photo_zoom_out").click(function () {
            pv.zoom(false);
        });
        //关闭查看器
        $viewer.find(".photo_close").click(function () {
            $viewer.hide();
        });
        //显示原始尺寸
        $viewer.find(".resize_btn").click(function () {
            pv.reset();
            pv.setPosition();
        });
        //点击显示上一张图
        $viewer.find(".photo_prev").click(function () {
            pv.index=pv.index-1;
            if(pv.index<0) {
                pv.index = pv.count -1;
            }
            pv.view();
        });
        //点击显示下一张图
        $viewer.find(".photo_next").click(function () {
            pv.index++;
            if(pv.index >= pv.count) {
                pv.index = 0;
            }
            pv.view();
        });
        //点击旋转图片
        $viewer.find(".photo_rotating").click(function () {
            pv.rotateDeg += 90;
            if(pv.rotateDeg==360) {
                pv.rotateDeg = 0;
            }
            pv.transform();
        });


        /*
         *  ****** 处理图片的拖拽 start *****
         */
        var dragging = false;
        var iX, iY;
        //鼠标按下，激活拖拽，设置鼠标捕获
        $view.mousedown(function(e) {
            dragging = true;
            iX = e.clientX - this.offsetLeft;
            iY = e.clientY - this.offsetTop;
            this.setCapture && this.setCapture();
            return false;
        });
        //拖拽开始
        document.onmousemove = function(e) {
            if (dragging) {
                var e = e || window.event;
                var oX = e.clientX - iX;
                var oY = e.clientY - iY;
                $view.css({"left":oX + "px", "top":oY + "px"});
                return false;
            }
        };
        //释放鼠标捕获，阻止冒泡
        $(document).mouseup(function (e) {
            dragging = false;
            e.cancelBubble = true;
        });
        /* ****** 处理图片的拖拽 end ******/


        //浏览器在调整大小的时候，保存图片显示器的高宽
        $(window).resize(pv.resize);


        //图片查看器的公共方法
        return {
            /**
             * 显示查看器
             * @param imgs 图片路径数组
             * @param index 默认要显示的图片下标,不传时默认为0
             */
            show:function (imgs,index) {
                if (!$.isArray(imgs)) {
                    throw "请输入图片路径数组！";
                } else if (imgs.length < 1) {
                    throw "图片路径数组长度为0！";
                }
                pv.imgs = imgs;
                pv.index = $.isNumeric(index) ? index : 0;
                $count.text(pv.count = imgs.length);

                pv.reset();
                $viewer.show();
                pv.resize();
                pv.view();
            },
            /**
             * 设置图片相对链接的基准URL
             * @param BASE_HREF 图片相对链接的基准URL,不传时默认为空字符
             */
            setBaseHref:function (BASE_HREF) {
                pv.BASE_HREF = BASE_HREF;
            }
        };
    }

    //暴露获取图片查看器单例对象的方法
    return {
        /**
         * 获取图片查看器的单例对象
         * @param BASE_HREF 图片相对链接的基准URL,不传时默认为空字符
         * @returns 图片查看器对象
         */
        getInstance: function (BASE_HREF) {
            if (!instantiated) {
                instantiated = init();
            }
            if(BASE_HREF) {
                instantiated.setBaseHref(BASE_HREF);
            }
            return instantiated;
        }
    };
})();