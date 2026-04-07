import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminProductStore } from "../../store/adminProductStore";
import { Button } from "../../../user/components/ui/button";
import { Input } from "../../../user/components/ui/input";
import { Label } from "../../../user/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../user/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../user/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Save,
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  Search,
} from "lucide-react";
import { useToast } from "../../../user/components/Toast";
import { compressImage } from "../../../../lib/utils";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getProductById,
    addProduct,
    updateProduct,
    categories,
    fetchCategories,
  } = useAdminProductStore();
  const isEdit = !!id;

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [variants, setVariants] = useState([]); // [{ color: '', images: [{ type, url?, file?, previewUrl? }] }]

  // Searchable Category State
  const [categorySearch, setCategorySearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    status: "Active",
    sku: "",
    specs: [{ key: "", value: "" }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter((c) =>
    (c.categoryName || c).toLowerCase().includes(categorySearch.toLowerCase()),
  );

  // ... inside render ...

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isEdit) {
      const product = getProductById(id);
      if (product) {
        setFormData({
          name: product.name || product.productName || "",
          description: product.description || "",
          category:
            product.categoryId?._id ||
            (typeof product.categoryId === "string"
              ? product.categoryId
              : "") ||
            "",
          price: product.price?.toString() || "",
          originalPrice:
            product.actualPrice?.toString() ||
            product.originalPrice?.toString() ||
            "",
          stock:
            product.stock?.toString() ||
            product.stockQuantity?.toString() ||
            product.quantity?.toString() ||
            "",
          status: product.isActive
            ? "Active"
            : product.status === "Active"
              ? "Active"
              : "Draft",
          sku: product.sku || "",
          specs: (() => {
            if (!product.specifications || product.specifications.length === 0)
              return [{ key: "", value: "" }];
            if (Array.isArray(product.specifications)) {
              if (typeof product.specifications[0] === "object")
                return product.specifications;
              if (typeof product.specifications[0] === "string") {
                try {
                  return JSON.parse(product.specifications[0]);
                } catch (e) {
                  return [];
                }
              }
            }
            return [{ key: "", value: "" }];
          })(),
        });

        // Load Variants
        if (product.variants && product.variants.length > 0) {
          setVariants(
            product.variants.map((v) => ({
              color: v.color,
              images: (v.images || []).map((url) => ({
                id: `${url}-${Math.random().toString(36).slice(2, 8)}`,
                type: "existing",
                url,
              })),
            })),
          );
        }

        // Set preview if image exists
        if (product.images && product.images.length > 0) {
          setPreviewUrls(product.images);
        } else if (product.image) {
          setPreviewUrls([product.image]);
        }
      } else {
        toast({
          title: "Product not found",
          description: "Redirecting to list...",
          variant: "destructive",
        });
        navigate("/admin/products");
      }
    }
  }, [id, isEdit, getProductById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specs];
    newSpecs[index][field] = value;
    setFormData((prev) => ({ ...prev, specs: newSpecs }));
  };

  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { key: "", value: "" }],
    }));
  };

  const removeSpec = (index) => {
    setFormData((prev) => ({
      ...prev,
      specs: formData.specs.filter((_, i) => i !== index),
    }));
  };

  // Variant Helpers
  const addVariant = () => {
    setVariants([
      ...variants,
      { color: "", images: [] },
    ]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => {
      const next = [...prev];
      const removed = next[index];
      if (removed?.images?.length) {
        removed.images.forEach((image) => {
          if (image.type === "new" && image.previewUrl) {
            URL.revokeObjectURL(image.previewUrl);
          }
        });
      }
      return next.filter((_, i) => i !== index);
    });
  };

  const handleVariantColorChange = (index, val) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], color: val };
      return next;
    });
  };

  const handleVariantFileChange = (index, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const nextImages = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: "new",
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setVariants((prev) => {
      const next = [...prev];
      const current = next[index] || { color: "", images: [] };
      next[index] = {
        ...current,
        images: [...(current.images || []), ...nextImages],
      };
      return next;
    });

    e.target.value = "";
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setVariants((prev) => {
      const next = [...prev];
      const current = next[variantIndex];
      if (!current) return prev;

      const images = [...(current.images || [])];
      const [removed] = images.splice(imageIndex, 1);
      if (removed?.type === "new" && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      next[variantIndex] = { ...current, images };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("productName", formData.name);
      data.append("description", formData.description);

      // Correct price and stock mapping for backend ProductModel
      const sellingPrice = parseFloat(formData.price) || 0;
      const actualPrice = parseFloat(formData.originalPrice) || sellingPrice;

      data.append("sellingPrice", sellingPrice);
      data.append("actualPrice", actualPrice);
      data.append("quantity", formData.stock);

      // SKU handling: generate for new products, keep for existing if needed
      // Since the form doesn't have a SKU field, we generate one.
      const sku = isEdit
        ? formData.sku || `TOY-${Date.now()}`
        : `TOY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      data.append("sku", sku);

      if (formData.category) {
        data.append("categoryId", formData.category);
      } else {
        // If category is required by backend, this might still fail.
        // But we'll let the user see the toast error if it does.
      }

      data.append("isActive", formData.status === "Active");

      // Specs: Backend expects 'specifications' as a JSON string or array
      // Based on ProductCtrl.js: createProduct takes ...req.body.
      // If we send specifications as a stringified array of objects, the backend might just save it as is.
      // However, ProductModel defines specifications as [], so we should send it so it can be parsed or stored.
      // Let's send it as a JSON string to be safe, as FormData converts everything to string anyway.
      const validSpecs = formData.specs.filter((s) => s.key && s.value);
      if (validSpecs.length > 0) {
        // Send as stringified JSON array
        data.append("specifications", JSON.stringify(validSpecs));
      } else {
        data.append("specifications", JSON.stringify([]));
      }

      // Variants Handling
      const textVariants = variants.map((v) => {
        const images = v.images || [];
        return {
          color: v.color,
          images: images
            .filter((img) => img.type === "existing" && img.url)
            .map((img) => img.url),
          imageCount: images.filter((img) => img.type === "new" && img.file)
            .length,
        };
      });

      data.append("variants", JSON.stringify(textVariants));

      // Append variant files (compressed) in the same order as the variants payload
      for (const variant of variants) {
        for (const image of variant.images || []) {
          if (image.type !== "new" || !image.file) continue;
          const compressed = await compressImage(image.file, 1600, 0.8);
          data.append("images", compressed || image.file);
        }
      }

      // Append General files (if any)
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const compressed = await compressImage(file, 1600, 0.8);
          data.append("images", compressed || file);
        }
      }

      let result;
      if (isEdit) {
        result = await updateProduct(id, data);
        if (result.success) {
          toast({
            title: "Toy Updated!",
            description: `${formData.name} has been refreshed.`,
          });
        } else {
          toast({
            title: "Update Failed",
            description: result.error,
            variant: "destructive",
          });
        }
      } else {
        result = await addProduct(data);
        if (result.success) {
          toast({
            title: "New Toy Added!",
            description: `${formData.name} is now available.`,
          });
        } else {
          toast({
            title: "Add Failed",
            description: result.error,
            variant: "destructive",
          });
        }
      }

      if (result.success) {
        navigate("/admin/products");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="flex items-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 md:h-10 md:w-10"
          onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter uppercase">
            {isEdit ? "Edit Toy" : "Add New Toy"}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium italic">
            {isEdit
              ? `Refining ${formData.name}`
              : "A new addition to the toy kingdom"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-20">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-secondary/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-secondary/20 space-y-4 md:space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">
                Toy Name
              </Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="E.G. TURBO THRILL HOVERBOARD"
                className="h-10 md:h-14 rounded-xl md:rounded-2xl border-secondary/20 bg-background font-bold tracking-tight px-4 md:px-6 text-xs md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">
                Description
              </Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Tell us why this toy is awesome..."
                className="w-full bg-background/50 backdrop-blur-sm border border-input rounded-xl md:rounded-2xl p-4 md:p-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold tracking-tight text-xs md:text-base placeholder:italic placeholder:font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">
                  Category
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-10 md:h-14 bg-background/50 backdrop-blur-sm border border-input rounded-xl md:rounded-2xl px-4 md:px-6 font-bold uppercase tracking-widest text-[10px] md:text-sm flex items-center justify-between outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                      <span
                        className={
                          !formData.category ? "text-muted-foreground" : ""
                        }>
                        {formData.category
                          ? (
                            categories.find(
                              (c) => (c._id || c) === formData.category,
                            )?.categoryName || formData.category
                          ).toUpperCase()
                          : "SELECT CATEGORY"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-0 bg-popover z-50"
                    align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search category..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-[300px] overflow-auto p-1">
                      {filteredCategories.map((cat) => (
                        <DropdownMenuItem
                          key={cat._id || cat}
                          onSelect={() => {
                            setFormData((prev) => ({
                              ...prev,
                              category: cat._id || cat,
                            }));
                            setCategorySearch("");
                          }}
                          className="flex items-center justify-between cursor-pointer">
                          {(cat.categoryName || cat).toUpperCase()}
                          {formData.category === (cat._id || cat) && (
                            <Check className="h-4 w-4 opacity-50" />
                          )}
                        </DropdownMenuItem>
                      ))}
                      {filteredCategories.length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No category found.
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, status: val }))
                  }>
                  <SelectTrigger className="w-full h-10 md:h-14 bg-background/50 backdrop-blur-sm border border-input rounded-xl md:rounded-2xl px-4 md:px-6 font-bold uppercase tracking-widest text-[10px] md:text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">ACTIVE</SelectItem>
                    <SelectItem value="Draft">DRAFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-secondary/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-secondary/20 space-y-4 md:space-y-6">
            <div className="flex justify-between items-center ml-2">
              <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                Toy Specifications
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-primary font-bold uppercase tracking-widest text-[9px] md:text-[10px]"
                onClick={addSpec}>
                <Plus className="h-3 w-3 mr-1" /> Add Spec
              </Button>
            </div>

            <div className="space-y-3 md:space-y-4">
              {formData.specs.map((spec, index) => (
                <div
                  key={index}
                  className="flex gap-2 md:gap-4 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                  <Input
                    placeholder="Key (e.g. Weight)"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(index, "key", e.target.value)
                    }
                    className="rounded-lg md:rounded-xl h-10 md:h-12 bg-background/50 border-secondary/10 text-xs md:text-sm"
                  />
                  <Input
                    placeholder="Value (e.g. 5kg)"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(index, "value", e.target.value)
                    }
                    className="rounded-lg md:rounded-xl h-10 md:h-12 bg-background/50 border-secondary/10 text-xs md:text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 rounded-full h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
                    onClick={() => removeSpec(index)}>
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6 md:space-y-8">
          {/* Color Variants: multiple images per color */}
          <div className="bg-secondary/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-secondary/20 space-y-4 md:space-y-6">
            <div className="flex justify-between items-center ml-2">
              <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                Color Variants
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-primary font-bold uppercase tracking-widest text-[9px] md:text-[10px]"
                onClick={addVariant}>
                <Plus className="h-3 w-3 mr-1" /> Add Color
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((v, index) => (
                <div
                  key={index}
                  className="bg-background/40 p-3 md:p-4 rounded-xl border border-secondary/20 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Red)"
                      value={v.color}
                      onChange={(e) =>
                        handleVariantColorChange(index, e.target.value)
                      }
                      className="flex-1 min-w-[150px] md:min-w-[200px] h-10 rounded-xl border border-input bg-white text-black px-4 py-2 text-sm font-bold shadow-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest"
                        onClick={() =>
                          document
                            .getElementById(`variant-file-${index}`)
                            ?.click()
                        }
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Images
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 rounded-full h-8 w-8 hover:bg-red-50"
                        onClick={() => removeVariant(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <input
                    id={`variant-file-${index}`}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleVariantFileChange(index, e)}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Variant Images
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {v.images?.length || 0} image(s)
                      </span>
                    </div>

                    {v.images && v.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {v.images.map((image, imageIndex) => {
                          const src =
                            image.type === "new"
                              ? image.previewUrl
                              : image.url;

                          return (
                            <div
                              key={image.id || `${index}-${imageIndex}`}
                              className="relative aspect-square rounded-xl overflow-hidden border border-secondary/20 bg-white"
                            >
                              <img
                                src={src}
                                alt={`Variant ${v.color || "image"}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                                onClick={() =>
                                  removeVariantImage(index, imageIndex)
                                }
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className="rounded-xl border border-dashed border-secondary/40 bg-background/50 px-4 py-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() =>
                          document
                            .getElementById(`variant-file-${index}`)
                            ?.click()
                        }
                      >
                        <ImageIcon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Upload one or more images
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {variants.length === 0 && (
                <div className="text-center p-4 text-[10px] text-muted-foreground italic border border-dashed border-secondary/20 rounded-xl">
                  No variants added. Click "Add Color" to define specific
                  colors.
                </div>
              )}
            </div>
          </div>

          {/* Inventory & Pricing */}
          <div className="bg-secondary/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-secondary/20 space-y-4 md:space-y-6">
            <Label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ml-2">
              Pricing & Stock
            </Label>

            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2">
                  Base Price (INR)
                </Label>
                <Input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="2499"
                  className="h-10 md:h-12 rounded-xl border-secondary/20 bg-background font-black italic tracking-tighter text-xs md:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2">
                  Original Price (INR)
                </Label>
                <Input
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="2999"
                  className="h-10 md:h-12 rounded-xl border-secondary/20 bg-background/50 font-black italic tracking-tighter text-xs md:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2">
                  Stock Quantity
                </Label>
                <Input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  placeholder="50"
                  className="h-10 md:h-12 rounded-xl border-secondary/20 bg-background font-black italic tracking-tighter text-xs md:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-8 z-20 flex gap-3 md:gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 md:h-14 rounded-full font-black italic tracking-widest uppercase shadow-xl shadow-primary/20 text-xs md:text-sm disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {isEdit ? "Update Toy" : "Save Toy"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 md:h-14 rounded-full font-black italic tracking-widest uppercase px-6 md:px-8 border-secondary/20 text-xs md:text-sm"
              onClick={() => navigate("/admin/products")}>
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
