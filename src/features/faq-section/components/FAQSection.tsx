import { SectionShell, SectionHeader } from '@shared/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/components/ui/accordion';
import { FAQSectionBlock } from '../types';

interface FAQSectionProps {
  block: FAQSectionBlock;
}

export default function FAQSection({ block }: FAQSectionProps) {
  return (
    <SectionShell background={block.background} dataTestId="faq-section">
      <div className="container mx-auto max-w-3xl">
        {block.heading && (
          <SectionHeader
            heading={block.heading}
            className="mx-auto mb-12 max-w-2xl text-center"
          />
        )}
        {block.items?.length ? (
          <Accordion type="single" collapsible className="w-full">
            {block.items.map((item, index) => (
              <AccordionItem
                key={item._key ?? index}
                value={item._key ?? `faq-${index}`}
                data-testid="faq-item"
              >
                <AccordionTrigger className="text-foreground text-left text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : null}
      </div>
    </SectionShell>
  );
}
