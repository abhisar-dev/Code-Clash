'use client';

import React, { useState } from 'react';
import { X, Check, Copy, Share2, Send, MessageSquare } from 'lucide-react';

interface ShareInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export function ShareInviteModal({ isOpen, onClose, roomId }: ShareInviteModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?invite=${roomId}`
    : `http://localhost:3000/?invite=${roomId}`;

  const shareText = `Hey! Battle me live in a 1v1 LeetCode contest on CodeClash: ${inviteUrl}`;

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
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-950/50">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Match Invitation
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Send 1v1 duel invite link</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share Options */}
        <div className="p-5 space-y-3">
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
          <div className="pt-1.5">
            <label className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1 font-mono">
              Direct Link
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
          <button onClick={onClose} className="px-2.5 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
