<template>
  <div class="box">
    <div class="left">
      <div class="container" :style="{ borderColor: 'red' }">
        <Upload />
      </div>
      <div class="container" :style="{ borderColor: 'blue' }">
        <Upload />
      </div>
    </div>
    <div class="right">
      <div class="list">
        <a-list :data-source="newData">
          <div slot="header">
            定位点
          </div>
          <a-list-item slot="renderItem" :key="index" slot-scope="item, index">
            <div>
              {{ item }}
            </div>
            <a slot="actions" @click="deleteData(item.key)">删除</a>
          </a-list-item>
        </a-list>
      </div>
      <div :style="{ textAlign: 'center' }">
        <a-button
          type="primary"
          @click="
            () => {
              this.visible = true;
            }
          "
        >
          提交
        </a-button>
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
    this.$EventBus.$off("parentPullDot");
    document.removeEventListener("keydown", this.doSave);
  },
  mounted() {
    // 监听子组件的请求
    this.$EventBus.$on("parentPullDot", (obj) => {
      this.data.push(obj);
    });
    document.addEventListener("keydown", this.doSave);
  },
  data() {
    return {
      index: 0,
      data: [],
      newData: [],
      visible: false,
    };
  },
  watch: {
    data(v) {
      let dataObj = {};
      // 根据index合并
      _.map(v, (item) => {
        const { index, imageName, x, y } = item;
        if (!dataObj[index]) {
          dataObj[index] = [];
        }
        dataObj[index].push({ imageName, x, y });
      });
      this.newData = _.map(dataObj, (item, key) => {
        return { key, item };
      });
    },
  },
  methods: {
    doSave(e) {
      if (!(e.keyCode === 83 && e.ctrlKey)) {
        return;
      }
      e.preventDefault();
      this.index++;
      this.$EventBus.$emit("childPushDot", this.index);
    },
    deleteData(key) {
      // 待删除的元素
      this.newData.forEach((item, i) => {
        if (item.key === key) {
          this.newData.splice(i, 1);
        }
      });
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
    }
  }
}
</style>
