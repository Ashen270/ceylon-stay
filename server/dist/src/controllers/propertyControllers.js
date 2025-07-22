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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperties = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { favoriteIds, priceMin, priceMax, beds, baths, propertyType, squreFeetMin, squreFeetMax, ammenities, avalableFrom, latitude, longitude, } = req.query;
        let whereConditions = [];
        if (favoriteIds) {
            const favoriteIdsArray = favoriteIds.split(',').map(Number);
            whereConditions.push(client_1.Prisma.sql `id IN (${client_1.Prisma.join(favoriteIdsArray)})`);
        }
    }
    catch (error) {
        res.status(500).json({ message: `error retriving Properties: ${error.message}`, error: error.message });
    }
});
exports.getProperties = getProperties;
