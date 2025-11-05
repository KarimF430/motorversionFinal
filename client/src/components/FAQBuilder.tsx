import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQBuilderProps {
  items?: FAQItem[];
  onChange?: (items: FAQItem[]) => void;
}

export default function FAQBuilder({ items = [], onChange }: FAQBuilderProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>(items.length > 0 ? items : [
    { id: '1', question: '', answer: '' }
  ]);

  // Sync with parent when items change
  useEffect(() => {
    if (items.length > 0) {
      setFaqs(items);
    }
  }, [items]);

  const addFAQ = () => {
    const newFaqs = [...faqs, { id: Date.now().toString(), question: '', answer: '' }];
    setFaqs(newFaqs);
    onChange?.(newFaqs);
    console.log('Added new FAQ');
  };

  const removeFAQ = (id: string) => {
    const newFaqs = faqs.filter(faq => faq.id !== id);
    setFaqs(newFaqs);
    onChange?.(newFaqs);
    console.log('Removed FAQ:', id);
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    const newFaqs = faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    );
    setFaqs(newFaqs);
    onChange?.(newFaqs);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={faq.id} className="space-y-3 p-4 border rounded-lg" data-testid={`faq-item-${index}`}>
          <div className="flex items-center gap-2">
            <Input
              placeholder={`Q${index + 1}. Add FAQ`}
              value={faq.question}
              onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
              data-testid={`input-faq-question-${index}`}
            />
            {faqs.length > 1 && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeFAQ(faq.id)}
                data-testid={`button-remove-faq-${index}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Input
            placeholder={`Ans${index + 1}. Add FAQ`}
            value={faq.answer}
            onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
            data-testid={`input-faq-answer-${index}`}
          />
        </div>
      ))}
      <Button 
        type="button"
        variant="outline" 
        className="w-full" 
        onClick={addFAQ}
        data-testid="button-add-faq"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add more FAQ
      </Button>
    </div>
  );
}
