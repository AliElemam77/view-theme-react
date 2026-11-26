import { FiltersSkeleton, Pulse, ProductsListSkeleton } from '@salla.sa/twilight-components-react';

/**
 * `pendingComponent` for the product-listing / offers routes: without one the
 * router blanks the match on every sort, page or filter reload.
 *
 * Mirrors `ProductListPage` (View's `product/index.twig`): breadcrumb, the
 * `md:w-72` filters sidebar (from `lg`) and the bordered toolbar box with the
 * title, so nothing shifts once the page arrives.
 */
export function ProductListSkeleton({ hideFilters = false }: { hideFilters?: boolean }) {
  return (
    <div className="container px-2.5 ms:px-5 mb-10">
      <nav className="breadcrumbs w-full py-5" aria-hidden="true">
        <ol className="s-breadcrumb-wrapper">
          <Pulse className="h-4 w-64" />
        </ol>
      </nav>
      <div className="flex items-start flex-col lg:flex-row" aria-hidden="true">
        {!hideFilters && (
          <div className="md:w-72 flex-none">
            <FiltersSkeleton className="hidden lg:block" />
          </div>
        )}
        <div className={`main-content flex-1 w-full${hideFilters ? '' : ' ltr:lg:ml-5 rtl:lg:mr-5'}`}>
          <div className="mb-4 sm:mb-6 flex justify-between items-center border-lightgray rounded-theme border p-1.5 min-h-[3.25rem]">
            <Pulse className="h-4 w-40" />
          </div>
          <ProductsListSkeleton count={12} columns={hideFilters ? 4 : 3} />
        </div>
      </div>
    </div>
  );
}
