import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  ThumbsUp,
  Send,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

interface RatingDimension {
  key: string;
  label: string;
  value: number;
}

export default function Satisfaction() {
  const navigate = useNavigate();

  const [dimensions, setDimensions] = useState<RatingDimension[]>([
    { key: "overall", label: "整体服务", value: 0 },
    { key: "environment", label: "环境卫生", value: 0 },
    { key: "security", label: "安保秩序", value: 0 },
    { key: "facility", label: "设施维护", value: 0 },
    { key: "response", label: "响应速度", value: 0 },
  ]);
  const [overallSatisfaction, setOverallSatisfaction] = useState(75);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avgRating =
    dimensions.reduce((sum, d) => sum + d.value, 0) / dimensions.length;
  const getRatingLabel = (value: number) => {
    if (value >= 5) return "非常满意";
    if (value >= 4) return "满意";
    if (value >= 3) return "一般";
    if (value >= 2) return "不满意";
    if (value >= 1) return "非常不满意";
    return "未评分";
  };
  const getOverallLabel = (value: number) => {
    if (value >= 90) return "非常满意";
    if (value >= 75) return "满意";
    if (value >= 60) return "一般";
    if (value >= 40) return "不满意";
    return "非常不满意";
  };
  const getOverallColor = (value: number) => {
    if (value >= 75) return "text-success-600";
    if (value >= 60) return "text-warning-500";
    return "text-danger-500";
  };

  const handleStarClick = (key: string, value: number) => {
    setDimensions((prev) =>
      prev.map((d) => (d.key === key ? { ...d, value } : d))
    );
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(-1);
      }, 2000);
    }, 1200);
  };

  const isFormValid =
    dimensions.every((d) => d.value > 0) && overallSatisfaction > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <PageHeader showBack title="满意度评价" />

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-primary-800 to-primary-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} />
            <span className="font-semibold">总体满意度</span>
          </div>
          <div className="text-center mb-5">
            <div
              className={`text-5xl font-bold mb-1 ${getOverallColor(
                overallSatisfaction
              )} ${overallSatisfaction >= 75 ? "text-accent-300" : ""}`}
            >
              {overallSatisfaction}
              <span className="text-2xl">%</span>
            </div>
            <div className="text-white/80 text-sm">
              {getOverallLabel(overallSatisfaction)}
            </div>
          </div>
          <div className="relative">
            <input
              type="range"
              min={0}
              max={100}
              value={overallSatisfaction}
              onChange={(e) => setOverallSatisfaction(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/20
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:border-4
                [&::-webkit-slider-thumb]:border-accent-400
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-4
                [&::-moz-range-thumb]:border-accent-400
                [&::-moz-range-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, #FB923C 0%, #FB923C ${overallSatisfaction}%, rgba(255,255,255,0.2) ${overallSatisfaction}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-primary-800" />
              <span className="font-semibold text-gray-800">分项评分</span>
            </div>
            <div className="text-sm text-gray-500">
              平均分 <span className="font-bold text-primary-800">{avgRating.toFixed(1)}</span>
              <span className="text-gray-400">/5.0</span>
            </div>
          </div>
          <div className="space-y-5">
            {dimensions.map((dim) => (
              <div key={dim.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">{dim.label}</span>
                  <span
                    className={`text-sm font-semibold ${
                      dim.value >= 4
                        ? "text-success-600"
                        : dim.value >= 3
                        ? "text-warning-500"
                        : dim.value >= 1
                        ? "text-danger-500"
                        : "text-gray-400"
                    }`}
                  >
                    {getRatingLabel(dim.value)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(dim.key, star)}
                      className="flex-1 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      <Star
                        size={28}
                        className={`mx-auto transition-all ${
                          star <= dim.value
                            ? "fill-accent-400 text-accent-400 scale-110"
                            : "text-gray-200 hover:text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp size={18} className="text-primary-800" />
            <span className="font-semibold text-gray-800">意见建议</span>
            <span className="text-xs text-gray-400 ml-auto">
              {comment.length}/500
            </span>
          </div>
          <textarea
            value={comment}
            onChange={(e) =>
              setComment(e.target.value.slice(0, 500))
            }
            placeholder="请分享您的宝贵意见和建议，帮助我们做得更好..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-800 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400"
          />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <button
            onClick={() => setIsAnonymous(!isAnonymous)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isAnonymous
                    ? "bg-primary-100"
                    : "bg-gray-100"
                }`}
              >
                {isAnonymous ? (
                  <EyeOff size={20} className="text-primary-800" />
                ) : (
                  <Eye size={20} className="text-gray-500" />
                )}
              </div>
              <div className="text-left">
                <div
                  className={`font-medium ${
                    isAnonymous ? "text-primary-800" : "text-gray-800"
                  }`}
                >
                  匿名提交
                </div>
                <div className="text-xs text-gray-400">
                  {isAnonymous
                    ? "您的身份将被隐藏"
                    : "将显示您的姓名和工号"}
                </div>
              </div>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-all relative ${
                isAnonymous ? "bg-primary-800" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                  isAnonymous ? "left-6" : "left-1"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="app-container">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-primary-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg hover:bg-primary-900 active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-800/30"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send size={22} />
                提交评价
              </>
            )}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 mx-6 w-full max-w-sm text-center animate-slide-up">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-success-500/10 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-success-500 flex items-center justify-center animate-breath">
                <CheckCircle2 size={56} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">提交成功</h2>
            <p className="text-gray-500">感谢您的宝贵评价！</p>
          </div>
        </div>
      )}
    </div>
  );
}
