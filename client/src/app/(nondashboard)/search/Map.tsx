"use client"
import React, { useEffect } from 'react'
import { useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import "mapbox-gl/dist/mapbox-gl.css"
import { useAppSelector } from '@/state/redux';
import { useGetPropertiesQuery } from '@/state/api';



mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
    const mapContainerRef = useRef(null);
    const filters = useAppSelector((state) => state.global.filters);
    const isFiltersFullOpen = useAppSelector(
        (state) => state.global.isFiltersFullOpen
    )

    const {
        data: properties,
        isLoading,
        isError,
    } = useGetPropertiesQuery(filters);
    console.log("Properties:", properties);

    useEffect(() => {
        if (isLoading || isError || !properties) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: "mapbox://styles/ashen270/cme93z66q00e201sch0uc506r",
            center: filters.coordinates || [79.86, 6.93],
            zoom: 12,
        });

        
        return () => map.remove();
    })

    return (
        <div className='basis-5/12 bg grow relative rounded-xl'>
            <div className='map-container rounded-xl'
                ref={mapContainerRef}
                style={{
                    height: "100%",
                    width: "100%"
                }}
            />
        </div>
    )
}

export default Map
