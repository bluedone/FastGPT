// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase } from '@/service/mongo';
import { getOpenAIApi, authChat } from '@/service/utils/chat';
import { ChatItemType } from '@/types/chat';
import { httpsAgent } from '@/service/utils/tools';
import { ModelList } from '@/constants/model';
import { pushBill } from '@/service/events/pushChatBill';

/* 发送提示词 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt, chatId } = req.body as { prompt: ChatItemType[]; chatId: string };
    const { authorization } = req.headers;

    if (!prompt || !chatId) {
      throw new Error('缺少参数');
    }

    await connectToDatabase();

    const { chat, userApiKey, systemKey, userId } = await authChat(chatId, authorization);

    const model = chat.modelId;

    // 获取 chatAPI
    const chatAPI = getOpenAIApi(userApiKey || systemKey);

    // prompt处理
    const formatPrompts = prompt.map((item) => `${item.value}\n\n###\n\n`).join('');

    // 计算温度
    const modelConstantsData = ModelList.find((item) => item.model === model.service.modelName);
    if (!modelConstantsData) {
      throw new Error('模型异常');
    }
    const temperature = modelConstantsData.maxTemperature * (model.temperature / 10);

    // 发送请求
    const response = await chatAPI.createCompletion(
      {
        model: model.service.modelName,
        prompt: formatPrompts,
        temperature: temperature,
        // max_tokens: modelConstantsData.maxToken,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: ['###']
      },
      {
        httpsAgent
      }
    );

    const responseMessage = response.data.choices[0]?.text || '';

    const promptsLen = prompt.reduce((sum, item) => sum + item.value.length, 0);
    console.log(`responseLen: ${responseMessage.length}`, `promptLen: ${promptsLen}`);
    // 只有使用平台的 key 才计费
    !userApiKey &&
      pushBill({
        modelName: model.service.modelName,
        userId,
        chatId,
        textLen: promptsLen + responseMessage.length
      });

    jsonRes(res, {
      data: responseMessage
    });
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
