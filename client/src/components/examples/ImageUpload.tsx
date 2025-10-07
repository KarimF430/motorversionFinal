import { useState } from 'react';
import ImageUpload from '../ImageUpload';

export default function ImageUploadExample() {
  const [caption, setCaption] = useState('');

  return (
    <div className="p-6 max-w-md">
      <ImageUpload 
        caption={caption}
        onCaptionChange={setCaption}
        onDelete={() => console.log('Delete image')}
        onEdit={() => console.log('Edit image')}
      />
    </div>
  );
}
