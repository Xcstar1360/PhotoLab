# PhotoLab 项目架构文档

> 自动维护的最后更新: 2026-04-19

## 项目概述

PhotoLab 是一个照片处理工具，提供水印和边框功能。前端采用 Vue3 + Vite 构建，后端基于 Express.js 提供 API 服务。

## 技术栈

### 前端

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 构建工具 | Vite |
| 语言 | TypeScript |
| 路由 | Vue Router |
| 样式 | CSS |

### 后端

| 类别 | 技术 |
|------|------|
| 框架 | Express.js |
| 图像处理 | Sharp |
| EXIF 解析 | exifr |
| 开发工具 | tsx |

## 项目结构

```
PhotoLab/
├── src/
│   ├── main.ts              # 前端入口
│   ├── App.vue               # 根组件
│   ├── views/
│   │   └── HomeView.vue     # 首页
│   ├── components/
│   │   ├── DropZone.vue      # 图片拖拽上传
│   │   ├── ImagePreview.vue  # 图片预览
│   │   ├── ExifInfo.vue      # EXIF 信息展示
│   │   ├── WatermarkPanel.vue # 水印设置面板
│   │   ├── BorderPanel.vue   # 边框设置面板
│   │   └── ActionButtons.vue  # 操作按钮
│   ├── composables/
│   │   └── usePhotoApi.ts    # API 调用封装
│   ├── routes/
│   │   └── photo.routes.ts   # API 路由
│   ├── services/
│   │   ├── exif.service.ts   # EXIF 提取
│   │   └── image.service.ts  # 图像处理
│   ├── types/
│   │   └── index.ts          # 类型定义
│   └── index.ts              # 服务端入口
├── public/                   # 静态资源
├── uploads/                  # 上传文件目录
├── dist/                     # 编译输出
├── index.html
├── vite.config.ts
├── tsconfig.json
└── tsconfig.vue.json
```

## 前端路由

| 路径 | 组件 | 描述 |
|------|------|------|
| / | HomeView | 首页，包含图片处理功能 |

## API 接口

### POST /api/photo/upload
上传照片，返回 EXIF 信息。

### POST /api/photo/process
处理照片（添加水印、边框）。

### GET /api/photo/exif/:filename
获取指定文件的 EXIF 信息。

### GET /api/photo/color/:filename
提取图片主色调。

## 功能清单

- [x] EXIF 信息提取（相机、参数、GPS、时间等）
- [x] 文字水印（位置、大小、颜色、透明度可调）
- [x] 纯色边框（支持自定义颜色或主色调）
- [x] 模糊边框

## 更新日志

| 日期 | 描述 |
|------|------|
| 2026-04-19 | 重构为 Vite + Vue3 项目结构 |
| 2026-04-19 | 初始版本，包含 EXIF 提取、水印、边框功能 |
