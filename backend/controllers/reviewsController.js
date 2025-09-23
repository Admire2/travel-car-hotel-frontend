// reviewsController.js - Reviews controller with TripAdvisor API integration

const Review = require('../models/review');
const User = require('../models/user');

// Mock TripAdvisor Review Data
const mockReviewData = {
  hotels: {
    'hotel-001': [
      {
        id: 'review-h001-1',
        user: {
          name: 'Sarah Johnson',
          location: 'New York, NY',
          avatar: 'SJ'
        },
        rating: 5,
        title: 'Outstanding luxury experience!',
        comment: 'This hotel exceeded all my expectations. The service was impeccable, the room was beautifully appointed, and the location couldn\'t be better. The concierge went above and beyond to make our anniversary celebration special. The spa was world-class and the restaurant served some of the best food I\'ve had in the city. Will definitely be returning!',
        travelerType: 'couple',
        visitDate: '2024-08-15',
        recommended: true,
        helpfulVotes: 23,
        createdAt: '2024-08-20T10:30:00Z'
      },
      {
        id: 'review-h001-2',
        user: {
          name: 'Michael Chen',
          location: 'Los Angeles, CA',
          avatar: 'MC'
        },
        rating: 4,
        title: 'Great business travel option',
        comment: 'Stayed here for a week-long business conference. The WiFi was excellent, the business center was well-equipped, and the location made it easy to get to meetings downtown. The breakfast buffet was impressive with healthy options. Only minor complaint was that the room service was a bit slow during peak hours.',
        travelerType: 'business',
        visitDate: '2024-07-22',
        recommended: true,
        helpfulVotes: 15,
        createdAt: '2024-07-25T14:15:00Z'
      },
      {
        id: 'review-h001-3',
        user: {
          name: 'Emily Rodriguez',
          location: 'Chicago, IL',
          avatar: 'ER'
        },
        rating: 5,
        title: 'Perfect family vacation spot',
        comment: 'Brought the family here for spring break and it was fantastic! The kids loved the pool area and the family-friendly activities. The staff was so accommodating with our dietary restrictions and helped arrange babysitting so my husband and I could enjoy a romantic dinner. The rooms were spacious enough for our family of four.',
        travelerType: 'family',
        visitDate: '2024-03-18',
        recommended: true,
        helpfulVotes: 31,
        createdAt: '2024-03-22T09:45:00Z'
      },
      {
        id: 'review-h001-4',
        user: {
          name: 'David Thompson',
          location: 'Seattle, WA',
          avatar: 'DT'
        },
        rating: 3,
        title: 'Good but overpriced',
        comment: 'The hotel is nice and the service is professional, but I felt it was overpriced for what you get. The room was clean and comfortable, but nothing exceptional. The location is convenient but the parking fees were outrageous. Food at the restaurant was good but again, very expensive. It\'s a solid choice if budget isn\'t a concern.',
        travelerType: 'business',
        visitDate: '2024-06-10',
        recommended: false,
        helpfulVotes: 8,
        createdAt: '2024-06-14T16:20:00Z'
      },
      {
        id: 'review-h001-5',
        user: {
          name: 'Lisa Wang',
          location: 'San Francisco, CA',
          avatar: 'LW'
        },
        rating: 4,
        title: 'Lovely weekend getaway',
        comment: 'My partner and I had a wonderful romantic weekend here. The room had a beautiful view, the bed was incredibly comfortable, and the bathroom amenities were luxurious. The rooftop bar has an amazing sunset view. The only downside was that it can get quite noisy from the street below, especially on weekend nights.',
        travelerType: 'couple',
        visitDate: '2024-05-25',
        recommended: true,
        helpfulVotes: 12,
        createdAt: '2024-05-28T11:30:00Z'
      }
    ]
  },
  flights: {
    'flight-001': [
      {
        id: 'review-f001-1',
        user: {
          name: 'John Williams',
          location: 'Boston, MA',
          avatar: 'JW'
        },
        rating: 5,
        title: 'Excellent service and comfort',
        comment: 'Flying business class was worth every penny. The seats were spacious and comfortable, the meal service was outstanding, and the flight attendants were attentive throughout the long-haul flight. Entertainment system had great selection and WiFi worked perfectly for work. Arrived well-rested despite the overnight flight.',
        travelerType: 'business',
        visitDate: '2024-08-05',
        recommended: true,
        helpfulVotes: 18,
        createdAt: '2024-08-07T08:15:00Z'
      },
      {
        id: 'review-f001-2',
        user: {
          name: 'Amanda Foster',
          location: 'Miami, FL',
          avatar: 'AF'
        },
        rating: 2,
        title: 'Disappointing experience',
        comment: 'Flight was delayed by 3 hours with very little communication from the airline. When we finally boarded, the plane was cramped and uncomfortable. The meal was barely edible and the entertainment system was broken on multiple seats. Customer service was unhelpful when I complained. Would not recommend this airline.',
        travelerType: 'leisure',
        visitDate: '2024-07-12',
        recommended: false,
        helpfulVotes: 25,
        createdAt: '2024-07-15T19:30:00Z'
      }
    ]
  },
  cars: {
    'car-001': [
      {
        id: 'review-c001-1',
        user: {
          name: 'Robert Kim',
          location: 'Denver, CO',
          avatar: 'RK'
        },
        rating: 4,
        title: 'Reliable rental for road trip',
        comment: 'Rented this car for a week-long road trip and it performed excellently. Good fuel economy, comfortable seats for long drives, and plenty of trunk space for luggage. The GPS system was intuitive and the Bluetooth connectivity worked seamlessly. Only issue was a small scratch that was already documented when I picked it up.',
        travelerType: 'leisure',
        visitDate: '2024-06-20',
        recommended: true,
        helpfulVotes: 14,
        createdAt: '2024-06-28T12:45:00Z'
      },
      {
        id: 'review-c001-2',
        user: {
          name: 'Jennifer Lee',
          location: 'Phoenix, AZ',
          avatar: 'JL'
        },
        rating: 5,
        title: 'Perfect for business travel',
        comment: 'Needed a reliable car for a series of client meetings across the city. This vehicle was clean, comfortable, and professional-looking. The rental process was quick and efficient. Car had all the features I needed including hands-free calling and navigation. Excellent fuel efficiency saved on expenses. Will definitely rent from this company again.',
        travelerType: 'business',
        visitDate: '2024-08-02',
        recommended: true,
        helpfulVotes: 9,
        createdAt: '2024-08-06T15:20:00Z'
      }
    ]
  },
  bundles: {
    'bundle-deluxe-001': [
      {
        id: 'review-b001-1',
        user: {
          name: 'Patricia Martinez',
          location: 'Dallas, TX',
          avatar: 'PM'
        },
        rating: 5,
        title: 'Amazing value for complete package',
        comment: 'Booking the bundle deal saved us hundreds of dollars compared to booking separately. Everything was coordinated perfectly - flight times worked well with hotel check-in, and the rental car was ready at the airport. The hotel exceeded expectations and the car was exactly what we needed for exploring the city. Stress-free vacation planning!',
        travelerType: 'couple',
        visitDate: '2024-07-08',
        recommended: true,
        helpfulVotes: 27,
        createdAt: '2024-07-15T10:30:00Z'
      },
      {
        id: 'review-b001-2',
        user: {
          name: 'Thomas Anderson',
          location: 'Portland, OR',
          avatar: 'TA'
        },
        rating: 4,
        title: 'Good package with minor issues',
        comment: 'Overall satisfied with the bundle deal. The savings were significant and the convenience of having everything booked together was great. Flight was comfortable, hotel was nice, and car rental process was smooth. Only complaint was that the hotel room wasn\'t ready at check-in time, but they upgraded us as compensation.',
        travelerType: 'family',
        visitDate: '2024-05-15',
        recommended: true,
        helpfulVotes: 16,
        createdAt: '2024-05-22T14:45:00Z'
      }
    ]
  },
  'vacation-rentals': {
    'rental-001': [
      {
        id: 'review-vr001-1',
        user: {
          name: 'Sandra Wilson',
          location: 'Atlanta, GA',
          avatar: 'SW'
        },
        rating: 5,
        title: 'Perfect home away from home',
        comment: 'This vacation rental was absolutely perfect for our family reunion. The house was spacious, beautifully decorated, and had all the amenities we needed. The kitchen was fully equipped for cooking large meals, and the outdoor space was great for the kids to play. The host was responsive and provided excellent local recommendations. Highly recommend!',
        travelerType: 'family',
        visitDate: '2024-06-25',
        recommended: true,
        helpfulVotes: 22,
        createdAt: '2024-07-01T09:15:00Z'
      }
    ]
  }
};

