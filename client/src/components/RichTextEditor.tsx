import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from "lucide-react";

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
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 border-b pb-2">
        <select className="text-sm px-2 py-1 border rounded-md" defaultValue="normal">
          <option value="normal">Normal</option>
          <option value="heading">Heading</option>
        </select>
        <div className="h-6 w-px bg-border mx-2" />
        <Button size="icon" variant="ghost" className="h-8 w-8" data-testid="button-bold">
          <Bold className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" data-testid="button-italic">
          <Italic className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" data-testid="button-underline">
          <span className="font-bold underline">U</span>
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" data-testid="button-link">
          <LinkIcon className="w-4 h-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-2" />
        <Button size="icon" variant="ghost" className="h-8 w-8" data-testid="button-bullets">
          <List className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" data-testid="button-numbered">
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>
      <Textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`resize-none ${minHeight}`}
        data-testid="textarea-rich-editor"
      />
    </div>
  );
}
