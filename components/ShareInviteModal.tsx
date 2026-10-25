'use client';

import React, { useState } from 'react';
import { X, Check, Copy, Share2, Send, MessageSquare, RefreshCw, Users } from 'lucide-react';

interface ShareInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  onGenerateNewCode?: () => void;
  isFriendJoined?: boolean;
  opponentName?: string;
}

export function ShareInviteModal({
  isOpen,
  onClose,
  roomId,
  onGenerateNewCode,
  isFriendJoined,
  opponentName,
}: ShareInviteModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?invite=${roomId}`
      : `https://codeclash-in.vercel.app/?invite=${roomId}`;

  const shareText = `Hey! Battle me live in a 1v1 competitive coding duel on CodeClash: ${inviteUrl}`;

  // Direct WhatsApp Share
  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // Direct Telegram Share
  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent('Battle me 1v1 on CodeClash!')}`;
    window.open(url, '_blank');
  };

  // Native Device Share (Mobile / Windows / Mac Share Sheet)
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'CodeClash 1v1 Contest',
          text: 'Battle me in a live 1v1 coding contest on CodeClash!',
          url: inviteUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-950/50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-[10px] font-mono text-stone-700 dark:text-stone-300 font-semibold mb-1">
              <span>1v1 PRIVATE DUEL</span>
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Invite a Friend
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 cursor-pointer font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Friend Join Status Banner */}
        {isFriendJoined ? (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold">{opponentName || 'Friend'} Joined!</div>
                <div className="text-[11px] opacity-80 font-mono">Room synced and ready</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer transition-colors shrink-0"
            >
              Enter Arena
            </button>
          </div>
        ) : (
          <div className="mx-4 mt-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span className="text-[11px] font-mono">Waiting for friend to join with link...</span>
          </div>
        )}

        {/* Share Options */}
        <div className="p-4 space-y-3">
          {/* Room ID Badge & Regenerate Code */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block">Match Code</span>
              <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white tracking-wider">{roomId}</span>
            </div>
            {onGenerateNewCode && (
              <button
                onClick={onGenerateNewCode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                title="Generate another unique match code"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Code</span>
              </button>
            )}
          </div>

          {/* 1. Direct WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-between transition-colors cursor-pointer shadow-xs shadow-emerald-600/20"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>Share to WhatsApp</span>
            </div>
            <span className="text-[11px] font-mono opacity-80">Send →</span>
          </button>

          {/* 2. Direct Telegram Share */}
          <button
            onClick={handleTelegramShare}
            className="w-full py-2.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs flex items-center justify-between transition-colors cursor-pointer shadow-xs shadow-sky-500/20"
          >
            <div className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5" />
              <span>Share to Telegram</span>
            </div>
            <span className="text-[11px] font-mono opacity-80">Send →</span>
          </button>

          {/* 3. Native OS Share (if supported) */}
          {supportsNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-xs flex items-center justify-between border border-zinc-200/60 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>System Share Sheet</span>
              </div>
              <span className="text-[11px] font-mono opacity-70">Share →</span>
            </button>
          )}

          {/* 4. Link Copy Box */}
          <div className="pt-1">
            <label className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1 font-mono">
              Direct Invite URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-800 dark:text-zinc-200 select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>Match: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{roomId}</strong></span>
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
