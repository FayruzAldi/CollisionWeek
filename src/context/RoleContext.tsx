"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/lib/types";

interface RoleContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  setCurrentUser: (user: UserProfile) => void;
  role: UserRole;
  isLoading: boolean;
  refreshUsers: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        // Default to student Aldi if none selected
        if (!currentUser && data.users?.length > 0) {
          const student = data.users.find((u: UserProfile) => u.name.includes("Aldi")) || data.users[0];
          setCurrentUser(student);
        }
      }
    } catch (err) {
      console.error("Failed to load users for role context:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const role: UserRole = currentUser?.role || "STUDENT";

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        role,
        isLoading,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
