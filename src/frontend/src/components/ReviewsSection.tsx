import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Review {
  id: string;
  propertyId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

const STORAGE_KEY = "hidestay_reviews";

function getReviews(propertyId: string): Review[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const all: Review[] = JSON.parse(saved);
      return all.filter((r) => r.propertyId === propertyId);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveReview(review: Review) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const all: Review[] = saved ? JSON.parse(saved) : [];
    all.push(review);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

function StarDisplay({
  rating,
  size = "sm",
}: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sz} ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function InteractiveStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          data-ocid={`reviews.rating_star.${star}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-body text-muted-foreground">
          {["Poor", "Fair", "Good", "Very Good", "Excellent"][value - 1]}
        </span>
      )}
    </div>
  );
}

interface ReviewsSectionProps {
  propertyId: string;
  propertyName: string;
  isCustomer: boolean;
  customerName: string;
}

export default function ReviewsSection({
  propertyId,
  propertyName,
  isCustomer,
  customerName,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(() =>
    getReviews(propertyId),
  );
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const avg = averageRating(reviews);

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Please write at least 10 characters.");
      return;
    }
    setSubmitting(true);
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      propertyId,
      customerName: customerName || "Guest",
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };
    saveReview(newReview);
    setReviews(getReviews(propertyId));
    setShowForm(false);
    setRating(0);
    setComment("");
    setError("");
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setRating(0);
    setComment("");
    setError("");
  };

  return (
    <motion.section
      data-ocid="reviews.section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-8"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-bold text-foreground text-xl">
            Guest Reviews
          </h2>
          {reviews.length > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 font-body text-xs">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </Badge>
          )}
        </div>
        {isCustomer && !showForm && (
          <Button
            data-ocid="reviews.write_button"
            size="sm"
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground font-body font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Average Rating Display */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5">
          <div className="text-center">
            <p className="font-display font-black text-4xl text-amber-500">
              {avg.toFixed(1)}
            </p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">
              out of 5
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <StarDisplay rating={avg} size="lg" />
            <p className="text-sm font-body text-muted-foreground">
              Based on {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"} for{" "}
              <span className="font-semibold text-foreground">
                {propertyName}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div
              data-ocid="reviews.success_state"
              className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3"
            >
              <p className="text-sm font-body text-emerald-700 font-semibold">
                ✓ Your review has been submitted. Thank you!
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-emerald-500 hover:text-emerald-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Card className="border-primary/30 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-foreground">
                    Write a Review
                  </h3>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <p className="text-sm font-body text-muted-foreground mb-2">
                    Your Rating
                  </p>
                  <InteractiveStars value={rating} onChange={setRating} />
                </div>

                <div>
                  <p className="text-sm font-body text-muted-foreground mb-2">
                    Your Review
                  </p>
                  <Textarea
                    data-ocid="reviews.comment.textarea"
                    placeholder="Share your experience at this property..."
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      setError("");
                    }}
                    className="font-body text-sm min-h-24 resize-none"
                  />
                </div>

                {error && (
                  <p
                    data-ocid="reviews.error_state"
                    className="text-sm font-body text-red-500"
                  >
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    data-ocid="reviews.submit.button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-primary text-primary-foreground font-body font-semibold"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    data-ocid="reviews.cancel.button"
                    variant="outline"
                    onClick={handleCancel}
                    className="font-body"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div
          data-ocid="reviews.empty_state"
          className="flex flex-col items-center justify-center py-10 text-center bg-muted/30 rounded-2xl border border-dashed border-border"
        >
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="font-body font-medium text-muted-foreground">
            No reviews yet
          </p>
          <p className="font-body text-sm text-muted-foreground/60 mt-1">
            Be the first to share your experience!
          </p>
          {isCustomer && !showForm && (
            <Button
              data-ocid="reviews.write_button"
              size="sm"
              onClick={() => setShowForm(true)}
              className="mt-4 bg-primary text-primary-foreground font-body font-semibold text-xs"
            >
              Write a Review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              data-ocid={`reviews.item.${i + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border shadow-xs bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">
                        {review.customerName}
                      </p>
                      <StarDisplay rating={review.rating} />
                    </div>
                    <p className="text-[11px] font-body text-muted-foreground flex-shrink-0">
                      {new Date(review.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="font-body text-sm text-foreground leading-relaxed">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
