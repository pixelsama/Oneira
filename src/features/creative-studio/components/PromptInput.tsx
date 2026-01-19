import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGenerationStore } from '../../../stores/generationStore';
import { useReferenceImageStore } from '../../../stores/referenceImageStore';
import { useResourceStore, type Resource } from '../../../stores/resourceStore';
import { toast } from 'sonner';
import { MentionMenu, type MentionItem } from './MentionMenu';
import type { ReferenceImage } from '../../../types/referenceImage';
import type { PromptContent } from '../../../types/prompt';

export const PromptInput = () => {
  const { setPromptContent, generate, isGenerating, promptContent } = useGenerationStore();
  const { getImageById, images } = useReferenceImageStore();
  const { getResourceById } = useResourceStore();

  const editorRef = useRef<HTMLDivElement>(null);
  const isLocalUpdate = useRef(false);
  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);

  // Initialize and sync content
  useEffect(() => {
    if (!editorRef.current) return;
    if (isLocalUpdate.current) {
      isLocalUpdate.current = false;
      return;
    }

    // Rebuild DOM from promptContent
    const root = editorRef.current;
    root.innerHTML = '';

    promptContent.forEach((item) => {
      if (item.type === 'text') {
        root.appendChild(document.createTextNode(item.value));
      } else if (item.type === 'image-reference') {
        const img = getImageById(item.value);
        const span = document.createElement('span');
        span.contentEditable = 'false';
        span.className =
          'inline-flex items-center gap-1 bg-purple-900/50 text-purple-200 px-1.5 py-0.5 rounded text-xs mx-1 align-middle border border-purple-700 select-none';
        span.dataset.imageId = item.value;
        // Re-create SVG icon
        span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span>${img ? img.displayName : 'Unknown Image'}</span>`;
        root.appendChild(span);
      } else if (item.type === 'resource-reference') {
        const resource = getResourceById(item.value);
        const span = document.createElement('span');
        span.contentEditable = 'false';
        span.className =
          'inline-flex items-center gap-1 bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded text-xs mx-1 align-middle border border-blue-700 select-none';
        span.dataset.resourceId = item.value;
        // Re-create SVG icon (Package)
        const resName = resource ? resource.name : 'Unknown Resource';
        if (!resource) {
          span.classList.add('border-yellow-600', 'text-yellow-200');
          span.classList.remove('border-blue-700', 'text-blue-200');
        }
        span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg><span>${resName}</span>`;
        root.appendChild(span);
      }
    });
  }, [promptContent, getImageById, getResourceById, images]);

  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionFilter, setMentionFilter] = useState('');

  // Track if we are currently typing a mention
  // We need to know where the @ started.
  const mentionStartRef = useRef<Range | null>(null);

  const handleGenerate = async () => {
    try {
      await generate();
      toast.success('Dream captured successfully.');
    } catch (e) {
      toast.error(`Generation failed: ${e}`);
    }
  };

  const parseContent = useCallback(() => {
    if (!editorRef.current) return;

    const content: PromptContent[] = [];

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) {
          content.push({ type: 'text', value: node.textContent });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.dataset.imageId) {
          content.push({ type: 'image-reference', value: el.dataset.imageId });
        } else if (el.dataset.resourceId) {
          content.push({ type: 'resource-reference', value: el.dataset.resourceId });
        } else if (el.tagName === 'BR') {
          content.push({ type: 'text', value: '\n' });
        } else {
          node.childNodes.forEach(walk);
        }
      }
    };

    editorRef.current.childNodes.forEach(walk);
    isLocalUpdate.current = true;
    setPromptContent(content);
  }, [setPromptContent]);

  const checkForMention = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const text = textNode.textContent || '';
    const cursorOffset = range.startOffset;

    // Look backwards for @
    const lastAt = text.lastIndexOf('@', cursorOffset - 1);

    if (lastAt !== -1) {
      // Check if there are spaces between @ and cursor (allow spaces in search? Usually no)
      // Standard mention: @name without spaces, or with spaces if strictly tracked.
      // Let's allow spaces for now as users might name images "Style A".
      // But usually we limit search to the current "word" or "phrase".
      // Let's say we check up to the @.

      const query = text.substring(lastAt + 1, cursorOffset);

      // Basic validation: ensure no newlines?
      if (query.includes('\n')) {
        setMentionMenuOpen(false);
        return;
      }

      // Calculate position using viewport coordinates (for fixed positioning)
      try {
        const rect = range.getBoundingClientRect();
        // Use viewport coordinates directly since MentionMenu uses fixed positioning
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
    if (!selection) return;

    // Restore range if lost (though we usually have it if we just typed)
    // Actually, we want to replace the text from @...cursor
    if (!mentionStartRef.current) return;

    const range = mentionStartRef.current;
    range.deleteContents();

    // Create the tag element
    const tag = document.createElement('span');
    tag.contentEditable = 'false';
    tag.className =
      'inline-flex items-center gap-1 bg-purple-900/50 text-purple-200 px-1.5 py-0.5 rounded text-xs mx-1 align-middle border border-purple-700 select-none';
    tag.dataset.imageId = image.id;

    // We can use React to render inside this span?
    // No, standard DOM is safer for contentEditable.
    tag.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span>${image.displayName}</span>`;

    range.insertNode(tag);

    // Insert a space after
    const space = document.createTextNode('\u00A0'); // nbsp to ensure cursor can move out? Or standard space ' '
    range.collapse(false);
    range.insertNode(space);

    // Move cursor after space
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    setMentionMenuOpen(false);
    parseContent();
  };

  const insertResourceTag = (resource: Resource) => {
    const selection = window.getSelection();
    if (!selection) return;
    if (!mentionStartRef.current) return;

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
        // Let the menu handle it
        e.preventDefault();
        return;
      }
      e.preventDefault();
      handleGenerate();
    }

    // Allow menu navigation keys to bubble up if we wanted global handler,
    // but MentionMenu handles its own keys via window listener.
    // However, we need to prevent the contentEditable from capturing Enter/Arrows if menu is open.
    if (mentionMenuOpen) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-[var(--text-secondary)]">Prompt</label>
      <div className="relative group">
        <div
          ref={editorRef}
          contentEditable={!isGenerating}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Delay closing menu to allow click
            setTimeout(() => {
              // Check if focus moved to menu?
              // Actually menu uses window click/keydown.
            }, 200);
          }}
          className={`
            w-full min-h-[128px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4 
            text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] 
            resize-none whitespace-pre-wrap overflow-y-auto max-h-[300px] transition-colors duration-200
            ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          role="textbox"
          aria-multiline="true"
        />

        {!promptContent.length && (
          <div className="absolute top-4 left-4 text-[var(--text-secondary)] pointer-events-none select-none opacity-70">
            Describe your dream... (Type @ to add image or resource)
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="absolute bottom-4 right-4 bg-[var(--accent-color)] hover:brightness-110 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors cursor-pointer z-10"
        >
          {isGenerating ? 'Dreaming...' : 'Generate'}
        </button>

        <MentionMenu
          key={mentionFilter}
          isOpen={mentionMenuOpen}
          filterText={mentionFilter}
          position={mentionPosition}
          onSelect={handleSelect}
          onClose={() => setMentionMenuOpen(false)}
        />
      </div>
    </div>
  );
};
