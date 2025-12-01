import type { SVGProps } from 'react';
import { MessageSquare } from 'lucide-react';

const Logo = (props: SVGProps<SVGSVGElement>) => (
    <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div className="text-right">
            <div className="font-bold text-primary text-lg leading-tight">Ronza Chat</div>
            <div className="text-sm text-muted-foreground leading-tight">Rooms</div>
        </div>
    </div>
);
export default Logo;
