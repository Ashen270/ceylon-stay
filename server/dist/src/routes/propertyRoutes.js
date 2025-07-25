"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propertyControllers_1 = require("../controllers/propertyControllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
router.get("/", propertyControllers_1.getProperties);
router.get("/:id", propertyControllers_1.getPropertyById);
router.post("/", (0, authMiddleware_1.authMiddleware)(["manager"]), upload.array("photos"), propertyControllers_1.createProperty);
exports.default = router;
