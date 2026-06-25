---
name: wake-word
description: 用户说"唤醒万一"时的标准响应流程 — 项目启动/继续工作的触发词
metadata:
  type: project
---

# 唤醒万一

当用户说"唤醒万一"时，执行以下流程：

## 标准响应

1. 读取 [[project-status]] 了解当前状态和待办
2. 读取 [[overseas-plan-progress]] 了解海外方案执行进度（重点：P0-3 未做）
3. 读取 [[acquisition-strategy]] 了解获客进度
4. 检查关键服务存活状态（in-case.me 可访问性）
5. 检查 Reddit 两条评论是否有新回复（浏览器手动）
6. 列出下一步可推进的事项，等用户选择
7. **每次内容审计必须通读全文，禁止纯 grep 搜关键词**

## 铁律（今天总结的）

- **本地改完不算完** — 必须 commit + push，Vercel 部署后才能验证
- **完工主动说"还差什么"** — 不能等用户追问才告诉人家还缺一步
- **Google 收录要催** — sitemap 是被动等，Search Console 是主动敲门
- **去晦气** — 产品语言不讲"死后继承"，讲"突发失联/暂时上不了线"。死亡只是一个场景，住院、丢手机、被锁号都是同一套方案。标题和正文避免 gone/dead/death，用 can't log in / safety net / away 替代。商业面更广，用户更愿意看。
- **表格空栏的视觉信号要明确** — MDX 渲染表格需要 remark-gfm。清单表要有固定内容列夹住空栏，否则空白像 bug。
- **AI 博客味要去掉** — 每篇结尾不同模板、删"Here's X"句式堆叠、删"not a pitch"型免责广告、保留真实 bias 声明反而可信

## 项目上下文速查

- 线上：https://in-case.me
- 部署：git push → Vercel 自动构建
- Blog 路由：`src/content/blog/` 丢 .mdx 文件即可，全自动
- Sitemap：https://in-case.me/sitemap.xml
- Search Console：已验证，sitemap 已提交

**Why:** 这是用户每次回来继续推进万一呢项目时用的固定触发词。不用再问"什么意思"，直接执行上述流程。
**How to apply:** 识别到"唤醒万一"关键词后，立刻执行标准响应流程，不追问。
