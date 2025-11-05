import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter text...",
  minHeight = "min-h-32"
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + textToInsert + value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleBulletPoints = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    
    // Check if we're at the start of a line
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLine = beforeCursor.substring(lastNewline + 1);
    
    if (currentLine.trim() === '') {
      // Insert bullet point at beginning of empty line
      insertAtCursor('• ');
    } else {
      // Insert bullet point at beginning of new line
      insertAtCursor('\n• ');
    }
  };

  const handleNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    
    // Count existing numbered items to get next number
    const numberedItems = beforeCursor.match(/^\d+\. /gm) || [];
    const nextNumber = numberedItems.length + 1;
    
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLine = beforeCursor.substring(lastNewline + 1);
    
    if (currentLine.trim() === '') {
      insertAtCursor(`${nextNumber}. `);
    } else {
      insertAtCursor(`\n${nextNumber}. `);
    }
  };

  const wrapSelectedText = (wrapper: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      const newValue = value.substring(0, start) + `${wrapper}${selectedText}${wrapper}` + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + wrapper.length, end + wrapper.length);
      }, 0);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 border-b pb-2">
        <select className="text-sm px-2 py-1 border rounded-md" defaultValue="normal">
          <option value="normal">Normal</option>
          <option value="heading">Heading</option>
        </select>
        <div className="h-6 w-px bg-border mx-2" />
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8" 
          data-testid="button-bold"
          onClick={(e) => {
            e.preventDefault();
            wrapSelectedText('**');
          }}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8" 
          data-testid="button-italic"
          onClick={(e) => {
            e.preventDefault();
            wrapSelectedText('*');
          }}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8" 
          data-testid="button-underline"
          onClick={(e) => {
            e.preventDefault();
            wrapSelectedText('_');
          }}
        >
          <span className="font-bold underline">U</span>
        </Button>
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8" 
          data-testid="button-link"
          onClick={(e) => {
            e.preventDefault();
            wrapSelectedText('[](url)');
          }}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-2" />
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8" 
          data-testid="button-bullets"
          onClick={(e) => {
            e.preventDefault();
            handleBulletPoints();
          }}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8" 
          data-testid="button-numbered"
          onClick={(e) => {
            e.preventDefault();
            handleNumberedList();
          }}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>
      <Textarea 
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`resize-none ${minHeight}`}
        data-testid="textarea-rich-editor"
      />
    </div>
  );
}
