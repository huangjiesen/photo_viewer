# 网页全屏图片查看器
[在线演示](http://jiesenboor.github.io/other/demo/photoviewer/index.html)

简介：<br/>
这是基于`jquery1.8.3`开发的一个图片查看插件，实现图片在页面的`放大`、`缩小`、`旋转`、`拖拽`等功能

使用方法：<br />
  在页面中引入样式文件`core.css`、脚本文件`core.js`，再使用以下代码显示图片。
``` javascript
var pv=PhotoViewer.getInstance();
pv.show(图片路径数组);
```

