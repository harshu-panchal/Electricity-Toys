import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminProductStore } from '../../store/adminProductStore';
import { Button } from '../../../user/components/ui/button';
import { Plus, Trash2, Tag, Image as ImageIcon, X, Search, Loader2, Edit2 } from 'lucide-react';
import { optimizeImageUrl, compressImage } from '../../../../lib/utils';
import { Badge } from '../../../user/components/ui/badge';

export default function CategoryManager() {
    const { categories, addCategory, updateCategory, deleteCategory, fetchCategories } = useAdminProductStore();
    const [newCategory, setNewCategory] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const resetForm = () => {
        if (imagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setNewCategory('');
        setDescription('');
        setImage(null);
        setImagePreview(null);
        setExistingImage(null);
        setEditingCategory(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        if (!category?._id) return;
        resetForm();
        setEditingCategory(category);
        setNewCategory(category.categoryName || '');
        setDescription(category.description || '');
        setExistingImage(category.image || null);
        setImage(null);
        setImagePreview(category.image ? optimizeImageUrl(category.image, 300) : null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        resetForm();
        setIsModalOpen(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (imagePreview?.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearSelectedImage = () => {
        if (imagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImage(null);
        setImagePreview(existingImage ? optimizeImageUrl(existingImage, 300) : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newCategory.trim()) {
            setIsAdding(true);
            try {
                const formData = new FormData();
                formData.append('categoryName', newCategory.trim());
                formData.append('description', description.trim() || 'Added via Admin Panel');
                if (image) {
                    const compressed = await compressImage(image, 1600, 0.8);
                    formData.append('image', compressed || image);
                }
                const result = editingCategory
                    ? await updateCategory(editingCategory._id, formData)
                    : await addCategory(formData);

                if (result?.success) {
                    closeModal();
                }
            } catch (error) {
                console.error("Save category failed", error);
            } finally {
                setIsAdding(false);
            }
        }
    };

    const filteredCategories = categories.filter(cat =>
        (cat.categoryName || cat).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase mb-2">Categories</h1>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium italic">Manage product categories ({categories.length} total)</p>
                </div>
                <Button
                    onClick={openAddModal}
                    className="rounded-full font-black italic tracking-widest uppercase px-6 md:px-8 h-10 md:h-12 shadow-lg shadow-primary/20 text-xs md:text-sm"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Category
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full bg-white border border-secondary/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-bold uppercase tracking-wider text-xs md:text-sm"
                />
            </div>

            {/* Category List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredCategories.map((category) => (
                        <motion.div
                            key={category._id || category}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-4 md:p-5 rounded-3xl border border-secondary/20 flex items-center justify-between group hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-primary overflow-hidden">
                                    {category.image ? (
                                        <img src={optimizeImageUrl(category.image, 300)} alt={category.categoryName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Tag className="h-5 w-5 md:h-6 md:w-6" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase italic tracking-tight text-sm md:text-base">{category.categoryName || category}</h3>
                                    <Badge variant="secondary" className="mt-1 text-[9px] md:text-[10px] tracking-widest bg-secondary/20">Active</Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 md:gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => openEditModal(category)}
                                    className="h-8 w-8 md:h-10 md:w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                >
                                    <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => deleteCategory(category._id)}
                                    className="h-8 w-8 md:h-10 md:w-10 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add/Edit Category Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                                        {editingCategory ? 'Edit Category' : 'Add Category'}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Category Name</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                autoFocus
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                placeholder="E.g. Electric Skateboards"
                                                className="w-full bg-secondary/5 border border-secondary/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-bold uppercase tracking-wider text-xs md:text-sm"
                                                />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Short category description"
                                            rows="3"
                                            className="w-full bg-secondary/5 border border-secondary/20 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-xs md:text-sm resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Category Image</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative group flex-1">
                                                <input
                                                    type="file"
                                                    id="category-image-modal"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="category-image-modal"
                                                    className="flex items-center justify-center h-12 px-6 bg-secondary/5 border border-secondary/20 border-dashed rounded-2xl cursor-pointer hover:bg-secondary/10 transition-all gap-2"
                                                >
                                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                                        {image ? 'Change' : editingCategory && existingImage ? 'Replace Image' : 'Upload Image'}
                                                    </span>
                                                </label>
                                            </div>

                                            {imagePreview && (
                                                <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-secondary/20 shadow-sm flex-shrink-0">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    {image && (
                                                        <button
                                                            type="button"
                                                            onClick={clearSelectedImage}
                                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-4 w-4 text-white" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {editingCategory && existingImage && !image && (
                                            <p className="text-[10px] md:text-xs text-muted-foreground ml-2">
                                                Current image will stay unless you upload a new one.
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={!newCategory.trim() || isAdding}
                                        className="w-full rounded-full font-black italic tracking-widest uppercase h-12 shadow-lg shadow-primary/20 text-sm mt-2"
                                    >
                                        {isAdding ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {editingCategory ? 'Updating...' : 'Adding...'}
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                {editingCategory ? 'Update Category' : 'Add Category'}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
