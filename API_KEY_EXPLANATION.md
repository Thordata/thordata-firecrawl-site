# API Key 使用说明

## 为什么需要填写两次 API Key？

### 1. Render 服务器端的 `THORDATA_API_KEY`

**位置**：Render Dashboard → Environment Variables

**作用**：
- **Fallback 机制**：当 API 请求**没有** `Authorization` header 时，服务器会使用这个环境变量中的 API Key
- **服务端配置**：这是服务器级别的配置，用于处理没有认证头的请求

**使用场景**：
- 服务器内部调用（如果有的话）
- 测试请求（没有 Authorization header）
- 作为备用认证方式

### 2. GitHub Pages Playground 中的 API Key

**位置**：https://thordata.github.io/thordata-firecrawl-site/ → Playground → API Key 输入框

**作用**：
- **客户端认证**：通过 `Authorization: Bearer <your-api-key>` header 发送给 API 服务器
- **用户自己的 Key**：**每个用户应该使用自己的 Thordata API Key**

**使用场景**：
- 用户在 Playground 中测试 API
- 用户自己的应用调用 API
- 正常的 API 使用场景

## 用户应该使用自己的 API Key 吗？

**✅ 是的！** 这是**正确的使用方式**。

### 为什么？

1. **安全性**：
   - 每个用户使用自己的 API Key，可以追踪自己的使用量
   - 如果 API Key 泄露，只影响该用户，不影响其他用户

2. **配额管理**：
   - 每个用户有自己的 API 配额限制
   - 可以独立管理自己的使用情况

3. **最佳实践**：
   - 这是标准的 API 使用方式
   - 类似于其他 API 服务（如 OpenAI、Firecrawl 等）

### Render 服务器端的 API Key 是做什么的？

Render 服务器端的 `THORDATA_API_KEY` 主要用于：
- **Fallback**：当请求没有 Authorization header 时使用（这种情况很少见）
- **服务器内部调用**：如果有服务器端的后台任务需要调用 Thordata API

**对于普通用户**：
- 你**不需要**知道 Render 服务器端的 API Key
- 你只需要在 Playground 中填写**你自己的 API Key** 即可

## 工作流程

```
用户浏览器 (GitHub Pages)
    ↓
填写自己的 API Key
    ↓
发送请求: Authorization: Bearer <用户的API_KEY>
    ↓
Render API 服务器
    ↓
检查 Authorization header
    ↓
如果有 header → 使用 header 中的 API Key ✅
如果没有 header → 使用环境变量中的 API Key (fallback)
    ↓
调用 Thordata API
```

## 总结

- ✅ **用户应该使用自己的 API Key**（在 Playground 中填写）
- ✅ Render 服务器端的 API Key 是**可选的 fallback**（主要用于服务器内部）
- ✅ 你的 API Key **只发送给 API 服务器**，**不会存储**在 GitHub Pages 上
- ✅ 这是**标准且安全**的 API 使用方式
