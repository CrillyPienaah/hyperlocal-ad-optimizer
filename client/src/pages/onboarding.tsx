import { useState } from "react";
import BusinessDetails from "@/components/onboarding/business-details";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState(null);

  const handleBusinessDetailsNext = (data: any) => {
    setBusinessData(data);
    setCurrentStep(2);
    // For now, redirect to dashboard after step 1
    // Later we can add more onboarding steps
    setLocation("/");
  };

  const handleSkip = () => {
    setLocation("/");
  };

  switch (currentStep) {
    case 1:
      return (
        <BusinessDetails 
          onNext={handleBusinessDetailsNext}
          onSkip={handleSkip}
        />
      );
    
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Onboarding Complete</h1>
            <p className="text-gray-600 mb-6">Your business profile has been set up successfully.</p>
            <button 
              onClick={() => setLocation("/")}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
  }
}