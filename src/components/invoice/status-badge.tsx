import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/types/invoice';

interface StatusBadgeProps {
  status: InvoiceStatus | string;
  dueDate?: string | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, dueDate }) => {
  // PRD Section 3.3: Effective status computation
  let effectiveStatus: string = status;
  if (status !== 'paid' && status !== 'draft' && dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) {
      effectiveStatus = 'overdue';
    }
  }

  switch (effectiveStatus.toLowerCase()) {
    case 'paid':
      return <Badge variant="success">Paid</Badge>;
    case 'overdue':
      return <Badge variant="danger">Overdue</Badge>;
    case 'sent':
      return <Badge variant="info">Sent</Badge>;
    case 'draft':
    default:
      return <Badge variant="default">Draft</Badge>;
  }
};
