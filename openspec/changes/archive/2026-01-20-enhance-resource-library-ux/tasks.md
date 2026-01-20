# Tasks: Enhance Resource Library UX

## 1. Resource Card UI Enhancement

- [x] 1.1 Enhance ResourceCard component display

**Acceptance Criteria**:

- [x] 资源卡片显示资源名称（突出显示）
- [x] 资源卡片显示提示词预览（截断显示，最多2-3行）
- [x] 资源卡片显示图片缩略图网格（最多显示4张，多余显示 "+N"）
- [x] 卡片布局美观，响应式设计

- [x] 1.2 Add prompt template hover tooltip

**Acceptance Criteria**:

- [x] 悬停在提示词预览区域时显示完整提示词
- [x] Tooltip 样式与应用整体风格一致
- [x] Tooltip 位置不会超出视口
- [x] 长文本适当换行显示

- [x] 1.3 Add "Copy to Clipboard" quick action

**Acceptance Criteria**:

- [x] 资源卡片上增加"复制"按钮（📋 图标）
- [x] 点击后将资源的提示词复制到剪贴板
- [x] 显示成功 toast 提示："Prompt copied to clipboard"
- [x] 按钮悬停有视觉反馈

---

## 2. Resource Editor Enhancement

- [x] 2.1 Add live preview of resource card

**Acceptance Criteria**:

- [x] 资源编辑器右侧或底部显示预览区域
- [x] 预览实时反映用户输入的名称、描述、提示词
- [x] 预览显示已上传的图片缩略图
- [x] 预览样式与资源库卡片一致

- [x] 2.2 Implement image drag-and-drop reorder

**Acceptance Criteria**:

- [x] 支持拖拽图片调整顺序
- [x] 拖拽时有视觉反馈（如拖拽占位符）
- [x] 松开后图片顺序更新
- [x] 顺序变化保存到资源中

- [x] 2.3 (Optional) Add prompt template variable hints

**Acceptance Criteria**:

- [x] 在提示词输入框旁显示帮助提示
- [x] 说明支持的变量格式（如 `{variable_name}`）
- [x] 此为可选功能，可延后实现

---

## 3. Image Path Validation

- [x] 3.1 Validate image paths when displaying resource

**Acceptance Criteria**:

- [x] 加载资源时检查每张图片路径是否存在
- [x] 无效路径的图片显示占位图（如灰色背景 + ❌ 图标）
- [x] 占位图 tooltip 提示 "Image not found: {path}"
- [x] 不阻塞其他有效图片的显示

- [x] 3.2 Handle invalid image paths during generation

**Acceptance Criteria**:

- [x] 生成时跳过无效的图片路径
- [x] 控制台输出警告：`Warning: Image not found, skipping: {path}`
- [x] 如果资源所有图片都无效，仅注入提示词，不注入图片
- [x] 生成流程不会因无效路径而崩溃

- [ ] 3.3 (Optional) Show warning when saving resource with invalid paths

**Acceptance Criteria**:

- [ ] 保存资源时检测无效路径
- [ ] 显示警告对话框列出无效图片
- [ ] 用户可选择"仍然保存"或"取消"
- [ ] 此为可选功能，可延后实现

---

## 4. Resource Image Limit

- [x] 4.1 Implement soft limit for images per resource

**Acceptance Criteria**:

- [x] 单个资源最多允许 5 张图片（软限制）
- [x] 超过限制时显示警告提示（黄色横幅或 toast）
- [x] 警告文案："Recommended: max 5 images per resource for optimal performance"
- [x] 不阻止用户添加更多图片（仅警告）

- [x] 4.2 Show image count in resource editor

**Acceptance Criteria**:

- [x] 图片上传区域显示当前图片数量，如 "3 / 5 images"
- [x] 接近或超过限制时数字变为警告色
- [x] 帮助用户理解当前状态

- [ ] 4.3 (Optional) Validate total image size before generation

**Acceptance Criteria**:

- [ ] 生成前计算所有参考图片的总大小
- [ ] 如果超过 API 限制（64MB），显示错误提示
- [ ] 提示用户移除部分图片或压缩图片
- [ ] 此为可选功能，可延后实现

---

## 5. Testing

- [x] 5.1 Manual test: Resource Library UI improvements
- [x] 5.2 Manual test: Invalid image path handling
- [x] 5.3 Manual test: Image limit warning
- [x] 5.4 Manual test: Resource editor live preview
- [x] 5.5 Manual test: Image reordering
