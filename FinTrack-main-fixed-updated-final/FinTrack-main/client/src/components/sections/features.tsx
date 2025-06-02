import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Building, 
  PiggyBank, 
  Bot, 
  ArrowLeftRight, 
  Shield 
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <TrendingUp className="text-primary text-xl" />,
      title: "Investment Tracking",
      description: "Monitor your portfolio performance, track gains/losses, and analyze investment trends with real-time data."
    },
    {
      icon: <Building className="text-primary text-xl" />,
      title: "Bank Account Integration", 
      description: "Connect all your bank accounts and credit cards to get a complete view of your financial picture."
    },
    {
      icon: <PiggyBank className="text-primary text-xl" />,
      title: "Retirement Planning",
      description: "Track 401(k), IRA, and other retirement accounts with projections for your future financial security."
    },
    {
      icon: <Bot className="text-primary text-xl" />,
      title: "AI Financial Insights",
      description: "Get personalized recommendations and insights powered by advanced AI to optimize your financial decisions."
    },
    {
      icon: <ArrowLeftRight className="text-primary text-xl" />,
      title: "Cash Flow Analysis",
      description: "Track income and expenses with detailed categorization and spending pattern analysis."
    },
    {
      icon: <Shield className="text-primary text-xl" />,
      title: "Bank-Level Security",
      description: "Your financial data is protected with 256-bit encryption and industry-leading security measures."
    }
  ];

  return (
    <section id="features" className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Complete Financial Management</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to track, analyze, and optimize your financial life in one powerful platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-muted/50 hover:bg-muted/70 transition-colors">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
