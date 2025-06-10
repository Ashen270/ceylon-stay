"use client"
import React from 'react'
import { motion, stagger } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link';



const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 1,
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



const FeaturesSection = () => {
  return <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={containerVariants}
    className='py-24 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white'
  >
    <div className='max-w-4xl xl:max-w-6xl mx-auto'>
      <motion.h2 variants={itemVariant} className='text-3xl w-full sm:w-2/3 mx-auto font-bold text-center mb-12'>
        Features that make your life easier
      </motion.h2>
      <div className='grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16'>
        {[0, 1, 2].map((index) => (
          <motion.div key={index} variants={itemVariant}>
            <FeatureCard 
            imageSrc={`/landing-search${3 - index}.png`}
            title={["Trustworthy and Verified", "Browse Rental Listings with Ease", "Simplify Your Rental Search with Advanced"][index]}
            description={["We ensure that all listings are verified and trustworthy, so you can search with confidence.",
              "Our user-friendly interface makes it easy to browse through rental listings and find your perfect home.",
              "Advanced search filters help you narrow down options based on your preferences and needs."][index]}
            linkText={["Explore", "Search", "Discover"][index]}
            linkHref={["/explore", "/search", "/discover"][index]}

            />
          </motion.div>
        ))}
      </div>
    </div>

  </motion.div>

}

const FeatureCard = ({
  imageSrc,
  title,
  description,
  linkText,
  linkHref,
}: {
  imageSrc: string,
  title: string,
  description: string,
  linkText: string,
  linkHref: string,
}) => (
  <div className='text-center'>
    <div className='p-4 rounded-lg mb-4 flex items-center justify-center h-48 '>
      <Image
        src={imageSrc}
        alt={title}
        width={400}
        height={400}
        className='w-full h-full object-contain'
      />
    </div>
    <h3 className='text-xl font-semibold mb-2'>{title}</h3>
    <p className='mb-4'>{description}</p>
    <Link href={linkHref} className='inline-block border border-gray-300 rounded px-4 py-2 hover:bg-gray-100'
      scroll={false}
    >{linkText}</Link>
  </div>
)

export default FeaturesSection
