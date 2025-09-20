import { Activity } from "@/types/Activity";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating"; // Adjust the import path if needed
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const ActivityCard = ({
  activity,
  isSelected,
}: {
  activity: Activity & { attraction: string };
  isSelected: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = () => {
    // Here you would typically handle the form submission,
    // e.g., send the data to your backend API.
    // Reset state and close the modal
    setRating(0);
    setReview("");
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        key={activity.id}
        className={`cursor-pointer rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
          isSelected
            ? "border-orange-500 bg-orange-50 shadow-orange-100"
            : "border-gray-200 bg-white hover:border-orange-300"
        }`}
        onClick={() => setIsModalOpen(true)} // Open modal on click
      >
        {/* Header */}
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-1">
                {activity.name}
              </h3>
              <p className="text-sm text-orange-600 font-medium">
                {activity.attraction}
              </p>
            </div>
            {/* Selection Indicator */}
            {/* <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ml-3 flex-shrink-0 ${
                isSelected
                  ? "bg-orange-500 border-orange-500"
                  : "bg-white border-gray-300"
              }`}
            >
              {isSelected && <span className="text-white text-sm">✓</span>}
            </div> */}
          </div>
          {activity.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {activity.description}
            </p>
          )}
        </div>
        {/* Footer */}
        <div className="p-5 pt-0">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              {activity.category}
            </span>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span>⏱️ {formatDuration(activity.duration)}</span>
              {activity.price ? (
                <span className="font-medium text-green-600">
                  {formatCurrency(activity.price)}
                </span>
              ) : (
                <span className="text-gray-400">Free</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review and Rating Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-amber-500">Rate and Review</DialogTitle>
            <DialogDescription>
              Share your experience for "{activity.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="rating" className="text-center mb-2 text-orange-400">
                Your Rating
              </Label>
              <Rating value={rating} onValueChange={setRating} className="text-orange-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <RatingButton key={index} />
                ))}
              </Rating>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="review">Your Review</Label>
              <Textarea
                placeholder="Tell us about your experience..."
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-orange-600"
              onClick={handleSubmit}
              disabled={rating === 0 || review.trim() === ""}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivityCard;
