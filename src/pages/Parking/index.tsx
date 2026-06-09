import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Clock,
  CreditCard,
  Plus,
  X,
  Navigation,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useParkingStore } from "@/store/useParkingStore";
import { formatMoney } from "@/utils/format";

export default function Parking() {
  const navigate = useNavigate();
  const {
    currentRecord,
    plateNumbers,
    selectedFloor,
    setSelectedFloor,
    getSpots,
    addPlateNumber,
    removePlateNumber,
  } = useParkingStore();

  const [showAddPlate, setShowAddPlate] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  const floors = ["B1", "B2", "B3"];
  const areas = ["A", "B", "C"];
  const spots = getSpots(selectedFloor);

  const availableCount = spots.filter((s) => s.status === "available").length;
  const occupiedCount = spots.filter((s) => s.status === "occupied").length;
  const reservedCount = spots.filter((s) => s.status === "reserved").length;

  const getAreaSpots = (area: string) =>
    spots.filter((s) => s.area === area);

  const handleAddPlate = () => {
    if (newPlate.trim()) {
      addPlateNumber(newPlate.trim().toUpperCase());
      setNewPlate("");
      setShowAddPlate(false);
    }
  };

  const getSpotColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success-500 text-white border-success-600";
      case "occupied":
        return "bg-danger-500 text-white border-danger-600";
      case "reserved":
        return "bg-warning-500 text-white border-warning-600";
      default:
        return "bg-gray-200 text-gray-500 border-gray-300";
    }
  };

  const getSpotIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 size={12} />;
      case "occupied":
        return <Car size={12} />;
      case "reserved":
        return <Lock size={12} />;
      default:
        return null;
    }
  };

  const handleSpotClick = (spot: typeof spots[0]) => {
    if (spot.status === "available") {
      setSelectedSpot(spot.spotNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="停车服务" />

      <div className="p-4 space-y-4">
        {currentRecord && (
          <div className="bg-gradient-to-br from-primary-800 to-primary-600 rounded-2xl p-5 text-white shadow-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Car size={20} />
              <span className="font-semibold">当前停车状态</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-white/70 text-xs mb-1">车牌号</div>
                <div className="text-xl font-bold tracking-wide">
                  {currentRecord.plateNumber}
                </div>
              </div>
              <div>
                <div className="text-white/70 text-xs mb-1">入场时间</div>
                <div className="text-base font-medium">
                  {currentRecord.enterTime}
                </div>
              </div>
              <div>
                <div className="text-white/70 text-xs mb-1">已停时长</div>
                <div className="text-base font-medium flex items-center gap-1">
                  <Clock size={14} />
                  {currentRecord.duration}
                </div>
              </div>
              <div>
                <div className="text-white/70 text-xs mb-1">预计费用</div>
                <div className="text-xl font-bold text-accent-300">
                  {formatMoney(currentRecord.fee)}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/parking/pay")}
              className="w-full bg-white text-primary-800 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-lg"
            >
              <CreditCard size={20} />
              立即缴费
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Car size={18} className="text-primary-800" />
              <span className="font-semibold text-gray-800">车牌管理</span>
            </div>
            <button
              onClick={() => setShowAddPlate(true)}
              className="flex items-center gap-1 text-primary-800 text-sm font-medium hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={16} />
              添加车牌
            </button>
          </div>
          <div className="space-y-2">
            {plateNumbers.map((plate) => (
              <div
                key={plate}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Car size={18} className="text-primary-800" />
                  </div>
                  <span className="font-semibold text-gray-800 tracking-wide">
                    {plate}
                  </span>
                </div>
                <button
                  onClick={() => removePlateNumber(plate)}
                  className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {plateNumbers.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无绑定车牌，请点击右上角添加
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary-800" />
              <span className="font-semibold text-gray-800">车位地图</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-success-500" />
                <span className="text-gray-600">空闲 {availableCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-danger-500" />
                <span className="text-gray-600">占用 {occupiedCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-warning-500" />
                <span className="text-gray-600">预留 {reservedCount}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            {floors.map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                  selectedFloor === floor
                    ? "bg-primary-800 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {floor}层
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {areas.map((area) => (
              <div key={area}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-primary-100 rounded-md flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-800">
                      {area}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {area}区
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {getAreaSpots(area).map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => handleSpotClick(spot)}
                      disabled={spot.status !== "available"}
                      className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all ${getSpotColor(
                        spot.status
                      )} ${
                        spot.status === "available"
                          ? "cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                          : "cursor-not-allowed opacity-90"
                      } ${
                        selectedSpot === spot.spotNumber
                          ? "ring-2 ring-offset-2 ring-primary-800"
                          : ""
                      }`}
                    >
                      {getSpotIcon(spot.status)}
                      <span>{spot.spotNumber.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedSpot && (
            <div className="mt-5 p-4 bg-primary-50 rounded-xl border border-primary-100 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">已选择车位</div>
                  <div className="text-lg font-bold text-primary-800">
                    {selectedFloor}-{selectedSpot}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 bg-primary-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-900 active:bg-primary-800 transition-colors">
                  <Navigation size={16} />
                  导航前往
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-primary-800" />
            <span className="font-semibold text-gray-800">空闲车位统计</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {floors.map((floor) => {
              const floorSpots = getSpots(floor);
              const floorAvailable = floorSpots.filter(
                (s) => s.status === "available"
              ).length;
              const percent = Math.round((floorAvailable / 60) * 100);
              return (
                <div
                  key={floor}
                  className="text-center p-3 rounded-xl bg-gray-50"
                >
                  <div className="text-xs text-gray-500 mb-1">{floor}层</div>
                  <div className="text-2xl font-bold text-success-600">
                    {floorAvailable}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{percent}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAddPlate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">添加车牌</h3>
              <button
                onClick={() => setShowAddPlate(false)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newPlate}
              onChange={(e) => setNewPlate(e.target.value)}
              placeholder="请输入车牌号，如：京A·88888"
              maxLength={10}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-primary-800 focus:ring-2 focus:ring-primary-100 mb-5 uppercase"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPlate(false)}
                className="flex-1 py-3.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddPlate}
                disabled={!newPlate.trim()}
                className="flex-1 py-3.5 rounded-xl font-medium text-white bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                确定添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
