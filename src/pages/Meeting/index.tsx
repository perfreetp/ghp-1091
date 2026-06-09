import { useNavigate } from "react-router-dom";
import { Calendar, Users, Projector, Presentation, Video, ChevronRight, ClipboardList } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useMeetingStore } from "@/store/useMeetingStore";
import { getDateLabel, formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";

const capacityOptions = [
  { label: "不限", value: 0 },
  { label: "4人", value: 4 },
  { label: "6人", value: 6 },
  { label: "10人+", value: 10 },
  { label: "20人+", value: 20 },
];

const equipmentOptions = ["投影仪", "白板", "视频会议"];

const equipmentIcons: Record<string, React.ReactNode> = {
  投影仪: <Projector size={14} />,
  白板: <Presentation size={14} />,
  视频会议: <Video size={14} />,
};

export default function MeetingIndex() {
  const navigate = useNavigate();
  const { filters, setFilters, getFilteredRooms } = useMeetingStore();
  const rooms = getFilteredRooms();

  const dateList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: formatDate(d),
      label: getDateLabel(i),
      day: d.getDate(),
    };
  });

  const handleDateSelect = (date: string) => {
    setFilters({ date });
  };

  const toggleEquipment = (eq: string) => {
    const current = filters.equipment;
    const next = current.includes(eq)
      ? current.filter((e) => e !== eq)
      : [...current, eq];
    setFilters({ equipment: next });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader
        title="会议室"
        showSearch
        rightContent={
          <button
            onClick={() => navigate("/meeting/my")}
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ClipboardList size={20} className="text-gray-600" />
          </button>
        }
      />

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-primary-500" />
            <span className="text-sm font-medium text-gray-700">选择日期</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {dateList.map((item) => (
              <button
                key={item.date}
                onClick={() => handleDateSelect(item.date)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center w-16 py-2 rounded-xl transition-all",
                  filters.date === item.date
                    ? "bg-primary-500 text-white shadow-md shadow-primary-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    filters.date === item.date ? "text-primary-100" : "text-gray-500"
                  )}
                >
                  {item.label}
                </span>
                <span className="text-lg font-semibold mt-0.5">{item.day}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-primary-500" />
              <span className="text-sm font-medium text-gray-700">人数筛选</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {capacityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters({ capacity: opt.value })}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm transition-all",
                    filters.capacity === opt.value
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
            <div className="flex items-center gap-2 mb-3">
              <Projector size={16} className="text-primary-500" />
              <span className="text-sm font-medium text-gray-700">设备筛选</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((eq) => {
                const selected = filters.equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all",
                      selected
                        ? "bg-primary-500 text-white shadow-sm shadow-primary-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {equipmentIcons[eq]}
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">
            可用会议室 <span className="text-primary-500">({rooms.length})</span>
          </h2>
        </div>

        <div className="space-y-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-40">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Users size={12} className="text-primary-500" />
                  <span className="text-xs font-medium text-gray-700">
                    {room.capacity}人
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {room.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{room.floor}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary-500">
                      ¥{room.pricePerHour}
                    </span>
                    <span className="text-xs text-gray-400">/小时</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                  {room.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {room.equipment.slice(0, 4).map((eq) => (
                    <span
                      key={eq}
                      className="flex items-center gap-1 bg-primary-50 text-primary-600 px-2 py-1 rounded-md text-xs"
                    >
                      {equipmentIcons[eq] || <span className="w-3" />}
                      {eq}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/meeting/${room.id}`)}
                  className="w-full py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 active:bg-primary-700 transition-colors flex items-center justify-center gap-1"
                >
                  立即预订
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}

          {rooms.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">
              暂无符合条件的会议室
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