// Helper function to calculate review statistics
const calculateReviewStats = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [0, 0, 0, 0, 0]
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  const ratingDistribution = [0, 0, 0, 0, 0];
  reviews.forEach(review => {
    ratingDistribution[review.rating - 1]++;
  });

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    ratingDistribution
  };
};

// Helper function to sort reviews
const sortReviews = (reviews, sortBy) => {
  const sortedReviews = [...reviews];
  
  switch (sortBy) {
    case 'newest':
      return sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'highest':
      return sortedReviews.sort((a, b) => b.rating - a.rating);
    case 'lowest':
      return sortedReviews.sort((a, b) => a.rating - b.rating);
    case 'helpful':
      return sortedReviews.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
    default:
      return sortedReviews;
  }
};

// Get reviews for a specific entity
exports.getReviews = async (req, res) => {
  try {
    const {
      entityType,
      entityId,
      page = 1,
      limit = 10,
      sortBy = 'newest',
      rating
    } = req.query;

    // Validate required parameters
    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: 'Entity type and ID are required'
      });
    }

    // Get mock reviews for the entity
    let allReviews = [];
    if (mockReviewData[entityType] && mockReviewData[entityType][entityId]) {
      allReviews = mockReviewData[entityType][entityId];
    }

    // Filter by rating if specified
    if (rating && rating > 0) {
      allReviews = allReviews.filter(review => review.rating === parseInt(rating));
    }

    // Sort reviews
    const sortedReviews = sortReviews(allReviews, sortBy);

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = calculateReviewStats(mockReviewData[entityType]?.[entityId] || []);

    // Calculate total pages
    const totalPages = Math.ceil(sortedReviews.length / limitNumber);

    res.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        stats,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalResults: sortedReviews.length,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Submit a new review
