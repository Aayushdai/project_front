import { Gem, Clock, X } from "lucide-react";
import { Link } from "react-router-dom";

const KYC_STATUS_CONFIG = {
  rejected: {
    icon: X,
    label: "Verification Rejected",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    labelColor: "text-red-300",
    textColor: "text-red-200/60",
    defaultMessage: "Your KYC was rejected. Please resubmit.",
    buttonLabel: "Resubmit",
    buttonColor: "bg-[#C9A84C] hover:bg-[#e8c96d]"
  },
  pending: {
    icon: Clock,
    label: "Verification Pending",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
    labelColor: "text-amber-300",
    textColor: "text-amber-200/60",
    message: "Your KYC is under review. You can still use features while we verify.",
    buttonLabel: "View",
    buttonColor: "bg-[#C9A84C] hover:bg-[#e8c96d]"
  },
  not_submitted: {
    icon: Gem,
    label: "Register KYC to Get Full Access",
    bgColor: "bg-[#C9A84C]/8",
    borderColor: "border-[#C9A84C]/30",
    iconColor: "text-[#C9A84C]",
    labelColor: "text-[#C9A84C]",
    textColor: "text-white/50",
    message: "Complete KYC verification to unlock premium features.",
    buttonLabel: "Register",
    buttonColor: "bg-[#C9A84C] hover:bg-[#e8c96d]"
  }
};

export default function KYCBanner({ status, rejectionReason }) {
  if (status === 'approved') return null;

  const config = KYC_STATUS_CONFIG[status] || KYC_STATUS_CONFIG.not_submitted;
  const Icon = config.icon;
  const message = status === 'rejected' && rejectionReason 
    ? `Rejected: ${rejectionReason}. Please resubmit your KYC.`
    : config.defaultMessage || config.message;

  return (
    <div className={`rounded-xl border-2 p-4 overflow-hidden transition-all ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 flex-shrink-0 ${config.iconColor}`} />
            <p className={`text-[12px] font-semibold ${config.labelColor}`}>
              {config.label}
            </p>
          </div>
          <p className={`text-[11px] ${config.textColor}`}>
            {message}
          </p>
        </div>
        <Link to="/kyc"
          className={`px-3 py-1.5 rounded-lg text-black font-semibold text-[11px] transition whitespace-nowrap flex-shrink-0 ${config.buttonColor}`}>
          {config.buttonLabel}
        </Link>
      </div>
    </div>
  );
}
