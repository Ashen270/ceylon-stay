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
exports.getManagerProperties = exports.updateManager = exports.createManager = exports.getManager = void 0;
const client_1 = require("@prisma/client");
const wkt_1 = require("@terraformer/wkt");
const prisma = new client_1.PrismaClient();
const getManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const manager = yield prisma.manager.findUnique({
            where: { cognitoId },
        });
        if (manager) {
            res.json(manager);
        }
        else {
            res.status(404).json({ message: "Manager not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: `error retriving Manager: ${error.message}`, error: error.message });
    }
});
exports.getManager = getManager;
const createManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const manager = yield prisma.manager.create({
            data: {
                cognitoId,
                name,
                email,
                phoneNumber
            },
        });
        res.status(201).json(manager);
    }
    catch (error) {
        res.status(500).json({ message: `error Creating manager: ${error.message}`, error: error.message });
    }
});
exports.createManager = createManager;
const updateManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const { name, email, phoneNumber } = req.body;
        const updatedManager = yield prisma.manager.update({
            where: { cognitoId },
            data: {
                name,
                email,
                phoneNumber
            },
        });
        res.json(updatedManager);
    }
    catch (error) {
        res.status(500).json({ message: `error updating manager: ${error.message}`, error: error.message });
    }
});
exports.updateManager = updateManager;
const getManagerProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const manager = yield prisma.manager.findUnique({
            where: { cognitoId },
        });
        const properties = yield prisma.property.findMany({
            where: { managerCognitoId: cognitoId },
            include: {
                location: true,
            },
        });
        const propertiesWithFormattedLocation = yield Promise.all(properties.map((property) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const coordinates = yield prisma.$queryRaw `SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
            const geoJSON = (0, wkt_1.wktToGeoJSON)(((_a = coordinates[0]) === null || _a === void 0 ? void 0 : _a.coordinates) || "");
            const longitude = geoJSON.coordinates[0];
            const latitude = geoJSON.coordinates[1];
            return Object.assign(Object.assign({}, property), { location: Object.assign(Object.assign({}, property.location), { coordinates: {
                        longitude,
                        latitude,
                    } }) });
        })));
        res.json(propertiesWithFormattedLocation);
    }
    catch (err) {
        res.status(500).json({ message: `Error retrieving property: ${err.message}`, error: err.message });
    }
});
exports.getManagerProperties = getManagerProperties;
