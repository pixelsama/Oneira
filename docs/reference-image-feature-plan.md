# 参考图上传与 @ 提及功能实现计划

**创建日期**: 2026-01-17  
**状态**: 待实施  
**优先级**: 高

---

## 📋 功能概述

实现完整的参考图上传、管理和引用系统，支持：

1. 使用 Tauri 原生对话框选择图片文件
2. 拖拽上传图片
3. 图片缩略图预览与自定义命名
4. 在 Prompt 输入框中通过 `@` 符号引用图片
5. 后端集成豆包图生图 API

---

## 🎯 目标用户体验

```
┌─────────────────────────────────────────────────────────────────┐
│  Prompt 输入框                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 将 [📷 角色设计图] 的服装换为 [📷 时装参考] 的风格@          ││
│  │                                              ┌────────────┐ ││
│  │                                              │ 角色设计图 │ ││
│  │                                              │ 时装参考   │ ││
│  │                                              │ 背景素材   │ ││
│  │                                              └────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  已上传图片：                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  🖼️      │ │  🖼️      │ │  🖼️      │ │    +     │           │
│  │ 角色设计图│ │ 时装参考 │ │ 背景素材 │ │  上传    │           │
│  │   ✏️ ❌  │ │   ✏️ ❌  │ │   ✏️ ❌  │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 文件结构

```
src/
├── features/
│   └── creative-studio/
│       └── components/
│           ├── ImageUploader.tsx        # 重构：图片上传区域
│           ├── UploadedImageCard.tsx    # 新增：单张图片卡片（缩略图、名称、编辑、删除）
│           ├── PromptInput.tsx          # 重构：支持 @ 提及
│           └── MentionMenu.tsx          # 新增：@ 提及下拉菜单
├── stores/
│   └── referenceImageStore.ts           # 新增：参考图状态管理
├── hooks/
│   └── useMentionInput.ts               # 新增：@ 提及输入逻辑
└── types/
    └── referenceImage.ts                # 新增：类型定义

src-tauri/
├── src/
│   └── commands/
│       └── generate.rs                  # 修改：支持图生图参数
└── Cargo.toml                           # 可能需要添加依赖
```

---

## 📦 Phase 1: 基础设施

### 1.1 安装 Tauri Dialog 插件

```bash
# 前端
pnpm add @tauri-apps/plugin-dialog

# 后端 (Cargo.toml)
tauri-plugin-dialog = "2"
```

**注册插件** (`src-tauri/src/lib.rs`):

```rust
.plugin(tauri_plugin_dialog::init())
```

**权限配置** (`capabilities/default.json`):

```json
"dialog:default"
```

### 1.2 类型定义

**`src/types/referenceImage.ts`**:

```typescript
export interface ReferenceImage {
  id: string; // 唯一标识 (uuid)
  originalPath: string; // 本地文件路径
  displayName: string; // 用户可编辑的显示名称
  originalFileName: string; // 原始文件名（不可变）
  thumbnailDataUrl?: string; // Base64 缩略图（用于快速预览）
  addedAt: number; // 添加时间戳
}
```

### 1.3 状态管理

**`src/stores/referenceImageStore.ts`**:

```typescript
import { create } from 'zustand';
import type { ReferenceImage } from '../types/referenceImage';

interface ReferenceImageState {
  images: ReferenceImage[];

  // Actions
  addImage: (path: string, fileName: string) => Promise<void>;
  removeImage: (id: string) => void;
  updateDisplayName: (id: string, newName: string) => void;
  clearAll: () => void;

  // Utils
  getImageById: (id: string) => ReferenceImage | undefined;
  getImageByName: (name: string) => ReferenceImage | undefined;
}
```

---

## 📦 Phase 2: 图片上传组件

### 2.1 ImageUploader 重构

**功能需求**:

- 点击打开 Tauri 原生文件选择对话框
- 支持拖拽上传（使用 HTML5 Drag & Drop API）
- 支持多选文件
- 文件类型过滤：`jpg, jpeg, png, webp, gif`
- 上传后立即显示缩略图

**实现要点**:

```typescript
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

