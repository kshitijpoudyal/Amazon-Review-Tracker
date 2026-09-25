import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import { VendorVoidMetric } from '../../utils/dashboardMetrics';
import { typography } from '../../utils/typography';
import { getStatsColor } from '../../utils/colors';
import { ChartCard } from './ChartCard';

interface VendorVoidChartProps {
  metrics: VendorVoidMetric[];
}

function truncateName(name: string, max = 14): string {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

export const VendorVoidChart: React.FC<VendorVoidChartProps> = ({ metrics }) => {
  const withVoid = metrics.filter((v) => v.voidCount > 0);
  const chartData = withVoid.map((v) => ({
    name: truncateName(v.vendorName),
    fullName: v.vendorName,
    voidPaid: v.voidPaidTotal,
    voidCount: v.voidCount,
  }));

  return (
    <ChartCard
      title="Void by vendor"
      subtitle="Paid amount written off on void products"
    >
      {chartData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-[#74777f] text-sm">
          No void products yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 36)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e2dd" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#74777f' }}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 11, fill: '#74777f' }}
            />
            <Tooltip
              formatter={(value, name) => {
                const num = typeof value === 'number' ? value : 0;
                return [
                  name === 'voidPaid' ? formatCurrency(num) : num,
                  name === 'voidPaid' ? 'Void $' : 'Void count',
                ];
              }}
              labelFormatter={(_, payload) =>
                (payload?.[0]?.payload as { fullName?: string } | undefined)?.fullName ?? ''
              }
            />
            <Bar dataKey="voidPaid" name="voidPaid" fill="#74777f" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {metrics.length > 0 && (
        <div className="mt-4 overflow-x-auto -mx-1">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className={`${typography.captionStrong} border-b border-[#e4e2dd]`}>
                <th className="py-2 pr-3 font-medium">Vendor</th>
                <th className="py-2 pr-3 font-medium text-right">Products</th>
                <th className="py-2 pr-3 font-medium text-right">Void</th>
                <th className="py-2 pr-3 font-medium text-right">Void $</th>
                <th className="py-2 pr-3 font-medium text-right">Void %</th>
                <th className="py-2 font-medium text-right">Net Δ</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((v) => (
                <tr key={v.vendorId} className={`${typography.caption} border-b border-[#f0eeea]`}>
                  <td className="py-2 pr-3">{v.vendorName}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{v.totalProducts}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{v.voidCount}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">
                    {formatCurrency(v.voidPaidTotal)}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">
                    {(v.voidRate * 100).toFixed(0)}%
                  </td>
                  <td
                    className={`py-2 text-right tabular-nums ${getStatsColor('netDelta', v.netDelta)}`}
                  >
                    {formatCurrency(v.netDelta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
};
