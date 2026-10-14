import { Badge } from './ui';
import { t } from '@/i18n/ar';
import type { OrderStatus } from '@/types';

const toneByStatus: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'danger'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  on_the_way: 'primary',
  delivered: 'success',
  cancelled: 'danger',
};

export function OrderStatusBadge({ status, size = 'sm' }: { status: OrderStatus; size?: 'sm' | 'md' }) {
  return <Badge label={t.tracking.statusLabel[status]} tone={toneByStatus[status]} size={size} />;
}
