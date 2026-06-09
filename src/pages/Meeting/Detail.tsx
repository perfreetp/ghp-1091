import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Projector,
  Presentation,
  Video,
  Phone,
  Mic,
  Speaker,
  VideoIcon,
  Clock,
  Calendar,
  Check,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useMeetingStore } from "@/store/useMeetingStore";
import { generateTimeSlots } from "@/utils/date";
import { cn } from "@/lib/utils";

const equipmentIcons: Record<string, React.ReactNode> = {
  投影仪: <Projector size={16} />,
  白板: <Presentation size={16} />,
  视频会议: <Video size={16} />,
  电话会议: <Phone size={16} />,
  电视屏幕: <VideoIcon size={16} />,
  麦克风: <Mic size={16} />,
  音响系统: <Speaker size={16} />,
  录制设备: <VideoIcon size={16} />,
};

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rooms, filters, getRoomBookings, addBooking } = useMeetingStore();
  const room = rooms.find((r) => r.id === id);

  const [imageIndex, setImageIndex] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState(4);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(8, 20, 30), []);
  const roomBookings = getRoomBookings(id || "", filters.date);

  const images = room
    ? [room.image, room.image, room.image]
    : [];

  const isBooked = (slot: string) => {
    return roomBookings.some((b) => slot >= b.startTime && slot < b.endTime);
  };

  const isInSelectedRange = (slot: string) => {
    if (!startTime || !endTime) return false;
    return slot >= startTime && slot < endTime;
  };

  const getSlotIndex = (slot: string) => timeSlots.indexOf(slot);

  const handleSlotClick = (slot: string) => {
    if (isBooked(slot)) return;

    if (!startTime || (startTime && endTime)) {
      setStartTime(slot);
      setEndTime(null);
      setSelectingEnd(true);
    } else if (selectingEnd && startTime) {
      const startIdx = getSlotIndex(startTime);
      const endIdx = getSlotIndex(slot);
      if (endIdx <= startIdx) {
        setStartTime(slot);
        setEndTime(null);
        setSelectingEnd(true);
      } else {
        const conflict = roomBookings.some((b) => {
          const bStartIdx = getSlotIndex(b.startTime);
          const bEndIdx = getSlotIndex(b.endTime);
          return (
            (startIdx < bEndIdx && endIdx > bStartIdx)
          );
        });
        if (!conflict) {
          const nextSlotIdx = endIdx;
          const nextSlot = timeSlots[nextSlotIdx] || slot;
          setEndTime(nextSlot);
          setSelectingEnd(false);
        }
      }
    }
  };

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const startIdx = getSlotIndex(startTime);
    const endIdx = getSlotIndex(endTime);
    return ((endIdx - startIdx) * 30) / 60;
  };

  const totalPrice = calculateHours() * (room?.pricePerHour || 0);

  const handleSubmit = () => {
    if (!room || !startTime || !endTime || !title.trim()) return;
    addBooking({
      roomId: room.id,
      roomName: room.name,
      date: filters.date,
      startTime,
      endTime,
      title: title.trim(),
      attendees,
    });
    navigate("/meeting/my");
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="会议室详情" showBack />
        <div className="p-8 text-center text-gray-400">会议室不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PageHeader title={room.name} showBack />

      <div className="relative h-56 bg-gray-200 overflow-hidden">
        <img
          src={images[imageIndex]}
          alt={room.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setImageIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === imageIndex ? "bg-white w-6" : "bg-white/50"
              )}
            />
          ))}
        </div>
        {imageIndex > 0 && (
          <button
            onClick={() => setImageIndex((i) => i - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {imageIndex < images.length - 1 && (
          <button
            onClick={() => setImageIndex((i) => i + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{room.name}</h1>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <MapPin size={12} />
                {room.floor}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary-500">
                <Users size={14} />
                <span className="font-semibold">{room.capacity}人</span>
              </div>
              <div className="mt-1">
                <span className="text-xl font-bold text-primary-500">
                  ¥{room.pricePerHour}
                </span>
                <span className="text-xs text-gray-400">/小时</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">{room.description}</p>

          <div className="flex flex-wrap gap-2">
            {room.equipment.map((eq) => (
              <span
                key={eq}
                className="flex items-center gap-1.5 bg-primary-50 text-primary-600 px-3 py-1.5 rounded-lg text-sm"
              >
                {equipmentIcons[eq] || <Check size={14} />}
                {eq}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary-500" />
              <span className="font-semibold text-gray-800">选择时段</span>
            </div>
            <span className="text-sm text-gray-500">{filters.date}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {timeSlots.map((slot) => {
              const booked = isBooked(slot);
              const selected = isInSelectedRange(slot) || slot === startTime;
              const isStart = slot === startTime;
              const isEnd = slot === endTime;
              return (
                <button
                  key={slot}
                  onClick={() => handleSlotClick(slot)}
                  disabled={booked}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all min-w-[60px]",
                    booked && "bg-red-50 text-red-300 cursor-not-allowed line-through",
                    !booked && !selected && "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    selected && !booked && "bg-primary-500 text-white shadow-sm shadow-primary-200",
                    (isStart || isEnd) && selected && "ring-2 ring-primary-300"
                  )}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-100" />
              可预约
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary-500" />
              已选
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
              已预订
            </div>
          </div>

          {startTime && (
            <div className="mt-4 p-3 bg-primary-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-primary-500" />
                <span className="text-gray-700">
                  {startTime} {endTime ? `- ${endTime}` : "~ 选择结束时间"}
                </span>
              </div>
              {endTime && (
                <span className="text-xs text-primary-600 font-medium">
                  {calculateHours()}小时
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              会议主题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入会议主题"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-200 outline-none text-sm text-gray-800 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              参会人数
            </label>
            <input
              type="number"
              value={attendees}
              onChange={(e) =>
                setAttendees(Math.max(1, Math.min(room.capacity, parseInt(e.target.value) || 1)))
              }
              min={1}
              max={room.capacity}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-200 outline-none text-sm text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">总计</div>
            <div className="text-xl font-bold text-primary-500">
              ¥{totalPrice.toFixed(2)}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!startTime || !endTime || !title.trim()}
            className={cn(
              "px-8 py-3 rounded-xl text-white text-sm font-medium transition-all",
              startTime && endTime && title.trim()
                ? "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-md shadow-primary-200"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            确认预订
          </button>
        </div>
      </div>
    </div>
  );
}
