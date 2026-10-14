import { useRouter } from 'expo-router';

import { EmptyState, Screen } from '@/components/ui';
import { t } from '@/i18n/ar';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen>
      <EmptyState
        emoji="🧭"
        title={t.common.notFound}
        actionLabel={t.common.goHome}
        onAction={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}
