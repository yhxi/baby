# 宝宝养育计划小程序 — 项目长期笔记

## 技术栈
- 微信小程序原生（WXML/WXSS/JS），无框架、无云开发、无后端。
- 数据持久化：wx.getStorageSync / wx.setStorageSync（本地存储 key: babyRecords / babyProfile）。
- 图标方案：emoji + 纯色块，未引入图片资源，降低体积、避免缺图。

## 目录结构
- pages/index：首页（概览卡片 + 快速记录 + 今日列表）
- pages/record：记录添加/编辑（受 type / id 查询参数驱动）
- pages/timeline：按日期分组的时间线
- pages/insights：今日统计 + 近7天睡眠趋势柱状图（CSS 高度实现）
- pages/family：宝宝档案设置、数据导出（复制到剪贴板）、清空
- utils/storage.js：记录类型配置 RECORD_TYPES + 增删改查工具

## 约定
- 记录类型 key：breast(亲喂)/feed(奶瓶)/pump(泵奶)/sleep(睡眠)/diaper(尿布)/medicine(补剂药品)。
- 时间线、首页、洞察均在 onShow 中 refresh，保证返回时数据最新。
- 界面配色主色 #FF7B7B（暖粉），婴儿友好风格。

## 预览方式
- 微信开发者工具导入 E:\baby 目录；appid 沿用 wx105c251b88b52fcc 或选测试号。
- 本机未安装微信开发者工具（截至 2026-08-13 探测）。
