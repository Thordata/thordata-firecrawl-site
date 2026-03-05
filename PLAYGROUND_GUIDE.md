# Playground 使用指南

## 一键测试流程

### 方法一：最简单的方式（推荐）

1. **输入 API Key**
   - 在 "API Key" 字段输入你的 Thordata API Key（格式：`td-xxxxx`）
   - 这是唯一必填项

2. **点击 "📋 Load Example" 按钮**
   - 自动填充示例请求数据
   - 根据选择的端点自动填充对应的示例

3. **点击 "🚀 Send Request" 按钮**
   - 或按 `Ctrl/Cmd + Enter` 快捷键
   - 等待响应结果

### 方法二：自定义测试

1. **输入 API Key**（必填）

2. **选择端点**
   - 从下拉菜单选择要测试的 API 端点
   - 例如：`POST /v1/scrape`

3. **修改请求体**（可选）
   - 点击 "Load Example" 加载示例
   - 或手动编辑 JSON 请求体
   - 支持 JSON 格式验证

4. **发送请求**
   - 点击 "Send Request" 或按 `Ctrl/Cmd + Enter`

## 功能说明

### 快速操作

- **📋 Load Example**: 一键加载当前端点的示例请求数据
- **🚀 Send Request**: 发送 API 请求
- **Clear**: 清空响应区域

### 键盘快捷键

- `Ctrl/Cmd + Enter`: 发送请求（在请求体文本框中）
- `Ctrl/Cmd + K`: 聚焦到 API Key 输入框

### 字段说明

- **API Key** (必填): 你的 Thordata API Key
- **API URL**: API 服务器地址，默认 `http://localhost:3002`
- **Endpoint**: 要调用的 API 端点
- **Request Body**: JSON 格式的请求体

## 示例端点

### POST /v1/scrape
```json
{
  "url": "https://www.thordata.com",
  "formats": ["markdown"]
}
```

### POST /v1/batch-scrape
```json
{
  "urls": ["https://www.thordata.com", "https://www.thordata.com/about"],
  "formats": ["markdown"]
}
```

### POST /v1/search
```json
{
  "query": "Thordata web data API",
  "limit": 5,
  "engine": "google"
}
```

### POST /v1/crawl
```json
{
  "url": "https://www.thordata.com",
  "limit": 10,
  "formats": ["markdown"]
}
```

## 常见问题

### Q: 为什么需要 API Key？
A: API Key 用于身份验证，确保只有授权用户可以使用 API。

### Q: API URL 应该填什么？
A: 
- 本地开发：`http://localhost:3002`
- 远程服务器：填写你的服务器地址，如 `https://api.example.com`

### Q: 如何获取 API Key？
A: 联系 Thordata 获取你的 API Key。

### Q: 请求失败怎么办？
A: 检查：
1. API Key 是否正确
2. API 服务器是否运行
3. 请求体 JSON 格式是否正确
4. 网络连接是否正常
5. CORS 是否已配置（跨域请求时）

## 提示

- 所有请求数据仅用于 API 调用，不会存储
- 响应结果可以复制（点击代码块右上角的 Copy 按钮）
- 支持所有 7 个 API 端点测试
