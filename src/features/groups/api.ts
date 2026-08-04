import { apiClient, type Envelope } from '@/api/client';

import type {
  Group,
  GroupCreatePayload,
  GroupExpenseCreatePayload,
  GroupSettlementCreatePayload,
  MemberBalance,
} from './types';

export async function getGroups(): Promise<Group[]> {
  const response = await apiClient.get<Envelope<Group[]>>('/groups');
  return response.data.data as Group[];
}

export async function createGroup(payload: GroupCreatePayload): Promise<Group> {
  const response = await apiClient.post<Envelope<Group>>('/groups', payload);
  return response.data.data as Group;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}`);
}

export async function addGroupExpense(
  groupId: string,
  payload: GroupExpenseCreatePayload,
): Promise<Group> {
  const response = await apiClient.post<Envelope<Group>>(`/groups/${groupId}/expenses`, payload);
  return response.data.data as Group;
}

export async function addGroupSettlement(
  groupId: string,
  payload: GroupSettlementCreatePayload,
): Promise<Group> {
  const response = await apiClient.post<Envelope<Group>>(`/groups/${groupId}/settlements`, payload);
  return response.data.data as Group;
}

export async function deleteGroupExpense(groupId: string, expenseId: string): Promise<Group> {
  const response = await apiClient.delete<Envelope<Group>>(
    `/groups/${groupId}/expenses/${expenseId}`,
  );
  return response.data.data as Group;
}

export async function deleteGroupSettlement(groupId: string, settlementId: string): Promise<Group> {
  const response = await apiClient.delete<Envelope<Group>>(
    `/groups/${groupId}/settlements/${settlementId}`,
  );
  return response.data.data as Group;
}

export async function getGroupBalances(groupId: string): Promise<MemberBalance[]> {
  const response = await apiClient.get<Envelope<MemberBalance[]>>(`/groups/${groupId}/balances`);
  return response.data.data as MemberBalance[];
}
