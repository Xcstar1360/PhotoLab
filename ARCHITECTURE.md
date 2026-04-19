# PhotoLab 项目架构文档

> 自动维护的最后更新: 2026-04-19

## 项目概述

PhotoLab 是一个照片处理工具，提供水印和边框功能。

## 技术栈

| 类别 | 技术 |
|------|------|
| 后端框架 | Express.js |
| 图像处理 | Sharp |
| EXIF 解析 | exifr |
| 语言 | TypeScript |
| 开发工具 | tsx |

## 项目结构

```
PhotoLab/
├── src/
│   ├── index.ts          # 服务入口
│   ├── routes/
│   │   └── photo.routes.ts  # API 路由
│   ├── services/
│   │   ├── exif.service.ts  # EXIF 提取
│   │   └── image.service.ts  # 图像处理
│   └── types/
│       └── index.ts      # 类型定义
├── public/
│   └── index.html        # 前端页面
├── uploads/              # 上传文件目录
├── dist/                # 编译输出
├── package.json
└── tsconfig.json
```

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
| 2026-04-19 | 初始版本，包含 EXIF 提取、水印、边框功能 |
