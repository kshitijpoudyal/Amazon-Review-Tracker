import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import EditProductModal from './EditProductModal';
import { getProductStatus } from '../utils/productStatus';
import { useProductPayPalLinks } from '../hooks/useProductPayPalLinks';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'

interface ProductTableProps {
    products: Product[];
    onUpdateProduct?: (index: number, updatedProduct: Product) => void;
    onDeleteProduct?: (productId: string) => void;
    userId?: string; // Add userId to check for linked PayPal transactions
}

export default function ProductTable({ products, onUpdateProduct, onDeleteProduct, userId }: ProductTableProps) {
    const [showDropdown, setShowDropdown] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const getDeltaClass = (delta: number | null) => {
        if (delta === null) return 'text-gray-500';
        if (delta > 0) return 'text-green-600';
        if (delta < 0) return 'text-red-600';
        return 'text-gray-500';
    };

    const handleSaveProduct = (updatedProduct: Product) => {
        const productIndex = products.findIndex(p => p.id === updatedProduct.id);
        if (productIndex !== -1 && onUpdateProduct) {
            onUpdateProduct(productIndex, updatedProduct);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleCancelEdit = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };


    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
        setShowDropdown(null);
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return '-';
        return `$${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            // Split the date string to avoid timezone issues
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day); // month is 0-indexed
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString; // Return original string if parsing fails
        }
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500">
                <p className="text-lg">No products found matching your criteria.</p>
            </div>
        );
    }

    // Get product IDs for checking PayPal links
    const productIds = products.map(p => p.id).filter(Boolean) as string[];
    const { isProductLinked } = useProductPayPalLinks(userId, productIds);

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* <div className="sm:flex sm:items-center">
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                    >
                        Add Product
                    </button>
                </div>
            </div> */}
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                                <thead>
                                    <tr>
                                        <th
                                            scope="col"
                                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                        >
                                            Item ({products.length})
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Order Date
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Paid
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Received
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Delta
                                        </th>
                                        <th scope="col" className="py-3.5 pl-3 pr-4 sm:pr-0">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                    {products.map((product, index) => (
                                        <tr key={index}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 dark:text-white">
                                                {product.url ? (
                                                    <a
                                                        href={product.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        {product.item}
                                                    </a>
                                                ) : (
                                                    <strong>{product.item}</strong>
                                                )}
                                                {product.id && isProductLinked(product.id) && (
                                                    <span className="inline-block px-2 py-1 rounded-full text-center text-xs font-semibold tracking-wider bg-green-100 text-green-800">
                                                        Linked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(product.orderDate)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {(() => {
                                                    const status = getProductStatus(product);
                                                    return (
                                                        <div className="flex flex-col space-y-1">
                                                            <span className={`inline-block px-2 py-1 rounded-full text-center text-xs font-semibold tracking-wider ${status.color}`}>
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {formatCurrency(product.paid)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {formatCurrency(product.received)}
                                            </td>
                                            <td className={`whitespace-nowrap px-3 py-4 text-sm ${getDeltaClass(product.delta)}`}>
                                                {formatCurrency(product.delta)}
                                            </td>
                                            <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <Menu as="div" className="relative inline-block">
                                                    <MenuButton className="flex items-center rounded-full text-gray-400 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-gray-400 dark:hover:text-gray-300 dark:focus-visible:outline-indigo-500">
                                                        <span className="sr-only">Open options</span>
                                                        <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                                                    </MenuButton>

                                                    <MenuItems
                                                        transition
                                                        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline outline-1 outline-black/5 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                                                    >
                                                        <div className="py-1">
                                                            <MenuItem>
                                                                <a
                                                                    href="#"
                                                                    onClick={() => handleEditProduct(product)}
                                                                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none dark:text-gray-300 dark:data-[focus]:bg-white/5 dark:data-[focus]:text-white"
                                                                >
                                                                    Edit
                                                                </a>
                                                            </MenuItem>
                                                            <MenuItem>
                                                                <a
                                                                    href="#"
                                                                    onClick={() => {
                                                                        if (product.id && window.confirm('Are you sure you want to delete this product?')) {
                                                                            onDeleteProduct?.(product.id);
                                                                        }
                                                                        setShowDropdown(null);
                                                                    }}
                                                                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none dark:text-gray-300 dark:data-[focus]:bg-white/5 dark:data-[focus]:text-white"
                                                                >
                                                                    Delete
                                                                </a>
                                                            </MenuItem>
                                                        </div>
                                                    </MenuItems>
                                                </Menu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Product Modal */}
            {isModalOpen && editingProduct && (
                <EditProductModal
                    isOpen={isModalOpen}
                    product={editingProduct}
                    onSave={handleSaveProduct}
                    onCancel={handleCancelEdit}
                />
            )}
        </>
    )
}
