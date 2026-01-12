import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { FileText, Mail, Handshake, ShieldCheck, Zap } from "lucide-react";

export default function HowItWorks() {
  const data = [
    {
      title: "Step 01",
      content: (
        <div>
          <h4 className="text-2xl md:text-3xl font-black uppercase text-foreground mb-4">Post your Request</h4>
          <p className="text-muted-foreground text-sm md:text-base font-medium mb-8">
            Tell us exactly what you need. Whether it's a leaky faucet or a full home renovation, 
            our intelligent matching system analyzes your job to find the perfect professional.
          </p>
          <div className="flex items-center gap-4 bg-muted/50 p-6 rounded-[2rem] border border-border">
            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="text-white h-6 w-6" />
            </div>
            <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Simple & Fast</p>
                <p className="text-sm font-bold text-foreground">Post in under 60 seconds</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 02",
      content: (
        <div>
          <h4 className="text-2xl md:text-3xl font-black uppercase text-foreground mb-4">Receive & Compare</h4>
          <p className="text-muted-foreground text-sm md:text-base font-medium mb-8">
            Get multiple quotes from vetted experts. Check their profiles, verified reviews, 
            and historical performance. You are in full control of who you invite into your home.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-muted/50 p-6 rounded-[2rem] border border-border">
                <Mail className="text-blue-600 h-6 w-6 mb-3" />
                <p className="text-sm font-bold text-foreground">Instant Quotes</p>
                <p className="text-xs text-muted-foreground mt-1">Real-time price estimates</p>
             </div>
             <div className="bg-muted/50 p-6 rounded-[2rem] border border-border">
                <Zap className="text-amber-500 h-6 w-6 mb-3" />
                <p className="text-sm font-bold text-foreground">Top Rated Pros</p>
                <p className="text-xs text-muted-foreground mt-1">Only the best for you</p>
             </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 03",
      content: (
        <div>
          <h4 className="text-2xl md:text-3xl font-black uppercase text-foreground mb-4">Secure & Finish</h4>
          <p className="text-muted-foreground text-sm md:text-base font-medium mb-8">
            Once the work is done, release payment using our unique secure code system. 
            No more chasing pros or worrying about incomplete work. Quality is guaranteed.
          </p>
          <div className="bg-blue-600/10 border border-blue-600/20 p-8 rounded-[2.5rem] relative overflow-hidden">
            <ShieldCheck className="absolute -right-8 -bottom-8 h-32 w-32 text-blue-600/10" />
            <p className="text-xl font-black text-blue-600 uppercase italic mb-2 tracking-tighter">Secure Code System</p>
            <p className="text-sm font-medium text-foreground max-w-xs">
                Payment is only released when you provide the completion code. Complete peace of mind.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-background overflow-hidden">
      <Timeline data={data} />
    </section>
  );
}