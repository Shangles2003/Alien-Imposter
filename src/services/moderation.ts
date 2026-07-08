import { supabase } from '@/config/supabase';
import { ReportReason } from '@/constants/reportReasons';

export interface BlockedUser {
  blockedId: string;
  username: string | null;
  displayName: string;
  avatarColor: string;
  blockedAt: string;
}

export function mapJoinLobbyError(message: string): string {
  if (/blocked player is in this lobby/i.test(message)) {
    return "You can't join this lobby because a blocked player is here. Unblock them in Settings to join.";
  }
  if (/only original crew can rejoin/i.test(message)) {
    return 'This mission is already running. Only players who started the game can rejoin with the lobby code.';
  }
  if (/mission has ended/i.test(message)) {
    return 'This mission has already ended.';
  }
  return message;
}

export async function blockUser(targetId: string): Promise<void> {
  const { error } = await supabase.rpc('block_user', { p_target_id: targetId });
  if (error) throw error;
}

export async function unblockUser(targetId: string): Promise<void> {
  const { error } = await supabase.rpc('unblock_user', { p_target_id: targetId });
  if (error) throw error;
}

export async function blockUserByUsername(username: string): Promise<void> {
  const { error } = await supabase.rpc('block_user_by_username', { p_username: username });
  if (error) throw error;
}

export async function reportUser(params: {
  targetId: string;
  reason: ReportReason;
  details?: string;
  context?: string;
}): Promise<void> {
  const { error } = await supabase.rpc('report_user', {
    p_target_id: params.targetId,
    p_reason: params.reason,
    p_details: params.details ?? null,
    p_context: params.context ?? null,
  });
  if (error) throw error;
}

export async function fetchMyBlocks(): Promise<BlockedUser[]> {
  const { data, error } = await supabase.rpc('list_my_blocks');
  if (error) throw error;

  const rows = (data ?? []) as {
    blocked_id: string;
    username: string | null;
    display_name: string;
    avatar_color: string;
    blocked_at: string;
  }[];

  return rows.map((r) => ({
    blockedId: r.blocked_id,
    username: r.username,
    displayName: r.display_name,
    avatarColor: r.avatar_color,
    blockedAt: r.blocked_at,
  }));
}