const handleSelectFiles = async () => {
  const selected = await open({
    multiple: true,
    filters: [
      {
        name: 'Images',
        extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      },
    ],
  });

  if (selected) {
    const paths = Array.isArray(selected) ? selected : [selected];
    for (const path of paths) {
      await addImage(path);
    }
  }
};
```

**拖拽上传**:

```typescript
const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  // 注意：Web 拖拽获取的是 File 对象，需要通过 Tauri 转换为路径
  // 或者直接读取为 base64
};
```

### 2.2 UploadedImageCard 组件

**UI 结构**:

```
┌─────────────────┐
│   [缩略图 80x80] │
├─────────────────┤
│ 📷 显示名称      │  ← 可点击编辑
│     ✏️     ❌   │  ← 编辑/删除按钮
└─────────────────┘
```

**Props**:

```typescript
interface UploadedImageCardProps {
  image: ReferenceImage;
  onRename: (id: string, newName: string) => void;
  onRemove: (id: string) => void;
}
```

---

## 📦 Phase 3: @ 提及系统

### 3.1 PromptInput 重构

**核心需求**:

1. 检测 `@` 字符输入
2. 显示/隐藏 MentionMenu
3. 处理键盘事件（↑↓ 导航、Enter 选择、Tab 快速选择、Esc 取消）
4. 插入引用标签（视觉上为圆角矩形标签）
5. 支持文本与标签混合编辑

**实现方案**:
使用 `contenteditable` div 或自定义 HTML 结构来支持内嵌标签。

**状态结构**:

```typescript
interface MentionState {
  isOpen: boolean; // 菜单是否打开
  searchQuery: string; // @ 后的搜索关键词
  selectedIndex: number; // 当前选中项索引
  cursorPosition: number; // 光标位置
}
```

### 3.2 MentionMenu 组件

**UI**:

```
┌──────────────────┐
│ 📷 角色设计图    │  ← 高亮选中
│ 📷 时装参考      │
│ 📷 背景素材      │
└──────────────────┘
```

**功能**:

- 根据输入过滤匹配的图片名称
- 键盘导航（↑↓ 移动选择）
- Enter 确认选择
- Tab 快速选择第一项
- 点击选择
- Esc 关闭菜单

**Props**:

```typescript
interface MentionMenuProps {
  images: ReferenceImage[];
  searchQuery: string;
  selectedIndex: number;
  onSelect: (image: ReferenceImage) => void;
  position: { top: number; left: number };
}
```

### 3.3 引用标签渲染

**视觉效果**:

```
[📷 角色设计图]
```

- 背景：`bg-purple-900/50`
- 边框：`border border-purple-600`
- 圆角：`rounded-md`
- 内边距：`px-2 py-0.5`
- 字体：`text-sm text-purple-300`

**数据结构**:

```typescript
interface PromptContent {
  type: 'text' | 'image-reference';
  value: string; // 文本内容或图片 ID
}

// 示例
const content: PromptContent[] = [
  { type: 'text', value: '将 ' },
  { type: 'image-reference', value: 'uuid-of-image-1' },
  { type: 'text', value: ' 的服装换为 ' },
  { type: 'image-reference', value: 'uuid-of-image-2' },
  { type: 'text', value: ' 的风格' },
];
```

### 3.4 Prompt 序列化

发送给后端时，需要将内容转换为纯文本：

```typescript
const serializePrompt = (content: PromptContent[], images: ReferenceImage[]): string => {
  return content
    .map((item) => {
      if (item.type === 'text') {
        return item.value;
      } else {
        const image = images.find((img) => img.id === item.value);
        return image ? `图片文件[${image.displayName}]` : '';
      }
    })
    .join('');
};

