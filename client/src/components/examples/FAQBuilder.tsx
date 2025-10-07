import FAQBuilder from '../FAQBuilder';

export default function FAQBuilderExample() {
  return (
    <div className="p-6 max-w-2xl">
      <FAQBuilder onChange={(items) => console.log('FAQs updated:', items)} />
    </div>
  );
}
