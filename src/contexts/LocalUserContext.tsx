import {
  DEFAULT_PRIMARY_COLOR_KEY,
  type PrimaryColorKey,
} from "@/constants/primaryColors";
import { DEFAULT_THEME_KEY, type THemeKey } from "@/constants/themes";
import { createContext, useContext, useState, type ReactNode } from "react";

export type LocalUser = {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
  theme?: THemeKey;
  primaryColor?: PrimaryColorKey;
};

type UserContextType = {
  localUser: LocalUser;
  setLocalUser: (localUser: LocalUser) => void;
};

export const defaultLocalUser: LocalUser = {
  uid: "",
  displayName: null,
  photoURL: null,
  theme: DEFAULT_THEME_KEY,
  primaryColor: DEFAULT_PRIMARY_COLOR_KEY,
};

const LocalUserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [localUser, setLocalUser] = useState<LocalUser>(defaultLocalUser);

  return (
    <LocalUserContext.Provider value={{ localUser, setLocalUser }}>
      {children}
    </LocalUserContext.Provider>
  );
};

export const useLocalUser = () => {
  const context = useContext(LocalUserContext);
  if (!context) {
    throw new Error("useLocalUser must be used within a UserProvider");
  }
  return context;
};
