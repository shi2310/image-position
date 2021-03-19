<template>
  <div class="box">
    <a-upload
      name="avatar"
      list-type="picture-card"
      class="avatar-uploader"
      :show-upload-list="false"
      :before-upload="beforeUpload"
    >
      <a-icon :type="loading ? 'loading' : 'plus'" />
      <div class="ant-upload-text">上传图片...</div>
    </a-upload>
    <div class="img">
      <ImgShow
        :imageURL="imageUrl"
        :imageName="imageName"
        :dots="dots"
        :box="box"
      />
    </div>
  </div>
</template>
<script>
import _ from "lodash";
import ImgShow from "./ImgShow";

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

export default {
  data() {
    return {
      loading: false,
      imageName: "",
      imageUrl: "",
    };
  },
  props: ["box", "dots"],
  components: {
    ImgShow,
  },
  methods: {
    beforeUpload(file) {
      const imgTypes = ["image/jpeg", "image/png", "image/jpg"];
      const isJPG = _.includes(imgTypes, file.type);
      if (!isJPG) {
        this.$message.error("仅允许上传的文件类型JPG,JPEG,PNG!");
      }
      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        this.$message.error("文件大小不能超过20MB!");
      }
      if (isJPG && isLt20M) {
        getBase64(file, (imageUrl) => {
          this.imageName = file.name;
          this.imageUrl = imageUrl;
          this.loading = false;
        });
      }
      return false;
    },
  },
};
</script>
<style lang="less" scoped>
.box {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: stretch;

  .img {
    width: 100%;
    height: calc(100% - 42px);
  }

  .avatar-uploader {
    width: 100%;

    /deep/.ant-upload {
      width: 100%;
      height: 100%;
      padding: 0;
    }
  }
}
</style>
