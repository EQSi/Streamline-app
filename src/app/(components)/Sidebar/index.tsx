"use client";

import {useAppDispatch, useAppSelector} from '@/app/redux';
import React from 'react'
import { Icon, Layout, LucideIcon, Menu } from 'lucide-react'
import Link from 'next/link'
import { setIsSidebarCollapsed } from '@/state';
import { usePathname } from 'next/navigation';
import path from 'path';
import Image from "next/image";
import Logo from "@/assets/logo.png";


interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === '/' && href === '/dashboard');
  return (
    <Link href={href}>
      <div className={`cursor-pointer flex items-center ${
        isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
      } 
      hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
        isActive ? "bg-blue-200 text-white" : ""
        }
      }`}
      >
        <Icon className="w-6 h-6 !text-gray-700" />

        <span 
          className={`${
            isCollapsed ? "hidden" : "block"
          }font-medium text-gray-700`}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}

const Sidebar = () => {
  const disbatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    disbatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
        isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
      } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`; 

  return (
    <div className={sidebarClassNames}>
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        
        <Image
          src={Logo}
          alt="streamline-logo"
          width={60}
          height={60}
          priority
          className="rounded w-8"
        />
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-extrabold text-2xl`}
        >
          Streamline
        </h1>
        
        <button 
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100" 
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
      
      {/* FOOTER */}
      <div className="flex-grow mt-8">
        <SidebarLink 
          href="/dashboard" 
          icon={Layout} 
          label="Dashboard" 
          isCollapsed={isSidebarCollapsed} 
        />
      </div>
      <div>
        <p className="text-center text-xs text-gray-500">&copy; 2025 EQSi</p>
      </div>
    </div>
  );
};

export default Sidebar;