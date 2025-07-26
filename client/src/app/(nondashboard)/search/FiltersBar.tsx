import { useDispatch } from 'react-redux'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import React from 'react'
import { useAppSelector } from '@/state/redux'
import { debounce } from 'lodash'
import { cleanParams, formatPriceValue } from '@/lib/utils'
import { FilterState, setFilters, setViewMode, toggleFiltersFullOpen } from '@/state'
import { Button } from '@/components/ui/button'
import { Filter, Grid, List, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { SelectValue } from '@radix-ui/react-select'
import { format } from 'path'
import { PropertyTypeIcons } from '@/lib/constants'


const FiltersBar = () => {

    const dispatch = useDispatch()
    const router = useRouter()
    const pathname = usePathname()
    const filters = useAppSelector((state) => state.global.filters)
    const isFiltersFullOpen = useAppSelector(
        (state) => state.global.isFiltersFullOpen);
    const viewMode = useAppSelector((state) => state.global.viewMode);
    const [searchInput, setSearchInput] = useState(filters.location);

    const updateUrl = debounce((newFilters: FilterState) => {
        const cleanFilters = cleanParams(newFilters);
        const updatedSearchParams = new URLSearchParams();

        Object.entries(cleanFilters).forEach(([key, value]) => {
            updatedSearchParams.set(
                key,
                Array.isArray(value) ? value.join(',') : value.toString()
            );
        });

        router.push(`${pathname}?${updatedSearchParams.toString()}`);
    });

    const handleFilterChange = (
        key: string,
        value: any,
        isMin: boolean | null
    ) => {
        let newValue = value;

        if (key === 'priceRange' || key === 'squareFeet') {
            const currentArrayRange = [...filters[key]];
            if (isMin !== null) {
                const index = isMin ? 0 : 1;
                currentArrayRange[index] = value === "any" ? null : Number(value);
            };
            newValue = currentArrayRange;
        } else if (key === 'coordinates') {
            newValue = value === "any" ? [0, 0] : value.map(Number);
        } else {
            newValue = value === "any" ? "" : value;
        }

        const newFilters = { ...filters, [key]: newValue };
        dispatch(setFilters(newFilters));
        updateUrl(newFilters);
    }


    return (
        <div className='flex justify-between items-center w-full py-5'>
            {/* filters */}
            <div className='flex justify-between items-center gap-4 p-2'>
                {/* allfilters */}
                <Button
                    variant='outline'
                    className={cn("gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100",
                        isFiltersFullOpen && "bg-primary-700 text-primary-100")}
                    onClick={() => dispatch(toggleFiltersFullOpen())}>
                    <Filter className='h-4 w-4' />
                    <span >All Filters</span>
                </Button>
                {/* search location */}
                <div className='flex itemss-center'>
                    <Input
                        placeholder='Search location'
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className='w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0'
                    />
                    <Button
                        // onClick={handleLocationSearch}
                        className='rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none 
                    border hover:bg-primary-700 hover-text-primary-50'
                    >
                        <Search className='h-4 w-4' />
                    </Button>
                </div>
                {/* price range */}
                <div className='flex gap-1'>
                    {/* Minimum price Selector */}
                    <Select
                        value={filters.priceRange[0]?.toString() || "any"}
                        onValueChange={(value) => handleFilterChange('priceRange', value, true)}>
                        <SelectTrigger className='w-22 rounded-xl border-primary-400'>
                            <SelectValue>
                                {formatPriceValue(filters.priceRange[0], true)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                            <SelectItem value="any">Any Min Price</SelectItem>
                            {[5000, 8000, 10000, 15000, 20000, 25000, 50000].map((price) => {
                                const formattedPrice = new Intl.NumberFormat('en-US').format(price);
                                const spacedPrice = formattedPrice.replace(/,/g, ' ');

                                return (
                                    <SelectItem key={price} value={price.toString()}>
                                        Rs. {spacedPrice}+
                                    </SelectItem>
                                );
                            })}

                        </SelectContent>
                    </Select>
                    {/* Maximum price Selector */}
                    <Select
                        value={filters.priceRange[1]?.toString() || "any"}
                        onValueChange={(value) => handleFilterChange('priceRange', value, false)}>
                        <SelectTrigger className='w-22 rounded-xl border-primary-400'>
                            <SelectValue>
                                {formatPriceValue(filters.priceRange[1], false)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                            <SelectItem value="any">Any Max Price</SelectItem>
                            {[5000, 8000, 10000, 15000, 20000, 25000, 50000].map((price) => {
                                const formattedPrice = new Intl.NumberFormat('en-US').format(price);
                                const spacedPrice = formattedPrice.replace(/,/g, ' ');

                                return (
                                    <SelectItem key={price} value={price.toString()}>
                                        Rs. {spacedPrice}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
                {/* Beds and Baths*/}
                <div className='flex gap-1'>
                    {/* Beds */}
                    <Select
                        value={filters.beds}
                        onValueChange={(value) => handleFilterChange('beds', value, null)}>
                        <SelectTrigger className='w-26 rounded-xl border-primary-400'>
                            <SelectValue placeholder="Beds" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                            <SelectItem value="any">Any Beds</SelectItem>
                            <SelectItem value="1">1+ Bed</SelectItem>
                            <SelectItem value="2">2+ Beds</SelectItem>
                            <SelectItem value="3">3+ Beds</SelectItem>
                            <SelectItem value="4">4+ Beds</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Baths */}
                    <Select
                        value={filters.baths}
                        onValueChange={(value) => handleFilterChange('baths', value, null)}>
                        <SelectTrigger className='w-26 rounded-xl border-primary-400'>
                            <SelectValue placeholder="Baths" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                            <SelectItem value="any">Any Baths</SelectItem>
                            <SelectItem value="1">1+ Bath</SelectItem>
                            <SelectItem value="2">2+ Baths</SelectItem>
                            <SelectItem value="3">3+ Baths</SelectItem>
                            <SelectItem value="4">4+ Baths</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Property Type */}
                <Select
                    value={filters.propertyType || "any"}
                    onValueChange={(value) =>
                        handleFilterChange('propertyType', value, null)}>

                    <SelectTrigger className='w-32 rounded-xl border-primary-400'>
                        <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                        <SelectItem value="any">Property Type</SelectItem>
                        {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                            <SelectItem key={type} value={type}>
                                <div className='flex items-center'>
                                    <Icon className='h-4 w-4 mr-2' />
                                    <span>{type}</span>
                                </div>
                            </SelectItem>
                        )
                        )}
                    </SelectContent>
                </Select>
            </div>
            {/* View Mode */}
            <div className='flex justify-between items-center gap-4 p-2'>
                <div className='flex border rounded-xl'>
                    <Button
                        variant="ghost"
                        className={cn("px-3 py-1 rounded-none rounded-1-xl hover:bg-primary-600 hover:text-primary-400",
                            viewMode === "list" ? "bg-primary-700 text-primary-50" : "")}
                        onClick={() => dispatch(setViewMode("list"))}>
                        <List className='h-5 w-5' />
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "px-3 py-1 rounded-none rounded-1-xl hover:bg-primary-600 hover:text-primary-400 ",
                            viewMode === "grid" ? "bg-primary-700 text-primary-50" : "")}
                        onClick={() => dispatch(setViewMode("grid"))}>
                        <Grid className='h-5 w-5' />
                    </Button>
                </div>
            </div>
        </div >
    )
}

export default FiltersBar
