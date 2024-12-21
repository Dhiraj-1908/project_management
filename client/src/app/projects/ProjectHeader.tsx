import Header from '@/components/Header';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Clock, Filter, Grid, Grid3X3, List, PlusSquare, Share2, Table } from 'lucide-react';
import React, { useState } from 'react'
import ModalNewProject from "./ModalNewProject"

type Props = {
    activeTab: string;
    setActiveTab: (tabName: string) =>void
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProjectHeader = ({activeTab, setActiveTab}: Props) => {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isModalNewProjectOpen, setIsModalNewPojectOpen] = useState(false);


    return (
        <div className="px-4 xl:px-6">
          <ModalNewProject
            isOpen={isModalNewProjectOpen}
            onClose={() => setIsModalNewPojectOpen(false)}
          />
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8">
            <Header
              name="Product Design Development"
              buttonComponent={
                <button
                  className="flex items-center rounded-md bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
                  onClick={() => setIsModalNewPojectOpen(true)}
                >
                  <PlusSquare className="mr-2 h-5 w-5" /> New Boards
                </button>
              }
            />
          </div>

    {/* TABS */}

    <div className='flex flex-wrap-reverse gap-2 border-y border-gray-200 pb-[8px] pt-2 dark:border-stroke-dark md:items-center'>
        <div className='flex flex-1 items-center gap-2 md:gap-4'>
            <TabButton
              name='Board'
              icon={<Grid3X3 className="h-5 w-5 stroke-current text-gray-500 hover:text-blue-600" />}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />

            <TabButton
              name='List'
              icon={<List className='h-5 w-5'/>}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />

            <TabButton
              name='TimeLine'
              icon={<Clock className='h-5 w-5'/>}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />

            <TabButton
              name='Table'
              icon={<Table className='h-5 w-5'/>}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />
        </div>
        <div className='flex items-center gap-2'>
            <button className='text-gray-500 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-gray-300'>
                <Filter className='h-5 w-5'/>
            </button>
            <button className='text-gray-500 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-gray-300'>
                <Share2 className='h-5 w-5'/>
            </button>
            <div className='relative'>
                <input type='text' placeholder='Search Task'
                className='rounded-md border py-1 pl-10 pr-4 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white'/>
                    <Grid3X3 className='absolute left-3 top-2 h-4 w-4 text-gray-400 dark:text-neutral-500' />
            </div>
        </div>
    </div>
  </div>
    );
};

type TabButtonProps = {
    name: string;
    icon: React.ReactNode;
    setActiveTab: (tabName: string) => void;
    activeTab: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TabButton = ({name, icon, setActiveTab, activeTab}: TabButtonProps) =>{
    const isActive = activeTab === name;

    return (
        <button 
            // CHANGE: Simplified className
            className={`
                relative flex items-center gap-2 px-1 py-2 
                text-gray-500 hover:text-blue-600 
                dark:text-neutral-500 dark:hover:text-white 
                sm:px-2 lg:px-4 
                ${isActive ? "text-blue-600 dark:text-white" : ""}
            `}
            onClick={() => setActiveTab(name)}
        >
            <span className="icon-wrapper mr-1">{icon}</span>
            {name}
            {/* NEW: Add this conditional rendering for the active line */}
            {isActive && (
                <span 
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 dark:bg-white"
                />
            )}
        </button> 
    )
}

export default ProjectHeader