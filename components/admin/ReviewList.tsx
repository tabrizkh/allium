"use client";

import { useState } from "react";
import { updateReviewStatus, deleteReview } from "@/app/actions/reviews";
import { Check, X, Trash2, Star, User, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ReviewList({ reviews }: { reviews: any[] }) {
  const [filter, setReviewFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const filteredReviews = reviews.filter(r => filter === "ALL" || r.status === filter);

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === "PENDING").length,
    approved: reviews.filter(r => r.status === "APPROVED").length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0",
  };

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    const result = await updateReviewStatus(id, status);
    if (result.success) {
      toast.success(status === "APPROVED" ? "Отзыв одобрен" : "Отзыв отклонен");
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      const result = await deleteReview(id);
      if (result.success) {
        toast.success("Отзыв удален");
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление отзывами</h1>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setReviewFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f 
                  ? "bg-[var(--accent)] text-white" 
                  : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "ALL" ? "Все" : f === "PENDING" ? "Ожидают" : f === "APPROVED" ? "Одобрено" : "Отклонено"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Всего отзывов</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Ожидают модерации</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Одобрено</div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Средний рейтинг</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgRating} ★</div>
        </div>
      </div>

      {/* Reviews Table/List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="divide-y">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  {/* User Info */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <User size={16} className="text-gray-400" />
                      {review.user?.name || "Пользователь"}
                    </div>
                    <div className="text-xs text-gray-500">{review.user?.email}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(review.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="w-px h-10 bg-gray-200" />

                  {/* Product Info */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ShoppingBag size={16} className="text-gray-400" />
                      {review.product?.name}
                    </div>
                    <div className="text-xs text-[var(--accent)]">{Number(review.product?.price).toLocaleString()} ₼</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {review.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(review.id, "APPROVED")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Одобрить"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(review.id, "REJECTED")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Отклонить"
                      >
                        <X size={20} />
                      </button>
                    </>
                  )}
                  {review.status === "APPROVED" && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Одобрен</span>
                  )}
                  {review.status === "REJECTED" && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Отклонен</span>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-2"
                    title="Удалить навсегда"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                    />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed italic border-l-4 border-gray-200 pl-4 py-1">
                  {review.text}
                </p>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="p-12 text-center text-gray-500 italic">
              Отзывов в этой категории пока нет
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
