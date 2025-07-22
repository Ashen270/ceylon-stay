import express  from "express";
import { getProperties, getPropertyById,  createProperty } from "../controllers/propertyController";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", authMiddleware(["manager"]), upload.array("photos"), createProperty);



export default router;