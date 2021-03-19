<template>
  <div class="box">
    <div class="left">
      <div class="container" :style="{ borderColor: 'red' }">
        <Upload :dots="getBoxDots('left')" :box="'left'" />
      </div>
      <div class="container" :style="{ borderColor: 'blue' }">
        <Upload :dots="getBoxDots('right')" :box="'right'" />
      </div>
    </div>
    <div class="right">
      <div class="list">
        <a-list :data-source="newData">
          <div class="title" slot="header">
            <span>定位点</span><a @click="addData">添加</a>
          </div>
          <a-list-item slot="renderItem" :key="index" slot-scope="obj, index">
            <div>
              {{ obj }}
            </div>
            <a slot="actions" @click="deleteData(index)">删除</a>
          </a-list-item>
        </a-list>
      </div>
      <div :style="{ textAlign: 'center' }">
        <a-space>
          <a-button
            type="primary"
            @click="
              () => {
                this.visible = true;
              }
            "
          >
            <a-icon type="download" />导成JSON
          </a-button>
          <a-upload
            name="file"
            :show-upload-list="false"
            :before-upload="beforeUpload"
          >
            <a-button><a-icon type="upload" /> 导入JSON </a-button>
          </a-upload>
        </a-space>
      </div>
    </div>
    <a-modal v-model="visible" title="对标数据">
      <pre :style="{ maxHeight: '500px' }">{{
        JSON.stringify(newData, null, 3)
      }}</pre>
    </a-modal>
  </div>
</template>

<script>
import _ from "lodash";
import Upload from "../components/Upload";
export default {
  name: "Main",
  components: {
    Upload,
  },
  beforeDestroy() {
    this.$EventBus.$off("dotChange");
  },
  mounted() {
    // 监听子组件的请求
    this.$EventBus.$on("dotChange", (index, box, xy) => {
      this.newData[index][box] = xy;
    });
  },
  data() {
    return {
      index: 0,
      newData: [],
      visible: false,
    };
  },
  methods: {
    getBoxDots(box) {
      return _.map(this.newData, box);
    },
    addData() {
      this.newData.push({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } });
    },
    deleteData(index) {
      // 待删除的元素
      this.newData.splice(index, 1);
    },
    beforeUpload(file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const importJSON = JSON.parse(reader.result);
        this.newData = [...this.newData, ...importJSON];
      });
      reader.readAsText(file);
      return false;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.box {
  height: 100%;
  width: 100%;
  display: flex;

  .left {
    flex: 1;
    height: 100%;
    display: flex;
    justify-content: space-between;

    .container {
      height: 100%;
      width: 50%;
      border-width: 1px;
      border-style: solid;
      position: relative;
    }
  }

  .right {
    width: 300px;
    height: 100%;
    border: 1px solid #dedede;
    padding: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .list {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;

      .title {
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style>
