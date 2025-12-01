'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps extends ButtonProps {
  isSubmitting: boolean;
}

export function SubmitButton({ children, isSubmitting, ...props }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting} {...props}>
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
