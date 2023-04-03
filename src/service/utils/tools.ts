import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import tunnel from 'tunnel';
import { ChatItemType } from '@/types/chat';
import { encode } from 'gpt-token-utils';

/* 密码加密 */
export const hashPassword = (psw: string) => {
  return crypto.createHash('sha256').update(psw).digest('hex');
};

/* 生成 token */
export const generateToken = (userId: string) => {
  const key = process.env.TOKEN_KEY as string;
  const token = jwt.sign(
    {
      userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    },
    key
  );
  return token;
};

/* 校验 token */
export const authToken = (token?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject('缺少登录凭证');
      return;
    }
    const key = process.env.TOKEN_KEY as string;

    jwt.verify(token, key, function (err, decoded: any) {
      if (err || !decoded?.userId) {
        reject('凭证无效');
        return;
      }
      resolve(decoded.userId);
    });
  });
};

/* 代理 */
export const httpsAgent =
  process.env.AXIOS_PROXY_HOST && process.env.AXIOS_PROXY_PORT
    ? tunnel.httpsOverHttp({
        proxy: {
          host: process.env.AXIOS_PROXY_HOST,
          port: +process.env.AXIOS_PROXY_PORT
        }
      })
    : undefined;

/* tokens 截断 */
export const openaiChatFilter = (prompts: ChatItemType[], maxTokens: number) => {
  let res: ChatItemType[] = [];

  let systemPrompt: ChatItemType | null = null;

  //  System 词保留
  if (prompts[0]?.obj === 'SYSTEM') {
    systemPrompt = prompts.shift() as ChatItemType;
    maxTokens -= encode(prompts[0].value).length;
  }

  // 从后往前截取
  for (let i = prompts.length - 1; i >= 0; i--) {
    const tokens = encode(prompts[i].value).length;
    if (maxTokens >= tokens) {
      res.unshift(prompts[i]);
      maxTokens -= tokens;
    } else {
      break;
    }
  }

  return systemPrompt ? [systemPrompt, ...res] : res;
};

/* system 内容截断 */
export const systemPromptFilter = (prompts: string[], maxTokens: number) => {
  let splitText = '';

  // 从前往前截取
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    splitText += `${prompt}\n`;
    const tokens = encode(splitText).length;
    if (tokens >= maxTokens) {
      break;
    }
  }

  return splitText;
};
