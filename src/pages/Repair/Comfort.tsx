import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Thermometer,
  Lightbulb,
  Snowflake,
  Flame,
  Sun,
  Moon,
  MapPin,
  Send,
  Eye,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useRepairStore } from "@/store/useRepairStore";
import { cn } from "@/lib/utils";
import { mockUser } from "@/mock";

const locationOptions = [
  { value: "A区", label: "A区" },
  { value: "B区", label: "B区" },
  { value: "C区", label: "C区" },
  { value: "会议室", label: "会议室" },
  { value: "茶水间", label: "茶水间" },
  { value: "其他", label: "其他" },
];

export default function ComfortFeedback() {
  const navigate = useNavigate();
  const { addFeedback } = useRepairStore();

  const [temperature, setTemperature] = useState(24);
  const [lighting, setLighting] = useState(70);
  const [location, setLocation] = useState("A区");
  const [comment, setComment] = useState("");

  const canSubmit = location.trim().length > 0;

  const getTemperatureColor = (temp: number) => {
    if (temp <= 20) return "from-blue-400 to-cyan-400";
    if (temp <= 24) return "from-cyan-400 to-green-400";
    if (temp <= 27) return "from-green-400 to-yellow-400";
    return "from-yellow-400 to-orange-500";
  };

  const getTemperatureIcon = (temp: number) => {
    if (temp <= 20) return <Snowflake size={20} />;
    if (temp >= 28) return <Flame size={20} />;
    return <Thermometer size={20} />;
  };

  const getLightingIcon = (value: number) => {
    if (value >= 70) return <Sun size={20} />;
    if (value >= 40) return <Lightbulb size={20} />;
    return <Moon size={20} />;
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    addFeedback({
      location: `${mockUser.floor} ${location}`,
      temperature,
      lighting,
      comment: comment.trim(),
    });
    navigate("/repair");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PageHeader title="舒适度反馈" showBack />

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={18} className="text-primary-500" />
            <span className="text-sm font-medium text-gray-700">实时预览效果</span>
          </div>
          <div
            className="relative h-40 rounded-2xl overflow-hidden transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${
                temperature <= 22
                  ? "#60a5fa, #22d3ee"
                  : temperature <= 25
                  ? "#34d399, #6ee7b7"
                  : "#fbbf24, #fb923c"
              })`,
              filter: `brightness(${0.4 + (lighting / 100) * 0.6})`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/30 backdrop-blur-md rounded-2xl px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-4 text-white">
                  <div className="flex items-center gap-1.5">
                    {getTemperatureIcon(temperature)}
                    <span className="text-2xl font-bold">{temperature}°C</span>
                  </div>
                  <div className="w-px h-6 bg-white/40" />
                  <div className="flex items-center gap-1.5">
                    {getLightingIcon(lighting)}
                    <span className="text-2xl font-bold">{lighting}%</span>
                  </div>
                </div>
                <div className="text-xs text-white/80 mt-2">
                  {mockUser.floor} {location}
                </div>
              </div>
            </div>
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500"
              style={{
                background:
                  lighting < 50
                    ? `radial-gradient(ellipse at 50% 30%, rgba(255,255,200,${lighting / 200}) 0%, transparent 70%)`
                    : "none",
              }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-white",
                  temperature <= 20
                    ? "bg-blue-500"
                    : temperature <= 24
                    ? "bg-cyan-500"
                    : temperature <= 27
                    ? "bg-yellow-500"
                    : "bg-orange-500"
                )}
              >
                {getTemperatureIcon(temperature)}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  温度调节
                </div>
                <div className="text-xs text-gray-400">建议温度 22-26°C</div>
              </div>
            </div>
            <div
              className={cn(
                "px-3 py-1.5 rounded-lg text-white text-lg font-bold",
                `bg-gradient-to-r ${getTemperatureColor(temperature)}`
              )}
            >
              {temperature}°C
            </div>
          </div>

          <div className="relative pt-2">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-300 via-green-300 to-orange-300" />
            <input
              type="range"
              min={18}
              max={30}
              step={1}
              value={temperature}
              onChange={(e) => setTemperature(parseInt(e.target.value))}
              className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-4
                [&::-webkit-slider-thumb]:border-primary-500
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-4
                [&::-moz-range-thumb]:border-primary-500
                [&::-moz-range-thumb]:shadow-lg
                [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>18°C</span>
              <span>24°C</span>
              <span>30°C</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-white",
                  lighting >= 70
                    ? "bg-yellow-500"
                    : lighting >= 40
                    ? "bg-amber-400"
                    : "bg-gray-500"
                )}
              >
                {getLightingIcon(lighting)}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  照明亮度
                </div>
                <div className="text-xs text-gray-400">建议亮度 60-80%</div>
              </div>
            </div>
            <div
              className={cn(
                "px-3 py-1.5 rounded-lg text-white text-lg font-bold",
                lighting >= 70
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                  : lighting >= 40
                  ? "bg-gradient-to-r from-amber-400 to-orange-400"
                  : "bg-gradient-to-r from-gray-400 to-gray-600"
              )}
            >
              {lighting}%
            </div>
          </div>

          <div className="relative pt-2">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-gray-300 via-amber-200 to-yellow-400" />
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={lighting}
              onChange={(e) => setLighting(parseInt(e.target.value))}
              className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-4
                [&::-webkit-slider-thumb]:border-primary-500
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-4
                [&::-moz-range-thumb]:border-primary-500
                [&::-moz-range-thumb]:shadow-lg
                [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary-500" />
                所在位置
                <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLocation(opt.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    location === opt.value
                      ? "bg-primary-500 text-white shadow-sm shadow-primary-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              补充说明
              <span className="text-xs text-gray-400 font-normal ml-2">（选填）</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="如有其他舒适相关问题，请在此补充说明..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-200 outline-none text-sm text-gray-800 placeholder:text-gray-400 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 z-40">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "w-full py-3 rounded-xl text-white text-sm font-medium transition-all flex items-center justify-center gap-2",
              canSubmit
                ? "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-md shadow-primary-200"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            <Send size={16} />
            提交反馈
          </button>
        </div>
      </div>
    </div>
  );
}
