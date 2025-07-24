"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenantController_1 = require("../controllers/tenantController");
const router = express_1.default.Router();
router.get("/:cognitoId", tenantController_1.getTenant);
router.get("/:cognitoId/current-residences", tenantController_1.getCurrentResidences);
router.post("/", tenantController_1.createTenant);
router.put("/:cognitoId", tenantController_1.updateTenant); // Assuming update is the same as create for simplicity
exports.default = router;
