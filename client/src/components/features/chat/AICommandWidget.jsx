import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Download, Loader2, MessageSquare, Mic, Send, Square, X } from 'lucide-react';
import { sendAIChatMessage, sendAIVoiceTranscript } from '../../../api/ai';
import { useSOS } from '../../../context/SOSContext';
import { useAuth } from '../../../hooks/useAuth';

const CHAT_STATE_KEY = 'ai_command_widget_state_v1';

const ROLE_CONFIG = {
  CUSTOMER: {
    assistantName: 'Customer Copilot',
    roleLabel: 'Customer',
    accentClass: 'from-sky-600 via-cyan-500 to-emerald-500',
    starterSuggestions: [
      'Book plumber tomorrow 10 AM in Pune',
      'Show my wallet balance',
      'Show my latest booking status',
      'Help me understand pending payments',
    ],
    quickActions: [
      { label: 'Book Service', prompt: 'Book electrician tomorrow 11 AM in Mumbai' },
      { label: 'My Bookings', prompt: 'Show my latest booking' },
      { label: 'Wallet', prompt: 'Show my wallet balance' },
      { label: 'Notifications', prompt: 'Show notifications' },
    ],
  },
  WORKER: {
    assistantName: 'Worker Copilot',
    roleLabel: 'Professional',
    accentClass: 'from-emerald-600 via-teal-500 to-cyan-500',
    starterSuggestions: [
      'Show my worker bookings',
      'Show payout history',
      'Show verification status',
      'Add availability monday 10:00 to 13:00',
    ],
    quickActions: [
      { label: 'Bookings', prompt: 'Show my worker bookings' },
      { label: 'Payouts', prompt: 'Show payout details' },
      { label: 'Availability', prompt: 'Show availability' },
      { label: 'Verify', prompt: 'Show verification status' },
    ],
  },
  ADMIN: {
    assistantName: 'Admin Copilot',
    roleLabel: 'Administrator',
    accentClass: 'from-amber-600 via-orange-500 to-rose-500',
    starterSuggestions: [
      'Show dashboard',
      'Show verification queue',
      'Show fraud alerts',
      'Show analytics summary',
    ],
    quickActions: [
      { label: 'Dashboard', prompt: 'Show dashboard' },
      { label: 'Users', prompt: 'Show users' },
      { label: 'Verification', prompt: 'Show verification queue' },
      { label: 'Fraud', prompt: 'Show fraud alerts' },
    ],
  },
  GUEST: {
    assistantName: 'AI Assistant',
    roleLabel: 'Guest',
    accentClass: 'from-sky-600 via-cyan-500 to-emerald-500',
    starterSuggestions: [
      'Show services',
      'Show top workers',
      'Open profile',
      'Show notifications',
    ],
    quickActions: [
      { label: 'Services', prompt: 'Show services' },
      { label: 'Workers', prompt: 'Show top workers' },
      { label: 'Bookings', prompt: 'Show my bookings' },
      { label: 'Wallet', prompt: 'Show my wallet balance' },
    ],
  },
};

function getRoleConfig(role) {
  const key = String(role || '').toUpperCase();
  return ROLE_CONFIG[key] || ROLE_CONFIG.GUEST;
}

function getStarterSuggestions(role) {
  return getRoleConfig(role).starterSuggestions;
}

const intentSuggestions = {
  create_booking: ['Book electrician tomorrow 11 AM in Mumbai', 'Show services list', 'Show my latest booking status', 'Cancel booking 12'],
  search_service: ['Book plumber tomorrow 10 AM in Pune', 'Top workers', 'Services in pune', 'Show my wallet balance'],
  get_booking_status: ['Booking details 12', 'Cancel booking 12', 'Show my wallet balance', 'Platform guide'],
  view_wallet: ['See history', 'Redeem 200', 'Show notifications', 'Booking status'],
  payment_history: ['Show my wallet balance', 'Validate coupon SAVE50 amount 1200', 'My referral code', 'Platform guide'],
  notifications: ['Mark all notifications read', 'Show my wallet balance', 'Show my latest booking status', 'Platform guide'],
  reviews: ['Pending reviews', 'Review booking 12 with 5 stars', 'Show my latest booking status', 'Platform guide'],
  availability: ['Add availability monday 10:00 to 13:00', 'Remove availability slot 12', 'Payout details', 'Platform guide'],
  payout_history: ['Payout details', 'Update payout method UPI test@upi', 'Instant payout', 'Platform guide'],
  profile_view: ['Update profile', 'Show my wallet balance', 'Show notifications', 'Platform guide'],
  safety_contacts: ['Add emergency contact Rahul 9999999999', 'Remove emergency contact 3', 'Trigger SOS booking 12', 'Platform guide'],
  platform_guide: ['Show my wallet balance', 'Show notifications', 'My conversations', 'Show profile'],
};

