import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function Pricing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const plans = [
    {
      name: "Basic",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Up to 3 bank accounts",
        "Basic spending tracking", 
        "Monthly financial reports",
        "Mobile app access"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For serious financial planning",
      features: [
        "Unlimited bank accounts",
        "Investment tracking",
        "Retirement planning tools",
        "AI-powered insights",
        "Weekly reports & alerts",
        "Goal tracking"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Premium",
      price: "$39", 
      period: "/month",
      description: "Advanced financial management",
      features: [
        "Everything in Pro",
        "Tax optimization tools",
        "Advanced AI analytics",
        "Personal financial advisor",
        "Custom reporting",
        "Priority support"
      ],
      cta: "Upgrade to Premium",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground">Start free and upgrade as your financial complexity grows</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-2 border-primary shadow-xl' : 'border border-border shadow-lg'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-foreground mb-2">
                  {plan.price}<span className="text-lg text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={handleGetStarted}
                  className={`w-full py-3 font-semibold ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90 text-white' 
                      : 'border-2 border-primary text-primary hover:bg-primary/5'
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
