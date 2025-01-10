"use client";

import {useAppDispatch, useAppSelector} from '@/app/redux';
import React from 'react'
import {Calendar, Contact, Forklift, Layout, LayoutList, LucideIcon, Menu, SquareChartGantt, StickyNote, Truck, User, Users, Wrench } from 'lucide-react'
import Link from 'next/link'
import { setIsSidebarCollapsed } from '@/state';
import { usePathname } from 'next/navigation';
import path from 'path';
import Image from "next/image";
import Logo from "@/assets/logo.png";
import { Stick } from 'next/font/google';


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
          } font-medium text-gray-700`}
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
      <div className="min-w-[27px] min-h-[27px]">
        <Image
        src={Logo}
        alt="streamline-logo"
        width={27}
        height={27}
        className="rounded w-8"
        />
      </div>

      <h1
        className={`${
        isSidebarCollapsed ? "hidden" : "block"
        } text-[20px] rubik-vinyl-regular text-gray-700`}
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
      <SidebarLink 
        href="/schedule" 
        icon={Calendar} 
        label="Schedule" 
        isCollapsed={isSidebarCollapsed} 
      />
      <SidebarLink 
        href="/jobs" 
        icon={Wrench} 
        label="Jobs" 
        isCollapsed={isSidebarCollapsed} 
      />
      <SidebarLink 
        href="/customers" 
        icon={Users} 
        label="Customers" 
        isCollapsed={isSidebarCollapsed} 
      />
      <SidebarLink 
        href="/contacts" 
        icon={Contact} 
        label="Contacts" 
        isCollapsed={isSidebarCollapsed} 
      />
      <SidebarLink 
        href="/tasks" 
        icon={LayoutList} 
        label="Tasks" 
        isCollapsed={isSidebarCollapsed} 
      />
      <SidebarLink 
        href="/vendors" 
        icon={Truck} 
        label="Vendors" 
        isCollapsed={isSidebarCollapsed} 
      />
      <SidebarLink 
        href="/equipment" 
        icon={Forklift} 
        label="Equipment" 
        isCollapsed={isSidebarCollapsed} 
      />
      <SidebarLink 
        href="/reports" 
        icon={SquareChartGantt} 
        label="Reports" 
        isCollapsed={isSidebarCollapsed}
      />
      </div>
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`
      }>
      <p className="text-center text-xs text-gray-500">&copy; 2025 EQSi</p>
      </div>
    </div>
  );
};

export default Sidebar;