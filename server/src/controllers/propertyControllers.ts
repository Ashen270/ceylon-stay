import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squreFeetMin,
      squreFeetMax,
      amenities,
      avalableFrom,
      latitude,
      longitude,
    } = req.query;

    let whereConditions: Prisma.Sql[] = [];

    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(',').map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
      );
    }

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`
      );
    }
    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`
      );
    }
    if (beds && beds !== "any") {
      whereConditions.push(
        Prisma.sql`p.beds >= ${Number(beds)}`
      );
    }
    if (baths && baths !== "any") {
      whereConditions.push(
        Prisma.sql`p.baths >= ${Number(baths)}`
      );
    }
    if (squreFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squreFeet" >= ${Number(squreFeetMin)}`
      );
    }
    if (squreFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squreFeet" <= ${Number(squreFeetMax)}`
      );
    }
    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType} ::"PropertyType"`
      );
    }
    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(',');
      whereConditions.push(
        Prisma.sql`p.amenities @> ${(amenitiesArray)}`
      );
    }
    if (avalableFrom && avalableFrom !== "any") {
      const avalableFromDate =
        typeof avalableFrom === 'string' ? avalableFrom : null;
      if (avalableFromDate) {
        const date = new Date(avalableFromDate);
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
                SELECT 1 FROM "Lease" l 
                WHERE l."propertyId" = p.id 
                AND l."startDate" <= ${date.toISOString()}
              )`
          );
        }
      }
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const radiusInKiloMeters = 1000;
      const degrees = radiusInKiloMeters / 111;

      whereConditions.push(
        Prisma.sql`ST_DWithin(
      l.coordinates::geometry,
      ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326),
      ${degrees}
    )`
      );
    }

  // l for location 
    const completeQuery = Prisma.sql`
      SELECT p.*,
       json_build_object(   
        'id', l.id,
        'address', l.address,
        'city', l.city,
        'state', l.state,
        'country', l.country,
        'postalCode', l."postalCode",
        'coordinates',  json_build_object(
          'longitude', ST_X(l."coordinates" ::geometry),
          'latitude', ST_Y(l."coordinates" ::geometry)
        ),
       ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id

      ${whereConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
        : Prisma.empty
      }
      `;

  } catch (error: any) {
    res.status(500).json({ message: `error retriving Properties: ${error.message}`, error: error.message });
  }
}