// 输出示例: "将 图片文件[角色设计图] 的服装换为 图片文件[时装参考] 的风格"
```

---

## 📦 Phase 4: 后端集成（Base64 方式）

### 4.1 豆包官方限制

根据豆包官方文档，我们必须使用 **Base64 编码方式**（因为文件路径上传仅支持 Python/Go SDK）：

| 项目          | 限制                                    |
| ------------- | --------------------------------------- |
| 单张图片大小  | < 10 MB                                 |
| 请求体总大小  | < 64 MB                                 |
| Data URI 格式 | `data:{mime_type};base64,{base64_data}` |

### 4.2 修改 GeneratePayload

**`src-tauri/src/models/mod.rs`**:

```rust
#[derive(Debug, Deserialize)]
pub struct GeneratePayload {
    pub prompt: String,
    pub width: u32,
    pub height: u32,
    pub count: u32,
    // 新增
    pub reference_images: Option<Vec<String>>,  // 图片路径列表
}
```

### 4.3 实现图片转 Base64（完整版）

**新增辅助函数** (`src-tauri/src/commands/generate.rs`):

```rust
use std::path::Path;

/// 根据文件扩展名获取 MIME 类型
fn get_mime_type(path: &Path) -> Result<&'static str, String> {
    match path.extension().and_then(|s| s.to_str()) {
        Some("jpg") | Some("jpeg") => Ok("image/jpeg"),
        Some("png") => Ok("image/png"),
        Some("webp") => Ok("image/webp"),
        Some("gif") => Ok("image/gif"),
        _ => Err("Unsupported image format. Supported: jpg, png, webp, gif".to_string()),
    }
}

/// 将本地图片转换为 Base64 Data URI
fn image_to_base64_uri(path: &str) -> Result<String, String> {
    let file_path = Path::new(path);

    // 1. 验证文件存在
    if !file_path.exists() {
        return Err(format!("Image file not found: {}", path));
    }

    // 2. 检查文件大小（< 10MB）
    let metadata = fs::metadata(file_path).map_err(|e| e.to_string())?;
    const MAX_SIZE: u64 = 10 * 1024 * 1024; // 10 MB
    if metadata.len() > MAX_SIZE {
        return Err(format!(
            "Image too large: {} MB (max 10 MB). Path: {}",
            metadata.len() / 1024 / 1024,
            path
        ));
    }

    // 3. 获取 MIME 类型
    let mime_type = get_mime_type(file_path)?;

    // 4. 读取文件并编码
    let bytes = fs::read(file_path).map_err(|e| e.to_string())?;
    let base64_str = BASE64_STANDARD.encode(&bytes);

    // 5. 构造 Data URI
    Ok(format!("data:{};base64,{}", mime_type, base64_str))
}
```

### 4.4 修改 generate_doubao 函数

**集成图片处理逻辑**:

```rust
async fn generate_doubao(
    store: &tauri_plugin_store::Store<tauri::Wry>,
    client: &Client,
    output_path: &Path,
    payload: GeneratePayload,
) -> Result<Vec<String>, String> {
    // ... existing code (API token, model, size)

    let mut body = json!({
        "model": model,
        "prompt": payload.prompt,
        "sequential_image_generation": "disabled",
        "response_format": "url",
        "size": size_str,
        "stream": false,
        "watermark": false
    });

    // 🔥 新增：处理参考图片
    if let Some(ref_images) = &payload.reference_images {
        if !ref_images.is_empty() {
            // 转换为 Base64 Data URIs
            let image_uris: Vec<String> = ref_images
                .iter()
                .map(|path| image_to_base64_uri(path))
                .collect::<Result<Vec<_>, _>>()?;

            // 根据数量决定格式
            if image_uris.len() == 1 {
                // 单张图片：直接传字符串
                body["image"] = json!(image_uris[0]);
            } else {
                // 多张图片：传数组
                body["image"] = json!(image_uris);
            }
        }
    }

    // ... rest of code (HTTP request)
}
```

### 4.5 豆包 API 图生图参数规范

| 场景                  | `image` 格式                           | `sequential_image_generation` |
| --------------------- | -------------------------------------- | ----------------------------- |
| 单张参考图 → 单张输出 | `"image": "data:image/png;base64,..."` | `"disabled"`                  |
| 单张参考图 → 多张输出 | `"image": "data:image/png;base64,..."` | `"auto"`                      |
| 多张参考图 → 单张输出 | `"image": ["data:...", "data:..."]`    | `"disabled"`                  |
| 多张参考图 → 多张输出 | `"image": ["data:...", "data:..."]`    | `"auto"`                      |

---

## 📦 Phase 5: 前端 Store 集成

### 5.1 修改 generationStore

**新增字段**:

```typescript
interface GenerationState {
  // ... existing fields

