"use client"

import Header from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { useSearchQuery } from '@/state/api';
import { debounce } from "lodash";
import React, { useEffect, useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import UserCard from '@/components/UserCard';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: searchResults, isLoading, isError } = useSearchQuery(searchTerm, {
        skip: searchTerm.length < 3,
    });

    const handleSearch = debounce(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(event.target.value)
        },
        500
    );

    useEffect(() => {
        return handleSearch.cancel;
    }, [handleSearch.cancel]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <Header name='Search' />
                
                {/* Search Input Section */}
                <div className="relative mt-8 mb-12">
                    <div className="relative mx-auto max-w-2xl">
                        <SearchIcon 
                            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" 
                        />
                        <input 
                            type="text"
                            placeholder='Search for tasks, projects, or users...'
                            className="w-full rounded-xl border border-gray-200 bg-white px-12 py-4 shadow-sm 
                                     transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 
                                     dark:bg-gray-800 dark:text-white"
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {/* Results Section */}
                <div className="mt-8 space-y-8">
                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
                        </div>
                    )}

                    {isError && (
                        <div className="rounded-lg bg-red-50 p-4 text-center text-red-800 dark:bg-red-900/50 dark:text-red-200">
                            Error occurred while fetching search results.
                        </div>
                    )}

                    {!isLoading && !isError && searchResults && (
                        <div className="space-y-12">
                            {/* Tasks Section */}
                            {searchResults.tasks && searchResults.tasks.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        Tasks
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {searchResults.tasks.map((task) => (
                                            <div key={task.id} 
                                                 className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                                            >
                                                <TaskCard task={task} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects Section */}
                            {searchResults.projects && searchResults.projects.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        Projects
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {searchResults.projects.map((project) => (
                                            <div key={project.id} 
                                                 className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                                            >
                                                <ProjectCard project={project} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Users Section */}
                            {searchResults.users && searchResults.users.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        Users
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {searchResults.users.map((user) => (
                                            <div key={user.userId} 
                                                 className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                                            >
                                                <UserCard user={user} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No Results Message */}
                            {searchTerm.length >= 3 && 
                             (!searchResults.tasks?.length && 
                              !searchResults.projects?.length && 
                              !searchResults.users?.length) && (
                                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                    No results found for "{searchTerm}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;