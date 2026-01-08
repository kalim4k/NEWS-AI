import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List, Image as ImageIcon, Heading1, Heading2, Quote } from 'lucide-react';

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichEditor: React.FC<RichEditorProps> = ({ content, onChange, placeholder = "Écrivez votre histoire...", minHeight = "300px" }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial content only once to avoid cursor jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus(); // Ensure focus returns to editor
    }
    handleInput(); // Force update state
  };

  const handleToolbarAction = (e: React.MouseEvent, command: string, value?: string) => {
    e.preventDefault(); // Crucial: Prevents button from stealing focus from the editor
    
    // Toggle logic for formatBlock (H1, H2, Blockquote)
    if (command === 'formatBlock' && value) {
      const currentBlock = document.queryCommandValue('formatBlock');
      if (currentBlock && currentBlock.toLowerCase() === value.toLowerCase()) {
        // If already applied, revert to paragraph
        execCmd('formatBlock', 'p');
        return;
      }
    }
    
    execCmd(command, value);
  };

  const triggerImageUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    // Save current cursor position if possible (basic implementation relies on browser retaining selection)
    fileInputRef.current?.click();
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          // Restore focus before inserting
          if (editorRef.current) editorRef.current.focus();
          execCmd('insertImage', base64);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const toolbarBtnClass = "p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer";

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Hidden File Input for Image Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageSelected} 
        accept="image/*" 
        className="hidden" 
        style={{ display: 'none' }}
      />

      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
        {/* Note: Using onMouseDown instead of onClick prevents focus loss from the contentEditable area */}
        <button onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'H1')} className={toolbarBtnClass} title="Titre 1"><Heading1 size={18} /></button>
        <button onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'H2')} className={toolbarBtnClass} title="Titre 2"><Heading2 size={18} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button onMouseDown={(e) => handleToolbarAction(e, 'bold')} className={toolbarBtnClass} title="Gras"><Bold size={18} /></button>
        <button onMouseDown={(e) => handleToolbarAction(e, 'italic')} className={toolbarBtnClass} title="Italique"><Italic size={18} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button onMouseDown={(e) => handleToolbarAction(e, 'insertUnorderedList')} className={toolbarBtnClass} title="Liste"><List size={18} /></button>
        <button onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'blockquote')} className={toolbarBtnClass} title="Citation"><Quote size={18} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Updated Image Button to trigger file upload */}
        <button onMouseDown={triggerImageUpload} className={toolbarBtnClass} title="Insérer une image"><ImageIcon size={18} /></button>
      </div>

      {/* Styles Specific to Editor to ensure WYSIWYG */}
      <style>{`
        .rich-editor-content h1 { 
          font-family: 'Merriweather', serif;
          font-size: 2.25rem; 
          line-height: 2.5rem; 
          font-weight: 800; 
          margin-bottom: 1rem; 
          margin-top: 1.5rem; 
          color: #0f172a; 
          display: block;
        }
        .rich-editor-content h2 { 
          font-family: 'Merriweather', serif;
          font-size: 1.875rem; 
          line-height: 2.25rem; 
          font-weight: 700; 
          margin-bottom: 0.75rem; 
          margin-top: 1.25rem; 
          color: #1e293b; 
          display: block;
        }
        .rich-editor-content ul { 
          list-style-type: disc; 
          padding-left: 1.5rem; 
          margin-bottom: 1rem; 
        }
        .rich-editor-content ol { 
          list-style-type: decimal; 
          padding-left: 1.5rem; 
          margin-bottom: 1rem; 
        }
        .rich-editor-content blockquote { 
          border-left: 4px solid #cbd5e1; 
          padding-left: 1rem; 
          font-style: italic; 
          color: #475569; 
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .rich-editor-content img {
          border-radius: 0.5rem;
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }
        .rich-editor-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
      `}</style>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning={true}
        className="rich-editor-content w-full p-6 focus:outline-none text-slate-700 max-w-none"
        style={{ minHeight: minHeight }}
      />
      {(!content && document.activeElement !== editorRef.current) && (
         <div className="absolute pointer-events-none text-slate-400 p-6 top-[50px]">
           {placeholder}
         </div>
      )}
    </div>
  );
};