  // 新增
  promptContent: PromptContent[]; // 结构化 prompt 内容

  // Actions
  setPromptContent: (content: PromptContent[]) => void;
  insertImageReference: (imageId: string) => void;
  getSerializedPrompt: () => string;
  getReferencedImagePaths: () => string[];
}
```

### 5.2 调用生成 API 时

```typescript
const handleGenerate = async () => {
  const prompt = getSerializedPrompt();
  const referenceImages = getReferencedImagePaths();

  await invoke('generate_image', {
    payload: {
      prompt,
      width: settings.width,
      height: settings.height,
      count: settings.count,
      reference_images: referenceImages.length > 0 ? referenceImages : null,
    },
  });
};
```

---

## ✅ 实施检查清单

### Phase 1: 基础设施 (预计 30 分钟)

- [ ] 安装 `@tauri-apps/plugin-dialog`
- [ ] 更新 `Cargo.toml` 添加 `tauri-plugin-dialog`
- [ ] 注册插件到 Tauri Builder
- [ ] 更新 `capabilities/default.json`
- [ ] 创建 `types/referenceImage.ts`
- [ ] 创建 `stores/referenceImageStore.ts`

### Phase 2: 图片上传组件 (预计 1 小时)

- [ ] 重构 `ImageUploader.tsx` - 支持点击选择
- [ ] 添加拖拽上传支持
- [ ] 创建 `UploadedImageCard.tsx`
- [ ] 实现缩略图生成
- [ ] 实现名称编辑功能
- [ ] 实现删除功能

### Phase 3: @ 提及系统 (预计 2 小时)

- [ ] 创建 `MentionMenu.tsx`
- [ ] 重构 `PromptInput.tsx` 支持 contenteditable
- [ ] 实现 `@` 检测逻辑
- [ ] 实现键盘导航（↑↓ Enter Tab Esc）
- [ ] 实现搜索过滤
- [ ] 实现引用标签插入与渲染
- [ ] 实现 prompt 序列化

### Phase 4: 后端集成 (预计 1 小时)

- [ ] 修改 `GeneratePayload` 结构体
- [ ] 修改 `generate_doubao` 支持图片参数
- [ ] 修改 `generate_openai`（如适用）
- [ ] 测试图生图功能

### Phase 5: 集成测试 (预计 30 分钟)

- [ ] 端到端测试：上传 → 命名 → 引用 → 生成
- [ ] 边界情况测试
- [ ] 错误处理验证

---

## 🚨 风险与注意事项

1. **Base64 大小限制** (豆包官方限制):
   - 单张图片必须 < 10 MB
   - 请求体总大小 < 64 MB
   - **建议**：前端实现图片压缩/缩放（如使用 Canvas API 压缩到 2MB 以内）
2. **拖拽兼容性**: Tauri 拖拽可能需要特殊处理，需测试

3. **contenteditable 复杂性**: 光标管理、选区操作可能有兼容性问题

4. **API 错误处理**:
   - 图片格式不支持
   - 图片过大
   - Base64 编码失败
   - 网络请求超时

5. **前端图片压缩方案** (推荐)：
   ```typescript
   // 使用 Canvas API 压缩图片
   const compressImage = async (file: File, maxSizeMB: number = 2): Promise<Blob> => {
     const img = await createImageBitmap(file);
     const canvas = document.createElement('canvas');
     // ... resize logic
     return canvas.toBlob(blob, 'image/jpeg', 0.8);
   };
   ```

---

## 📚 参考资料

- [Tauri Dialog Plugin](https://tauri.app/plugin/dialog/)
- [豆包图生图 API](docs/doubao.md)
- [React contenteditable 最佳实践](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/contentEditable)
