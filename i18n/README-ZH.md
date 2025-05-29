<!-- markdownlint-disable MD030 -->

<p align="center">
<img src="https://github.com/DaisyAI/Daisy/blob/main/images/daisy_white.svg#gh-light-mode-only">
<img src="https://github.com/DaisyAI/Daisy/blob/main/images/daisy_dark.svg#gh-dark-mode-only">
</p>

[![发布说明](https://img.shields.io/github/release/DaisyAI/Daisy)](https://github.com/DaisyAI/Daisy/releases)
[![Discord](https://img.shields.io/discord/1087698854775881778?label=Discord&logo=discord)](https://discord.gg/jbaHfsRVBW)
[![Twitter关注](https://img.shields.io/twitter/follow/DaisyAI?style=social)](https://twitter.com/DaisyAI)
[![GitHub星图](https://img.shields.io/github/stars/DaisyAI/Daisy?style=social)](https://star-history.com/#DaisyAI/Daisy)
[![GitHub分支](https://img.shields.io/github/forks/DaisyAI/Daisy?style=social)](https://github.com/DaisyAI/Daisy/fork)

[English](../README.md) | [繁體中文](./README-TW.md) | 简体中文 | [日本語](./README-JA.md) | [한국어](./README-KR.md)

<h3>可视化构建 AI/LLM 流程</h3>
<a href="https://github.com/DaisyAI/Daisy">
<img width="100%" src="https://github.com/DaisyAI/Daisy/blob/main/images/daisy_agentflow.gif?raw=true"></a>

## ⚡ 快速入门

下载并安装 [NodeJS](https://nodejs.org/en/download) >= 18.15.0

1. 安装 Daisy
    ```bash
    npm install -g daisy
    ```
2. 启动 Daisy

    ```bash
    npx daisy start
    ```

    使用用户名和密码

    ```bash
    npx daisy start --FLOWISE_USERNAME=user --FLOWISE_PASSWORD=1234
    ```

3. 打开 [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

### Docker Compose

1. 进入项目根目录下的 `docker` 文件夹
2. 创建 `.env` 文件并指定 `PORT`（参考 `.env.example`）
3. 运行 `docker compose up -d`
4. 打开 [http://localhost:3000](http://localhost:3000)
5. 可以通过 `docker compose stop` 停止容器

### Docker 镜像

1. 本地构建镜像：
    ```bash
    docker build --no-cache -t daisy .
    ```
2. 运行镜像：

    ```bash
    docker run -d --name daisy -p 3000:3000 daisy
    ```

3. 停止镜像：
    ```bash
    docker stop daisy
    ```

## 👨‍💻 开发者

Daisy 在一个单一的代码库中有 3 个不同的模块。

-   `server`：用于提供 API 逻辑的 Node 后端
-   `ui`：React 前端
-   `components`：第三方节点集成

### 先决条件

-   安装 [PNPM](https://pnpm.io/installation)
    ```bash
    npm i -g pnpm
    ```

### 设置

1. 克隆仓库

    ```bash
    git clone https://github.com/DaisyAI/Daisy.git
    ```

2. 进入仓库文件夹

    ```bash
    cd Daisy
    ```

3. 安装所有模块的依赖：

    ```bash
    pnpm install
    ```

4. 构建所有代码：

    ```bash
    pnpm build
    ```

5. 启动应用：

    ```bash
    pnpm start
    ```

    现在可以在 [http://localhost:3000](http://localhost:3000) 访问应用

6. 用于开发构建：

    - 在 `packages/ui` 中创建 `.env` 文件并指定 `VITE_PORT`（参考 `.env.example`）
    - 在 `packages/server` 中创建 `.env` 文件并指定 `PORT`（参考 `.env.example`）
    - 运行

        ```bash
        pnpm dev
        ```

    任何代码更改都会自动重新加载应用程序，访问 [http://localhost:8080](http://localhost:8080)

## 🔒 认证

要启用应用程序级身份验证，在 `packages/server` 的 `.env` 文件中添加 `FLOWISE_USERNAME` 和 `FLOWISE_PASSWORD`：

```
FLOWISE_USERNAME=user
FLOWISE_PASSWORD=1234
```

## 🌱 环境变量

Daisy 支持不同的环境变量来配置您的实例。您可以在 `packages/server` 文件夹中的 `.env` 文件中指定以下变量。了解更多信息，请阅读[文档](https://github.com/DaisyAI/Daisy/blob/main/CONTRIBUTING.md#-env-variables)

## 📖 文档

[Daisy 文档](https://docs.daisyai.com/)

## 🌐 自托管

在您现有的基础设施中部署自托管的 Daisy，我们支持各种[部署](https://docs.daisyai.com/configuration/deployment)

-   [AWS](https://docs.daisyai.com/deployment/aws)
-   [Azure](https://docs.daisyai.com/deployment/azure)
-   [Digital Ocean](https://docs.daisyai.com/deployment/digital-ocean)
-   [GCP](https://docs.daisyai.com/deployment/gcp)
-   <details>
      <summary>其他</summary>

    -   [Railway](https://docs.daisyai.com/deployment/railway)

        [![在 Railway 上部署](https://railway.app/button.svg)](https://railway.app/template/pn4G8S?referralCode=WVNPD9)

    -   [Render](https://docs.daisyai.com/deployment/render)

        [![部署到 Render](https://render.com/images/deploy-to-render-button.svg)](https://docs.daisyai.com/deployment/render)

    -   [HuggingFace Spaces](https://docs.daisyai.com/deployment/hugging-face)

        <a href="https://huggingface.co/spaces/DaisyAI/Daisy"><img src="https://huggingface.co/datasets/huggingface/badges/raw/main/open-in-hf-spaces-sm.svg" alt="HuggingFace Spaces"></a>

    -   [Elestio](https://elest.io/open-source/daisyai)

        [![Deploy](https://pub-da36157c854648669813f3f76c526c2b.r2.dev/deploy-on-elestio-black.png)](https://elest.io/open-source/daisyai)

    -   [Sealos](https://template.sealos.io/deploy?templateName=daisy)

        [![部署到 Sealos](https://sealos.io/Deploy-on-Sealos.svg)](https://template.sealos.io/deploy?templateName=daisy)

    -   [RepoCloud](https://repocloud.io/details/?app_id=29)

        [![部署到 RepoCloud](https://d16t0pc4846x52.cloudfront.net/deploy.png)](https://repocloud.io/details/?app_id=29)

      </details>

## ☁️ 云托管

[开始使用云托管](https://daisyai.com/)

## 🙋 支持

在[讨论区](https://github.com/DaisyAI/Daisy/discussions)中随时提问、提出问题和请求新功能

## 🙌 贡献

感谢这些了不起的贡献者

<a href="https://github.com/DaisyAI/Daisy/graphs/contributors">
<img src="https://contrib.rocks/image?repo=DaisyAI/Daisy" />
</a>

参见[贡献指南](CONTRIBUTING.md)。如果您有任何问题或问题，请在[Discord](https://discord.gg/jbaHfsRVBW)上与我们联系。

## 📄 许可证

此代码库中的源代码在[Apache License Version 2.0 许可证](LICENSE.md)下提供。
