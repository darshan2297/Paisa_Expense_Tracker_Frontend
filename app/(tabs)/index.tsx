import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ComingUpCard,
  GoalProgressCard,
  RecentActivityCard,
} from '@/components/dashboard/ActivityPanels';
import { BudgetAlertBanner } from '@/components/dashboard/BudgetAlertBanner';
import { LifeMetricsGrid } from '@/components/dashboard/LifeMetricsGrid';
import { NetWorthHero } from '@/components/dashboard/NetWorthHero';
import { SpendingForecastCard } from '@/components/dashboard/SpendingForecastCard';
import { DesignGridLead } from '@/components/design/DesignGrid';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { emptyLifeDashboard } from '@/features/dashboard/mapLifeDashboard';
import { useLifeDashboard } from '@/features/dashboard/hooks';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { currentYearMonth } from '@/utils/date';

/** Design HTML `isLife` — Life Dashboard. */
export default function LifeDashboardScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [alertDismissed, setAlertDismissed] = useState(false);
  const { data: dashboardData } = useLifeDashboard(month);
  const data = dashboardData ?? emptyLifeDashboard(month);
  const { isMobile } = useResponsiveLayout();
  const showAlert = data.showBudgetAlert && !alertDismissed;

  return (
    <ScreenScaffold
      month={month}
      onMonthChange={setMonth}
      headerExtra={
        showAlert ? (
          <BudgetAlertBanner
            title={data.alertTitle}
            body={data.alertBody}
            onAdjust={() => router.push('/(tabs)/planned')}
            onDismiss={() => setAlertDismissed(true)}
          />
        ) : null
      }
    >
      <DesignGridLead
        stackOnMobile={isMobile}
        lead={
          <NetWorthHero
            netWorth={data.netWorth}
            delta={data.netWorthDelta}
            deltaPositive={data.netWorthDeltaPositive}
            parts={data.nwParts}
          />
        }
        side={<SpendingForecastCard month={month} forecast={data.forecast} />}
      />

      <LifeMetricsGrid tiles={data.lifeTiles} />

      <DesignGridLead
        stackOnMobile={isMobile}
        lead={
          <View style={styles.recentCol}>
            <RecentActivityCard items={data.recent} />
          </View>
        }
        side={
          <View style={styles.sideStack}>
            <ComingUpCard items={data.upcoming} windowLabel="next 15 days" />
            <GoalProgressCard goals={data.goals} />
          </View>
        }
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  recentCol: { flex: 1, minWidth: 0 },
  sideStack: { gap: 14 },
});
