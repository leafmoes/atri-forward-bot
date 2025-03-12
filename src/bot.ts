import { Bot, Context } from 'grammyjs'
import { User } from 'types-manage'
import { autoThread } from "auto-thread";
import { config } from './config.ts'
import { createSession, kv } from './kv.ts'
import { AtriContext } from './type.ts'

export const bot = new Bot<AtriContext>(config.BOT_TOKEN || '')

const isAdmin = (ctx: Context) => ctx.from?.id == config.ADMIN_ID
const isBoundGroup = (ctx: Context) => ctx.chatId == config.SUPERGROUPS_ID
bot.use(autoThread())
bot.command('regcmd', async (ctx) => {
	await ctx.api.setMyCommands([
		{ command: 'start', description: '开始对话' },
		{ command: 'help', description: '帮助信息' },
		{ command: 'about', description: '关于本机器人' },
	])
	await ctx.api.setMyCommands([
		{ command: 'info', description: '获取当前话题对应用户信息' },
		{ command: 'ban', description: '拉黑当前话题对应的用户' },
	], {
		scope: {
			type: 'chat_member',
			chat_id: config.SUPERGROUPS_ID,
			user_id: config.ADMIN_ID,
		},
	})
	ctx.reply('核心指令注册完毕！要试试[火箭拳菜单]还是[味觉传感器3.0]呢？')
})

bot.command(
	'start',
	(ctx) => ctx.reply(config.START_MESSAGE, { parse_mode: 'HTML' }),
)

bot.command(
	'about',
	(ctx) => ctx.reply(config.ABOUT_MESSAGE, { parse_mode: 'HTML' }),
)

bot.command(
	'help',
	(ctx) => {
		let helpText: string
		if (isAdmin(ctx)) {
			helpText = `
主人，这是我的操作指南！
基本命令：
<code>/start</code> 向用户发送欢迎信息
<code>/regcmd</code> 重新注册命令提示
<code>/help</code> 向用户发送帮助信息
<code>/about</code> 向用户发送关于信息
话题可用命令：
<code>/info</code> 获取话题所对应的用户的信息
<code>/ban</code> 封禁话题对应的用户
<code>/unban</code> 解除封禁话题对应的用户`
		} else {
			helpText = config.HELP_MESSAGE || config.START_MESSAGE
		}
		ctx.reply(helpText, { parse_mode: 'HTML' })
	},
)

bot.chatType('private').on(['message', 'edited_message'], async (ctx) => {
	if (ctx.from.id == config.ADMIN_ID) {
		ctx.reply(
			'主人在说什么呀~ 人家听不懂啦！\n\n(´•ω•̥`) 要不试试查看帮助菜单？\n\n输入 /help 就可以召唤魔法说明书啦～',
		)
	} else {
		const userId = ctx.from.id
		const isBanned = await kv.get(['banned', userId])
		if (isBanned.value) return
		const threadId = await kv.get<number>(['user_to_thread', userId])
		if (!threadId.value) {
			try {
				threadId.value = await createSession(bot, ctx.from)
			} catch {
				return ctx.reply('⛔️ 系统繁忙，请稍后再试')
			}
		}
		ctx.forwardMessage(config.SUPERGROUPS_ID, {
			message_thread_id: threadId.value,
		})
	}
})

bot.chatType('supergroup').command('info').filter(
	(ctx) => isBoundGroup(ctx),
	async (ctx) => {
		const threadId = Number(ctx.msg.message_thread_id)
		const userId = await kv.get<number>(['thread_to_user', threadId])
		if (!userId.value) {
			ctx.reply('⚠️ 当前会话未绑定用户！')
		} else {
			const userInfo = await kv.get<User>(['user_info', userId.value])
			if (!userInfo.value) {
				ctx.reply('⚠️ 当前会话用户信息丢失！请联系管理员！')
			} else {
				await ctx.reply(
					`
📌 用户信息：
ID: <code>${userInfo.value.id}</code>
昵称: <a href="tg://user?id=${userInfo.value.id}">${userInfo.value.first_name} ${userInfo.value.last_name}</a>
用户名: @${userInfo.value.username}`,
					{
						parse_mode: 'HTML',
					},
				)
			}
		}
	},
)

const banUser = (ban: boolean) => async (ctx: Context) => {
	const threadId = Number(ctx.msg?.message_thread_id)
	const userId = await kv.get<number>(['thread_to_user', threadId])

	if (!userId.value) return ctx.reply('⚠️ 当前会话未绑定用户！')

	const isBanned = await kv.get<boolean>(['banned', userId.value])
	if (isBanned.value === ban) {
		return ctx.reply(`ℹ️ 用户已${ban ? '封禁' : '解封'}，无需重复操作`)
	}

	await kv.set(['banned', userId.value], ban)
	await ctx.reply(`✅ 已${ban ? '封禁' : '解除封禁'}该用户！`)
}

bot.chatType('supergroup').command('ban').filter(
	(ctx) => isBoundGroup(ctx) && isAdmin(ctx),
	banUser(true),
)

bot.chatType('supergroup').command('unban').filter(
	(ctx) => isBoundGroup(ctx) && isAdmin(ctx),
	banUser(false),
)

bot.on('msg:forum_topic_closed').filter(
	(ctx) => isBoundGroup(ctx),
	banUser(true),
)

bot.on('msg:forum_topic_reopened').filter(
	(ctx) => isBoundGroup(ctx),
	banUser(false),
)

bot.chatType('supergroup').on(['message', 'edited_message']).filter(
	(ctx) => isBoundGroup(ctx) && isAdmin(ctx),
	async (ctx) => {
		const threadId = Number(ctx.msg.message_thread_id)
		const userId = await kv.get<number>(['thread_to_user', threadId])
		if (!userId.value) {
			ctx.reply('⚠️ 当前会话未绑定用户！')
		} else {
			ctx.forwardMessage(userId.value)
		}
	},
)
