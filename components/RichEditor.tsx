
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
    e.preventDefault(); // Prevents button from stealing focus
    
    // Specific logic for toggling block elements (H1, H2)
    if (command === 'formatBlock' && value) {
      const selection = document.getSelection();
      if (selection && selection.rangeCount > 0) {
         const currentBlockValue = document.queryCommandValue('formatBlock');
         // If the current block tag matches the requested tag (e.g., both are "h1"), toggle it off to "p" or "div"
         if (currentBlockValue && currentBlockValue.toLowerCase() === value.toLowerCase()) {
           execCmd('formatBlock', 'div'); // Revert to standard block
           return;
         }
      }
    }
    
    execCmd(command, value);
  };

  const triggerImageUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          if (editorRef.current) editorRef.current.focus();
          execCmd('insertImage', base64);
        }
      };
      reader.readAsDataURL(file);
    }
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
        <button onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'H1')} className={toolbarBtnClass} title="Titre 1 (H1)"><Heading1 size={18} /></button>
        <button onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'H2')} className={toolbarBtnClass} title="Titre 2 (H2)"><Heading2 size={18} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button onMouseDown={(e) => handleToolbarAction(e, 'bold')} className={toolbarBtnClass} title="Gras (Toggle)"><Bold size={18} /></button>
        <button onMouseDown={(e) => handleToolbarAction(e, 'italic')} className={toolbarBtnClass} title="Italique (Toggle)"><Italic size={18} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button onMouseDown={(e) => handleToolbarAction(e, 'insertUnorderedList')} className={toolbarBtnClass} title="Liste"><List size={18} /></button>
        <button onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'blockquote')} className={toolbarBtnClass} title="Citation"><Quote size={18} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button onMouseDown={triggerImageUpload} className={toolbarBtnClass} title="Insérer une image"><ImageIcon size={18} /></button>
      </div>

      {/* Editor Area */}
      {/* We add specific classes for h1 and h2 to ensure they appear distinct in the editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning={true}
        className="w-full p-6 focus:outline-none prose prose-slate max-w-none prose-h1:text-4xl prose-h1:font-black prose-h2:text-3xl prose-h2:font-bold prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-lg"
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