"use client";

import { useEffect, useRef, useState } from 'react';
import { Input as AntInput } from 'antd';
import { Button } from '@/components/ui/button';
import { attachLoading } from '@/utils/helper';

interface Props {
  question: string;
  isProcessing: boolean;
  onAsk: (value: string) => Promise<void>;
  inputProps: {
    placeholder?: string;
  };
}

export default function PromptInput(props: Props) {
  const { onAsk, isProcessing, question, inputProps } = props;
  const $promptInput = useRef<any>(null);
  const [inputValue, setInputValue] = useState('');
  const [innerLoading, setInnerLoading] = useState(false);

  useEffect(() => {
    if (question) setInputValue(question);
  }, [question]);

  useEffect(() => {
    if (!isProcessing) {
      $promptInput.current?.focus?.();
      setInputValue('');
    }
  }, [isProcessing]);

  const handleAsk = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    const startAsking = attachLoading(onAsk, setInnerLoading);
    startAsking(trimmedValue);
  };

  const inputEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.shiftKey) return;
    event.preventDefault();
    handleAsk();
  };

  const isDisabled = innerLoading || isProcessing;

  return (
    <div className="flex items-start">
      <AntInput.TextArea
        ref={$promptInput}
        data-gramm="false"
        autoSize
        value={inputValue}
        onInput={(e: any) => setInputValue(e.target.value)}
        onPressEnter={inputEnter}
        disabled={isDisabled}
        placeholder={inputProps?.placeholder}
      />
      <Button className="ml-3 min-w-[72px]" size="lg" onClick={handleAsk} disabled={isDisabled}>
        Ask
      </Button>
    </div>
  );
}











