# Claude Code Buddy 功能完整分析

从 Claude Code 2.1.88 源码中逆向分析的 buddy/companion 系统全部功能。

---

## 一、宠物生成系统

### 确定性生成（`companion.ts`）
- 基于用户 ID（OAuth UUID / userID / 'anon'）+ 固定盐值 `'friend-2026-401'` 生成
- 使用 **Mulberry32 PRNG**，相同用户永远得到同一只宠物
- **骨架（Bones）不持久化**：每次启动从 userId 重新生成，防止用户通过编辑 config 伪造稀有度
- **灵魂（Soul）持久化**：名字和性格由模型生成后存入 config，仅生成一次
- 单条目 LRU 缓存，避免热路径（500ms sprite tick、逐键盘输入、每轮消息）重复计算

### 18 种宠物（`types.ts`）
duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk

> 所有种名用 `String.fromCharCode()` 编码，避免触发 excluded-strings.txt 构建检查（其中一个种名与模型代号冲突）

### 稀有度系统
| 稀有度 | 概率 | 属性下限 | 颜色 | 星级 |
|--------|------|---------|------|------|
| common | 60% | 5 | inactive（灰） | ★ |
| uncommon | 25% | 15 | success（绿） | ★★ |
| rare | 10% | 25 | permission（青） | ★★★ |
| epic | 4% | 35 | autoAccept（品红） | ★★★★ |
| legendary | 1% | 50 | warning（金） | ★★★★★ |

### 自定义元素
- **眼睛**（6 种）：`·` `✦` `×` `◉` `@` `°`
- **帽子**（8 种）：none, crown, tophat, propeller, halo, wizard, beanie, tinyduck
  - common 稀有度固定 none，其他稀有度随机分配
- **闪光**：1% 概率为 shiny 变种

### 属性系统（5 项）
DEBUGGING / PATIENCE / CHAOS / WISDOM / SNARK

- 每只宠物有一个**峰值属性**（floor + 50~80）和一个**弱势属性**（floor - 10~+5）
- 其余属性在 floor ~ floor+40 之间分布
- 稀有度越高，floor 越高（legendary 的弱势属性都有 40+）

---

## 二、精灵渲染（`sprites.ts` + `CompanionSprite.tsx`）

### ASCII Art 精灵
- 每种宠物 **3 帧**，每帧 **5 行 × 12 字符宽**
- `{E}` 占位符在渲染时替换为宠物的眼睛字符
- 帽子覆盖在第 0 行（仅当该行为空时）

### 渲染模式

#### 完整精灵模式（终端 ≥ 100 列）
```
   .----.     ╭──────────────────╮
  / ✦  ✦ \   │ what's the       │
  |      |    │ damage today?    │
  ~`~``~`~    ╰──────────────────╯
   Pixa ★
```
- 左侧精灵列 + 右侧气泡
- 气泡尾巴朝右（`─`）连接到精灵

#### 窄终端模式（< 100 列）
```
/✦✦\ Pixa "what's the damage today?"
```
- 单行：face + 名字 + 台词
- 超过 24 字符的台词会被截断加 `…`

#### 全屏模式（fullscreen layout）
- 精灵在底部右侧
- 气泡独立渲染在 `CompanionFloatingBubble` 组件中
- 通过 `FullscreenLayout` 的 `bottomFloat` 插槽挂载
- 在 `overflowY:hidden` 裁剪区外渲染，可延伸到 ScrollBox 区域

### 宽度预留
- `companionReservedColumns()` 计算精灵占用的列数
- 输入框（PromptInput）减去这个值来正确换行
- 说话时额外预留 36 列气泡宽度（非全屏模式）
- 窄终端返回 0（精灵单独一行，不占输入宽度）

---

## 三、动画系统

### Idle 序列
```js
[0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0]
// 每 500ms 切换一次，循环播放
// 0 = 静止帧, 1/2 = 摆动帧, -1 = 眨眼
```
- **大部分时间静止**（帧 0）
- **偶尔摆动**（帧 1-2）
- **罕见眨眼**（-1：将眼睛字符替换为 `-`）

