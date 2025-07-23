"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = exports.getPropertyById = exports.getProperties = void 0;
const client_1 = require("@prisma/client");
const wkt_1 = require("@terraformer/wkt");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
});
const getProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { favoriteIds, priceMin, priceMax, beds, baths, propertyType, squreFeetMin, squreFeetMax, amenities, avalableFrom, latitude, longitude, } = req.query;
        let whereConditions = [];
        if (favoriteIds) {
            const favoriteIdsArray = favoriteIds.split(',').map(Number);
            whereConditions.push(client_1.Prisma.sql `p.id IN (${client_1.Prisma.join(favoriteIdsArray)})`);
        }
        if (priceMin) {
            whereConditions.push(client_1.Prisma.sql `p."pricePerMonth" >= ${Number(priceMin)}`);
        }
        if (priceMax) {
            whereConditions.push(client_1.Prisma.sql `p."pricePerMonth" <= ${Number(priceMax)}`);
        }
        if (beds && beds !== "any") {
            whereConditions.push(client_1.Prisma.sql `p.beds >= ${Number(beds)}`);
        }
        if (baths && baths !== "any") {
            whereConditions.push(client_1.Prisma.sql `p.baths >= ${Number(baths)}`);
        }
        if (squreFeetMin) {
            whereConditions.push(client_1.Prisma.sql `p."squreFeet" >= ${Number(squreFeetMin)}`);
        }
        if (squreFeetMax) {
            whereConditions.push(client_1.Prisma.sql `p."squreFeet" <= ${Number(squreFeetMax)}`);
        }
        if (propertyType && propertyType !== "any") {
            whereConditions.push(client_1.Prisma.sql `p."propertyType" = ${propertyType} ::"PropertyType"`);
        }
        if (amenities && amenities !== "any") {
            const amenitiesArray = amenities.split(',');
            whereConditions.push(client_1.Prisma.sql `p.amenities @> ${(amenitiesArray)}`);
        }
        if (avalableFrom && avalableFrom !== "any") {
            const avalableFromDate = typeof avalableFrom === 'string' ? avalableFrom : null;
            if (avalableFromDate) {
                const date = new Date(avalableFromDate);
                if (!isNaN(date.getTime())) {
                    whereConditions.push(client_1.Prisma.sql `EXISTS (
                SELECT 1 FROM "Lease" l 
                WHERE l."propertyId" = p.id 
                AND l."startDate" <= ${date.toISOString()}
              )`);
                }
            }
        }
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lon = parseFloat(longitude);
            const radiusInKiloMeters = 1000;
            const degrees = radiusInKiloMeters / 111;
            whereConditions.push(client_1.Prisma.sql `ST_DWithin(
      l.coordinates::geometry,
      ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326),
      ${degrees}
    )`);
        }
        // l for location 
        const completeQuery = client_1.Prisma.sql `
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
            ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(whereConditions, ' AND ')}`
            : client_1.Prisma.empty}
      `;
        const properties = yield prisma.$queryRaw(completeQuery);
        res.json(properties);
    }
    catch (error) {
        res.status(500).json({ message: `error retriving Properties: ${error.message}`, error: error.message });
    }
});
exports.getProperties = getProperties;
const getPropertyById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const property = yield prisma.property.findUnique({
            where: { id: Number(id) },
            include: {
                location: true,
            },
        });
        if (property) {
            const coordinates = yield prisma.$queryRaw `SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
            const geoJSON = (0, wkt_1.wktToGeoJSON)(((_a = coordinates[0]) === null || _a === void 0 ? void 0 : _a.coordinates) || "");
            const longitude = geoJSON.coordinates[0];
            const latitude = geoJSON.coordinates[1];
            const propertyWithCoordinates = Object.assign(Object.assign({}, property), { location: Object.assign(Object.assign({}, property.location), { coordinates: {
                        longitude,
                        latitude,
                    } }) });
            res.json(propertyWithCoordinates);
        }
    }
    catch (err) {
        res.status(500).json({ message: `Error retrieving property: ${err.message}`, error: err.message });
    }
});
exports.getPropertyById = getPropertyById;
const createProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const files = req.files;
        const _e = req.body, { address, city, state, country, postalCode, managerCognitoId } = _e, propertyData = __rest(_e, ["address", "city", "state", "country", "postalCode", "managerCognitoId"]);
        const photoUrls = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const uploadParams = {
                Bucket: process.env.S3_BUCKET_NAME, //  aws s3 location
                Key: `properties/${Date.now()}-${file.originalname}`, // Unique key for each file
                Body: file.buffer, // File content
                ContentType: file.mimetype, // Set the content type
            };
            const uploadResult = yield new lib_storage_1.Upload({
                client: s3Client,
                params: uploadParams,
            }).done();
            return uploadResult.Location;
        })));
        const geoCodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
            street: address,
            city,
            country,
            postalcode: postalCode,
            format: "json",
            limit: "1",
        }).toString()}`;
        const geoCodingResponse = yield axios_1.default.get(geoCodingUrl, {
            headers: {
                "User-Agent": "CeylonStayApp (ashenshamilka270@gmail.com)"
            }
        });
        const [logitude, latitude] = ((_a = geoCodingResponse.data[0]) === null || _a === void 0 ? void 0 : _a.lon) && ((_b = geoCodingResponse.data[0]) === null || _b === void 0 ? void 0 : _b.lat) ? [
            parseFloat((_c = geoCodingResponse.data[0]) === null || _c === void 0 ? void 0 : _c.lon),
            parseFloat((_d = geoCodingResponse.data[0]) === null || _d === void 0 ? void 0 : _d.lat)
        ] : [0, 0];
        // Create Location
        const [location] = yield prisma.$queryRaw `
    INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
    VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${logitude}, ${latitude}), 4326))
    RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;
        const newProperty = yield prisma.property.create({
            data: Object.assign(Object.assign({}, propertyData), { photoUrls, locationId: location.id, managerCognitoId, amenities: typeof propertyData.amenities === "string"
                    ? propertyData.amenities.split(",")
                    : [], highlights: typeof propertyData.highlights === "string"
                    ? propertyData.highlights.split(",")
                    : [], isPetsAllowed: propertyData.isPetsAllowed === "true", isPrkingInculuded: propertyData.isPrkingIncluded === "true", pricePerMonth: parseFloat(propertyData.pricePerMonth), securityDeposit: parseFloat(propertyData.securityDeposit), applicationFee: parseFloat(propertyData.applicationFee), beds: parseInt(propertyData.beds), baths: parseFloat(propertyData.baths), squreFeet: parseInt(propertyData.squreFeet) }),
            include: {
                location: true,
                manager: true,
            },
        });
        res.status(201).json(newProperty);
    }
    catch (err) {
        res.status(500).json({ message: `Error creating property: ${err.message}`, error: err.message });
    }
});
exports.createProperty = createProperty;
