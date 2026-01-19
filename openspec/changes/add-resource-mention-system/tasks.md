# Tasks: Add Resource @ Mention System

## 1. Type System Extensions

- [x] 1.1 Extend `src/types/prompt.ts` to add `resource-reference` to PromptContent type union

**Acceptance Criteria**:

- [x] `PromptContent.type` 类型定义包含 `'text' | 'image-reference' | 'resource-reference'`
- [x] TypeScript 编译器无类型错误
- [x] 现有使用 `PromptContent` 的代码不受影响（向后兼容）

---

## 2. Resource Store Enhancements

- [x] 2.1 Add `getResourceById(id: string)` method to `resourceStore.ts`

**Acceptance Criteria**:

- [x] 方法签名为 `getResourceById: (id: string) => Resource | undefined`
- [x] 使用 `get()` 模式（与 `referenceImageStore` 保持一致）
- [x] 传入有效 ID 时返回对应资源
- [x] 传入无效 ID 时返回 `undefined`

- [x] 2.2 Add `getResourceByName(name: string)` method to `resourceStore.ts`

**Acceptance Criteria**:

- [x] 方法签名为 `getResourceByName: (name: string) => Resource | undefined`
- [x] 使用 `get()` 模式
- [x] 传入有效名称时返回对应资源
- [x] 传入无效名称时返回 `undefined`
- [x] 区分大小写匹配

---

## 3. MentionMenu Unification

- [x] 3.1 Import `useResourceStore` in `MentionMenu.tsx`

**Acceptance Criteria**:

- [x] 正确导入 `useResourceStore` store
- [x] 组件能够访问 `resources` 数组
- [x] 无循环依赖警告

- [x] 3.2 Create unified `MentionItem` interface

**Acceptance Criteria**:

- [x] 定义 `MentionItem` 接口，包含以下字段：
  - `id: string`
  - `type: 'image' | 'resource'`
  - `displayName: string`
  - `thumbnail?: string`
  - `imageCount?: number` (仅资源)
  - `promptPreview?: string` (仅资源)
- [x] 接口定义位置合理（组件内部或独立类型文件）

- [x] 3.3 Merge images and resources into single `mentionItems` array

**Acceptance Criteria**:

- [x] 图片通过 `useReferenceImageStore().images` 获取并转换为 `MentionItem`
- [x] 资源通过 `useResourceStore().resources` 获取并转换为 `MentionItem`
- [x] 图片的 `type` 为 `'image'`，资源的 `type` 为 `'resource'`
- [x] 资源使用首张图片作为缩略图（若存在）
- [x] 合并后数组包含所有图片和资源

- [x] 3.4 Update filter logic to search both image names and resource names

**Acceptance Criteria**:

- [x] 过滤逻辑基于 `displayName` 字段（图片和资源统一）
- [x] 过滤不区分大小写
- [x] 输入 `@角色` 时同时匹配名为"角色设计图"的图片和"角色风格包"的资源
- [x] 空搜索词显示所有项目

- [x] 3.5 Render distinct UI for image items (📷 purple) vs resource items (📦 blue)

**Acceptance Criteria**:

- [x] 图片项使用 `ImageIcon`（lucide-react）和紫色系样式
- [x] 资源项使用 `Package` 图标（lucide-react）和蓝色系样式
- [x] 高亮选中状态颜色与项目类型一致
- [x] 悬停状态视觉反馈正常

- [x] 3.6 Show resource metadata (image count, prompt preview) in menu items

**Acceptance Criteria**:

- [x] 资源项显示图片数量，格式如 "3 images"
- [x] 资源项显示提示词预览，截断至约50字符 + "..."
- [x] 图片项不显示额外元数据
- [x] 布局美观，文字不溢出

---

## 4. PromptInput Resource Tag Support

- [x] 4.1 Create `insertResourceTag(resource: Resource)` function

**Acceptance Criteria**:

- [x] 函数接收 `Resource` 对象作为参数
- [x] 创建 `<span>` 元素，设置 `contentEditable="false"`
- [x] 设置 `data-resource-id` 属性为资源 ID
- [x] 替换 `@` 及其后的搜索文本
- [x] 插入后光标移动到标签之后

- [x] 4.2 Style resource tags with blue color scheme

**Acceptance Criteria**:

- [x] 背景色: `bg-blue-900/50`
- [x] 边框色: `border-blue-700`
- [x] 文字色: `text-blue-200`
- [x] 圆角和内边距与图片标签一致
- [x] 深色/浅色主题下均清晰可见

- [x] 4.3 Use Package icon (📦) for resource tags

**Acceptance Criteria**:

- [x] 使用 lucide-react 的 `Package` 图标或等效 SVG
- [x] 图标尺寸与图片标签的图标一致（12x12）
- [x] 图标颜色继承文字颜色

- [x] 4.4 Extend `parseContent()` to recognize `data-resource-id` attribute

**Acceptance Criteria**:

