"use client";

import { useAppDispatch, useAppSelector } from '@/src/app/redux';
import React from 'react';
import {
  Calendar,
  Contact,
  Forklift,
  Layout,
  LayoutList,
  LucideIcon,
  Menu,
  SquareChartGantt,
  Truck,
  Users,
  Wrench,
  UserPen,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { setIsSidebarCollapsed } from '@/src/state';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Logo from '@/src/assets/logo.png';
import Logo3 from '@/src/assets/logo2.png';

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === '/' && href === '/dashboard');
  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center group ${
          isCollapsed ? 'justify-center py-4' : 'justify-start px-8 py-4'
        } hover:text-white hover:bg-[radial-gradient(circle,_#414a9e,_#29abe2)] gap-1 transition-colors ${
          isActive ? 'bg-[radial-gradient(circle,_#29abe2,_#414a9e)] text-white' : 'text-gray-900'
        } figtree-font`}
      >
        <Icon className={`w-6 h-6 ${isActive ? '!text-white' : 'group-hover:!text-white'}`} />
        {!isCollapsed && (
          <span className={`font-semibold text-md ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-white'}`}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state: { global: { isSidebarCollapsed: boolean } }) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };
  const sidebarClassNames = `fixed top-0 bottom-0 z-0 flex flex-col ${
    isSidebarCollapsed ? 'w-0 md:w-16' : 'w-72 md:w-64'
  } bg-gradient-to-b bg-[length:50%_150%] from-[#ffffff] to-[#e4f0ff] transition-all duration-300 overflow-visible shadow-md z-40 figtree-font`;

  return (
    <div className={`bg-gray-200 ${sidebarClassNames}`}>
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? 'px-5' : 'px-8'
        }`}
      >
        <div className="min-w-[27px] min-h-[27px]">
          <Image
            src={isSidebarCollapsed ? Logo : Logo3}
            alt="streamline-logo"
            width={isSidebarCollapsed ? 27 : 108}
            height={isSidebarCollapsed ? 27 : 90}
            quality={100}
            className={`rounded ${isSidebarCollapsed ? 'w-8 h-8' : 'w-40 h-12'}`}
          />
        </div>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-grow mt-4">
        <SidebarLink href="/dashboard" icon={Layout} label="Dashboard" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/schedule" icon={Calendar} label="Schedule" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/jobs" icon={Wrench} label="Jobs" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/company" icon={Building2} label="Companies" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/customers" icon={Users} label="Customers" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/contacts" icon={Contact} label="Contacts" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/tasks" icon={LayoutList} label="Tasks" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/vendors" icon={Truck} label="Vendors" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/equipment" icon={Forklift} label="Equipment" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/reports" icon={SquareChartGantt} label="Reports" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/admin" icon={UserPen} label="Admin" isCollapsed={isSidebarCollapsed} />
      </div>
      
      <div className="mb-10">
        <p className="text-center text-xs text-gray-500">&copy; 2025 EQSi</p>
      </div>
    </div>
  );
};

export default Sidebar;
