<template>
  <div class="canvas_box">
    <span>{{ imageName }}</span>
    <a
      v-for="(xy, index) in dots"
      :key="index"
      :style="{
        left: `${xy.x * imgScale + imgX}px`,
        top: `${xy.y * imgScale + imgY}px`,
      }"
      :class="[index === currentDotIndex ? 'on' : null]"
      @click="setDotIndex(index)"
      >{{ `${index}[x:${xy.x},y:${xy.y}]` }}</a
    >
    <canvas ref="myCanvas" width="808" height="883"> </canvas>
  </div>
</template>
<script>
export default {
  data() {
    return {
      imgX: 0,
      imgY: 0, //在画布上放置图像的 x 、y坐标位置。
      imgScale: 1,
      canvas: null,
      ctx: null,
      img: null,
      currentDotIndex: 0,
    };
  },
  props: ["imageURL", "imageName", "dots", "box"],
  watch: {
    imageURL(val) {
      this.loadImg(val);
    },
    dots(newValue, oldValue) {
      if (newValue.length !== oldValue.length) {
        this.currentDotIndex = newValue.length - 1;
      }
    },
  },
  mounted() {
    this.canvas = this.$refs.myCanvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvasEventsInit();
  },
  methods: {
    loadImg(imgUrl) {
      // 绘制图片
      this.img = new Image();
      this.img.setAttribute("crossOrigin", "anonymous");
      this.img.onload = () => {
        this.drawImage();
      };
      this.img.src = imgUrl;
    },
    drawImage() {
      const _this = this;
      if (_this.img) {
        this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
        this.ctx.drawImage(
          _this.img, //规定要使用的图像、画布或视频。
          0,
          0, //img开始剪切的位置
          _this.img.width,
          _this.img.height, //需要剪切的img宽高
          _this.imgX,
          _this.imgY, //在画布上放置图像的 x 、y坐标位置。
          _this.img.width * _this.imgScale,
          _this.img.height * _this.imgScale //剪切的img需要放入画布的尺寸
        );
      }
    },
    canvasEventsInit() {
      var _this = this;
      var canvas = _this.canvas;

      canvas.oncontextmenu = function(e) {
        e.preventDefault();
      };

      canvas.onmousedown = function(event) {
        event.stopPropagation();
        event.preventDefault();
        if (!_this.img) {
          _this.$message.error("请上传图片");
          return;
        }
        let pos = _this.windowToCanvas(event.clientX, event.clientY);

        if (event.button == 2) {
          //鼠标右击事件
          canvas.onmousemove = function(evt) {
            //移动
            canvas.style.cursor = "move";
            var pos1 = _this.windowToCanvas(evt.clientX, evt.clientY);
            var x = pos1.x - pos.x;
            var y = pos1.y - pos.y;
            pos = pos1;
            _this.imgX += x;
            _this.imgY += y;
            _this.drawImage(); //重新绘制图片
          };
          canvas.onmouseup = function() {
            canvas.onmousemove = null;
            canvas.onmouseup = null;
            canvas.style.cursor = "default";
          };
        } else if (event.button == 0) {
          //鼠标点击事件
          const imgX = _this.imgX;
          const imgY = _this.imgY;
          const image_width = _this.img.width;
          const image_height = _this.img.height;
          const imgScale = _this.imgScale;
          //实际点的坐标
          var isX = 0;
          var isY = 0;
          //实际选中坐标 肯定 = 点击的坐标 + canvas的坐标(必须为-数)
          var temp_canvas_x = imgX - imgX * 2;
          var temp_canvas_y = imgY - imgY * 2;

          if (imgScale == 1) {
            //原始尺寸
            isX = pos.x + temp_canvas_x;
            isY = pos.y + temp_canvas_y;
          } else {
            if (imgScale > 1) {
              //被放大了,实际坐标需要/
              isX = (pos.x + temp_canvas_x) / imgScale;
              isY = (pos.y + temp_canvas_y) / imgScale;
            } else {
              //被缩小了,坐标点放大
              isX = (pos.x + temp_canvas_x) * (1 / imgScale);
              isY = (pos.y + temp_canvas_y) * (1 / imgScale);
            }
          }

          //处理左上的是否超出图片范围
          if (isX < 0 || isY < 0) {
            _this.$message.error("请选择图片区域");
            return false;
          }
          //处理右下区域,主要处理图片是否超出
          if (isX > image_width || isY > image_height) {
            _this.$message.error("超出图片尺度");
            return false;
          }
          // 分发事件给主组件
          _this.$EventBus.$emit("dotChange", _this.currentDotIndex, _this.box, {
            x: isX,
            y: isY,
          });

          console.log("点击相对于图片的坐标点: x=" + isX + " & y=" + isY);
          console.log(
            "图片完整的宽度=" + image_width + "&高度=" + image_height
          );
          console.log("缩放级别:" + imgScale);
        }
      };

      canvas.onmousewheel = canvas.onwheel = function() {
        //滚轮放大缩小
        var wheelDelta = event.wheelDelta
          ? event.wheelDelta
          : event.deltalY * -40; //获取当前鼠标的滚动情况
        if (wheelDelta > 0) {
          _this.imgScale *= 1.1;
        } else {
          _this.imgScale *= 0.9;
        }
        _this.drawImage(); //重新绘制图片
        event.preventDefault && event.preventDefault(); // 阻止默认事件，可能在滚动的时候，浏览器窗口也会滚动
        return false;
      };
    },
    windowToCanvas(x, y) {
      var box = this.canvas.getBoundingClientRect(); //这个方法返回一个矩形对象，包含四个属性：left、top、right和bottom。分别表示元素各边与页面上边和左边的距离
      return {
        x: x - box.left - (box.width - this.canvas.width) / 2,
        y: y - box.top - (box.height - this.canvas.height) / 2,
      };
    },
    setDotIndex(index) {
      this.currentDotIndex = index;
    },
  },
};
</script>
<style lang="less" scoped>
.canvas_box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  canvas {
    background-color: #000;
  }

  a {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: red;
    z-index: 999;
    color: yellow;
    font-size: 16px;
  }

  .on {
    border: 2px dotted blue;
  }

  span {
    position: absolute;
    font-size: 18px;
    color: yellow;
    background-color: rgba(0, 0, 0, 0.5);
    right: 0;
    top: 0;
    z-index: 999;
  }
}
</style>
