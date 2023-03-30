export enum EmailTypeEnum {
  register = 'register',
  findPassword = 'findPassword'
}

export const PRICE_SCALE = 100000;

export const introPage = `
## 欢迎使用 Fast GPT

[Git 仓库](https://github.com/c121914yu/FastGPT)

### 快速开始
1. 使用邮箱注册账号。  
2. 进入账号页面，添加关联账号，目前只有 openai 的账号可以添加，直接去 openai 官网，把 API Key 粘贴过来。  
3. 如果填写了自己的 openai 账号，使用时会直接用你的账号。如果没有填写，需要付费使用平台的账号。
4. 进入模型页，创建一个模型，建议直接用 ChatGPT。    
5. 在模型列表点击【对话】，即可使用 API 进行聊天。  

### 定制 prompt

1. 进入模型编辑页  
2. 调整温度和提示词  
3. 使用该模型对话。每次对话时，提示词和温度都会自动注入，方便管理个人的模型。建议把自己日常经常需要使用的 5~10 个方向预设好。

### 知识库

1. 创建模型时选择【知识库】  
2. 进入模型编辑页  
3. 导入数据，可以选择手动导入，或者选择文件导入。文件导入会自动调用 chatGPT 理解文件内容，并生成知识库。  
4. 使用该模型对话。  

注意：使用知识库模型对话时，tokens 消耗会加快。  

### 其他问题
还有其他问题，可以加我 wx: YNyiqi，拉个交流群大家一起聊聊。

`;

export const chatProblem = `
**内容长度**
单次最长 4000 tokens, 上下文最长 8000 tokens, 上下文超长时会被截断。

**模型问题**
一般情况下，请直接选择 chatGPT 模型，价格低效果好。

**代理出错**
服务器代理不稳定，可以过一会儿再尝试。  

**API key 问题**
请把 openai 的 API key 粘贴到账号里再创建对话。如果是使用分享的对话，不需要填写 API key。  
`;

export const versionIntro = `
## Fast GPT V2.2
* 定制知识库：创建模型时可以选择【知识库】模型, 可以手动导入知识点或者直接导入一个文件自动学习。
* 删除和复制功能：点击对话头像，可以选择复制或删除该条内容。
`;

export const shareHint = `
你正准备分享对话，请确保分享链接不会滥用，因为它是使用的是你的 API key。  
* 分享空白对话：为该模型创建一个空白的聊天分享出去。  
* 分享当前对话：会把当前聊天的内容也分享出去，但是要注意不要多个人同时用一个聊天内容。
`;
