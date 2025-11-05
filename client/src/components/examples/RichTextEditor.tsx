import { useState } from 'react';
import RichTextEditor from '../RichTextEditor';

export default function RichTextEditorExample() {
  const [value, setValue] = useState('');

  return (
    <div className="p-6 max-w-2xl">
      <RichTextEditor value={value} onChange={setValue} placeholder="Enter your content here..." />
    </div>
  );
}
