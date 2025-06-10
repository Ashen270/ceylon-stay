"use client"
import React from 'react'
import { motion, stagger } from 'framer-motion'
import Image from 'next/image'



const containerVariants = {
    hidden: { opacity: 0, },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            staggerChildren: 0.2,
        }
    }
}

const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};



const DiscoverSection = () => {
    return <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={containerVariants}
        className='py-12 bg-white mb-16'
    >
        <div className='max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16'>
            <motion.div variants={itemVariant}
                className='my-12 text-center'
            >
                <h2 className='text-3xl font-semibold leading-tight text-gray-800'>
                    Discover
                </h2>
                <p className='mt-4 text-lg text-gary-600'>
                    Find Your Dream Property Today!
                </p>
                <p className='mt-2 text-gray-500 max-w-3xl mx-auto'>
                    Searchinf for Your Dreame Property has never been easier.
                    With our user-friendly search feature, you can quickly find the perfeact home that meets all your needs.
                    Start your search today and discover your dream rental property!
                </p>
            </motion.div>
            <div className='grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16 text-center'>
                {[
                    {
                        imageSrc: '/landing-icon-wand.png',
                        title: "Search For Properties",
                        description: " Use our advanced search filters to find properties that match your criteria, including location, price range, and amenities."
                    },
                    {
                        imageSrc: '/landing-icon-calendar.png',
                        title: "Book Your Property",
                        description: "Once your found perfeact property, easily book it online with just a click "
                    },
                    {
                        imageSrc: '/landing-icon-heart.png',
                        title: "Enjoy Your New Home",
                        description: "Move on to your new property and start enjoy your dream home"
                    }
                ].map((card, index) => (
                    <motion.div key={index} variants={itemVariant}>
                        <DiscoverCard {...card}/>
                    </motion.div>
                ))
                }
            </div>
        </div>

    </motion.div>

}

const DiscoverCard = ({
    imageSrc,
    title,
    description,

}: {
    imageSrc: string,
    title: string,
    description: string,

}) => (
    <div className='px-4 py-12 shadow-lg rounded-lg bg-primary-50 md:h-72'>
        <div className='bg-primary-700 p-[0.6rem] rounded-full mb-4 h-10 w-10 mx-auto'>
            <Image
                src={imageSrc}
                alt={title}
                width={30}
                height={30}
                className='w-full h-full '
            />
        </div>
        <h3 className='mt-4 text-xl font-medium text-gray-800'>{title}</h3>
        <p className='mt-2 text-base text-gray-500'>{description}</p>

    </div>
)

export default DiscoverSection
