"use client"

import { useState } from "react"
import { ChevronRight, Package, Grid3x3, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  stock?: number
}

interface SubSubcategory {
  id: string
  name: string
  products?: Product[]
}

interface Subcategory {
  id: string
  name: string
  products?: Product[]
  sub_subcategories?: SubSubcategory[]
}

interface Category {
  id: string
  name: string
  products?: Product[]
  subcategories?: Subcategory[]
}

interface TreeComponentProps {
  data: Category[]
}

const PRODUCTS_PER_PAGE = 5

export function TreeComponent({ data }: TreeComponentProps) {
  const [visibleProductsMap, setVisibleProductsMap] = useState<Record<string, number>>({})

  const handleLoadMore = (categoryId: string) => {
    setVisibleProductsMap((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || PRODUCTS_PER_PAGE) + PRODUCTS_PER_PAGE,
    }))
  }

  return (
    <div className="space-y-4">
      {data.map((category) => (
        <CategoryNode
          key={category.id}
          category={category}
          level={0}
          visibleProductsMap={visibleProductsMap}
          onLoadMore={handleLoadMore}
        />
      ))}
    </div>
  )
}

interface CategoryNodeProps {
  category: Category | Subcategory | SubSubcategory
  level: number
  visibleProductsMap: Record<string, number>
  onLoadMore: (categoryId: string) => void
}

type ViewMode = "products" | "categories"

function CategoryNode({ category, level, visibleProductsMap, onLoadMore }: CategoryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("categories")

  const hasSubcategories = "subcategories" in category && category.subcategories && category.subcategories.length > 0
  const hasSubSubcategories =
    "sub_subcategories" in category && category.sub_subcategories && category.sub_subcategories.length > 0
  const hasProducts = category.products && category.products.length > 0
  const hasCategories = hasSubcategories || hasSubSubcategories
  const hasChildren = hasCategories || hasProducts

  const showToggle = hasProducts && hasCategories
  const productCount = category.products?.length || 0

  const visibleCount = visibleProductsMap[category.id] || PRODUCTS_PER_PAGE
  const visibleProducts = category.products?.slice(0, visibleCount) || []
  const hasMoreProducts = (category.products?.length || 0) > visibleCount

  return (
    <div className="space-y-3">
      {/* Category Card */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-all duration-200",
          "border text-left shadow-xs",
          isExpanded && hasChildren
            ? "border-primary bg-primary-light dark:bg-primary-dark dark:border-primary"
            : "border-neutral-20 dark:border-neutral-80 bg-card dark:bg-card hover:border-neutral-30 dark:hover:border-neutral-70 hover:shadow-sm",
        )}
      >
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-title-md text-foreground">{category.name}</h3>
          <p className="text-label-md text-neutral-normal dark:text-neutral-normal mt-1">{productCount} Products</p>
        </div>

        {/* Right Section - Badge, Toggle, and Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {productCount > 0 && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary dark:bg-primary text-white text-label-sm font-bold shadow-sm">
              {productCount}
            </div>
          )}

          {showToggle && (
            <div className="flex gap-1 bg-neutral-light dark:bg-neutral-dark rounded-md p-1 shadow-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setViewMode("products")
                }}
                className={cn(
                  "p-1.5 rounded transition-all duration-200",
                  viewMode === "products"
                    ? "bg-card dark:bg-card text-primary dark:text-primary shadow-xs"
                    : "text-neutral-normal dark:text-neutral-normal hover:text-neutral-dark dark:hover:text-neutral-light",
                )}
                title="View products"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setViewMode("categories")
                }}
                className={cn(
                  "p-1.5 rounded transition-all duration-200",
                  viewMode === "categories"
                    ? "bg-card dark:bg-card text-primary dark:text-primary shadow-xs"
                    : "text-neutral-normal dark:text-neutral-normal hover:text-neutral-dark dark:hover:text-neutral-light",
                )}
                title="View categories"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {hasChildren && <ChevronRight className="w-5 h-5 text-neutral-normal dark:text-neutral-normal" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && hasChildren && (
        <div className="space-y-3 pl-4">
          {/* Products Section */}
          {viewMode === "products" && hasProducts && (
            <>
              {visibleProducts.map((product) => (
                <ProductNode key={product.id} product={product} />
              ))}

              {hasMoreProducts && (
                <button
                  onClick={() => onLoadMore(category.id)}
                  className="w-full py-2 px-4 text-center text-label-md font-medium text-primary dark:text-primary hover:bg-primary-light dark:hover:bg-primary-dark rounded-lg transition-colors"
                >
                  Load More
                </button>
              )}
            </>
          )}

          {/* Categories Section */}
          {viewMode === "categories" && (
            <>
              {hasSubcategories &&
                category.subcategories &&
                category.subcategories.map((subcat) => (
                  <CategoryNode
                    key={subcat.id}
                    category={subcat}
                    level={level + 1}
                    visibleProductsMap={visibleProductsMap}
                    onLoadMore={onLoadMore}
                  />
                ))}

              {hasSubSubcategories &&
                category.sub_subcategories &&
                category.sub_subcategories.map((subsubcat) => (
                  <CategoryNode
                    key={subsubcat.id}
                    category={subsubcat}
                    level={level + 2}
                    visibleProductsMap={visibleProductsMap}
                    onLoadMore={onLoadMore}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ProductNode({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-neutral-light dark:bg-neutral-dark border border-neutral-20 dark:border-neutral-80 hover:bg-neutral-light-hover dark:hover:bg-neutral-dark-hover transition-colors shadow-xs">
      {/* Product Icon */}
      <Package className="w-4 h-4 text-primary dark:text-primary flex-shrink-0" />

      {/* Product Name */}
      <span className="flex-1 font-medium text-label-md text-foreground">{product.name}</span>

      {/* Price Badge */}
      <span className="flex-shrink-0 px-3 py-1 bg-primary dark:bg-primary text-white text-label-sm font-semibold rounded-full shadow-xs">
        ${product.price.toFixed(2)}
      </span>
    </div>
  )
}