### 兴奋状态
- 触发条件：正在说话 或 被抚摸
- 快速循环所有帧：`tick % frameCount`
- 每 500ms 切换，比 idle 更活跃

### 种族特色动画
- **Dragon**：呼吸动画（`~~` / 无 / `~ ~`）
- **Penguin**：帧 2 跳跃
- **Octopus**：帧 2 吐泡泡
- **Cactus**：手臂移动
- **Ghost**：漂浮晃动

---

## 四、语音气泡系统

### 生命周期
1. 触发：设置 `companionReaction` 状态
2. 显示：**20 tick（~10 秒）**
3. 渐隐：最后 **6 tick（~3 秒）** 文字变暗
4. 消失：自动清除 `companionReaction`

### 气泡样式
- 最大宽度 34 字符（Box `width={34}`）
- 文本在 30 字符处自动换行
- 圆角边框（`borderStyle="round"`）
- 斜体文字（`italic={true}`）
- 边框颜色 = 稀有度颜色
- 渐隐时：文字和边框都变为 `inactive` 颜色

### 尾巴方向
- **右尾（`─`）**：非全屏模式，气泡在精灵左边
- **下尾（`╲`）**：全屏模式，气泡在精灵上方

### 滚动取消
- 用户在对话记录中滚动时，气泡立即消失
- 防止气泡遮挡用户正在阅读的内容

---

## 五、互动功能

### /buddy 命令
- **触发方式**：输入 `/buddy` 或通过底部栏选择 companion pill 后按 Enter
- **输入高亮**：输入框中的 `/buddy` 文本以彩虹色渲染
- **触发检测**：`findBuddyTriggerPositions()` 用正则扫描 `/buddy\b`

### 底部栏集成（Footer）
- 宠物作为底部栏的一个 **pill 选项**（companion 类型）
- 用方向键导航到 companion pill
- **未聚焦**：暗色名字 + ↓ 发现提示
- **聚焦**：反色显示名字（` Pixa `）
- 按 Enter 提交 `/buddy` 命令

### 抚摸系统（/buddy pet）
- 设置 `companionPetAt` 时间戳
- **爱心动画**：持续 2.5 秒（`PET_BURST_MS`）
- 5 帧爱心从上方飘落：
  ```
  Frame 0:    ♥    ♥
  Frame 1:   ♥  ♥   ♥
  Frame 2:  ♥   ♥  ♥
  Frame 3: ♥  ♥      ♥
  Frame 4: ·    ·   ·
  ```
- 爱心颜色：autoAccept（绿色）
- 使用**同步渲染**（非 useEffect）确保第一帧立即显示，不丢帧

### 观察者反应系统（Observer）
- REPL 在每次查询完成后调用 `fireCompanionObserver()`
- 分析对话内容，生成上下文相关的台词
- 通过回调设置 `companionReaction`
- **当前状态**：接口已定义，完整实现 pending

---

## 六、系统提示词集成（`prompt.ts`）

### Companion 介绍附件
当宠物首次出现时，添加到对话中的系统消息：

```
# Companion

A small [species] named [name] sits beside the user's input box 
and occasionally comments in a speech bubble. You're not [name] 
— it's a separate watcher.

When the user addresses [name] directly (by name), its bubble 
will answer. Your job in that moment is to stay out of the way: 
respond in ONE line or less, or just answer any part of the 
message meant for you. Don't explain that you're not [name] — 
they know. Don't narrate what [name] might say — the bubble 
handles that.
```

### 关键行为指令
1. 用户直接叫宠物名字时，Claude **只回复一行或更少**
2. Claude **不是宠物**，宠物是独立的观察者
3. **不做元评论**：不解释"我不是 Pixa"
4. **让气泡处理**：不描述宠物的动作

### 去重机制
- 附件类型 `companion_intro`，包含 name 和 species
- 检查历史消息避免重复发送
- 静音时跳过

---

## 七、预热/彩蛋系统（`useBuddyNotification.tsx`）

