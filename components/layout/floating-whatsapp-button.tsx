
'use client';

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Mail, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
      >
        <path d="M16.75 13.96c.25.13.43.2.5.33.07.13.07.55-.02.98-.09.43-.55.83-1.13 1.05-.58.22-1.13.3-1.98.18-.85-.13-2.08-.5-3.33-1.33-1.25-.83-2.2-1.85-2.9-2.93-.7-.95-1.13-2.05-1.13-3.15 0-1.1.48-1.95 1.13-2.6.65-.65 1.5-.98 2.6-.98.25 0 .5.03.75.08.43.1.7.63.78 1.05.08.43.05.85-.03 1.13-.08.28-.2.53-.35.7-.15.18-.3.35-.5.65l-.33.33c-.08.08-.13.18-.1.3.03.13.25.55.65 1.13.4.58.95 1.13 1.63 1.6.68.48 1.13.7 1.35.73.18.03.3-.03.4-.13l.33-.33c.2-.2.4-.33.6-.45.2-.13.4-.18.58-.18.2 0 .43.05.6.13zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/>
      </svg>
    )
}
  
export default function FloatingWhatsappButton() {
  const whatsappNumber = "+972533039834";
  const email = "pipohost@gmail.com";
  const message = "Hello, I'm interested in Ronza Chat Rooms.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
                "fixed bottom-6 right-6 h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg text-white animate-pulse-whatsapp",
                isOpen && "animate-none"
            )}
            aria-label="Contact support"
          >
            {isOpen ? <X className="h-8 w-8" /> : <WhatsAppIcon className="h-8 w-8" />}
          </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4 mb-2" side="top" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Contact Us</h4>
            <p className="text-sm text-muted-foreground">
              We're here to help. Choose a contact method below.
            </p>
          </div>
          <div className="grid gap-2">
            <Button asChild variant="outline">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-start gap-3">
                <WhatsAppIcon className="h-6 w-6 text-green-500" />
                WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
               <a href={`mailto:${email}`} className="flex items-center justify-start gap-3">
                 <Mail className="h-6 w-6 text-muted-foreground" />
                 {email}
               </a>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
