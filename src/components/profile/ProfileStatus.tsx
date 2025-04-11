
import { ReactNode } from "react";
import { CircleCheck, CircleSlash, CircleAlert, CircleX } from "lucide-react";
import { UserStatus } from "@/services/user";

interface ProfileStatusProps {
  status: UserStatus;
  onClick?: () => void;
  showTooltip?: boolean;
  className?: string;
}

export const availabilityIcons: Record<UserStatus, ReactNode> = {
  online: <CircleCheck className="w-6 h-6 text-green-500" />,
  busy: <CircleSlash className="w-6 h-6 text-red-500" />,
  away: <CircleAlert className="w-6 h-6 text-yellow-500" />,
  offline: <CircleX className="w-6 h-6 text-gray-500" />
};

export const availabilityLabels: Record<UserStatus, string> = {
  online: 'Online',
  busy: 'Busy',
  away: 'Away',
  offline: 'Offline'
};

export const ProfileStatus = ({ status, onClick, showTooltip = true, className = "" }: ProfileStatusProps) => {
  return (
    <button 
      onClick={onClick}
      className={`p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform ${className}`}
      title={showTooltip ? `Current status: ${availabilityLabels[status] || status}` : undefined}
    >
      {availabilityIcons[status] || availabilityIcons.offline}
    </button>
  );
};
