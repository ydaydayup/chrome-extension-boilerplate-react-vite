import axios from 'axios';
import { convert } from 'html-to-text';

const headers = {
  Authorization: 'Bearer fastgpt-q2fDJh0aHmG7bph0LkuuGUH23Uovy5NmYI1OgLZRriUEy6YWEPcEk3mYiv5dzW',
  'Content-Type': 'application/json',
};
const service = axios.create({
  baseURL: 'https://api.fastgpt.in/api/core/dataset',
  headers,
  timeout: 5000, // request timeout
});

// 添加请求拦截器
service.interceptors.request.use(
  async config => {
    // 在发送请求之前做些什么
    // 判断请求方法是否为'post'或其他需要修改body的方法
    if (config.method === 'post' || config.method === 'PUT') {
      let data = {};
      try {
        data = await chrome.storage.sync.get('datasetId');
      } catch (e) {
        console.error(e);
      }
      config.data = {
        ...(config.data || {}), // 确保原有的数据不被覆盖，而是被合并
        data,
      };
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

export type SearchTestRequest = {
  datasetId: string;
  text: string;
  limit: number;
  similarity: number;
  searchMode: string;
  usingReRank: boolean;
};

interface SearchTestResponse {
  // 定义响应类型，根据实际响应数据来定义
}

export async function searchTest(requestBody: SearchTestRequest): Promise<SearchTestResponse> {
  const resp = await service({
    method: 'post',
    url: 'searchTest',
    data: requestBody,
  });
  return resp?.data;
}

type createLinkSchema = {
  link: string;
  datasetId: '66eeb16187788986aff82fb1';
  parentId: null;
  trainingType: 'chunk';
  chunkSize: 512;
  chunkSplitter: '';
  qaPrompt: '';
  // 'metadata': {
  //   'webPageSelector': '.docs-content'
  // }
};

async function addLink(requestBody: createLinkSchema, sendResponse): Promise<SearchTestResponse> {
  try {
    const response = await axios.post<SearchTestResponse>(
      'https://api.fastgpt.in/api/core/dataset/collection/create/link',
      requestBody,
      {
        headers: headers,
      },
    );
    sendResponse(response.data);
    return response.data;
  } catch (error) {
    console.error('Error during searchTest request:', error);
    throw error;
  }
}

async function getCollectionList(body) {
  try {
    const response = await axios.post<SearchTestResponse>(
      'https://api.fastgpt.in/api/core/dataset/collection/list',
      body,
      {
        headers: headers,
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error during searchTest request:', error);
    throw error;
  }
}

type Collection = {
  _id: string;
};
async function getAllCollectionList(): Promise<Collection> {
  const body = {
    pageNum: 0,
    pageSize: 30,
    datasetId: '66eeb16187788986aff82fb1',
    parentId: null,
    searchText: '',
  };
  const collectionList = [];
  while (1) {
    body.pageNum++;
    const response = await getCollectionList(body);
    if (!response?.data?.data || response?.data?.data?.length === 0) {
      break;
    }
    collectionList.push(...response.data.data);
  }
  return collectionList;
  // sendResponse(JSON.stringify(collectionList));
}

// 使用该函数
// const requestBody: SearchTestRequest = {
//   datasetId: '66eeb16187788986aff82fb1',
//   text: 'Cannot truncate a table referenced in a forein key constraint',
//   limit: 5000,
//   similarity: 0,
//   searchMode: 'embedding',
//   usingReRank: false,
// };

// searchTest(requestBody)
//   .then(response => console.log(response))
//   .catch(error => console.error(error));

async function getUrlHtml(url: string) {
  return axios
    .get(url, { responseType: 'text' })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      return null;
    });
}

export function add(...args: number[]) {
  return args.reduce((a, b) => a + b, 0);
}

type addTextBody = {
  text: string;
  datasetId: string;
  parentId: null;
  name: string;
  trainingType: 'qa' | 'chunk'; // 按文本长度进行分割
  chunkSize?: number;
  chunkSplitter?: '';
  qaPrompt?: '';
  metadata?: {};
};

export async function removeCollection(collectionId: string): Promise<{ code: number }> {
  const resp = await service({
    method: 'delete',
    url: 'collection/delete',
    params: {
      id: collectionId,
    },
  });
  return resp.data;
}

export async function addText(body: addTextBody): Promise<{ code: number; data: any; message: string }> {
  const resp = await service({
    method: 'post',
    url: 'collection/create/text',
    data: body,
  });
  return resp?.data;
}

function html2text(html: string): string {
  const options = {};
  const text = convert(html, options);
  console.log(text); // Hello World
  return text;
}

// in-source test suites
if (import.meta.vitest) {
  const { it, assert, test, expect, describe } = import.meta.vitest;

  describe('fastgpt', () => {
    // test('addText', async () => {
    //   const body: addTextBody = {
    //     'text': 'test',
    //     'datasetId': '66eeb16187788986aff82fb1',
    //     'parentId': null,
    //     'name': 'test',
    //   };
    //   const resp = await addText(body);
    //   expect(resp.code).equal(200);
    // });
    test('getUrlHtml', async () => {
      const url = 'https://codesearch.rnd.huawei.com/SmartInsightWeb/index';
      const text = await getUrlHtml(url);
      assert.isNull(text);
    });
    test('getAllCollectionList', async () => {
      const resp = await getAllCollectionList();
      assert.isArray(resp, 'color is array');
    });
    test('searchTest', async () => {
      const url = 'https://blog.51cto.com/59465168/1947902';
      const text2 = await getUrlHtml(url);
      const text = html2text(text2);
      assert.isString(text);
      const datasetId = '66eeb16187788986aff82fb1';
      const name = `为什么使用MongoDB？ ${url}`;
      const body: addTextBody = {
        text,
        datasetId,
        trainingType: 'chunk',
        parentId: null,
        name,
      };
      const resp = await addText(body);
      expect(resp.code).equal(200);
      const collectionId = resp.data.collectionId;
      assert.isString(collectionId);
      const body2: SearchTestRequest = {
        datasetId,
        text: `为什么使用MongoDB？`,
        limit: 5,
        similarity: 0.8,
        searchMode: 'mixedRecall',
        usingReRank: false,
      };
      const resp2 = await searchTest(body2);
      console.log(resp2);
      // const sourceNames = [];
      // for (const item of resp2.data.list) {
      //   sourceNames.push(item.sourceName);
      // }
      // const isInclude = sourceNames.some((n) => {
      //   return n.trim() === name.trim();
      // });
      // assert.isTrue(isInclude);
      const resp3 = await removeCollection(collectionId);
      expect(resp3.code).equal(200);
    });
  });
  test('removeALL', async () => {
    const resp = await getAllCollectionList();
    assert.isArray(resp, 'color is array');
    for (const collection of resp) {
      const result = await removeCollection(collection._id);
      console.log(result);
    }
  });
}

export { getUrlHtml, addLink, getAllCollectionList, type createLinkSchema };