function suggestionsFromIntent(intentName, role) {
  const key = String(intentName || '').trim();
  return intentSuggestions[key] || getStarterSuggestions(role);
}

function AssistantMessageContent({ text }) {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return null;

  const paragraphs = normalized.split(/\n{2,}/).map((entry) => entry.trim()).filter(Boolean);

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split('\n').map((line) => line.trim()).filter(Boolean);
        const isBullet = lines.length > 0 && lines.every((line) => /^[-*•]\s+/.test(line));
        const isNumbered = lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line));

        if (isBullet) {
          return (
            <ul key={`p-${index}`} className="space-y-1 pl-4">
              {lines.map((line, itemIndex) => (
                <li key={`b-${itemIndex}`} className="list-disc">
                  {line.replace(/^[-*•]\s+/, '')}
                </li>
              ))}
            </ul>
          );
        }

        if (isNumbered) {
          return (
            <ol key={`p-${index}`} className="space-y-1 pl-4">
              {lines.map((line, itemIndex) => (
                <li key={`n-${itemIndex}`} className="list-decimal">
                  {line.replace(/^\d+\.\s+/, '')}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`p-${index}`} className="leading-relaxed">
            {lines.join(' ')}
          </p>
        );
      })}
    </div>
  );
}

function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm break-words',
          isUser
            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
            : 'border border-zinc-200 bg-zinc-50 text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100',
        ].join(' ')}
      >
        {isUser ? text : <AssistantMessageContent text={text} />}
      </div>
    </div>
  );
}

function normalizeAgentTarget(target, role) {
  const raw = String(target || '').trim();
  if (!raw) return raw;

  const userRole = String(role || '').toUpperCase();
  if (raw === '/bookings') {
    if (userRole === 'WORKER') return '/worker/bookings';
    if (userRole === 'ADMIN') return '/admin/bookings';
    return '/customer/bookings';
  }

  if (raw === '/profile') {
    if (userRole === 'WORKER') return '/worker/profile';
    return '/customer/profile';
  }

  const aliasMap = {
    '/notifications': '/notifications/preferences',
    '/admin/fraud-alerts': '/admin/fraud',
    '/wallet': userRole === 'WORKER' ? '/worker/earnings' : '/customer/wallet',
  };

  return aliasMap[raw] || raw;
}

