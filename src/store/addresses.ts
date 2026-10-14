import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from './storage';
import type { Address } from '@/types';
import { uid } from '@/utils/format';

interface AddressState {
  addresses: Address[];
  selectedId: string | null;

  add: (address: Omit<Address, 'id'>) => Address;
  update: (id: string, patch: Partial<Address>) => void;
  remove: (id: string) => void;
  select: (id: string) => void;
  setDefault: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedId: null,

      add: (address) => {
        const isFirst = get().addresses.length === 0;
        const created: Address = { ...address, id: uid('addr-'), isDefault: isFirst || address.isDefault };
        set((s) => ({
          addresses: [
            ...(created.isDefault ? s.addresses.map((a) => ({ ...a, isDefault: false })) : s.addresses),
            created,
          ],
          selectedId: created.isDefault || !s.selectedId ? created.id : s.selectedId,
        }));
        return created;
      },

      update: (id, patch) =>
        set((s) => ({
          addresses: s.addresses.map((a) => {
            if (a.id === id) return { ...a, ...patch };
            return patch.isDefault ? { ...a, isDefault: false } : a;
          }),
        })),

      remove: (id) =>
        set((s) => {
          const addresses = s.addresses.filter((a) => a.id !== id);
          if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) addresses[0].isDefault = true;
          const selectedId =
            s.selectedId === id ? (addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null) : s.selectedId;
          return { addresses, selectedId };
        }),

      select: (id) => set({ selectedId: id }),

      setDefault: (id) =>
        set((s) => ({
          addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
          selectedId: id,
        })),
    }),
    { name: 'wasel.addresses', storage: zustandStorage }
  )
);

export const selectCurrentAddress = (s: AddressState): Address | undefined =>
  s.addresses.find((a) => a.id === s.selectedId) ?? s.addresses.find((a) => a.isDefault) ?? s.addresses[0];