exports.submitReview = async (req, res) => {
  try {
    const {
      entityType,
      entityId,
      entityName,
      rating,
      title,
      comment,
      travelerType,
      visitDate,
      recommended
    } = req.body;

    // Validate required fields
    if (!entityType || !entityId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Get user info from request (set by auth middleware)
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has already reviewed this entity
    const existingReview = await Review.findOne({
      userId,
      entityType,
      entityId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // Create new review
    const reviewData = {
      userId,
      entityType,
      entityId,
      entityName,
      rating: parseInt(rating),
      title: title.trim(),
      comment: comment.trim(),
      travelerType: travelerType || 'leisure',
      visitDate: visitDate ? new Date(visitDate) : null,
      recommended: recommended !== false,
      helpfulVotes: 0,
      reportedCount: 0,
      status: 'approved', // In production, might need moderation
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const review = new Review(reviewData);
    await review.save();

    // Populate user details for response
    await review.populate('userId', 'name email location');

    // Format response to match frontend expectations
    const formattedReview = {
      _id: review._id,
      user: {
        name: review.userId.name,
        location: review.userId.location || 'Location not specified',
        avatar: review.userId.name?.charAt(0).toUpperCase() || 'U'
      },
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      travelerType: review.travelerType,
      visitDate: review.visitDate,
      recommended: review.recommended,
      helpfulVotes: review.helpfulVotes,
      createdAt: review.createdAt
    };

    res.status(201).json({
      success: true,
      data: {
        review: formattedReview,
        message: 'Review submitted successfully'
      }
    });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

// Get review statistics for an entity
exports.getReviewStats = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    // Get mock reviews for the entity
    let reviews = [];
    if (mockReviewData[entityType] && mockReviewData[entityType][entityId]) {
      reviews = mockReviewData[entityType][entityId];
    }

    // Also get database reviews
    const dbReviews = await Review.find({ entityType, entityId, status: 'approved' });
    
    // Combine mock and database reviews for statistics
    const allReviews = [...reviews, ...dbReviews.map(r => ({ rating: r.rating }))];
    const stats = calculateReviewStats(allReviews);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get review statistics',
      error: error.message
    });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked this review as helpful
    if (review.helpfulBy && review.helpfulBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked this review as helpful'
      });
    }

    // Add user to helpfulBy array and increment helpfulVotes
    review.helpfulBy = review.helpfulBy || [];
    review.helpfulBy.push(userId);
    review.helpfulVotes = (review.helpfulVotes || 0) + 1;
    
    await review.save();

    res.json({
      success: true,
      data: {
        helpfulVotes: review.helpfulVotes,
        message: 'Review marked as helpful'
      }
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};

// Report a review
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already reported this review
    if (review.reportedBy && review.reportedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this review'
      });
    }

    // Add report
    review.reportedBy = review.reportedBy || [];
    review.reportedBy.push(userId);
    review.reportedCount = (review.reportedCount || 0) + 1;
    
    // Add report details
    review.reports = review.reports || [];
    review.reports.push({
      userId,
      reason: reason || 'Inappropriate content',
      reportDate: new Date()
    });

    // If too many reports, flag for review
    if (review.reportedCount >= 5) {
      review.status = 'flagged';
    }

    await review.save();

    res.json({
      success: true,
      data: {
        message: 'Review reported successfully'
      }
    });

  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report review',
      error: error.message
    });
  }
};

// Legacy endpoints for backward compatibility
exports.createReview = exports.submitReview;
exports.getAllReviews = exports.getReviews;
