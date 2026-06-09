import { useState, useRef, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  MapPin,
  ImagePlus,
  X,
  Wrench,
  Thermometer,
  Lightbulb,
  Wifi,
  Droplets,
  MoreHorizontal,
  Send,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { repairCategories, useRepairStore } from "@/store/useRepairStore";
import { useMessageStore } from "@/store/useMessageStore";
import { cn } from "@/lib/utils";
import { mockUser } from "@/mock";

const iconMap: Record<string, React.ReactNode> = {
  Wrench: <Wrench size={20} />,
  Thermometer: <Thermometer size={20} />,
  Lightbulb: <Lightbulb size={20} />,
  Wifi: <Wifi size={20} />,
  Droplets: <Droplets size={20} />,
  MoreHorizontal: <MoreHorizontal size={20} />,
};

export default function RepairSubmit() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const category = repairCategories.find((c) => c.id === categoryId);
  const fromList = (routeLocation.state as any)?.fromList === true;

  const { addOrder } = useRepairStore();
  const addMessage = useMessageStore((s) => s.addMessage);

  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState(`${mockUser.floor} 公共区域`);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageTitle = useMemo(
    () => (category ? `${category.name}` : "报修提交"),
    [category]
  );

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).slice(0, 3 - images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = category && description.trim().length > 0 && location.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || !category) return;
    const order = addOrder({
      category: category.name,
      description: description.trim(),
      images,
      location: location.trim(),
    });

    addMessage({
      type: "repair",
      title: "报修单已提交",
      content: `您提交的${category.name}报修已受理，我们将尽快安排处理。位置：${location.trim()}`,
      relatedId: order.id,
    });

    if (fromList) {
      navigate("/repair/list", { state: { highlightId: order.id } });
    } else {
      navigate("/repair");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PageHeader title={pageTitle} showBack />

      {category && (
        <div className="px-4 pt-4">
          <div className={cn("bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3", category.color)}>
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center bg-white/80"
              )}
            >
              {iconMap[category.icon]}
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {category.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                维修工程师将在30分钟内响应
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            上传现场图片
            <span className="text-xs text-gray-400 font-normal ml-2">（最多3张，选填）</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                <img
                  src={img}
                  alt={`图片${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <button
                onClick={handleImageSelect}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1.5 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <ImagePlus size={28} className="text-gray-400" />
                <span className="text-xs text-gray-400">添加图片</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary-500" />
                报修位置
                <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="请输入具体位置，如：18F A区 1803工位"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-200 outline-none text-sm text-gray-800 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              问题描述
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述问题情况，如：空调制冷效果差，出风温度偏高，持续约2天..."
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-200 outline-none text-sm text-gray-800 placeholder:text-gray-400 resize-none"
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {description.length}/500
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">提交人</span>
            <span className="text-gray-700 font-medium">{mockUser.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-3">
            <span className="text-gray-500">联系电话</span>
            <span className="text-gray-700 font-medium">{mockUser.phone}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-3">
            <span className="text-gray-500">所在部门</span>
            <span className="text-gray-700 font-medium">{mockUser.department}</span>
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
            提交报修单
          </button>
        </div>
      </div>
    </div>
  );
}
