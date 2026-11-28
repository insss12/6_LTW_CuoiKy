import mongoose from "mongoose";

import Review from "../models/Review.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { resolveRecipe } from "../utils/recipeRef.js";

// Chuyển dữ liệu Review thành JSON an toàn.
// review.recipe cần được populate("recipe", "legacyKey title") để có recipeKey/recipeTitle.
function formatReview(review) {
    const recipeId = String(review.recipe?._id || review.recipe);

    return {
        id: String(review._id),
        recipeId,
        // Giữ "mau-1" cho món mẫu để client cũ vẫn khớp được
        recipeKey: review.recipe?.legacyKey || recipeId,
        recipeTitle: review.recipe?.title || "",
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
    const recipe = await resolveRecipe(req.params.recipeKey);

    const reviews = await Review.find({
        recipe: recipe._id,
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

    // Các review này thuộc cùng một công thức nên gắn thông tin công thức thủ công,
    // không cần populate thêm
    res.status(200).json({
        success: true,
        items: reviews.map((review) =>
            formatReview({ ...review, recipe })
        ),
        summary: {
            count,
            average
        }
    });
});

// GET /api/reviews/:recipeKey/mine
// Lấy nhận xét của tài khoản đang đăng nhập
export const getMyReview = asyncHandler(async (req, res) => {
    const recipe = await resolveRecipe(req.params.recipeKey);

    const review = await Review.findOne({
        recipe: recipe._id,
        user: req.user._id
    }).populate("user", "name");

    res.status(200).json({
        success: true,
        review: review ? formatReview({ ...review.toObject(), recipe }) : null
    });
});

// POST /api/reviews/:recipeKey
// Tạo hoặc cập nhật nhận xét
export const saveReview = asyncHandler(async (req, res) => {
    const recipe = await resolveRecipe(req.params.recipeKey);

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

    // Tài khoản chỉ có một nhận xét cho mỗi công thức (unique index user + recipe).
    // Khi sửa, trạng thái sẽ quay về pending để Admin duyệt lại.
    const review = await Review.findOneAndUpdate(
        {
            user: req.user._id,
            recipe: recipe._id
        },
        {
            $set: {
                rating,
                comment,
                status: "pending",
                moderatedBy: null,
                moderatedAt: null
            }
        },
        {
            returnDocument: "after",
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        }
    ).populate("user", "name");

    res.status(200).json({
        success: true,
        message: "Nhận xét đã gửi và đang chờ Admin kiểm duyệt",
        review: formatReview({ ...review.toObject(), recipe })
    });
});

// DELETE /api/reviews/:recipeKey
// Người dùng chỉ được xóa nhận xét của chính mình
// (công thức có thể đã bị ẩn, nên không bắt buộc đã duyệt)
export const deleteMyReview = asyncHandler(async (req, res) => {
    const recipe = await resolveRecipe(req.params.recipeKey, {
        onlyApproved: false
    });

    const result = await Review.deleteOne({
        recipe: recipe._id,
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
            .populate("recipe", "legacyKey title")
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

// Đổi trạng thái kiểm duyệt của một nhận xét
async function moderateReview(req, status) {
    validateReviewId(req.params.id);

    const review = await Review.findById(req.params.id)
        .populate("user", "name")
        .populate("recipe", "legacyKey title");

    if (!review) {
        throw ApiError.notFound("Không tìm thấy nhận xét");
    }

    review.status = status;
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();

    await review.save();

    return review;
}

// PATCH /api/admin/reviews/:id/approve
export const approveReview = asyncHandler(async (req, res) => {
    const review = await moderateReview(req, "approved");

    res.status(200).json({
        success: true,
        message: "Đã duyệt nhận xét",
        review: formatReview(review)
    });
});

// PATCH /api/admin/reviews/:id/hide
export const hideReview = asyncHandler(async (req, res) => {
    const review = await moderateReview(req, "hidden");

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