### 彩虹预告通知
- **时间窗口**：2026 年 4 月 1-7 日（本地日期，非 UTC）
- **设计意图**：24 小时滚动跨时区，维持 Twitter 持续讨论而非单一 UTC 峰值
- **触发条件**：BUDDY 功能启用 + 尚未孵化宠物 + 在预告窗口内
- **显示效果**：`/buddy` 每个字符用不同彩虹色渲染
- **优先级**：immediate
- **持续时间**：15 秒后自动消失
- **之后**：4 月 7 日后命令永久可用

---

## 八、配置与状态

### 持久化配置（`config.ts`）
```typescript
companion?: StoredCompanion  // { name, personality, hatchedAt }
companionMuted?: boolean     // 隐藏精灵但不删除
```

### 运行时状态（`AppStateStore.ts`）
```typescript
companionReaction?: string    // 当前气泡文字
companionPetAt?: number       // 最后一次抚摸时间戳
footerSelection?: 'companion' // 底部栏焦点状态
```

### Feature Flag
```typescript
feature('BUDDY')           // 主开关
isBuddyTeaserWindow()      // 4月1-7日
isBuddyLive()              // 4月之后
```

---

## 九、我们已实现 vs 未实现

| 功能 | Claude Code | terminal-buddy | 状态 |
|------|-------------|----------------|------|
| 18 种宠物 + 3 帧动画 | ✅ | ✅ | 完整 |
| 确定性种子生成 | ✅ | ✅ | 完整 |
| 稀有度系统（5 级） | ✅ | ✅ | 完整 |
| 属性系统（5 项） | ✅ | ✅ | 完整 |
| 帽子系统（8 种） | ✅ | ✅ | 完整 |
| 眼睛系统（6 种） | ✅ | ✅ | 完整 |
| Shiny 变种（1%） | ✅ | ✅ 生成 | 视觉效果未实现 |
| Idle 动画序列 | ✅ | ✅ | 完整 |
| 眨眼动画 | ✅ | ✅ | 完整 |
| 语音气泡（10 秒 + 渐隐） | ✅ | ✅ | 完整 |
| 抚摸爱心动画 | ✅ | ✅ | 完整 |
| 窄终端 face 模式 | ✅ | ✅ | 完整 |
| 基于属性的台词加权 | ✅（observer pending） | ✅ quips.js | 完整 |
| 事件反应（tool/error/idle） | ✅（observer pending） | ✅ hooks | 完整 |
| 系统提示词集成 | ✅ | ❌ | 不适用于插件模式 |
| 底部栏 pill 导航 | ✅ | ❌ | Codex TUI 不支持 |
| 全屏浮动气泡 | ✅ | ❌ | tmux 面板替代 |
| 彩虹预告通知 | ✅ | ❌ | 不需要 |
| 滚动取消气泡 | ✅ | ❌ | tmux 面板独立 |
| 模型生成名字/性格 | ✅ | ✅ 本地随机名 | 简化版 |
| 宠物卡片/stats 展示 | ✅（pending） | ✅ renderCard | 完整 |

---

## 十、源码文件索引

```
src/buddy/
├── types.ts              # 种类/稀有度/眼睛/帽子/属性 类型定义
├── sprites.ts            # 18×3 帧 ASCII art + 帽子 + face 渲染
├── companion.ts          # Mulberry32 PRNG + 种子生成 + 缓存
├── prompt.ts             # 系统提示词（companion_intro 附件）
├── CompanionSprite.tsx   # 主组件：动画/气泡/抚摸/宽度适应
└── useBuddyNotification.tsx  # 彩虹预告 + /buddy 触发检测

src/components/
├── PromptInput/PromptInput.tsx  # 宽度预留 + 底部栏 + 高亮
├── FullscreenLayout.tsx         # 浮动气泡插槽
└── Messages.tsx                 # 附件过滤

src/state/AppStateStore.ts       # companionReaction/PetAt 状态
src/screens/REPL.tsx             # 精灵挂载 + observer 钩子 + 滚动取消
src/utils/config.ts              # companion/companionMuted 配置
src/utils/messages.ts            # companion_intro 附件管理
src/commands.ts                  # /buddy 命令条件导入
```
