import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** تخزين موحّد لكل الـ stores (AsyncStorage على الموبايل، localStorage على الويب) */
export const zustandStorage = createJSONStorage(() => AsyncStorage);
