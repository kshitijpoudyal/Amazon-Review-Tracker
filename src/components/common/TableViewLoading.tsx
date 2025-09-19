import React from 'react';

export const TableViewLoading: React.FC = () => {
    // Mobile Card Skeleton
    const MobileCardSkeleton = () => (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 animate-pulse">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/3"></div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-16"></div>
                </div>
            </div>
            <div className="border-t pt-3 mb-3">
                <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded mb-1"></div>
                        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
            </div>
        </div>
    );

    // Desktop Table Row Skeleton
    const TableRowSkeleton = ({ columns = 7 }: { columns?: number }) => {
        return (
            <tr className="border-b border-gray-200 bg-white">
                {Array.from({ length: columns }).map((_, index) => {
                    return (
                        <td key={index} className="px-3 py-4">
                            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
                        </td>
                    );
                })}
            </tr>
        );
    };

    const TableHeaderSkeleton = ({ columns = 7 }: { columns?: number }) => (
        <tr>
            {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-3 py-4">
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
                </th>
            ))}
        </tr>
    );

    return (
        <>
            {/* Mobile Loading Layout */}
            <div className="block md:hidden space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <MobileCardSkeleton key={index} />
                ))}
            </div>

            {/* Desktop Loading Layout */}
            <div className="hidden md:block">
                <div className="overflow-x-auto max-h-[93vh] overflow-y-auto border border-gray-200 rounded-xl">
                    <table className="w-full bg-white shadow-md">
                        <thead className="gradient-bg sticky top-0 z-5 shadow-sm">
                           <TableHeaderSkeleton columns={7} />
                        </thead>
                        <tbody>
                            {Array.from({ length: 7 }).map((_, index) => (
                                <TableRowSkeleton key={index} columns={7} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};
