import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Hero() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleViewDemo = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-br from-primary/5 to-blue-100/50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Take Control of Your
              <span className="text-primary"> Financial Future</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              All-in-one financial tracker that manages your retirement accounts, spending, investments, and provides AI-powered insights to optimize your financial health.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
                size="lg"
              >
                Start Free Trial
              </Button>
              <Button 
                onClick={handleViewDemo}
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary/5 px-8 py-4 text-lg"
                size="lg"
              >
                View Demo
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Bank-level security
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                AI-powered insights
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Real-time tracking
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Financial dashboard interface showing charts and account summaries" 
              className="rounded-xl shadow-2xl w-full h-auto" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
