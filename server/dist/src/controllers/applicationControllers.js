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
exports.updateApplicationStatus = exports.createApplications = exports.getApplications = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, userType } = req.query;
        let whereClause = {};
        if (userId && userType) {
            if (userType === 'tenant') {
                whereClause = { tenantCognitoId: String(userId) };
            }
            else if (userType === 'manager') {
                whereClause = {
                    property: {
                        managerCognitoId: String(userId)
                    }
                };
            }
        }
        const applications = yield prisma.application.findMany({
            where: whereClause,
            include: {
                property: {
                    include: {
                        location: true,
                        manager: true
                    }
                },
                tenant: true
            }
        });
        function calculateNextPaymentDate(startDate) {
            const today = new Date();
            const nextPaymentDate = new Date(startDate);
            while (nextPaymentDate <= today) {
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            }
            return nextPaymentDate;
        }
        const formattedApplications = yield Promise.all(applications.map((app) => __awaiter(void 0, void 0, void 0, function* () {
            const lease = yield prisma.lease.findFirst({
                where: {
                    tenant: {
                        cognitoId: app.tenantCognitoId
                    },
                    propertyId: app.propertyId
                },
                orderBy: { startDate: 'desc' },
            });
            return Object.assign(Object.assign({}, app), { property: Object.assign(Object.assign({}, app.property), { address: app.property.location.address }), manager: app.property.manager, lease: lease
                    ? Object.assign(Object.assign({}, lease), { nextPaymentDate: calculateNextPaymentDate(lease.startDate) }) : null });
        })));
        res.json(formattedApplications);
    }
    catch (error) {
        res.status(500).json({ message: `error retriving Applications: ${error.message}`, error: error.message });
    }
});
exports.getApplications = getApplications;
const createApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicationDate, status, propertyId, tenantCognitoId, name, email, phoneNumber, message, } = req.body;
        const property = yield prisma.property.findUnique({
            where: { id: propertyId },
            select: { pricePerMonth: true, securityDeposit: true },
        });
        if (!property) {
            res.status(404).json({ message: "Property not found" });
            return;
        }
        const newApplication = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            //create Lease first
            const lease = yield prisma.lease.create({
                data: {
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // lease contact for only 1 year
                    rent: property.pricePerMonth,
                    deposit: property.securityDeposit,
                    property: {
                        connect: { id: propertyId },
                    },
                    tenant: {
                        connect: { cognitoId: tenantCognitoId },
                    },
                },
            });
            const application = yield prisma.application.create({
                data: {
                    applicationDate: new Date(applicationDate),
                    status,
                    name,
                    email,
                    phoneNumber,
                    message,
                    property: {
                        connect: { id: propertyId },
                    },
                    tenant: {
                        connect: { cognitoId: tenantCognitoId },
                    },
                    lease: {
                        connect: { id: lease.id },
                    },
                },
                include: {
                    property: true,
                    tenant: true,
                    lease: true,
                },
            });
            return application;
        }));
        res.status(201).json(newApplication);
    }
    catch (error) {
        res.status(500).json({ message: `error creating application: ${error.message}`, error: error.message });
    }
});
exports.createApplications = createApplications;
const updateApplicationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const application = yield prisma.application.findUnique({
            where: { id: Number(id) },
            include: {
                property: true,
                tenant: true,
            }
        });
        if (!application) {
            res.status(404).json({ message: "Application not found" });
            return;
        }
        if (status === "Approved") {
            const newLease = yield prisma.lease.create({
                data: {
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // lease contract for only 1 year
                    rent: application.property.pricePerMonth,
                    deposit: application.property.securityDeposit,
                    propertyId: application.propertyId,
                    tenantCognitoId: application.tenantCognitoId,
                },
            });
            // update the property to connect the tenant
            yield prisma.property.update({
                where: { id: application.propertyId },
                data: {
                    tenants: {
                        connect: { cognitoId: application.tenantCognitoId }
                    }
                },
            });
            //update the application with new leas ID
            yield prisma.application.update({
                where: { id: Number(id) },
                data: { status, leaseId: newLease.id },
                include: {
                    property: true,
                    tenant: true,
                    lease: true,
                }
            });
        }
        else {
            yield prisma.application.update({
                where: { id: Number(id) },
                data: { status },
            });
        }
        const updatedApplication = yield prisma.application.findUnique({
            where: { id: Number(id) },
            include: {
                property: true,
                tenant: true,
                lease: true,
            },
        });
        res.json(updatedApplication);
    }
    catch (error) {
        res.status(500).json({ message: `error updating application status : ${error.message}`, error: error.message });
    }
});
exports.updateApplicationStatus = updateApplicationStatus;
