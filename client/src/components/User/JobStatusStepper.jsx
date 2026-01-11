import React from 'react';
import { 
  Briefcase, 
  Handshake, 
  Hammer, 
  ShieldCheck, 
  Star,
  Check
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Map your backend status strings to Step Numbers
const getActiveStep = (status) => {
  switch (status) {
    case 'open': return 0;
    case 'assigned': return 1;
    case 'in_progress': return 2;
    case 'pending_verification': return 3; // Or 'paid' depending on backend
    case 'completed': return 4;
    default: return 0;
  }
};

const steps = [
  { label: 'Job Posted', icon: Briefcase },
  { label: 'Worker Assigned', icon: Handshake },
  { label: 'Work In Progress', icon: Hammer },
  { label: 'Verify Code', icon: ShieldCheck },
  { label: 'Completed', icon: Star },
];

const JobStatusStepper = ({ currentStatus }) => {
  const activeStep = getActiveStep(currentStatus);

  return (
    <div className="w-full mb-8 mt-4">
      
      {/* --- Stepper UI --- */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center w-full">
        
        {/* Background Progress Line (Desktop Only) */}
        <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 -z-10 hidden md:block rounded-full"></div>
        <div 
          className="absolute top-5 left-0 h-1 bg-green-500 -z-10 hidden md:block rounded-full transition-all duration-500"
          style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex md:flex-col items-center gap-4 md:gap-2 w-full md:w-auto mb-6 md:mb-0 relative">
              
              {/* Vertical Line for Mobile */}
              {index !== steps.length - 1 && (
                 <div className={cn(
                    "absolute left-5 top-10 w-0.5 h-12 md:hidden -z-10",
                    isCompleted ? "bg-green-500" : "bg-slate-200"
                 )} />
              )}

              {/* Circle Icon */}
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 z-10 bg-white",
                isCompleted ? "border-green-500 bg-green-500 text-white" : 
                isActive ? "border-blue-600 text-blue-600 ring-4 ring-blue-50" : 
                "border-slate-300 text-slate-400"
              )}>
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>

              {/* Label */}
              <span className={cn(
                "text-sm font-medium transition-colors duration-300",
                isActive ? "text-blue-700 font-bold" : 
                isCompleted ? "text-green-600" : "text-slate-500"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* --- Helper Text Box --- */}
      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center shadow-sm">
        <p className="text-sm text-slate-600">
          <span className="font-bold text-slate-800">Next Step:</span> 
          {activeStep === 0 && " Wait for tradespeople to send proposals."}
          {activeStep === 1 && " You have accepted a worker. Wait for them to arrive."}
          {activeStep === 2 && " Work is currently happening."}
          {activeStep === 3 && " Check the work, then share the Secret Code to finish."}
          {activeStep === 4 && " Job done! Leave a review."}
        </p>
      </div>
    </div>
  );
};

export default JobStatusStepper;