import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useMeetingStore } from "@/store/useMeetingStore";
import { generateTimeSlots } from "@/utils/date";
import { getStatusText } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { MeetingBooking } from "@/types";

const statusStyleMap: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  changed: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-purple-100 text-purple-700",
};

const statusIconMap: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle size={12} />,
  changed: <RefreshCw size={12} />,
  cancelled: <XCircle size={12} />,
  completed: <CheckCircle size={12} />,
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlightId");
  const { getMyBookings, cancelBooking, updateBooking, getRoomBookings, rooms } =
    useMeetingStore();
  const bookings = getMyBookings();

  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const [rescheduleBooking, setRescheduleBooking] = useState<MeetingBooking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<MeetingBooking | null>(null);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newStartTime, setNewStartTime] = useState<string | null>(null);
  const [newEndTime, setNewEndTime] = useState<string | null>(null);
  const [selectingNewEnd, setSelectingNewEnd] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(8, 20, 30), []);

  const now = new Date();

  const { upcoming, history } = useMemo(() => {
    const upcomingList: MeetingBooking[] = [];
    const historyList: MeetingBooking[] = [];

    bookings.forEach((b) => {
      if (b.status === "cancelled") {
        historyList.push(b);
        return;
      }
      const bookingTime = new Date(`${b.date}T${b.startTime}`);
      if (bookingTime >= now) {
        upcomingList.push(b);
      } else {
        historyList.push(b);
      }
    });

    return { upcoming: upcomingList, history: historyList };
  }, [bookings, now]);

  const displayList = activeTab === "upcoming" ? upcoming : history;

  useEffect(() => {
    if (highlightId) {
      const findHigh = bookings.find((b) => b.id === highlightId);
      if (findHigh) {
        const isHistory =
          findHigh.status === "cancelled" ||
          new Date(`${findHigh.date}T${findHigh.startTime}`) < now;
        if (isHistory && activeTab === "upcoming") {
          setActiveTab("history");
        }
        if (!isHistory && activeTab === "history") {
          setActiveTab("upcoming");
        }
      }
    }
  }, [highlightId, bookings, activeTab, now]);

  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => {
        document.getElementById(highlightId)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [highlightId, bookings, activeTab]);

  const handleCancelConfirm = () => {
    if (cancelModalBooking) {
      cancelBooking(cancelModalBooking.id);
      setCancelModalBooking(null);
    }
  };

  const getSlotIndex = (slot: string) => timeSlots.indexOf(slot);

  const isNewSlotBooked = (slot: string) => {
    if (!rescheduleBooking) return false;
    const existing = getRoomBookings(rescheduleBooking.roomId, newDate).filter(
      (b) => b.id !== rescheduleBooking.id
    );
    return existing.some((b) => slot >= b.startTime && slot < b.endTime);
  };

  const isInNewRange = (slot: string) => {
    if (!newStartTime || !newEndTime) return false;
    return slot >= newStartTime && slot < newEndTime;
  };

  const handleNewSlotClick = (slot: string) => {
    if (isNewSlotBooked(slot)) return;

    if (!newStartTime || (newStartTime && newEndTime)) {
      setNewStartTime(slot);
      setNewEndTime(null);
      setSelectingNewEnd(true);
    } else if (selectingNewEnd && newStartTime) {
      const startIdx = getSlotIndex(newStartTime);
      const endIdx = getSlotIndex(slot);
      if (endIdx <= startIdx) {
        setNewStartTime(slot);
        setNewEndTime(null);
        setSelectingNewEnd(true);
      } else {
        const conflict = getRoomBookings(rescheduleBooking?.roomId || "", newDate)
          .filter((b) => b.id !== rescheduleBooking?.id)
          .some((b) => {
            const bStartIdx = getSlotIndex(b.startTime);
            const bEndIdx = getSlotIndex(b.endTime);
            return startIdx < bEndIdx && endIdx > bStartIdx;
          });
        if (!conflict) {
          const nextSlotIdx = endIdx;
          const nextSlot = timeSlots[nextSlotIdx] || slot;
          setNewEndTime(nextSlot);
          setSelectingNewEnd(false);
        }
      }
    }
  };

  const handleRescheduleConfirm = () => {
    if (!rescheduleBooking || !newStartTime || !newEndTime) return;
    updateBooking(rescheduleBooking.id, {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
    });
    setRescheduleBooking(null);
    setNewStartTime(null);
    setNewEndTime(null);
  };

  const openReschedule = (booking: MeetingBooking) => {
    setRescheduleBooking(booking);
    setNewDate(booking.date);
    setNewStartTime(null);
    setNewEndTime(null);
    setSelectingNewEnd(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader title="我的预订" showBack />

      <div className="sticky top-14 z-30 bg-gray-50 px-4 pt-3 pb-2">
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm">
          {[
            { key: "upcoming", label: "即将开始", count: upcoming.length },
            { key: "history", label: "历史记录", count: history.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "upcoming" | "history")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                activeTab === tab.key
                  ? "bg-primary-500 text-white shadow-sm shadow-primary-200"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-2 space-y-4">
        {displayList.map((booking) => {
          const room = rooms.find((r) => r.id === booking.roomId);
          const isCancelled = booking.status === "cancelled";
          const canModify =
            activeTab === "upcoming" && !isCancelled;

          return (
            <div
              key={booking.id}
              id={booking.id}
              className={cn(
                "bg-white rounded-2xl shadow-sm overflow-hidden transition-all",
                isCancelled && "opacity-75",
                booking.id === highlightId &&
                  "ring-2 ring-primary-400 ring-offset-2 bg-primary-50 animate-pulse"
              )}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          "text-base font-semibold",
                          isCancelled
                            ? "text-gray-400 line-through"
                            : "text-gray-800"
                        )}
                      >
                        {booking.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <MapPin size={12} />
                      {booking.roomName}
                      {room && <span className="text-gray-400"> · {room.floor}</span>}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                      statusStyleMap[booking.status]
                    )}
                  >
                    {statusIconMap[booking.status]}
                    {getStatusText(booking.status)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar size={14} className="text-primary-500" />
                    {booking.date.slice(5)}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock size={14} className="text-primary-500" />
                    {booking.startTime}-{booking.endTime}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Users size={14} className="text-primary-500" />
                    {booking.attendees}人
                  </div>
                </div>

                {canModify && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openReschedule(booking)}
                      className="flex-1 py-2 rounded-xl border border-primary-200 text-primary-600 text-sm font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit3 size={14} />
                      改签
                    </button>
                    <button
                      onClick={() => setCancelModalBooking(booking)}
                      className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X size={14} />
                      取消
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {displayList.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">
              {activeTab === "upcoming" ? "暂无即将开始的预订" : "暂无历史预订记录"}
            </p>
            {activeTab === "upcoming" && (
              <button
                onClick={() => navigate("/meeting")}
                className="mt-4 px-6 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                去预订会议室
              </button>
            )}
          </div>
        )}
      </div>

      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
              确认取消预订？
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              取消后该时段将释放给其他同事预订
              <br />
              <span className="font-medium text-gray-700">
                {cancelModalBooking.title} · {cancelModalBooking.startTime}-
                {cancelModalBooking.endTime}
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                再想想
              </button>
              <button
                onClick={handleCancelConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}

      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">改签预订</h3>
              <button
                onClick={() => setRescheduleBooking(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="bg-primary-50 rounded-xl p-3 mb-4">
              <div className="text-sm text-primary-700 font-medium mb-1">
                {rescheduleBooking.title}
              </div>
              <div className="text-xs text-primary-600">
                当前: {rescheduleBooking.date} {rescheduleBooking.startTime}-
                {rescheduleBooking.endTime}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择日期
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setNewStartTime(null);
                  setNewEndTime(null);
                }}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-200 outline-none text-sm text-gray-800"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择新时段
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl max-h-40 overflow-y-auto">
                {timeSlots.map((slot) => {
                  const booked = isNewSlotBooked(slot);
                  const selected = isInNewRange(slot) || slot === newStartTime;
                  return (
                    <button
                      key={slot}
                      onClick={() => handleNewSlotClick(slot)}
                      disabled={booked}
                      className={cn(
                        "px-2 py-1 rounded-lg text-xs font-medium transition-all min-w-[55px]",
                        booked && "bg-red-50 text-red-300 cursor-not-allowed line-through",
                        !booked && !selected && "bg-white text-gray-600 hover:bg-gray-100",
                        selected && !booked && "bg-primary-500 text-white"
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              {newStartTime && (
                <div className="mt-2 text-xs text-primary-600 text-center font-medium">
                  {newStartTime} {newEndTime ? `- ${newEndTime}` : "~ 选择结束时间"}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRescheduleBooking(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRescheduleConfirm}
                disabled={!newStartTime || !newEndTime}
                className={cn(
                  "flex-1 py-3 rounded-xl font-medium transition-colors",
                  newStartTime && newEndTime
                    ? "bg-primary-500 text-white hover:bg-primary-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                确认改签
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
