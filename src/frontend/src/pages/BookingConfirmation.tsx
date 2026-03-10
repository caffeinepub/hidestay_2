import { Button } from "@/components/ui/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CalendarCheck, CheckCircle2, MapPin, User } from "lucide-react";
import { motion } from "motion/react";

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/confirmation" });

  const bookingId = search.bookingId ?? "";
  const stayName = search.stayName ?? "";
  const location = search.location ?? "";
  const checkin = search.checkin ?? "";
  const checkout = search.checkout ?? "";
  const guestName = search.guestName ?? "";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Success Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
          {/* Top accent */}
          <div className="bg-primary px-6 pt-10 pb-8 flex flex-col items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                delay: 0.2,
              }}
              className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="font-display font-black text-white text-3xl text-center"
            >
              Booking Confirmed!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="font-body text-white/85 text-base font-semibold tracking-wide uppercase"
            >
              Pay at Hotel
            </motion.p>
          </div>

          {/* Booking ID strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-primary/8 border-b border-primary/15 px-6 py-4 flex flex-col items-center gap-1"
          >
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest">
              Booking ID
            </p>
            <p
              data-ocid="confirmation.booking_id.card"
              className="font-display font-black text-primary text-xl tracking-widest"
            >
              {bookingId}
            </p>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="px-6 py-6 space-y-4"
          >
            <DetailRow
              icon={
                <span className="font-display font-black text-primary text-sm">
                  🏨
                </span>
              }
              label="Stay"
              value={stayName}
            />
            <DetailRow
              icon={<MapPin className="w-4 h-4 text-primary" />}
              label="Location"
              value={location}
            />
            <DetailRow
              icon={<CalendarCheck className="w-4 h-4 text-primary" />}
              label="Check-in"
              value={formatDate(checkin)}
            />
            <DetailRow
              icon={<CalendarCheck className="w-4 h-4 text-primary" />}
              label="Check-out"
              value={formatDate(checkout)}
            />
            <DetailRow
              icon={<User className="w-4 h-4 text-primary" />}
              label="Guest"
              value={guestName}
            />
          </motion.div>

          {/* Footer note */}
          <div className="px-6 pb-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs font-body text-amber-700 text-center leading-relaxed">
              Please carry a valid ID proof at check-in. Show your Booking ID to
              the hotel reception.
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="px-6 pb-8 pt-5"
          >
            <Button
              data-ocid="confirmation.home.button"
              onClick={() => navigate({ to: "/dashboard" })}
              className="w-full h-13 text-base font-display font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              Back to Home
            </Button>
          </motion.div>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-muted-foreground font-body mt-6">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="font-body text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
