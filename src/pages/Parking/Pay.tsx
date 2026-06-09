import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Clock,
  Tag,
  CreditCard,
  Check,
  CheckCircle2,
  CircleDot,
  ShieldCheck,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useParkingStore } from "@/store/useParkingStore";
import { formatMoney } from "@/utils/format";

interface Coupon {
  id: string;
  name: string;
  discount: number;
  minAmount: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const coupons: Coupon[] = [
  { id: "C001", name: "新人立减券", discount: 5, minAmount: 0 },
  { id: "C002", name: "满30减10元券", discount: 10, minAmount: 30 },
  { id: "C003", name: "停车优惠月券", discount: 8, minAmount: 20 },
];

const paymentMethods: PaymentMethod[] = [
  { id: "wechat", name: "微信支付", icon: "💚", color: "text-green-600" },
  { id: "alipay", name: "支付宝", icon: "💙", color: "text-blue-600" },
  { id: "unionpay", name: "云闪付", icon: "💎", color: "text-red-600" },
];

export default function ParkingPay() {
  const navigate = useNavigate();
  const { currentRecord, payParking } = useParkingStore();

  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("wechat");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  if (!currentRecord) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader showBack title="停车缴费" />
        <div className="p-8 text-center text-gray-500">
          <Car size={48} className="mx-auto mb-4 text-gray-300" />
          <p>暂无待缴费的停车记录</p>
        </div>
      </div>
    );
  }

  const originalFee = currentRecord.fee;
  const coupon = coupons.find((c) => c.id === selectedCoupon);
  const couponDiscount =
    coupon && originalFee >= coupon.minAmount ? coupon.discount : 0;
  const finalFee = Math.max(0, originalFee - couponDiscount);

  const handlePay = () => {
    setIsPaying(true);
    setTimeout(() => {
      payParking();
      setIsPaying(false);
      setShowSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <PageHeader showBack title="停车缴费" />

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-primary-800 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard size={20} />
            <span className="font-semibold">缴费详情</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">车牌号</span>
              <span className="text-xl font-bold tracking-wide">
                {currentRecord.plateNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">入场时间</span>
              <span className="font-medium">{currentRecord.enterTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm flex items-center gap-1">
                <Clock size={14} />
                已停时长
              </span>
              <span className="font-medium">{currentRecord.duration}</span>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">应付金额</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-accent-300 text-lg">¥</span>
              <span className="text-accent-300 text-5xl font-bold">
                {finalFee.toFixed(2)}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="mt-2 text-sm text-white/80">
                已优惠 ¥{couponDiscount.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={18} className="text-primary-800" />
            <span className="font-semibold text-gray-800">优惠券</span>
            <span className="text-xs text-gray-400 ml-auto">
              {coupons.length}张可用
            </span>
          </div>
          <div className="space-y-2.5">
            {coupons.map((c) => {
              const isAvailable = originalFee >= c.minAmount;
              const isSelected = selectedCoupon === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    isAvailable &&
                    setSelectedCoupon(isSelected ? null : c.id)
                  }
                  disabled={!isAvailable}
                  className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-primary-800 bg-primary-50"
                      : isAvailable
                      ? "border-gray-100 bg-gray-50 hover:border-primary-200"
                      : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                      isSelected
                        ? "bg-primary-800 text-white"
                        : "bg-accent-100 text-accent-600"
                    }`}
                  >
                    <span className="text-xl font-bold">-¥{c.discount}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800">{c.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {c.minAmount > 0
                        ? `满${c.minAmount}元可用`
                        : "无门槛使用"}
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected
                        ? "border-primary-800 bg-primary-800"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-primary-800" />
            <span className="font-semibold text-gray-800">支付方式</span>
          </div>
          <div className="space-y-2.5">
            {paymentMethods.map((m) => {
              const isSelected = selectedPayment === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedPayment(m.id)}
                  className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-primary-800 bg-primary-50"
                      : "border-gray-100 bg-gray-50 hover:border-primary-200"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mr-4 text-2xl shadow-sm">
                    {m.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div
                      className={`font-semibold ${
                        isSelected ? "text-primary-800" : "text-gray-800"
                      }`}
                    >
                      {m.name}
                    </div>
                  </div>
                  <CircleDot
                    size={22}
                    className={
                      isSelected ? "text-primary-800" : "text-gray-300"
                    }
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">停车费用</span>
              <span className="text-gray-800 font-medium">
                {formatMoney(originalFee)}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">优惠抵扣</span>
                <span className="text-accent-600 font-medium">
                  -{formatMoney(couponDiscount)}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-700 font-medium">实付金额</span>
              <span className="text-primary-800 text-2xl font-bold">
                {formatMoney(finalFee)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="app-container">
          <button
            onClick={handlePay}
            disabled={isPaying}
            className="w-full bg-primary-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg hover:bg-primary-900 active:bg-primary-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-800/30"
          >
            {isPaying ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                支付中...
              </>
            ) : (
              <>
                <CheckCircle2 size={22} />
                确认支付 {formatMoney(finalFee)}
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">支付成功</h2>
            <p className="text-gray-500 mb-2">已完成停车费用支付</p>
            <p className="text-3xl font-bold text-primary-800 mb-6">
              {formatMoney(finalFee)}
            </p>
            <button
              onClick={() => navigate("/parking")}
              className="w-full bg-primary-800 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-900 transition-colors"
            >
              返回停车页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
