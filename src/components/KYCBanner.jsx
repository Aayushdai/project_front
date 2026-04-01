import { Gem, Clock, X } from "lucide-react";
import { Link } from "react-router-dom";

const FONTS = {
  display: "Playfair Display, Georgia, serif",
  body: "DM Sans, system-ui, sans-serif",
  mono: "DM Mono, monospace",
};

export default function KYCBanner({ status, rejectionReason }) {
  // Only show banner if KYC is not approved
  if (status === 'approved') return null;

  return (
    <div className={`rounded-xl border-2 p-4 overflow-hidden transition-all ${
      status === 'rejected'
        ? 'bg-red-500/10 border-red-500/30'
        : status === 'pending'
        ? 'bg-amber-500/10 border-amber-500/30'
        : 'bg-[#C9A84C]/8 border-[#C9A84C]/30'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {status === 'rejected' ? (
              <>
                <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p style={{ fontFamily: FONTS.body }} className="text-[12px] font-semibold text-red-300">
                  Verification Rejected
                </p>
              </>
            ) : status === 'pending' ? (
              <>
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p style={{ fontFamily: FONTS.body }} className="text-[12px] font-semibold text-amber-300">
                  Verification Pending
                </p>
              </>
            ) : (
              <>
                <Gem className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                <p style={{ fontFamily: FONTS.body }} className="text-[12px] font-semibold text-[#C9A84C]">
                  Register KYC to Get Full Access
                </p>
              </>
            )}
          </div>
          <p style={{ fontFamily: FONTS.body }} className={`text-[11px] ${
            status === 'rejected'
              ? 'text-red-200/60'
              : status === 'pending'
              ? 'text-amber-200/60'
              : 'text-white/50'
          }`}>
            {status === 'rejected'
              ? rejectionReason ? `Rejected: ${rejectionReason}. Please resubmit your KYC.` : 'Your KYC was rejected. Please resubmit.'
              : status === 'pending'
              ? 'Your KYC is under review. You can still use features while we verify.'
              : 'Complete KYC verification to unlock premium features.'}
          </p>
        </div>
        <Link to="/kyc" style={{ fontFamily: FONTS.body }}
          className="px-3 py-1.5 rounded-lg bg-[#C9A84C] text-black font-semibold text-[11px] hover:bg-[#e8c96d] transition whitespace-nowrap flex-shrink-0">
          {status === 'rejected' ? 'Resubmit' : status === 'pending' ? 'View' : 'Register'}
        </Link>
      </div>
    </div>
  );
}