- [x] `walk` 函数检测 `el.dataset.resourceId`
- [x] 检测到时推入 `{ type: 'resource-reference', value: resourceId }`
- [x] 不影响现有 `data-image-id` 检测逻辑

- [x] 4.5 Update `useEffect` DOM rebuild to handle `resource-reference` items

**Acceptance Criteria**:

- [x] 当 `promptContent` 包含 `resource-reference` 时，正确重建 DOM
- [x] 重建的资源标签样式正确（蓝色系）
- [x] 重建的资源标签包含正确的资源名称
- [x] 资源被删除时显示 "Unknown Resource"

- [x] 4.6 Update MentionMenu `onSelect` handler to dispatch correct insertion function

**Acceptance Criteria**:

- [x] 选择图片时调用 `insertImageTag(image)`
- [x] 选择资源时调用 `insertResourceTag(resource)`
- [x] 需要从 `MentionItem` 获取原始对象（通过 ID 查询 store）
- [x] 选择后菜单正确关闭

---

## 5. Generation Store Serialization

- [x] 5.1 Update `getSerializedPrompt()` to expand resource references

**Acceptance Criteria**:

- [x] 遍历 `promptContent` 时检测 `type === 'resource-reference'`
- [x] 通过 `getResourceById` 获取资源对象
- [x] 返回资源的 `promptTemplate` 作为序列化文本
- [x] 资源不存在时返回空字符串
- [x] 示例：`[📦 动漫风格]` → `"anime style, vibrant colors, ..."`

- [x] 5.2 Update `getReferencedImagePaths()` to include resource images

**Acceptance Criteria**:

- [x] 遍历 `promptContent` 时检测 `type === 'resource-reference'`
- [x] 通过 `getResourceById` 获取资源对象
- [x] 将资源的所有 `images` 路径添加到返回数组
- [x] 不重复添加相同路径
- [x] 资源不存在时跳过

- [x] 5.3 Import `useResourceStore` in `generationStore.ts`

**Acceptance Criteria**:

- [x] 使用 `useResourceStore.getState()` 模式（非 hook 调用）
- [x] 无循环依赖警告
- [x] 能够调用 `getResourceById` 方法

---

## 6. Error Handling

- [x] 6.1 Handle deleted resource display (show warning style)

**Acceptance Criteria**:

- [x] 当资源 ID 在 store 中找不到时：
  - 标签显示 `[📦 Unknown Resource]`
  - 标签使用警告样式（如黄色/橙色边框）
  - 不影响其他标签渲染
- [x] 可选：标签 tooltip 提示"此资源已被删除"

- [x] 6.2 Skip deleted resources during generation (no crash)

**Acceptance Criteria**:

- [x] `getSerializedPrompt()` 中资源不存在时返回空字符串，不抛错
- [x] `getReferencedImagePaths()` 中资源不存在时跳过，不抛错
- [x] 控制台输出警告日志：`Warning: Resource xxx not found, skipping`
- [x] 生成流程正常完成

---

## 7. UI Polish

- [x] 7.1 Update placeholder text: "Type @ to add image or resource"

**Acceptance Criteria**:

- [x] PromptInput 占位符文本更新为 "Describe your dream... (Type @ to add image or resource)"
- [x] 中英文版本一致（如果支持多语言）
- [x] 占位符样式不变

- [x] 7.2 Ensure resources load on app startup

**Acceptance Criteria**:

- [x] 在 `App.tsx` 或合适的顶层组件中调用 `loadResources()`
- [x] 或在 `MentionMenu` 首次渲染时触发加载
- [x] 打开 @ 菜单时资源列表不为空（假设已有资源）
- [x] 加载期间显示 loading 状态或不阻塞交互

---

## 8. Testing

- [x] 8.1 Manual test: Create resource → @ reference → generate

**Acceptance Criteria**:

- [x] 在资源库创建新资源（包含名称、提示词、至少1张图片）
- [x] 在 Creative Studio 输入 `@` 并选择该资源
- [x] 资源标签正确显示（蓝色，📦图标）
- [x] 点击生成，提示词和图片都被正确发送
- [x] 生成成功返回图片

- [x] 8.2 Manual test: Delete resource → verify warning display

**Acceptance Criteria**:

- [x] 先引用一个资源到 prompt
- [x] 然后在资源库删除该资源
- [x] 返回 Creative Studio，查看标签显示为警告样式
- [x] 点击生成，不会崩溃，正常完成（跳过该资源）

- [x] 8.3 Manual test: Multiple resources in single prompt

**Acceptance Criteria**:

- [x] 在 prompt 中引用 2-3 个不同资源
- [x] 所有标签正确显示
- [x] 生成时所有资源的提示词按顺序拼接
- [x] 所有资源的图片都被收集发送

- [x] 8.4 Manual test: Mix of images and resources in prompt

**Acceptance Criteria**:

- [x] prompt 中同时包含图片引用和资源引用
- [x] 图片标签为紫色，资源标签为蓝色
- [x] 生成时：
  - 图片引用保持原有行为
  - 资源引用展开提示词和图片
  - 两种类型的图片都被发送到 API
