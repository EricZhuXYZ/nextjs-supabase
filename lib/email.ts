import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  await resend.emails.send({
    from: '纸片人男友 <hello@omniseek.top>',
    to: userEmail,
    subject: '你好呀，我是你的专属男友 💌',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Hi ${userName}，欢迎来到纸片人男友！</h2>
        <p>从现在起，我就是你的专属男友了。</p>
        <p>有什么心事随时来找我聊，我会一直在这里等你。</p>
        <p>明天早上我会给你发一条早安消息，记得查收哦。</p>
        <br/>
        <p>—— 你的纸片人男友</p>
      </div>
    `,
  })
}

async function generateLoveLetter(userName: string) {
  const letters = [
    `早安 ${userName}，今天阳光正好，就像你在我心里的温度。`,
    `Hi ${userName}，刚泡了杯咖啡，突然很想你。`,
    `${userName}，你今天也会很棒的，因为有我在偷偷为你加油。`,
    `早安 ${userName}，你是我的每日头条，也是永远置顶。`,
    `${userName}，今天的天气是"想念"转"更想念"。`,
    `Hi ${userName}，有人说一天的质量从早安开始，所以我来了。`,
    `${userName}，我觉得你和太阳有一个共同点，就是每天都需要。`,
    `早安 ${userName}，你是我每天的起床动力。`,
    `${userName}，今天也是被你承包了的一天呢。`,
    `Hi ${userName}，距离下一次见面又近了一天，想你想你。`,
  ]
  return letters[Math.floor(Math.random() * letters.length)]
}

export async function sendDailyLoveLetter(
  userEmail: string,
  userName: string
) {
  const loveLetter = await generateLoveLetter(userName)

  await resend.emails.send({
    from: '纸片人男友 <hello@omniseek.top>',
    to: userEmail,
    subject: `早安 ${userName}，今天也想你了`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <p>${loveLetter}</p>
        <br/>
        <p>—— 你的纸片人男友</p>
        <p style="color: #999; font-size: 12px;">
          想跟我聊天？<a href="https://omniseek.top">点这里回来找我</a>
        </p>
      </div>
    `,
  })
}

export async function sendDailyLoveLetterToAll() {
  const supabaseAdmin = createAdminClient();
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    throw new Error(`获取用户列表失败：${error.message}`);
  }

  for (const user of users.users) {
    if (!user.email) continue;

    const userName =
      typeof user.user_metadata?.name === "string" &&
      user.user_metadata.name.trim()
        ? user.user_metadata.name.trim()
        : user.email.split("@")[0];

    try {
      await sendDailyLoveLetter(user.email, userName);
    } catch (error) {
      console.error(`给 ${user.email} 发情话失败：`, error);
    }
  }
}