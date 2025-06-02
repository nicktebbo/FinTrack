import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Target, AlertCircle } from "lucide-react";
import type { Insight } from "@shared/schema";

interface AIInsightsProps {
  insights: Insight[];
}

export default function AIInsights({ insights }: AIInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending_alert':
        return <AlertCircle className="w-4 h-4" />;
      case 'investment_opportunity':
        return <TrendingUp className="w-4 h-4" />;
      case 'goal_progress':
        return <Target className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-600';
    if (priority === 'medium') return 'bg-amber-100 text-amber-600';
    
    switch (type) {
      case 'spending_alert':
        return 'bg-red-100 text-red-600';
      case 'investment_opportunity':
        return 'bg-green-100 text-green-600';
      case 'goal_progress':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  // Mock insights if none exist
  const displayInsights = insights.length > 0 ? insights.slice(0, 3) : [
    {
      id: 1,
      type: 'spending_alert',
      title: 'Spending Alert',
      description: "You've spent 23% more on dining this month compared to your average.",
      priority: 'medium',
      isRead: false,
      createdAt: new Date(),
      userId: ''
    },
    {
      id: 2,
      type: 'investment_opportunity',
      title: 'Investment Opportunity',
      description: 'Consider increasing your retirement contribution by $200/month to maximize tax benefits.',
      priority: 'low',
      isRead: false,
      createdAt: new Date(),
      userId: ''
    },
    {
      id: 3,
      type: 'goal_progress',
      title: 'Goal Progress',
      description: "You're 78% on track to reach your emergency fund goal of $50,000.",
      priority: 'low',
      isRead: false,
      createdAt: new Date(),
      userId: ''
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayInsights.map((insight) => (
            <div key={insight.id} className="flex items-start">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 ${getInsightColor(insight.type, insight.priority)}`}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{insight.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
