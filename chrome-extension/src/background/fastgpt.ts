import axios from 'axios';

interface SearchTestRequest {
  datasetId: string;
  text: string;
  limit: number;
  similarity: number;
  searchMode: string;
  usingReRank: boolean;
}

interface SearchTestResponse {
  // 定义响应类型，根据实际响应数据来定义
}

async function searchTest(requestBody: SearchTestRequest): Promise<SearchTestResponse> {
  try {
    const response = await axios.post<SearchTestResponse>(
      'https://api.fastgpt.in/api/core/dataset/searchTest',
      requestBody,
      {
        headers: {
          Authorization: 'Bearer fastgpt-q2fDJh0aHmG7bph0LkuuGUH23Uovy5NmYI1OgLZRriUEy6YWEPcEk3mYiv5dzW',
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error during searchTest request:', error);
    throw error;
  }
}

const headers = {
  Authorization: 'Bearer fastgpt-q2fDJh0aHmG7bph0LkuuGUH23Uovy5NmYI1OgLZRriUEy6YWEPcEk3mYiv5dzW',
  'Content-Type': 'application/json',
};
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

async function getAllCollectionList(sendResponse): Promise<SearchTestResponse> {
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
  sendResponse(JSON.stringify(collectionList));
}

// 使用该函数
const requestBody: SearchTestRequest = {
  datasetId: '66eeb16187788986aff82fb1',
  text: 'Cannot truncate a table referenced in a forein key constraint',
  limit: 5000,
  similarity: 0,
  searchMode: 'embedding',
  usingReRank: false,
};

// searchTest(requestBody)
//   .then(response => console.log(response))
//   .catch(error => console.error(error));

function getUrlHtml(url: string, sendResponse) {
  axios
    .get(url, { responseType: 'text' })
    .then(response => {
      sendResponse(response.data);
    })
    .catch(error => {
      sendResponse(null);
    });
}

export function add(...args: number[]) {
  return args.reduce((a, b) => a + b, 0);
}

// in-source test suites
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('add', () => {
    expect(add()).toBe(0);
    expect(add(1)).toBe(1);
    expect(add(1, 2, 3)).toBe(6);
  });
}

export { getUrlHtml, addLink, getAllCollectionList, type createLinkSchema };
