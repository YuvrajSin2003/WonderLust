const express = require("express");
const router = express.Router({ mergeParams: true }); // Important if used under /listings/:id/reviews
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


// Create Review
router.post("/", validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success" , "New Review created");
  res.redirect(`/listings/${listing._id}`);
}));

// Delete Review
router.delete("/:reviewsId", wrapAsync(async (req, res) => {
  let { id, reviewsId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewsId } });
  req.flash("success" , " Review deleted");
  await Review.findByIdAndDelete(reviewsId);
  res.redirect(`/listings/${id}`);
}));

module.exports = router;
