import { Bot } from 'grammyjs'
import { User } from 'types-manage'
import { config } from './config.ts'
import { AtriContext } from './type.ts'

export const kv = await Deno.openKv()

export async function createSession(bot: Bot<AtriContext>, user: User) {
	const topic = await bot.api.createForumTopic(
		config.SUPERGROUPS_ID,
		`${user.first_name} ${user.last_name}`,
	)

	const threadId = topic.message_thread_id
	const userKey = ['user_to_thread', user.id]
	const threadKey = ['thread_to_user', threadId]
	const infoKey = ['user_info', user.id]
	const res = await kv.atomic()
		.set(userKey, threadId)
		.set(threadKey, user.id)
		.set(infoKey, user)
		.commit()
	if (!res.ok) throw new Error('并发冲突，请重试')
	return threadId
}
