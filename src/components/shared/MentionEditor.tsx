import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MentionMenu,
  type MentionItem,
} from '../../features/creative-studio/components/MentionMenu';
import type { ReferenceImage } from '../../types/referenceImage';
import type { Resource } from '../../stores/resourceStore';
import type { PromptContent } from '../../types/prompt';

interface MentionEditorProps {
  content: PromptContent[];
  onChange: (content: PromptContent[]) => void;
  mentionItems: MentionItem[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onEnter?: () => void;
  getImageById?: (id: string) => ReferenceImage | undefined;
  getResourceById?: (id: string) => Resource | undefined;
}

export const MentionEditor = ({
  content,
  onChange,
  mentionItems,
  placeholder,
  disabled,
  className,
  onEnter,
  getImageById,
  getResourceById,
}: MentionEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isLocalUpdate = useRef(false);
  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionFilter, setMentionFilter] = useState('');
  const mentionStartRef = useRef<Range | null>(null);

  // Initialize and sync content
  useEffect(() => {
    if (!editorRef.current) return;
    if (isLocalUpdate.current) {
      isLocalUpdate.current = false;
      return;
    }

    const root = editorRef.current;

    // Check if current content matches DOM to avoid unnecessary resets which break cursor
    // This is a simple check, could be more robust
    const currentText = root.innerText;
    const contentText = content.map((c) => (c.type === 'text' ? c.value : '')).join('');

    // If it's just text and it matches, don't reset
    if (
      content.every((c) => c.type === 'text') &&
      currentText === contentText &&
      currentText !== ''
    ) {
      return;
    }

    root.innerHTML = '';
    content.forEach((item) => {
      if (item.type === 'text') {
        root.appendChild(document.createTextNode(item.value));
      } else if (item.type === 'image-reference') {
        const img = getImageById?.(item.value);
        const span = document.createElement('span');
        span.contentEditable = 'false';
        span.className =
          'inline-flex items-center gap-1 bg-purple-900/50 text-purple-200 px-1.5 py-0.5 rounded text-xs mx-1 align-middle border border-purple-700 select-none';
        span.dataset.imageId = item.value;
        span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span>${img ? img.displayName : 'Unknown Image'}</span>`;
        root.appendChild(span);
      } else if (item.type === 'resource-reference') {
        const resource = getResourceById?.(item.value);
        const span = document.createElement('span');
        span.contentEditable = 'false';
        span.className =
          'inline-flex items-center gap-1 bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded text-xs mx-1 align-middle border border-blue-700 select-none';
        span.dataset.resourceId = item.value;
        const resName = resource ? resource.name : 'Unknown Resource';
        if (!resource) {
          span.classList.add('border-yellow-600', 'text-yellow-200');
          span.classList.remove('border-blue-700', 'text-blue-200');
        }
        span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg><span>${resName}</span>`;
        root.appendChild(span);
      }
    });
  }, [content, getImageById, getResourceById]);

  const parseContent = useCallback(() => {
    if (!editorRef.current) return;

    const newContent: PromptContent[] = [];

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) {
          newContent.push({ type: 'text', value: node.textContent });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.dataset.imageId) {
          newContent.push({ type: 'image-reference', value: el.dataset.imageId });
        } else if (el.dataset.resourceId) {
          newContent.push({ type: 'resource-reference', value: el.dataset.resourceId });
        } else if (el.tagName === 'BR') {
          newContent.push({ type: 'text', value: '\n' });
        } else {
          node.childNodes.forEach(walk);
        }
      }
    };

    editorRef.current.childNodes.forEach(walk);
    isLocalUpdate.current = true;
    onChange(newContent);
  }, [onChange]);

  const checkForMention = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const text = textNode.textContent || '';
    const cursorOffset = range.startOffset;

    const lastAt = text.lastIndexOf('@', cursorOffset - 1);

    if (lastAt !== -1) {
      const query = text.substring(lastAt + 1, cursorOffset);
      if (query.includes('\n')) {
        setMentionMenuOpen(false);
        return;
      }

      try {
        const rect = range.getBoundingClientRect();
        setMentionPosition({
          top: rect.bottom + 5,
          left: rect.left,
        });
        setMentionFilter(query);
        setMentionMenuOpen(true);
        mentionStartRef.current = range.cloneRange();
        mentionStartRef.current.setStart(textNode, lastAt);
        mentionStartRef.current.setEnd(textNode, cursorOffset);
      } catch (e) {
        console.error('Failed to calculate menu position', e);
      }
    } else {
      setMentionMenuOpen(false);
    }
  };

  const handleInput = () => {
    checkForMention();
    parseContent();
  };

  const insertImageTag = (image: ReferenceImage) => {
    const selection = window.getSelection();
    if (!selection || !mentionStartRef.current) return;

    const range = mentionStartRef.current;
    range.deleteContents();

    const tag = document.createElement('span');
    tag.contentEditable = 'false';
    tag.className =
      'inline-flex items-center gap-1 bg-purple-900/50 text-purple-200 px-1.5 py-0.5 rounded text-xs mx-1 align-middle border border-purple-700 select-none';
    tag.dataset.imageId = image.id;
    tag.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span>${image.displayName}</span>`;

    range.insertNode(tag);
    const space = document.createTextNode('\u00A0');
    range.collapse(false);
    range.insertNode(space);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    setMentionMenuOpen(false);
    parseContent();
  };

  const insertResourceTag = (resource: Resource) => {
    const selection = window.getSelection();
    if (!selection || !mentionStartRef.current) return;

    const range = mentionStartRef.current;
    range.deleteContents();

    const tag = document.createElement('span');
    tag.contentEditable = 'false';
    tag.className =
      'inline-flex items-center gap-1 bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded text-xs mx-1 align-middle border border-blue-700 select-none';
    tag.dataset.resourceId = resource.id;
    tag.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg><span>${resource.name}</span>`;

    range.insertNode(tag);
    const space = document.createTextNode('\u00A0');
    range.collapse(false);
    range.insertNode(space);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    setMentionMenuOpen(false);
    parseContent();
  };

  const handleSelect = (item: MentionItem) => {
    if (item.type === 'image') {
      insertImageTag(item.originalObject as ReferenceImage);
    } else if (item.type === 'resource') {
      insertResourceTag(item.originalObject as Resource);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (mentionMenuOpen) {
        e.preventDefault();
        return;
      }
      if (onEnter) {
        e.preventDefault();
        onEnter();
      }
    }

    if (mentionMenuOpen) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="relative group w-full">
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={className}
        role="textbox"
        aria-multiline="true"
      />

      {!content.length && placeholder && (
        <div className="absolute top-4 left-4 text-[var(--text-secondary)] pointer-events-none select-none opacity-70">
          {placeholder}
        </div>
      )}

      <MentionMenu
        key={mentionFilter}
        items={mentionItems}
        isOpen={mentionMenuOpen}
        filterText={mentionFilter}
        position={mentionPosition}
        onSelect={handleSelect}
        onClose={() => setMentionMenuOpen(false)}
      />
    </div>
  );
};
