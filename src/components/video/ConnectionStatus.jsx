import React from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, User } from "lucide-react";

export default function ConnectionStatus({ status, guestName }) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <Badge className={getStatusColor()}>
        <Wifi className="w-3 h-3 mr-1" />
        {status}
      </Badge>
      {guestName && (
        <Badge variant="outline" className="bg-white/90">
          <User className="w-3 h-3 mr-1" />
          {guestName}
        </Badge>
      )}
    </div>
  );
}