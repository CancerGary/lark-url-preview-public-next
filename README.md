# 飞书自定义链接预览 | Lark Custom URL Preview

详细介绍可见 [飞书文档](https://bcew4xxy7a.feishu.cn/docx/UpJkdVTdao7IwUx46bRcDiahn2D)

## Docker 部署

```bash
docker pull cancergary/lark-url-preview-public-next:latest
docker run -p 3000:3000 cancergary/lark-url-preview-public-next:latest
```

## 开发

项目使用 [Next.js](https://nextjs.org/) 框架

### 启动开发环境

```bash
pnpm dev
```

- `/` 为重定向落地页
- `/api/handler` 为接收飞书回调的地址
- `/editor` 为编辑器页面

### 运行 API 测试

```bash
pnpm test
```