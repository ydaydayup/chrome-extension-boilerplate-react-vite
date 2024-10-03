// const OpenAI = require("openai");
import OpenAI from 'openai';
import axios from 'axios';

const MOONSHOT_API_KEY = 'sk-K8Tiulk9OhH9A83asxpfQ4ycwlkApJ2X2ujY2Jcnfq0VcDyA';
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${MOONSHOT_API_KEY}`,
};
const service = axios.create({
  baseURL: 'https://api.moonshot.cn/v1/tokenizers/estimate-token-count',
  headers,
  timeout: 5000, // request timeout
});

const client = new OpenAI({
  apiKey: MOONSHOT_API_KEY,
  baseURL: 'https://api.moonshot.cn/v1',
});

type messagesReq = { role: string; content: string }[];

type parametersOpenAi = {
  model: 'moonshot-v1-8k';
  messages: messagesReq;
  temperature: 0.3;
};

async function estimateTokenCount(data: parametersOpenAi) {
  const result = await service({
    method: 'POST',
    data: data,
  });
  console.log({ result: result });
  return result.data.data.total_tokens;
}

async function kimiApiRequest(messages: messagesReq) {
  const parameters: parametersOpenAi = {
    model: 'moonshot-v1-8k',
    messages: messages,
    temperature: 0.3,
  };
  const total_tokens = await estimateTokenCount(parameters);
  console.log({ total_tokens });
  if (total_tokens > 8 * 1024) {
    console.error({ messages });
    throw new Error('token不够');
    // return;
  }
  const completion = await client.chat.completions.create(parameters);
  return completion.choices[0].message.content;
}

export async function getHtmlTextSummary(htmlText: string) {
  const messages = [
    {
      role: 'system',
      content:
        '你是一个非常善于总结的专家，下面是需要总结的内容, 先把广告、链接、评论等无关内容剔除，要求返回的内容简洁、全面、不超过500个字',
    },
    { role: 'user', content: htmlText },
  ];
  return await kimiApiRequest(messages);
}

// in-source test suites
if (import.meta.vitest) {
  const { it, assert, test, expect, describe } = import.meta.vitest;
  describe('kimi', () => {
    test('kimiApi', async () => {
      // kimiApiRequest();
      const result = await getHtmlTextSummary('Kimi API 提供了与 Kimi 大模型交互的能力，以下是一个简单示例代码：');
      console.log(result);
    });
  });
}
