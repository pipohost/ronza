import {
  MessageSquare,
  Mic,
  Video,
  Users,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    icon: <div className="bg-sky-gradient p-3 rounded-full"><Mic className="h-6 w-6 text-white" /></div>,
    title: 'Crystal Clear Voice Chat',
    description: 'High-quality, low-latency voice communication powered by WebRTC.',
  },
  {
    icon: <div className="bg-sky-gradient p-3 rounded-full"><Video className="h-6 w-6 text-white" /></div>,
    title: 'HD Video Streaming',
    description: 'Engage face-to-face with smooth HD video streams.',
  },
  {
    icon: <div className="bg-sky-gradient p-3 rounded-full"><MessageSquare className="h-6 w-6 text-white" /></div>,
    title: 'Instant Text Messaging',
    description: 'Fast and reliable real-time text chat with rich formatting options.',
  },
  {
    icon: <div className="bg-sky-gradient p-3 rounded-full"><Users className="h-6 w-6 text-white" /></div>,
    title: 'Role-Based Permissions',
    description: 'Powerful admin controls with roles like Super Admin, Admin, and more.',
  },
  {
    icon: <div className="bg-sky-gradient p-3 rounded-full"><ShieldCheck className="h-6 w-6 text-white" /></div>,
    title: 'Advanced Security',
    description: 'Manage your community with IP-based blocking and advanced moderation tools.',
  },
  {
    icon: <div className="bg-sky-gradient p-3 rounded-full"><Palette className="h-6 w-6 text-white" /></div>,
    title: 'Full Customization',
    description: 'Personalize your rooms with unique names, colors, and welcome messages.',
  },
];

export default function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything You Need to Connect
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform is packed with features designed to create the best possible chat experience for you and your community.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-col items-start gap-4">
                {feature.icon}
                <div className="grid gap-1">
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
