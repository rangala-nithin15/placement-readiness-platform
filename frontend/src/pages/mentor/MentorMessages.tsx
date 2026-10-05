import WhatsAppChatView from "../../components/chat/WhatsAppChatView";

export default function MentorMessages() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Mentees Group Chat</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time group discussion with all students assigned to your mentorship cohort.
        </p>
      </div>

      <WhatsAppChatView userRole="MENTOR" />
    </div>
  );
}
