<template>
  <el-splitter layout="vertical" style="overflow: hidden" @collapse="delayResize()" @resize="delayResize()">
    <el-splitter-panel :collapsible="true" size="60px">
      <Header class="header"></Header>
    </el-splitter-panel>

    <el-splitter-panel class="main">
      <el-splitter @collapse="delayResize()" @resize="delayResize()">
        <el-splitter-panel :collapsible="true" size="20%">
          <div ref="sidebarLeftRef" class="sidebarLeftRef">

          </div>
        </el-splitter-panel>
        <el-splitter-panel size="60%">
          <div ref="viewRef" class="viewRef">

          </div>
        </el-splitter-panel>
        <el-splitter-panel :collapsible="true" size="20%">
          <div ref="sidebarRightRef" class="sidebarRightRef">

          </div>
        </el-splitter-panel>
      </el-splitter>
    </el-splitter-panel>

    <el-splitter-panel :collapsible="true" size="120px">
      <Footer class="footer"></Footer>
    </el-splitter-panel>
  </el-splitter>
</template>

<script lang="ts" setup>
import {nextTick, onMounted, ref, type Ref} from "vue";
import Header from "~/components/Header.vue";
import Footer from "~/components/Footer.vue";
import {SceneManager} from "~/utils/manager/scene/SceneManager.ts";
import {PlayerManager} from "~/utils/manager/player/PlayerManager.ts";

const viewRef = ref<HTMLDivElement>()
const sidebarLeftRef = ref<HTMLDivElement>()
const sidebarRightRef = ref<HTMLDivElement>()

const sceneManager = new SceneManager()
const playerManager = new PlayerManager(sceneManager)

function delayResize() {
  nextTick(() => {
    sceneManager.resize();
  })
}

onMounted(async () => {
  sceneManager.init(viewRef as Ref<HTMLDivElement>)
  sceneManager.setCamera(playerManager.Player.camera)
  sceneManager.pushFunction(playerManager.update.bind(playerManager))

  await playerManager.bindWindowEvent();

  sceneManager.run();

  window.addEventListener('resize', () => {
    sceneManager.resize();
  })

  setTimeout(() => {
    sceneManager.resize();
  })

})
</script>

<style scoped src="./app.css"></style>
