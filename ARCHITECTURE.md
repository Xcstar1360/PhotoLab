# PhotoLab 项目架构文档

> 自动维护的最后更新: 2026-04-25

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
| 样式 | SCSS |

### 后端

| 类别 | 技术 |
|------|------|
| 框架 | Express.js |
| 图像处理 | Sharp |
| EXIF 解析 | exifr |
| 开发工具 | tsx |

### 共享

| 类别 | 技术 |
|------|------|
| 类型定义 | TypeScript |

## 项目结构

```
PhotoLab/
├── client/                    # 前端 (Vue + Vite)
│   ├── src/
│   │   ├── main.ts           # 前端入口
│   │   ├── App.vue            # 根组件
│   │   ├── views/
│   │   │   └── HomeView.vue  # 首页
│   │   ├── components/
│   │   │   ├── DropZone.vue   # 图片拖拽上传
│   │   │   ├── ImagePreview.vue # 图片预览
│   │   │   ├── WatermarkOverlay.vue # 水印预览层（拖拽定位）
│   │   │   ├── ExifInfo.vue   # EXIF 信息展示
│   │   │   ├── WatermarkPanel.vue # 水印设置面板
│   │   │   ├── BorderPanel.vue # 边框设置面板
│   │   │   ├── PhotoInfoPanel.vue # 拍摄参数面板
│   │   │   └── ActionButtons.vue # 操作按钮
│   │   ├── composables/
│   │   │   └── usePhotoApi.ts # API 调用封装
│   │   └── assets/
│   │       ├── main.scss     # 全局样式入口
│   │       └── styles/       # SCSS partials
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/                    # 后端 (Express)
│   ├── src/
│   │   ├── index.ts          # 服务端入口
│   │   ├── routes/
│   │   │   └── photo.routes.ts # API 路由
│   │   └── services/
│   │       ├── image.service.ts # 图像处理入口
│   │       ├── exif.service.ts # EXIF 提取
│   │       ├── watermark/
│   │       │   └── watermark.service.ts # 水印处理
│   │       ├── border/
│   │       │   └── border.service.ts # 边框处理
│   │       └── capture/
│   │           └── capture.service.ts # 拍摄参数水印
│   ├── uploads/               # 上传文件目录
│   ├── tsconfig.json
│   └── package.json
├── shared/                    # 共享类型
│   ├── types/
│   │   └── index.ts          # 类型定义
│   ├── tsconfig.json
│   └── package.json
├── package.json               # 根目录 (npm workspaces)
├── tsconfig.base.json         # 基础 TypeScript 配置
└── ARCHITECTURE.md
```

## 启动命令

```bash
# 安装依赖
npm install

# 开发模式（仅后端）
npm run dev

# 开发模式（仅前端）
npm run dev:frontend

# 开发模式（前后端同时启动）
npm run dev:all

# 构建
npm run build

# 启动生产服务器
npm run start
```

## 前端路由

| 路径 | 组件 | 描述 |
|------|------|------|
| / | HomeView | 首页，包含图片处理功能 |

## API 接口

### POST /api/photo/upload
上传照片，返回 EXIF 信息。

### POST /api/photo/process
处理照片（上传新文件，添加水印、边框）。

### POST /api/photo/process-existing
处理已有照片（基于原图路径处理，避免重复上传）。

### GET /api/photo/exif/:filename
获取指定文件的 EXIF 信息。

### GET /api/photo/color/:filename
提取图片主色调。

## 功能清单

- [x] EXIF 信息提取（相机、参数、GPS、时间等）
- [x] 文字水印（自由定位拖拽、字体、颜色、透明度、旋转、阴影可调）
- [x] Logo 水印（上传自定义 Logo）
- [x] 纯色边框（支持自定义颜色或主色调）
- [x] 模糊边框
- [x] 深色/浅色主题切换
- [x] 拍摄参数水印（经典/徕卡/影院/宝丽来 四种风格）

## 更新日志

| 日期 | 描述 |
|------|------|
| 2026-04-25 | 重构水印功能：新增 WatermarkOverlay 拖拽定位，移除预设位置，优化前后端比例换算 |
| 2026-04-21 | 优化图片处理流程：已有原图不再重复上传，处理结果覆盖而非冗余生成 |
| 2026-04-20 | 重构服务端服务结构，拆分 image.service.ts |
| 2026-04-20 | 新增拍摄参数水印功能（四种风格） |
| 2026-04-20 | CSS 迁移到 SCSS 并拆分到各组件 |
| 2026-04-19 | 新增深色/浅色主题切换功能 |
| 2026-04-19 | 重构前端布局为左中右三栏结构 |
| 2026-04-19 | 重构为 Vite + Vue3 项目结构 |
| 2026-04-19 | 初始版本，包含 EXIF 提取、水印、边框功能 |
