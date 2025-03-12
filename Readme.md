<div align="center">
<h1>ATRI Forward Bot</h1>
<img src="https://lain.bgm.tv/r/400/pic/cover/l/46/f8/297264_Llz6w.jpg" alt="" height="300">
</div>

因为作者前段时间看了 [亚托莉 -我挚爱的时光-](https://bangumi.tv/subject/297264) ，非常喜欢亚托莉 （アトリ）这个角色，所以机器人使用 ATRI 来命名（之前叫 Baka Forward Bot）

一个高性能的 Telegram Forward Bot，工作在 Telegram SuperGroups Topics。

本项目使用 Deno 作为机器人托管平台，使用附属 KV 作为数据库。

官方免费版使用限制：[1M req/mo, 100 GB/mo, 10ms CPU 时间限制](https://deno.com/deploy/pricing)

免费版预计可支持读取操作45W次，写入操作30w次

对于机器人来说每增加一个与之对话的新陌生人，会产生两次写入

每次机器人收到消息会发生两次读取

综上所述，除非一个月内，你的机器人产生了近15w个陌生用户与你机器人对话，或者收到近20w条消息，此时免费额度会用完。

（wwww，怎么想都不可能用完吧？）

## 命令说明

`/start` : 向用户发送欢迎信息，信息内容可通过环境变量 `START_MESSAGE` 自定义

`/info` : 在话题内直接使用，获取当前话题所对应的用户的信息

`/ban` : 在话题内直接使用，会封禁该话题对应的用户

`/unban` : 在话题内直接使用，会解除封禁该话题对应的用户

`/about` : 向用户发送关于信息，信息内容可通过环境变量 `ABOUT_MESSAGE` 自定义

`/help` : 向用户发送帮助信息，如果是管理员会展示命令菜单，如果是陌生人会发送欢迎信息。

## 部署教程

你可以 fork 本项目，然后部署到 Deno 云托管平台

### 1. 前置操作

1. 机器人密钥 `BOT_TOKEN`，请前往 [@BotFather](https://t.me/BotFather) 申请。
2. 管理员ID `ADMIN_ID`，请前往 [@MissRose_bot](https://t.me/MissRose_bot) 发送 `/info` 获取你的 ID 填入
3. 超级群组ID `SUPERGROUPS_ID`，请前往你要作为接收陌生人消息的群组，然后将群组的ID填入（你可以使用 [@MissRose_bot](https://t.me/MissRose_bot) 发送 `/id` 获取群组ID），最后将群组开启话题模式，以转化为超级群组。

### 2. 部署

1. Fork 本项目到你的Github
2. 前往 [Deno 新建项目](https://dash.deno.com/new)，如果没有登录请使用 Github 登入 Deno，然后进行操作。
3. 点击 `Create an empty project` 创建一个空项目，然后点击 `Settings` 设置项目名称以及添加刚才获取的三个环境变量值 `BOT_TOKEN` 、`ADMIN_ID` 、`SUPERGROUPS_ID`
4. 在 Git Integration 选择你 Fork 的仓库进行连接，`Entrypoint` 设置为 `src/server.ts`，然后点击部署。
4. 浏览器访问 `https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<YOUR_DENO_PROJECT>.deno.dev/<BOT_TOKEN>` 进行 Webhook 注册（注意替换啊，别是笨蛋）。
5. 把你的机器人拉入到你要作为接收陌生人消息的群组，并给予管理员权限（消息和话题操作的权限都必须留下，否则无法正常工作）
6. （可选）在绑定的群组里面发送 `/regcmd` 来注册一些命令（`/info`，`/ban`，`/unban`）的提示。

## 常见问题

1. 为什么不使用 Cloudflare Workers 平台？

    答：wwww，主要原因是 Workers KV 数据库的读写是最终一致性，非强一致性，可能会在并发的时候导致未知的结果。

2. 为什么不支持 i18n （多语言支持）？

    答：感觉没太大必要？感觉天天水的也是中文社区，也没外国人跟我说话，也不咋和老外交流，如果你需要 i18n，可以尝试提交一些 i18n 翻译，也许会考虑加进去

3. 我该如何为项目做出贡献？

    答：Fork 本项目，然后在自己仓库修改后，提交 Pr 到本仓库