
import mongoose from "mongoose";

import Review from "../models/Review.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Kiểm tra mã công thức
function validateRecipeKey(value) {
    if (
        typeof value !== "string" ||
        value.trim().length < 1 ||
        value.trim().length > 120 ||
        !/^[a-zA-Z0-9_-]+$/.test(value.trim())
    ) {
        throw ApiError.badRequest("Mã công thức không hợp lệ");
    }

    return value.trim();
}

// Chuyển dữ liệu Review thành JSON an toàn
function formatReview(review) {
    return {
        id: String(review._id),
        recipeKey: review.recipeKey,
        userId: String(review.user?._id || review.user),
        userName: review.user?.name || "Thành viên Bếp Nhà",
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
    };
}

// GET /api/reviews/:recipeKey
// Chỉ lấy nhận xét đã được Admin duyệt
export const getPublicReviews = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

    const reviews = await Review.find({
        recipeKey,
        status: "approved"
    })
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .lean();

    const count = reviews.length;

    const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
    );

    const average = count
        ? Math.round((totalRating / count) * 10) / 10
        : 0;

    res.status(200).json({
        success: true,
        items: reviews.map(formatReview),
        summary: {
            count,
            average
        }
    });
});

// GET /api/reviews/:recipeKey/mine
// Lấy nhận xét của tài khoản đang đăng nhập
export const getMyReview = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

    const review = await Review.findOne({
        recipeKey,
        user: req.user._id
    }).populate("user", "name");

    res.status(200).json({
        success: true,
        review: review ? formatReview(review) : null
    });
});

// POST /api/reviews/:recipeKey
// Tạo hoặc cập nhật nhận xét
export const saveReview = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

    const rating = Number(req.body.rating);
    const comment =
        typeof req.body.comment === "string"
            ? req.body.comment.trim()
            : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw ApiError.badRequest("Số sao phải từ 1 đến 5");
    }

    if (comment.length < 3 || comment.length > 500) {
        throw ApiError.badRequest(
            "Nhận xét phải có từ 3 đến 500 ký tự"
        );
    }

    // Tài khoản chỉ có một nhận xét cho mỗi công thức.
    // Khi sửa, trạng thái sẽ quay về pending để Admin duyệt lại.
    const review = await Review.findOneAndUpdate(
        {
            user: req.user._id,
            recipeKey
        },
        {
            $set: {
                rating,
                comment,
                status: "pending",
                moderatedBy: null,
                moderatedAt: null
            },
            $setOnInsert: {
                user: req.user._id,
                recipeKey
            }
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        }
    ).populate("user", "name");

    res.status(200).json({
        success: true,
        message: "Nhận xét đã gửi và đang chờ Admin kiểm duyệt",
        review: formatReview(review)
    });
});

// DELETE /api/reviews/:recipeKey
// Người dùng chỉ được xóa nhận xét của chính mình
export const deleteMyReview = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

    const result = await Review.deleteOne({
        recipeKey,
        user: req.user._id
    });

    if (result.deletedCount === 0) {
        throw ApiError.notFound("Không tìm thấy nhận xét của bạn");
    }

    res.status(200).json({
        success: true,
        message: "Đã xóa nhận xét"
    });
});

// GET /api/admin/reviews?status=pending
// Admin lấy danh sách nhận xét theo trạng thái
export const getAdminReviews = asyncHandler(async (req, res) => {
    const allowedStatuses = ["pending", "approved", "hidden"];

    const status = req.query.status || "pending";

    if (!allowedStatuses.includes(status)) {
        throw ApiError.badRequest("Trạng thái kiểm duyệt không hợp lệ");
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
        50,
        Math.max(1, Number(req.query.limit) || 20)
    );

    const filter = { status };

    const [reviews, total] = await Promise.all([
        Review.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),

        Review.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        items: reviews.map(formatReview),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// Kiểm tra ID MongoDB
function validateReviewId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.badRequest("ID nhận xét không hợp lệ");
    }
}

// PATCH /api/admin/reviews/:id/approve
export const approveReview = asyncHandler(async (req, res) => {
    validateReviewId(req.params.id);

    const review = await Review.findById(req.params.id)
        .populate("user", "name");

    if (!review) {
        throw ApiError.notFound("Không tìm thấy nhận xét");
    }

    review.status = "approved";
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();

    await review.save();

    res.status(200).json({
        success: true,
        message: "Đã duyệt nhận xét",
        review: formatReview(review)
    });
});

// PATCH /api/admin/reviews/:id/hide
export const hideReview = asyncHandler(async (req, res) => {
    validateReviewId(req.params.id);

    const review = await Review.findById(req.params.id)
        .populate("user", "name");

    if (!review) {
        throw ApiError.notFound("Không tìm thấy nhận xét");
    }

    review.status = "hidden";
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();

    await review.save();

    res.status(200).json({
        success: true,
        message: "Đã ẩn nhận xét",
        review: formatReview(review)
    });
});

// DELETE /api/admin/reviews/:id
export const deleteReviewByAdmin = asyncHandler(async (req, res) => {
    validateReviewId(req.params.id);

    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
        throw ApiError.notFound("Không tìm thấy nhận xét");
    }

    res.status(200).json({
        success: true,
        message: "Đã xóa nhận xét"
    });
});
    