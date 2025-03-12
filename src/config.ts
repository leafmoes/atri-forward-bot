import { load } from 'dotenv'

const env = await load()

export const config = {
	BOT_TOKEN: Deno.env.get('BOT_TOKEN') || env['BOT_TOKEN'],
	ADMIN_ID: parseInt(Deno.env.get('ADMIN_ID') || env['ADMIN_ID']),
	SUPERGROUPS_ID: parseInt(Deno.env.get('SUPERGROUPS_ID') || env['SUPERGROUPS_ID']),
	HELP_MESSAGE: Deno.env.get('HELP_MESSAGE') || env['HELP_MESSAGE'],
	START_MESSAGE: Deno.env.get('START_MESSAGE') || env['START_MESSAGE'] || "你好！我是亚托莉！(๑´ڡ`๑)✨ \n\n你有什么想对主人说的都可以告诉我，我会帮你转达！\n\n我可是高性能的！这点事情我轻轻松松就可以搞定！",
	ABOUT_MESSAGE: Deno.env.get('ABOUT_MESSAGE') || env['ABOUT_MESSAGE'] || `你可以前往 <a href="https://github.com/leafmoes/atri-forward-bot">Github</a> 部署属于你的传话机器人！`,
}
