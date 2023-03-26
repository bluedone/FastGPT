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

### 模型配置

1. **提示语**：会在每个对话框的第一句自动加入，用于限定该模型的对话内容。  


2. **单句最大长度**：每个聊天，单次输入内容的最大长度。  


3. **上下文最大长度**：每个聊天，最多的轮数除以2，建议设置为偶数。可以持续聊天，但是旧的聊天内容会被截断，AI 就不会知道被截取的内容。 
例如：上下文最大长度为6。在第 4 轮对话时，第一轮对话的内容不会被计入。

4. **过期时间**：生成对话框后，这个对话框多久过期。  

5. **聊天最大加载次数**：单个对话框最多被加载几次，设置为-1代表不限制，正数代表只能加载 n 次，防止被盗刷。  

### 对话框介绍

1. 每个对话框以 chatId 作为标识。  
2. 每次点击【对话】，都会生成新的对话框，无法回到旧的对话框。对话框内刷新，会恢复对话内容。  
3. 直接分享对话框（网页）的链接给朋友，会共享同一个对话内容。但是！！！千万不要两个人同时用一个链接，会串味，还没解决这个问题。  
4. 如果想分享一个纯的对话框，请点击侧边栏的分享按键。例如：  

### 其他问题
还有其他问题，可以加我 wx: YNyiqi，拉个交流群大家一起聊聊。
`;

export const chatProblem = `
**模型问题**
一般情况下，请直接选择 chatGPT 模型，价格低效果好。

**代理出错**
服务器代理不稳定，可以过一会儿再尝试。  

**API key 问题**
请把 openai 的 API key 粘贴到账号里再创建对话。如果是使用分享的对话，不需要填写 API key。  
`;

export const versionIntro = `
## Fast GPT V2.0
* 删除和复制功能：点击对话头像，可以选择复制或删除该条内容。
* 优化记账模式： 不再根据文本长度进行记账，而是根据实际消耗 tokens 数量进行记账。
* 文本 QA 拆分: 可以在[数据]模块，使用 QA 拆分功能，粘贴文字或者选择文件均可以实现自动生成 QA。可以一键导出，用于微调模型。
`;

export const shareHint = `
你正准备分享对话，请确保分享链接不会滥用，因为它是使用的是你的 API key。  
* 分享空白对话：为该模型创建一个空白的聊天分享出去。  
* 分享当前对话：会把当前聊天的内容也分享出去，但是要注意不要多个人同时用一个聊天内容。
`;
