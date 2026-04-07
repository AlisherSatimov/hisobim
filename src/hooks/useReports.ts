import { useQuery } from '@tanstack/react-query';
import { fetchReports } from '../services/reports.service';

export function useReports(shopId: string) {
  return useQuery({
    queryKey: ['reports', shopId],
    queryFn: () => fetchReports(shopId),
    enabled: !!shopId,
    staleTime: 1000 * 30,
  });
}