export default function AICommandWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeBooking } = useSOS();
  const roleConfig = useMemo(() => getRoleConfig(user?.role), [user?.role]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi. I can help with bookings, wallet, notifications, and role-specific actions. Pick an option or type your request.',
    },
  ]);
  const [suggestions, setSuggestions] = useState(getStarterSuggestions(user?.role));
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceTranscriptRef = useRef('');

  const exportChat = () => {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        sessionId: sessionId || null,
        page: window.location.pathname,
        messageCount: messages.length,
        messages: messages.map((message, index) => ({
          index: index + 1,
          role: message.role,
          text: message.text,
        })),
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sessionSuffix = sessionId ? String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '-') : 'local';
      link.href = url;
      link.download = `ai-chat-export-${sessionSuffix}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      appendAssistantMessage('Could not export chat right now. Please try again.');
    }
  };

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(CHAT_STATE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.messages) && parsed.messages.length > 0) {
        setMessages(parsed.messages);
      }
      if (Array.isArray(parsed?.suggestions) && parsed.suggestions.length > 0) {
        setSuggestions(parsed.suggestions);
      }
      if (parsed?.sessionId) {
        setSessionId(parsed.sessionId);
      }
      if (typeof parsed?.open === 'boolean') {
        setOpen(parsed.open);
      }
    } catch {
      // Ignore invalid stored chat state.
    }
  }, []);

  useEffect(() => {
    setSuggestions((prev) => (prev?.length ? prev : getStarterSuggestions(user?.role)));
  }, [user?.role]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        CHAT_STATE_KEY,
        JSON.stringify({
          sessionId,
          open,
          messages,
          suggestions,
        })
      );
    } catch {
      // Best-effort persistence only.
    }
  }, [sessionId, open, messages, suggestions]);

  const appendAssistantMessage = (text) => {
    const clean = String(text || '').trim();
    if (!clean) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant' && last?.text === clean) {
        return prev;
      }
      return [...prev, { role: 'assistant', text: clean }];
    });
  };

  const scrollToLatest = () => {
    if (!messagesContainerRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    if (!open) return;
    scrollToLatest();
  }, [open, messages, loading]);

  useEffect(() => () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Best-effort cleanup.
      }
      recognitionRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const applyAiResponse = (data, fallbackMessage) => {
    if (data?.sessionId && !sessionId) {
      setSessionId(data.sessionId);
    }

    if (data?.transcript) {
      setMessages((prev) => [...prev, { role: 'user', text: data.transcript }]);
    }

    const responseType = String(data?.type || 'text').trim();
    const responseMessage = data?.message || data?.reply || fallbackMessage;

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: responseMessage,
      },
    ]);

    if (responseType === 'confirmation') {
      setPendingConfirmation({
        sessionId: data?.sessionId || sessionId,
        metadata: data?.metadata || null,
      });
    } else {
      setPendingConfirmation(null);
    }

    if (data?.action === 'navigate' && data?.target) {
      navigate(normalizeAgentTarget(data.target, user?.role));
    }

    if (Array.isArray(data?.suggestions) && data.suggestions.length) {
      setSuggestions(data.suggestions.slice(0, 4));
      return;
    }

    const nextSuggestions = suggestionsFromIntent(data?.intent?.intent, user?.role);
    setSuggestions(nextSuggestions.slice(0, 4));
  };

  const sendMessage = async (text) => {
    const message = String(text || '').trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendAIChatMessage({ message, sessionId });
      applyAiResponse(data, 'I could not generate a response right now.');
    } catch (error) {
      const rawError = String(error?.response?.data?.error || error?.message || '').toLowerCase();
      let friendlyError = error?.response?.data?.error || 'Something went wrong. Please try again.';

      if (rawError.includes('authentication service unavailable') || rawError.includes('unauthorized')) {
        friendlyError = 'Session check failed. Please refresh once and sign in again.';
      } else if (rawError.includes('timeout') || rawError.includes('econnaborted')) {
        friendlyError = 'The request timed out. Please try again in a few seconds.';
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: friendlyError,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (confirmed) => {
    if (loading) return;
    const confirmationText = confirmed ? 'yes' : 'no';
    await sendMessage(confirmationText);
    setPendingConfirmation(null);
  };

  const startVoiceRecording = async () => {
    if (loading || isRecording) return;

    const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    if (!window.isSecureContext && !isLocalHost) {
      appendAssistantMessage('Voice input requires HTTPS. Open the app on an HTTPS URL and try again.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      appendAssistantMessage('Voice transcription is not supported in this browser. Try Chrome or Edge, or type your command.');
      return;
    }

    if (navigator.permissions?.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        if (permissionStatus.state === 'denied') {
          appendAssistantMessage('Microphone access is blocked in browser settings. Allow mic for this site and reload once.');
          return;
        }
      } catch {
        // Some browsers do not support querying microphone permission state.
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = navigator.language || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
      voiceTranscriptRef.current = '';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .slice(event.resultIndex)
          .map((result) => result?.[0]?.transcript || '')
          .join(' ')
          .trim();

        if (transcript) {
          voiceTranscriptRef.current = `${voiceTranscriptRef.current} ${transcript}`.trim();
        }
      };

      recognition.onerror = (event) => {
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        recognitionRef.current = null;
        setIsRecording(false);
        setIsProcessingVoice(false);

        const errorName = String(event?.error || '');
        if (errorName === 'not-allowed' || errorName === 'service-not-allowed') {
          appendAssistantMessage('Microphone access was denied. Allow microphone for this site in browser permissions and try again.');
          return;
        }

        if (errorName === 'no-speech') {
          appendAssistantMessage('I did not catch anything. Try speaking again, or type your command.');
          return;
        }

        appendAssistantMessage('Voice transcription failed. Please try again or use text command.');
      };

      recognition.onend = async () => {
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        const transcript = String(voiceTranscriptRef.current || '').trim();
        recognitionRef.current = null;
        setIsRecording(false);

        if (!transcript) {
          setIsProcessingVoice(false);
          appendAssistantMessage('I could not hear a clear command. Please try again.');
          return;
        }

        setLoading(true);
        try {
          const data = await sendAIVoiceTranscript({ transcript, sessionId, locale: navigator.language || 'en-IN' });
          applyAiResponse(data, 'I could not process your voice command right now.');
        } catch (error) {
          try {
            const fallbackData = await sendAIChatMessage({ message: transcript, sessionId });
            applyAiResponse(fallbackData, 'I could not process your voice command right now.');
          } catch (fallbackError) {
            appendAssistantMessage(fallbackError?.response?.data?.error || error?.response?.data?.error || 'Voice command failed. Please try again.');
          }
        } finally {
          setLoading(false);
          setIsProcessingVoice(false);
          voiceTranscriptRef.current = '';
        }
      };

      recognition.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setIsProcessingVoice(false);
      appendAssistantMessage('Listening... Tap stop when you are done speaking.');
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      const errorName = String(error?.name || '');
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        appendAssistantMessage('Microphone access was denied. Allow microphone for this site in browser permissions and reload.');
        return;
      }

      if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        appendAssistantMessage('No microphone was found on this device. Connect a microphone and try again.');
        return;
      }

      if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        appendAssistantMessage('Microphone is currently busy in another app/tab. Close other apps using mic and try again.');
        return;
      }

      if (errorName === 'SecurityError') {
        appendAssistantMessage('Voice recording is blocked due to browser security context. Use HTTPS and reload.');
        return;
      }

      appendAssistantMessage('Unable to start voice transcription. Please retry or use text command.');
    }
  };

  const stopVoiceRecording = () => {
    if (!recognitionRef.current) return;
    setIsProcessingVoice(true);
    try {
      recognitionRef.current.stop();
    } catch {
      setIsProcessingVoice(false);
      setIsRecording(false);
    }
  };

  const floatingOffsetClass = activeBooking ? 'bottom-40 lg:bottom-28' : 'bottom-5';

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`fixed ${floatingOffsetClass} right-5 z-[70] inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${roleConfig.accentClass} px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:brightness-110`}
          aria-label="Open AI assistant"
        >
          <Bot size={16} />
          {roleConfig.assistantName}
        </button>
      )}

      {open && (
        <div className={`fixed ${floatingOffsetClass} right-5 z-[70] flex h-[620px] w-[420px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900`}>
          <div className={`bg-gradient-to-r ${roleConfig.accentClass} p-4 text-white`}>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="opacity-90" />
                <div>
                  <p className="text-sm font-semibold">{roleConfig.assistantName}</p>
                  <p className="text-[11px] font-medium opacity-90">{roleConfig.roleLabel} Mode</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={exportChat}
                  className="rounded-md p-1 text-white/85 transition hover:bg-white/15 hover:text-white"
                  aria-label="Export chat"
                  title="Export chat"
                >
                  <Download size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-white/85 transition hover:bg-white/15 hover:text-white"
                  aria-label="Close AI assistant"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {roleConfig.quickActions.map((actionItem) => (
                <button
                  key={actionItem.label}
                  type="button"
                  onClick={() => sendMessage(actionItem.prompt)}
                  className="rounded-full border border-white/40 bg-white/10 px-2.5 py-1 text-[11px] font-medium transition hover:bg-white/20"
                >
                  {actionItem.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Conversation</span>
            </div>

            {pendingConfirmation && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmation(true)}
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmation(false)}
                  disabled={loading}
                  className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div ref={messagesContainerRef} className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-zinc-50/40 to-white p-3 dark:from-zinc-900 dark:to-zinc-900">
            {messages.map((message, index) => (
              <MessageBubble key={`${message.role}-${index}`} role={message.role} text={message.text} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 size={14} className="animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <div className="border-t border-zinc-200 p-3 dark:border-zinc-700">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Suggested Prompts</p>
            <div className="mb-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && canSend) {
                    event.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Type a command..."
                className="h-10 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none ring-sky-300 transition focus:ring dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={loading}
                className={[
                  'inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition disabled:cursor-not-allowed disabled:opacity-60',
                  isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500',
                ].join(' ')}
                aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                title={isRecording ? 'Stop recording' : 'Start voice command'}
              >
                {isRecording ? <Square size={14} /> : <Mic size={14} />}
              </button>
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!canSend || isRecording}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-sky-500"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>

            {(isRecording || isProcessingVoice) && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {isRecording ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 font-medium text-red-500">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      Recording...
                    </span>
                    <span className="font-semibold tabular-nums">{formatDuration(recordingSeconds)}</span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Loader2 size={12} className="animate-spin" />
                    Processing voice command...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
