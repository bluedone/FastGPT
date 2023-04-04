import axios from 'axios';
import { getOpenAIApi } from '@/service/utils/chat';
import { httpsAgent } from './tools';
import { User } from '../models/user';
import { formatPrice } from '@/utils/user';
import { ChatModelNameEnum } from '@/constants/model';
import { pushGenerateVectorBill } from '../events/pushBill';

/* 获取用户 api 的 openai 信息 */
export const getUserApiOpenai = async (userId: string) => {
  const user = await User.findById(userId);

  const userApiKey = user?.accounts?.find((item: any) => item.type === 'openai')?.value;

  if (!userApiKey) {
    return Promise.reject('缺少ApiKey, 无法请求');
  }

  return {
    user,
    openai: getOpenAIApi(userApiKey),
    apiKey: userApiKey
  };
};

/* 获取 open api key，如果用户没有自己的key，就用平台的，用平台记得加账单 */
export const getOpenApiKey = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    return Promise.reject({
      code: 501,
      message: '找不到用户'
    });
  }

  const userApiKey = user?.accounts?.find((item: any) => item.type === 'openai')?.value;

  // 有自己的key
  if (userApiKey) {
    return {
      user,
      userApiKey,
      systemKey: ''
    };
  }

  // 平台账号余额校验
  if (formatPrice(user.balance) <= 0) {
    return Promise.reject({
      code: 501,
      message: '账号余额不足'
    });
  }

  return {
    user,
    userApiKey: '',
    systemKey: process.env.OPENAIKEY as string
  };
};

/* 获取向量 */
export const openaiCreateEmbedding = async ({
  isPay,
  userId,
  apiKey,
  text
}: {
  isPay: boolean;
  userId: string;
  apiKey: string;
  text: string;
}) => {
  // 获取 chatAPI
  const chatAPI = getOpenAIApi(apiKey);

  // 把输入的内容转成向量
  const vector = await chatAPI
    .createEmbedding(
      {
        model: ChatModelNameEnum.VECTOR,
        input: text
      },
      {
        timeout: 60000,
        httpsAgent
      }
    )
    .then((res) => res?.data?.data?.[0]?.embedding || []);

  pushGenerateVectorBill({
    isPay,
    userId,
    text
  });

  return {
    vector,
    chatAPI
  };
};
