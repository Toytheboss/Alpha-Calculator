# Alpha Calculator

Binance Alpha 多账户统计系统（静态页面 + Cloudflare Pages Functions + KV）。

## 功能

- 多账户月度收益明细、总览统计
- 管理密码登录（云端部署）
- 数据保存在 Cloudflare KV（多设备同步）

## 本地开发

```bash
npm install
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars 设置 ADMIN_PASSWORD 与 SESSION_SECRET
npm run dev
```

打开终端提示的本地地址，使用 `.dev.vars` 中的密码登录。

## 部署到 Cloudflare Pages

1. 安装依赖：`npm install`
2. 登录 Cloudflare：`npx wrangler login`
3. 部署：`npm run deploy`
4. 设置密钥（仅首次）：

```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name=alpha-calculator
npx wrangler pages secret put SESSION_SECRET --project-name=alpha-calculator
```

`SESSION_SECRET` 建议使用 32 位以上随机字符串。

## GitHub

仓库：<https://github.com/Toytheboss/Alpha-Calculator>

在 Cloudflare Dashboard → Workers & Pages → alpha-calculator → Settings → Builds 中连接该 GitHub 仓库，构建命令留空，输出目录为 `/`。

## 安全说明

- 密码通过 HTTPS 校验，会话为 HttpOnly Cookie
- 请勿将 `.dev.vars` 提交到 Git
- 定期更换 `ADMIN_PASSWORD`
