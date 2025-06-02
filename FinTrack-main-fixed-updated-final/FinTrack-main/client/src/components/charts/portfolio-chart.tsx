import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const portfolioData = [
  { month: 'Jan', value: 580000 },
  { month: 'Feb', value: 592000 },
  { month: 'Mar', value: 575000 },
  { month: 'Apr', value: 610000 },
  { month: 'May', value: 635000 },
  { month: 'Jun', value: 620000 },
  { month: 'Jul', value: 645000 },
  { month: 'Aug', value: 630000 },
  { month: 'Sep', value: 655000 },
  { month: 'Oct', value: 670000 },
  { month: 'Nov', value: 685000 },
  { month: 'Dec', value: 623847 },
];

export default function PortfolioChart() {
  const formatCurrency = (value: number) => {
    return `$${(value / 1000)}k`;
  };

  return (
    <Card className="chart-container">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Portfolio Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={portfolioData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value),
                'Portfolio Value'
              ]}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
