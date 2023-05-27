import { openaiError2 } from '../errorCode';
import { insertKbItem, PgClient } from '@/service/pg';
import { openaiEmbedding } from '@/pages/api/openapi/plugin/openaiEmbedding';
import { TrainingData } from '../models/trainingData';
import { ERROR_ENUM } from '../errorCode';
import { TrainingModeEnum } from '@/constants/plugin';

/* 索引生成队列。每导入一次，就是一个单独的线程 */
export async function generateVector(): Promise<any> {
  const maxProcess = Number(process.env.VECTOR_MAX_PROCESS || 10);

  if (global.vectorQueueLen >= maxProcess) return;
  global.vectorQueueLen++;

  let trainingId = '';
  let userId = '';

  try {
    const data = await TrainingData.findOneAndUpdate(
      {
        mode: TrainingModeEnum.index,
        lockTime: { $lte: new Date(Date.now() - 2 * 60 * 1000) }
      },
      {
        lockTime: new Date()
      }
    ).select({
      _id: 1,
      userId: 1,
      kbId: 1,
      q: 1,
      a: 1
    });

    /* 无待生成的任务 */
    if (!data) {
      global.vectorQueueLen--;
      !global.vectorQueueLen && console.log(`没有需要【索引】的数据`);
      return;
    }

    trainingId = data._id;
    userId = String(data.userId);
    const kbId = String(data.kbId);

    const dataItems = [
      {
        q: data.q,
        a: data.a
      }
    ];

    // 生成词向量
    const vectors = await openaiEmbedding({
      input: dataItems.map((item) => item.q),
      userId,
      type: 'training'
    });

    // 生成结果插入到 pg
    await insertKbItem({
      userId,
      kbId,
      data: vectors.map((vector, i) => ({
        q: dataItems[i].q,
        a: dataItems[i].a,
        vector
      }))
    });

    // delete data from training
    await TrainingData.findByIdAndDelete(data._id);
    console.log(`生成向量成功: ${data._id}`);

    global.vectorQueueLen--;
    generateVector();
  } catch (err: any) {
    global.vectorQueueLen--;
    // log
    if (err?.response) {
      console.log('openai error: 生成向量错误');
      console.log(err.response?.status, err.response?.statusText, err.response?.data);
    } else {
      console.log('生成向量错误:', err);
    }

    // openai 账号异常或者账号余额不足，删除任务
    if (openaiError2[err?.response?.data?.error?.type] || err === ERROR_ENUM.insufficientQuota) {
      console.log('余额不足，删除向量生成任务');
      await TrainingData.deleteMany({
        userId
      });
      return generateVector();
    }

    // unlock
    await TrainingData.findByIdAndUpdate(trainingId, {
      lockTime: new Date('2000/1/1')
    });

    setTimeout(() => {
      generateVector();
    }, 1000);
  }
}
