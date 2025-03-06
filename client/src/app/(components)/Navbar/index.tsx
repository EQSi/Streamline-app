"use client";

import { useAppDispatch, useAppSelector } from "@/src/app/redux";
import { setIsSidebarCollapsed } from "@/src/state";
import { Search, Settings, Bell, LogOut, ArrowRightFromLineIcon, ArrowLeftFromLineIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import axiosInstance from "@/src/state/axios";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  const { data: session } = useSession() as {
    data: { user: { id: string }; accessToken: string } | null;
  };
  const [user, setUser] = useState({ firstName: "", lastName: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchUserData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/users/${session.user.id}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.data) {
          throw new Error("Failed to fetch user data");
        }

        const userData = response.data;

        // Ensure data exists before updating state
        if (userData.firstName && userData.lastName) {
          setUser({ firstName: userData.firstName, lastName: userData.lastName });
        } else {
          throw new Error("First and last name missing in response");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  return (
    <div className="flex justify-between items-center w-full figtree-font">
      <div className="flex items-center gap-4">
        <button
          className="px-2 py-2 bg-gray-300 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          {isSidebarCollapsed ? <ArrowRightFromLineIcon className="w-7 h-4 text-black" /> : <ArrowLeftFromLineIcon className="w-7 h-4 text-black" />}
        </button>
        <div className="relative">
          <input
            type="search"
            placeholder="Start typing to search"
            className="pl-10 pr-4 py-2 w-70 md:w-70 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-3 cursor-pointer">
            {loading ? (
              <span>Loading...</span>
            ) : user.firstName ? (
              <span className="font-semibold">
                {user.firstName} {user.lastName}
              </span>
            ) : (
              <span>No Name Found</span>
            )}
          </div>
            <button
            onClick={() => signOut({ callbackUrl: '/signout' })}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
            <LogOut size={24} />
            </button>
          <hr className="w-0 h-7 border-solid border-l border-gray-300" />
          <div className="relative mx-2">
            <Bell className="cursor-pointer text-gray-500" size={24} />
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
              3
            </span>
          </div>
          <a href="/settings">
            <Settings className="cursor-pointer text-gray-500" size={24} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
